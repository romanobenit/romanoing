/**
 * /api/sportello/dashboard
 * GET — KPIs e dati per la Dashboard Titolare del Sportello Virtuale
 * Auth: TITOLARE only
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).ruolo !== 'TITOLARE') {
    return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'kpi'; // kpi | lead | consulenze

    if (tab === 'kpi') {
      const [sessioni, lead, consulenze, offerteOggi] = await Promise.all([
        query(`SELECT COUNT(*) as total,
                SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as oggi
               FROM sessioni_quiz`),
        query(`SELECT COUNT(*) as total,
                SUM(CASE WHEN stato = 'nuovo' THEN 1 ELSE 0 END) as nuovi
               FROM lead_preventivi`),
        query(`SELECT COUNT(*) as total,
                COALESCE(SUM(prezzo_finale_centesimi), 0) as totale_centesimi
               FROM offerte_calcolate WHERE accettata = TRUE`),
        query(`SELECT COUNT(*) as count
               FROM sessioni_quiz WHERE DATE(created_at) = CURRENT_DATE`),
      ]);

      return NextResponse.json({
        success: true,
        kpi: {
          sessioni_totali: parseInt(sessioni.rows[0].total),
          sessioni_oggi: parseInt(sessioni.rows[0].oggi),
          lead_totali: parseInt(lead.rows[0].total),
          lead_nuovi: parseInt(lead.rows[0].nuovi),
          consulenze_vendute: parseInt(consulenze.rows[0].total),
          fatturato_centesimi: parseInt(consulenze.rows[0].totale_centesimi),
        },
      });
    }

    if (tab === 'lead') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = 20;
      const offset = (page - 1) * limit;

      const result = await query(
        `SELECT id, nome, email, telefono, stato, note_aggiuntive,
                brief, created_at, assegnato_a,
                (SELECT email FROM utenti WHERE id = assegnato_a) as assegnato_email
         FROM lead_preventivi
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const count = await query(`SELECT COUNT(*) as total FROM lead_preventivi`);

      return NextResponse.json({
        success: true,
        lead: result.rows,
        total: parseInt(count.rows[0].total),
        page,
      });
    }

    if (tab === 'consulenze') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = 20;
      const offset = (page - 1) * limit;

      const result = await query(
        `SELECT o.id, o.tipo_erogazione, o.titolo_servizio, o.prezzo_finale_centesimi,
                o.sla_ore, o.created_at, o.stripe_session_id,
                s.email as cliente_email, s.routing,
                i.codice as incarico_codice, i.stato as incarico_stato,
                i.id as incarico_id
         FROM offerte_calcolate o
         JOIN sessioni_quiz s ON o.sessione_id = s.id
         LEFT JOIN incarichi i ON i.offerta_id = o.id
         WHERE o.accettata = TRUE
         ORDER BY o.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const count = await query(
        `SELECT COUNT(*) as total FROM offerte_calcolate WHERE accettata = TRUE`
      );

      return NextResponse.json({
        success: true,
        consulenze: result.rows,
        total: parseInt(count.rows[0].total),
        page,
      });
    }

    return NextResponse.json({ success: false, error: 'tab non valido' }, { status: 400 });
  } catch (err: any) {
    console.error('[/api/sportello/dashboard GET]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Aggiorna stato lead o assegnazione
  const session = await auth();
  if (!session?.user || (session.user as any).ruolo !== 'TITOLARE') {
    return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 });
  }

  try {
    const { leadId, stato, assegnatoA } = await request.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: 'leadId richiesto' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;

    if (stato) {
      updates.push(`stato = $${i++}`);
      params.push(stato);
    }
    if (assegnatoA !== undefined) {
      updates.push(`assegnato_a = $${i++}`);
      params.push(assegnatoA);
    }

    params.push(leadId);
    await query(
      `UPDATE lead_preventivi SET ${updates.join(', ')} WHERE id = $${i}`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[/api/sportello/dashboard PATCH]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
