import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { milestoneId } = body

    if (!milestoneId) {
      return NextResponse.json(
        { success: false, error: 'milestoneId richiesto' },
        { status: 400 }
      )
    }

    // Ottieni milestone e verifica accesso
    const sql = `
      SELECT
        m.id,
        m.codice,
        m.nome,
        m.importo,
        m.stato,
        i.id as incarico_id,
        i.codice as incarico_codice,
        i.oggetto as incarico_oggetto,
        i.cliente_id
      FROM milestone m
      JOIN incarichi i ON m.incarico_id = i.id
      WHERE m.id = $1 AND i.cliente_id = $2
      LIMIT 1
    `

    const result = await query(sql, [parseInt(milestoneId), parseInt(session.user.clienteId!)])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Milestone non trovata' },
        { status: 404 }
      )
    }

    const milestone = result.rows[0]

    // Verifica che non sia già pagata
    if (milestone.stato === 'PAGATO') {
      return NextResponse.json(
        { success: false, error: 'Milestone già pagata' },
        { status: 400 }
      )
    }

    // Crea Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${milestone.incarico_codice} - ${milestone.nome}`,
              description: milestone.incarico_oggetto,
            },
            unit_amount: Math.round(parseFloat(milestone.importo) * 100), // Converti in centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cliente/incarichi/${milestone.incarico_id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cliente/incarichi/${milestone.incarico_id}?payment=cancelled`,
      metadata: {
        milestoneId: milestone.id.toString(),
        incaricoId: milestone.incarico_id.toString(),
        clienteId: session.user.clienteId!,
      },
      customer_email: session.user.email!,
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating Stripe checkout:', error)
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione del pagamento' },
      { status: 500 }
    )
  }
}
