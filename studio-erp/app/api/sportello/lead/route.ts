/**
 * /api/sportello/lead
 * POST — Salva lead preventivo (percorso COMPLESSO)
 * Body: { token, nome, email, telefono, note_aggiuntive }
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { publicApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit';
import { sendLeadNotificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  const identifier = getIdentifier(request);
  const rl = await applyRateLimit(publicApiRateLimit, identifier);
  if (rl) return rl;

  try {
    const body = await request.json();
    const { token, nome, email, telefono, note_aggiuntive } = body;

    if (!nome || !email) {
      return NextResponse.json({ success: false, error: 'nome e email sono obbligatori' }, { status: 400 });
    }

    // Recupera sessione con brief e quadro
    const sessResult = await query(
      `SELECT id, brief, quadro_normativo FROM sessioni_quiz WHERE session_token = $1 LIMIT 1`,
      [token || '']
    );
    const sessione = sessResult.rows[0];

    const result = await query(
      `INSERT INTO lead_preventivi
         (sessione_id, nome, email, telefono, brief, quadro_normativo, note_aggiuntive)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id`,
      [
        sessione?.id || null,
        nome,
        email,
        telefono || null,
        sessione?.brief ? JSON.stringify(sessione.brief) : null,
        sessione?.quadro_normativo ? JSON.stringify(sessione.quadro_normativo) : null,
        note_aggiuntive || null,
      ]
    );

    // Aggiorna stato sessione
    if (sessione?.id) {
      await query(
        `UPDATE sessioni_quiz SET stato = 'completato_lead', updated_at = NOW() WHERE id = $1`,
        [sessione.id]
      );
    }

    // Notifica Titolare
    try {
      await sendLeadNotificationEmail({ nome, email, telefono, note_aggiuntive, brief: sessione?.brief });
    } catch (mailErr) {
      console.error('[lead] Email notifica fallita:', mailErr);
    }

    return NextResponse.json({ success: true, lead_id: result.rows[0].id }, { status: 201 });
  } catch (err: any) {
    console.error('[/api/sportello/lead POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
