/**
 * /api/sportello/analisi
 * POST — Agente 1: riceve messaggio utente, restituisce risposta AI
 *        Quando l'agente termina la discovery, restituisce il BRIEF
 * Body: { token, message, history: [{role, content}] }
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { processDiscovery } from '@/lib/sportello/agente-1-discovery';
import { publicApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const rl = await applyRateLimit(publicApiRateLimit, identifier);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { token, message, history = [] } = body;

    if (!token || !message) {
      return NextResponse.json({ success: false, error: 'token e message richiesti' }, { status: 400 });
    }

    // Carica sessione
    const sessResult = await query(
      `SELECT id, stato FROM sessioni_quiz WHERE session_token = $1 LIMIT 1`,
      [token]
    );
    if (!sessResult.rows[0]) {
      return NextResponse.json({ success: false, error: 'Sessione non trovata' }, { status: 404 });
    }

    const sessione = sessResult.rows[0];

    // Processa con Agente 1
    const { reply, brief, done } = await processDiscovery(history, message, sessione.id);

    // Se BRIEF pronto → salva in sessione
    if (done && brief) {
      await query(
        `UPDATE sessioni_quiz SET brief = $1, updated_at = NOW() WHERE id = $2`,
        [JSON.stringify(brief), sessione.id]
      );
    }

    return NextResponse.json({
      success: true,
      reply,
      brief: done ? brief : undefined,
      discovery_done: done,
    });
  } catch (err: any) {
    console.error('[/api/sportello/analisi POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
