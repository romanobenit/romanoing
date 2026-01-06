import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authenticatedApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit'
import { authOptions } from '@/lib/auth.config'

/**
 * GET /api/cliente/incarichi
 * 
 * Recupera gli incarichi del committente con filtro opzionale
 * Query params: filter=attivi|completati|tutti (default: tutti)
 */
export async function GET(request: Request) {
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(authenticatedApiRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json(
        { success: false, error: 'Accesso negato' },
        { status: 403 }
      )
    }

    const clienteId = session.user.cliente_id
    if (!clienteId) {
      return NextResponse.json(
        { success: false, error: 'Cliente ID non trovato' },
        { status: 400 }
      )
    }

    // Parse query params
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter') || 'tutti'

    // Build WHERE clause based on filter
    let whereClause = 'i.cliente_id = $1'
    switch (filter) {
      case 'attivi':
        whereClause += " AND i.stato IN ('ATTIVO', 'IN_CORSO')"
        break
      case 'completati':
        whereClause += " AND i.stato = 'COMPLETATO'"
        break
      // 'tutti' - no additional filter
    }

    const incarichiResult = await query(`
      SELECT 
        i.id,
        i.codice,
        i.oggetto,
        i.descrizione,
        i.stato,
        i.importo_totale,
        i.data_inizio,
        i.data_fine,
        b.nome as bundle_nome,
        -- Calcolo avanzamento
        CASE 
          WHEN COUNT(m.*) = 0 THEN 0
          ELSE ROUND((COUNT(CASE WHEN m.stato = 'PAGATO' THEN 1 END)::float / COUNT(m.*)::float) * 100)
        END as avanzamento,
        COUNT(m.*) as milestone_totali,
        COUNT(CASE WHEN m.stato = 'PAGATO' THEN 1 END) as milestone_pagate,
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
      LEFT JOIN bundle b ON i.bundle_id = b.id
      LEFT JOIN milestone m ON m.incarico_id = i.id
      WHERE ${whereClause}
      GROUP BY i.id, i.codice, i.oggetto, i.descrizione, i.stato, 
               i.importo_totale, i.data_inizio, i.data_fine, b.nome
      ORDER BY 
        CASE i.stato
          WHEN 'IN_CORSO' THEN 1
          WHEN 'ATTIVO' THEN 2
          WHEN 'IN_ATTESA' THEN 3
          WHEN 'COMPLETATO' THEN 4
          ELSE 5
        END,
        i.created_at DESC
    `, [clienteId])

    const incarichi = incarichiResult.rows.map(row => ({
      ...row,
      importo_totale: parseFloat(row.importo_totale) || 0,
      avanzamento: parseInt(row.avanzamento) || 0,
      milestone_totali: parseInt(row.milestone_totali) || 0,
      milestone_pagate: parseInt(row.milestone_pagate) || 0,
      prossima_milestone: row.prossima_milestone || null
    }))

    return NextResponse.json({
      success: true,
      incarichi,
      filter,
      total: incarichi.length
    })

  } catch (error: any) {
    console.error('[API] Error fetching client incarichi:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}