import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {query} from '@/lib/db'
import Stripe from 'stripe'
import {authenticatedApiRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'
import {logPagamento} from '@/lib/audit-log'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  // Rate limiting per webhook (usa limite API autenticate: 1000/min)
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(authenticatedApiRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        const milestoneId = session.metadata?.milestoneId
        const incaricoId = session.metadata?.incaricoId

        if (milestoneId && incaricoId) {
          // Ottieni cliente dell'incarico per audit log
          const incaricoResult = await query(
            `SELECT cliente_id FROM incarichi WHERE id = $1`,
            [parseInt(incaricoId)]
          )

          if (incaricoResult.rows.length > 0) {
            const clienteId = incaricoResult.rows[0].cliente_id

            // Ottieni utente del cliente
            const utenteResult = await query(
              `SELECT id FROM utenti WHERE cliente_id = $1 LIMIT 1`,
              [clienteId]
            )

            if (utenteResult.rows.length > 0) {
              const utenteId = utenteResult.rows[0].id

              // Audit log
              await logPagamento(utenteId, 'PAYMENT', parseInt(milestoneId), request, {
                stripeSessionId: session.id,
                importo: session.amount_total,
                valuta: session.currency,
                incaricoId: parseInt(incaricoId),
              })
            }
          }

          // Aggiorna milestone come pagata
          await query(
            `UPDATE milestone
             SET stato = 'PAGATO',
                 data_pagamento = CURRENT_TIMESTAMP,
                 "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [parseInt(milestoneId)]
          )

          // TODO: Invia email di conferma pagamento
          // TODO: Registra transazione in tabella pagamenti (se esiste)

          console.log(`Milestone ${milestoneId} marked as paid`)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
