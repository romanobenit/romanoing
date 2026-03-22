/**
 * /api/sportello/checkout
 * POST — Crea Stripe Checkout Session per un'offerta calcolata
 * Body: { offertaId, email? }
 * Non richiede autenticazione (acquisto pubblico)
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { publicApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const rl = await applyRateLimit(publicApiRateLimit, identifier);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { offertaId, email } = body;

    if (!offertaId) {
      return NextResponse.json({ success: false, error: 'offertaId richiesto' }, { status: 400 });
    }

    // Recupera offerta + dati sessione
    const result = await query(
      `SELECT
         o.id, o.tipo_erogazione, o.titolo_servizio, o.descrizione_deliverable,
         o.prezzo_finale_centesimi, o.sla_ore, o.sessione_id,
         s.session_token, s.email as sessione_email
       FROM offerte_calcolate o
       JOIN sessioni_quiz s ON o.sessione_id = s.id
       WHERE o.id = $1
       LIMIT 1`,
      [parseInt(offertaId)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Offerta non trovata' }, { status: 404 });
    }

    const offerta = result.rows[0];
    const customerEmail = email || offerta.sessione_email || undefined;

    const SLA_LABEL: Record<string, string> = {
      PLATFORM: 'Documento generato dall\'AI entro',
      IMMEDIATA: 'Analisi AI disponibile entro',
      INGEGNERE: 'Parere firmato consegnato entro',
    };
    const slaDesc = offerta.sla_ore
      ? `${SLA_LABEL[offerta.tipo_erogazione] ?? 'Consegna entro'} ${offerta.sla_ore}h dall\'acquisto`
      : '';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: offerta.titolo_servizio,
              description: [offerta.descrizione_deliverable, slaDesc].filter(Boolean).join(' · '),
            },
            unit_amount: offerta.prezzo_finale_centesimi,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sportello/acquista/${offertaId}?esito=successo&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sportello/acquista/${offertaId}?esito=annullato`,
      customer_email: customerEmail,
      metadata: {
        type: 'consulenza_sportello',
        offertaId: offerta.id.toString(),
        sessioneId: offerta.sessione_id.toString(),
        sessionToken: offerta.session_token,
        tipoErogazione: offerta.tipo_erogazione,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ success: true, checkoutUrl: checkoutSession.url });
  } catch (err: any) {
    console.error('[/api/sportello/checkout POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
