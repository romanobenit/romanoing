import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { authenticatedApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit'
import { auth } from '@/lib/auth'

/**
 * GET /api/cliente/dashboard
 * 
 * Recupera dati dashboard per committente
 */
export async function GET(request: Request) {
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(authenticatedApiRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json(
        { success: false, error: 'Accesso negato' },
        { status: 403 }
      )
    }

    const clienteId = session.user.clienteId
    if (!clienteId) {
      return NextResponse.json(
        { success: false, error: 'Cliente ID non trovato' },
        { status: 400 }
      )
    }

    // 1. Conteggi generali
    const statsResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM incarichi WHERE cliente_id = $1 AND stato IN ('ATTIVO', 'IN_CORSO')) as incarichi_attivi,
        (SELECT COUNT(*) FROM documenti d
         JOIN incarichi i ON d.incarico_id = i.id 
         WHERE i.cliente_id = $1 AND d.visibile_cliente = true) as documenti_disponibili,
        (SELECT COALESCE(SUM(importo), 0) FROM milestone m
         JOIN incarichi i ON m.incarico_id = i.id
         WHERE i.cliente_id = $1 AND m.stato = 'NON_PAGATO') as importo_da_pagare,
        (SELECT COUNT(*) FROM messaggi msg
         JOIN incarichi i ON msg.incarico_id = i.id
         WHERE i.cliente_id = $1 AND msg.destinatario_id = (
           SELECT id FROM utenti WHERE cliente_id = $1 LIMIT 1
         ) AND msg.letto = false) as messaggi_non_letti
    `, [clienteId])

    const stats = statsResult.rows[0] || {
      incarichi_attivi: 0,
      documenti_disponibili: 0,
      importo_da_pagare: 0,
      messaggi_non_letti: 0
    }

    // 2. Incarichi attivi con milestone
    const incarichiResult = await query(`
      SELECT 
        i.id, 
        i.codice, 
        i.oggetto, 
        i.stato,
        -- Calcolo avanzamento basato su milestone pagate
        CASE 
          WHEN COUNT(m.*) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN m.stato = 'PAGATO' THEN 1 END)::float / COUNT(m.*)::float) * 100)
        END as avanzamento,
        -- Prossima milestone non pagata
        (
          SELECT json_build_object(
            'nome', m2.nome,
            'importo', m2.importo,
            'scadenza', m2.data_scadenza
          )
          FROM milestone m2
          WHERE m2.incarico_id = i.id AND m2.stato = 'NON_PAGATO'
          ORDER BY m2.created_at ASC
          LIMIT 1
        ) as prossima_milestone
      FROM incarichi i
      LEFT JOIN milestone m ON m.incarico_id = i.id
      WHERE i.cliente_id = $1 AND i.stato IN ('ATTIVO', 'IN_CORSO')
      GROUP BY i.id, i.codice, i.oggetto, i.stato
      ORDER BY i.created_at DESC
      LIMIT 5
    `, [clienteId])

    const incarichi = incarichiResult.rows.map(row => ({
      ...row,
      avanzamento: parseInt(row.avanzamento) || 0,
      prossima_milestone: row.prossima_milestone || null
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        importo_da_pagare: parseFloat(stats.importo_da_pagare) || 0,
        prossimi_incarichi: incarichi
      }
    })

  } catch (error: any) {
    console.error('[API] Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}