/**
 * /api/sportello/sessione
 * POST — crea una nuova sessione agentica (session_token generato server-side)
 * GET  — recupera sessione per token
 * PATCH — aggiorna brief, quadro, routing, stato
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { soggetto_tipo, nome, email } = body;

    const token = randomBytes(32).toString('hex');

    const result = await query(
      `INSERT INTO sessioni_quiz (session_token, soggetto_tipo, nome, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_token, stato, created_at`,
      [token, soggetto_tipo || null, nome || null, email || null]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (err: any) {
    console.error('[/api/sportello/sessione POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ success: false, error: 'token richiesto' }, { status: 400 });

    const result = await query(
      `SELECT id, session_token, soggetto_tipo, nome, email,
              brief, quadro_normativo, routing, routing_motivo, stato, created_at
       FROM sessioni_quiz WHERE session_token = $1 LIMIT 1`,
      [token]
    );

    if (!result.rows[0]) return NextResponse.json({ success: false, error: 'Sessione non trovata' }, { status: 404 });

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error('[/api/sportello/sessione GET]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { token, ...updates } = body;
    if (!token) return NextResponse.json({ success: false, error: 'token richiesto' }, { status: 400 });

    const allowed = ['soggetto_tipo', 'nome', 'email', 'brief', 'quadro_normativo',
                     'routing', 'routing_motivo', 'stato'];
    const fields: string[] = [];
    const params: any[] = [];
    let i = 1;

    for (const key of allowed) {
      if (key in updates) {
        fields.push(`${key} = $${i}`);
        params.push(typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]);
        i++;
      }
    }

    if (!fields.length) return NextResponse.json({ success: false, error: 'Nessun campo da aggiornare' }, { status: 400 });

    fields.push(`updated_at = NOW()`);
    params.push(token);

    await query(
      `UPDATE sessioni_quiz SET ${fields.join(', ')} WHERE session_token = $${i}`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[/api/sportello/sessione PATCH]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
