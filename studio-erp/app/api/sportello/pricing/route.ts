/**
 * /api/sportello/pricing
 * POST — Agente 5: calcola prezzi e salva offerte in offerte_calcolate
 * Body: { token }
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { calculatePricing } from '@/lib/sportello/agente-5-pricer';
import { publicApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit';
import type { Brief } from '@/lib/sportello/agente-1-discovery';
import type { QuadroNormativo } from '@/lib/sportello/agente-2-normativista';
import type { Percorso } from '@/lib/sportello/agente-3-router';

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const rl = await applyRateLimit(publicApiRateLimit, identifier);
  if (rl) return rl;

  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ success: false, error: 'token richiesto' }, { status: 400 });

    const sessResult = await query(
      `SELECT id, brief, quadro_normativo, routing, email FROM sessioni_quiz
       WHERE session_token = $1 LIMIT 1`,
      [token]
    );
    const sessione = sessResult.rows[0];
    if (!sessione?.brief || !sessione?.quadro_normativo || !sessione?.routing) {
      return NextResponse.json({ success: false, error: 'Sessione incompleta — esegui prima /routing' }, { status: 400 });
    }

    const brief = sessione.brief as Brief;
    const quadro = sessione.quadro_normativo as QuadroNormativo;
    const percorso = sessione.routing as Percorso;

    // Prima consulenza se non ha mai pagato con questa email
    let isFirstTime = true;
    if (sessione.email) {
      const prevResult = await query(
        `SELECT COUNT(*) as cnt FROM incarichi i
         JOIN clienti c ON i.cliente_id = c.id
         WHERE c.email = $1 AND i.tipo LIKE 'consulenza_%'`,
        [sessione.email]
      );
      isFirstTime = parseInt(prevResult.rows[0].cnt) === 0;
    }

    const { opzioni, forchetta_complesso } = await calculatePricing(
      brief, quadro, percorso, isFirstTime, sessione.id
    );

    // Salva offerte nel DB
    const savedOpzioni = await Promise.all(
      opzioni.map(op =>
        query(
          `INSERT INTO offerte_calcolate (
            sessione_id, tipo_erogazione, titolo_servizio, descrizione_deliverable,
            prezzo_base_centesimi, adeguamenti, prezzo_finale_centesimi,
            rationale_pricing, sla_ore, avviso
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
          RETURNING id`,
          [
            sessione.id,
            op.tipo_erogazione,
            op.titolo_servizio,
            op.descrizione_deliverable,
            op.prezzo_base_centesimi,
            JSON.stringify(op.adeguamenti),
            op.prezzo_finale_centesimi,
            JSON.stringify(op.rationale_pricing),
            op.sla_ore,
            op.avviso,
          ]
        ).then(r => ({ ...op, id: r.rows[0].id }))
      )
    );

    return NextResponse.json({
      success: true,
      percorso,
      opzioni: savedOpzioni,
      forchetta_complesso,
    });
  } catch (err: any) {
    console.error('[/api/sportello/pricing POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
