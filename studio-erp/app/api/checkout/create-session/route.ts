import {NextResponse} from 'next/server'
import {query} from '@/lib/db'
import Stripe from 'stripe'
import {publicApiRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'

/**
 * Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not available
 */
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

/**
 * POST /api/checkout/create-session
 *
 * Crea una Stripe Checkout Session per l'acquisto iniziale di un bundle
 *
 * Body:
 * - bundleCode: Codice bundle (es. "BDL-RISTR-BONUS")
 * - cliente: { nome, cognome, email, telefono, codiceFiscale?, indirizzo?, citta?, cap?, note? }
 *
 * Response:
 * - checkoutUrl: URL Stripe Checkout per redirect
 * - sessionId: ID sessione Stripe
 */
export async function POST(request: Request) {
  // Rate limiting per API pubbliche
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(publicApiRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const {bundleCode, cliente} = body

    // Validazione input
    if (!bundleCode || !cliente) {
      return NextResponse.json(
        {success: false, error: 'bundleCode e cliente richiesti'},
        {status: 400}
      )
    }

    const {nome, cognome, email, telefono} = cliente

    if (!nome || !cognome || !email || !telefono) {
      return NextResponse.json(
        {success: false, error: 'Nome, cognome, email e telefono richiesti'},
        {status: 400}
      )
    }

    // Recupera bundle dal database
    const bundleSql = `
      SELECT
        id, codice, nome, descrizione,
        prezzo_min as "prezzoMin",
        prezzo_max as "prezzoMax",
        milestone,
        attivo
      FROM bundle
      WHERE codice = $1
      LIMIT 1
    `

    const bundleResult = await query(bundleSql, [bundleCode])
    const bundle = bundleResult.rows[0]

    if (!bundle) {
      return NextResponse.json(
        {success: false, error: 'Bundle non trovato'},
        {status: 404}
      )
    }

    if (!bundle.attivo) {
      return NextResponse.json(
        {success: false, error: 'Bundle non disponibile'},
        {status: 404}
      )
    }

    // Calcola importo acconto (prima milestone)
    const milestone = bundle.milestone as Array<{
      codice: string
      nome: string
      percentuale: number
    }>

    if (!milestone || milestone.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Bundle senza milestone configurate'},
        {status: 500}
      )
    }

    const primaMilestone = milestone[0]
    const prezzoMedio = Math.round((bundle.prezzoMin + bundle.prezzoMax) / 2)
    const importoAcconto = Math.round(prezzoMedio * (primaMilestone.percentuale / 100))

    // Crea Stripe Checkout Session
    const stripe = getStripeClient()
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${bundle.nome} - ${primaMilestone.nome}`,
              description: bundle.descrizione,
              metadata: {
                bundleCode: bundle.codice,
                bundleName: bundle.nome,
                milestoneCode: primaMilestone.codice,
              },
            },
            unit_amount: importoAcconto * 100, // Converti in centesimi
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?bundle=${bundleCode}&cancelled=true`,

      // Metadata per webhook (creazione cliente + incarico)
      metadata: {
        bundleId: bundle.id.toString(),
        bundleCode: bundle.codice,
        bundleName: bundle.nome,
        prezzoMedio: prezzoMedio.toString(),
        milestoneCode: primaMilestone.codice,
        milestoneName: primaMilestone.nome,
        milestonePercentuale: primaMilestone.percentuale.toString(),
        // Dati cliente (per webhook)
        clienteNome: nome,
        clienteCognome: cognome,
        clienteEmail: email,
        clienteTelefono: telefono,
        clienteCodiceFiscale: cliente.codiceFiscale || '',
        clienteIndirizzo: cliente.indirizzo || '',
        clienteCitta: cliente.citta || '',
        clienteCap: cliente.cap || '',
        clienteNote: cliente.note || '',
        type: 'initial_purchase', // Flag per distinguere da pagamento milestone
      },
      customer_email: email,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
    })

    console.log(
      `[Checkout] Stripe session created: ${checkoutSession.id} for bundle ${bundleCode} (${email})`
    )

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error: any) {
    console.error('[Checkout] Error creating Stripe session:', error)
    return NextResponse.json(
      {success: false, error: 'Errore nella creazione del checkout', details: error.message},
      {status: 500}
    )
  }
}
