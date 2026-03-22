/**
 * /api/sportello/offerta/[id]
 * GET — Recupera dettagli di un'offerta calcolata (pubblica, solo lettura)
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await query(
      `SELECT
         id, tipo_erogazione, titolo_servizio, descrizione_deliverable,
         prezzo_finale_centesimi, sla_ore, avviso
       FROM offerte_calcolate
       WHERE id = $1
       LIMIT 1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Offerta non trovata' }, { status: 404 });
    }

    return NextResponse.json({ success: true, offerta: result.rows[0] });
  } catch (err: any) {
    console.error('[/api/sportello/offerta GET]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
