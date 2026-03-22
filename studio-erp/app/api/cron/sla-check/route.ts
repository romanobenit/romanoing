/**
 * /api/cron/sla-check
 * GET — Controlla incarichi consulenza con SLA in scadenza e invia alert al Titolare
 * Chiamato da cron job ogni ora (es. Vercel Cron, crontab)
 *
 * Protezione: header Authorization: Bearer CRON_SECRET
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendSlaAlertEmail } from '@/lib/email';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Verifica autorizzazione cron
  if (CRON_SECRET) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
  }

  try {
    // Incarichi consulenza con SLA in scadenza nelle prossime 8h (non ancora in stato CHIUSO/CONSEGNATO)
    const result = await query(
      `SELECT
         i.id, i.codice, i.oggetto, i.sla_scadenza,
         EXTRACT(EPOCH FROM (i.sla_scadenza - NOW())) / 3600 AS ore_rimanenti,
         s.email AS customer_email
       FROM incarichi i
       LEFT JOIN sessioni_quiz s ON i.sessione_quiz_id = s.id
       WHERE i.tipo LIKE 'consulenza_%'
         AND i.sla_scadenza IS NOT NULL
         AND i.stato NOT IN ('CHIUSO', 'CONSEGNATO', 'ANNULLATO')
         AND i.sla_scadenza > NOW()
         AND i.sla_scadenza <= NOW() + INTERVAL '8 hours'
         AND (i.sla_alert_inviato IS NULL OR i.sla_alert_inviato < NOW() - INTERVAL '4 hours')
       ORDER BY i.sla_scadenza ASC`,
    );

    const alerts = result.rows;
    const results: { codice: string; oreRimanenti: number; sent: boolean }[] = [];

    for (const incarico of alerts) {
      const oreRimanenti = Math.max(0, Math.round(parseFloat(incarico.ore_rimanenti)));

      try {
        await sendSlaAlertEmail({
          codice: incarico.codice,
          titoloServizio: incarico.oggetto,
          slaScadenza: new Date(incarico.sla_scadenza),
          oreRimanenti,
          customerEmail: incarico.customer_email || 'N/D',
        });

        // Marca alert come inviato
        await query(
          `UPDATE incarichi SET sla_alert_inviato = NOW() WHERE id = $1`,
          [incarico.id]
        );

        results.push({ codice: incarico.codice, oreRimanenti, sent: true });
      } catch (err) {
        console.error(`[SLA Check] Alert fallito per ${incarico.codice}:`, err);
        results.push({ codice: incarico.codice, oreRimanenti, sent: false });
      }
    }

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      alertsSent: results.filter(r => r.sent).length,
      results,
    });
  } catch (err: any) {
    console.error('[/api/cron/sla-check]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
