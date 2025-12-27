import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {query} from '@/lib/db'
import Stripe from 'stripe'
import {authenticatedApiRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'
import {logPagamento} from '@/lib/audit-log'
import {sendWelcomeEmail, sendPaymentConfirmationEmail} from '@/lib/email'

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
        const metadata = session.metadata || {}

        // Distingui tra acquisto iniziale e pagamento milestone
        if (metadata.type === 'initial_purchase') {
          // ========== ACQUISTO INIZIALE BUNDLE ==========
          console.log(`[Webhook] Initial purchase for bundle ${metadata.bundleCode}`)

          try {
            // 1. Crea CLIENTE
            const clienteResult = await query(
              `INSERT INTO clienti (
                tipo, nome, cognome, email, telefono,
                codice_fiscale, indirizzo, citta, cap, note,
                stato_accesso_portale, "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
              RETURNING id, codice`,
              [
                'PRIVATO', // Tipo default
                metadata.clienteNome,
                metadata.clienteCognome,
                metadata.clienteEmail,
                metadata.clienteTelefono,
                metadata.clienteCodiceFiscale || null,
                metadata.clienteIndirizzo || null,
                metadata.clienteCitta || null,
                metadata.clienteCap || null,
                metadata.clienteNote || null,
                'in_attivazione', // Stato accesso portale
              ]
            )

            const cliente = clienteResult.rows[0]
            console.log(`[Webhook] Cliente created: ${cliente.id} (${cliente.codice})`)

            // 2. Crea INCARICO
            const incaricoResult = await query(
              `INSERT INTO incarichi (
                codice, cliente_id, bundle_id, oggetto, descrizione,
                importo_totale, stato, data_inizio, priorita,
                "createdAt", "updatedAt"
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, NOW(), $8, NOW(), NOW()
              )
              RETURNING id, codice`,
              [
                `INC${new Date().getFullYear()}${String(cliente.id).padStart(4, '0')}`, // Codice incarico
                cliente.id,
                parseInt(metadata.bundleId),
                metadata.bundleName,
                `Acquisto bundle ${metadata.bundleName} - Stripe Session ${session.id}`,
                parseFloat(metadata.prezzoMedio),
                'ATTIVO',
                'ALTA', // Priorità default
              ]
            )

            const incarico = incaricoResult.rows[0]
            console.log(`[Webhook] Incarico created: ${incarico.id} (${incarico.codice})`)

            // 3. Recupera milestone dal bundle
            const bundleResult = await query(
              `SELECT milestone FROM bundle WHERE id = $1`,
              [parseInt(metadata.bundleId)]
            )

            if (bundleResult.rows.length > 0) {
              const bundleMilestones = bundleResult.rows[0].milestone as Array<{
                codice: string
                nome: string
                percentuale: number
              }>

              // 4. Crea MILESTONE per incarico
              for (const [index, m] of bundleMilestones.entries()) {
                const importoMilestone = Math.round(
                  parseFloat(metadata.prezzoMedio) * (m.percentuale / 100)
                )

                const milestoneResult = await query(
                  `INSERT INTO milestone (
                    incarico_id, codice, nome, descrizione,
                    percentuale, importo, stato,
                    data_scadenza, "createdAt", "updatedAt"
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                  RETURNING id`,
                  [
                    incarico.id,
                    m.codice,
                    m.nome,
                    `Milestone ${m.nome} - ${m.percentuale}%`,
                    m.percentuale,
                    importoMilestone,
                    index === 0 ? 'PAGATO' : 'NON_PAGATO', // Prima milestone già pagata
                    index === 0 ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30gg per successive
                  ]
                )

                // Se è la prima milestone (appena pagata), aggiorna data pagamento
                if (index === 0) {
                  await query(
                    `UPDATE milestone SET data_pagamento = NOW() WHERE id = $1`,
                    [milestoneResult.rows[0].id]
                  )
                }

                console.log(
                  `[Webhook] Milestone ${m.codice} created (${index === 0 ? 'PAID' : 'UNPAID'})`
                )
              }
            }

            // 5. Crea UTENTE COMMITTENTE
            // Genera password temporanea (verrà richiesto reset al primo login)
            const bcrypt = require('bcryptjs')
            const tempPassword = Math.random().toString(36).slice(-12) // Password casuale
            const passwordHash = await bcrypt.hash(tempPassword, 10)

            const utenteResult = await query(
              `INSERT INTO utenti (
                email, password_hash, nome, cognome, ruolo,
                cliente_id, attivo, "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
              RETURNING id, email`,
              [
                metadata.clienteEmail,
                passwordHash,
                metadata.clienteNome,
                metadata.clienteCognome,
                'COMMITTENTE',
                cliente.id,
                true,
              ]
            )

            const utente = utenteResult.rows[0]
            console.log(`[Webhook] Utente COMMITTENTE created: ${utente.id} (${utente.email})`)

            // 6. Aggiorna stato accesso portale cliente
            await query(
              `UPDATE clienti SET stato_accesso_portale = 'attivo' WHERE id = $1`,
              [cliente.id]
            )

            // 7. Invia email con credenziali
            try {
              await sendWelcomeEmail(
                utente.email,
                metadata.clienteNome,
                tempPassword,
                incarico.codice
              )
              console.log(`[Webhook] Welcome email sent to ${utente.email}`)
            } catch (emailError: any) {
              // Email non critico, non blocca creazione
              console.error('[Webhook] Error sending welcome email:', emailError.message)
            }

            console.log(
              `[Webhook] ✅ Initial purchase completed: Cliente ${cliente.codice}, ` +
              `Incarico ${incarico.codice}, Utente ${utente.email}`
            )
          } catch (error: any) {
            console.error('[Webhook] Error creating initial purchase:', error)
            // Non ritorniamo errore a Stripe (già pagato), ma logghiamo
            // TODO: Implementare retry logic o alert admin
          }
        } else if (metadata.milestoneId && metadata.incaricoId) {
          // ========== PAGAMENTO MILESTONE SUCCESSIVA ==========
          const milestoneId = parseInt(metadata.milestoneId)
          const incaricoId = parseInt(metadata.incaricoId)

          console.log(`[Webhook] Milestone payment: ${milestoneId} for incarico ${incaricoId}`)

          // Ottieni cliente dell'incarico per audit log
          const incaricoResult = await query(
            `SELECT cliente_id FROM incarichi WHERE id = $1`,
            [incaricoId]
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
              await logPagamento(utenteId, 'PAYMENT', milestoneId, request, {
                stripeSessionId: session.id,
                importo: session.amount_total,
                valuta: session.currency,
                incaricoId,
              })
            }
          }

          // Aggiorna milestone come pagata
          const milestoneUpdate = await query(
            `UPDATE milestone
             SET stato = 'PAGATO',
                 data_pagamento = CURRENT_TIMESTAMP,
                 "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING nome`,
            [milestoneId]
          )

          // Invia email conferma pagamento
          if (incaricoResult.rows.length > 0 && milestoneUpdate.rows.length > 0) {
            const clienteId = incaricoResult.rows[0].cliente_id
            const milestoneName = milestoneUpdate.rows[0].nome

            // Get cliente info
            const clienteInfo = await query(
              `SELECT c.nome, c.cognome, c.email, i.codice as incarico_codice
               FROM clienti c
               JOIN incarichi i ON i.cliente_id = c.id
               WHERE c.id = $1 AND i.id = $2
               LIMIT 1`,
              [clienteId, incaricoId]
            )

            if (clienteInfo.rows.length > 0) {
              const {nome, email, incarico_codice} = clienteInfo.rows[0]

              try {
                await sendPaymentConfirmationEmail(
                  email,
                  nome,
                  milestoneName,
                  session.amount_total || 0,
                  incarico_codice
                )
                console.log(`[Webhook] Payment confirmation email sent to ${email}`)
              } catch (emailError: any) {
                console.error('[Webhook] Error sending payment confirmation:', emailError.message)
              }
            }
          }

          console.log(`[Webhook] ✅ Milestone ${milestoneId} marked as paid`)
        } else {
          console.log('[Webhook] Checkout session without recognized metadata, skipping')
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
