/**
 * /api/sportello/routing
 * POST — Agente 2 + Agente 3:
 *        Riceve BRIEF, esegue analisi normativa (Ag.2) e routing (Ag.3)
 *        Salva quadro_normativo + routing in sessione
 * Body: { token }  (il brief è già salvato nella sessione)
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { analyzeNormativa } from '@/lib/sportello/agente-2-normativista';
import { routeCase } from '@/lib/sportello/agente-3-router';
import { publicApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit';
import type { Brief } from '@/lib/sportello/agente-1-discovery';

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const rl = await applyRateLimit(publicApiRateLimit, identifier);
  if (rl) return rl;

  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ success: false, error: 'token richiesto' }, { status: 400 });

    const sessResult = await query(
      `SELECT id, brief FROM sessioni_quiz WHERE session_token = $1 LIMIT 1`,
      [token]
    );
    const sessione = sessResult.rows[0];
    if (!sessione?.brief) {
      return NextResponse.json({ success: false, error: 'BRIEF non ancora disponibile' }, { status: 400 });
    }

    const brief = sessione.brief as Brief;

    // Agente 2: analisi normativa
    const quadro = await analyzeNormativa(brief, sessione.id);

    // Agente 3: routing (deterministico, nessuna chiamata AI)
    const { percorso_primario, motivo } = routeCase(brief, quadro);

    // Salva in sessione
    await query(
      `UPDATE sessioni_quiz
       SET quadro_normativo = $1, routing = $2, routing_motivo = $3, updated_at = NOW()
       WHERE id = $4`,
      [JSON.stringify(quadro), percorso_primario, motivo, sessione.id]
    );

    return NextResponse.json({
      success: true,
      quadro_normativo: quadro,
      routing: percorso_primario,
      routing_motivo: motivo,
    });
  } catch (err: any) {
    console.error('[/api/sportello/routing POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
