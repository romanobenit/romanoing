import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Solo TITOLARE può accedere a tutti i messaggi
    if (!session?.user || session.user.ruolo !== 'TITOLARE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const letto = searchParams.get('letto')
    const incaricoId = searchParams.get('incaricoId')
    const limit = parseInt(searchParams.get('limit') || '50')

    let sql = `
      SELECT
        m.id,
        m.testo,
        m.letto,
        m.data_lettura as "dataLettura",
        m."createdAt",
        m.incarico_id as "incaricoId",
        i.codice as "incaricoCodice",
        i.oggetto as "incaricoOggetto",
        mittente.id as "mittenteId",
        mittente.nome as "mittenteNome",
        mittente.cognome as "mittenteCognome",
        destinatario.id as "destinatarioId",
        destinatario.nome as "destinatarioNome",
        destinatario.cognome as "destinatarioCognome",
        cliente.id as "clienteId",
        COALESCE(cliente.ragione_sociale, CONCAT(cliente.nome, ' ', cliente.cognome)) as "clienteNome"
      FROM messaggi m
      JOIN incarichi i ON m.incarico_id = i.id
      JOIN utenti mittente ON m.mittente_id = mittente.id
      LEFT JOIN utenti destinatario ON m.destinatario_id = destinatario.id
      LEFT JOIN clienti cliente ON i.cliente_id = cliente.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 1

    // Filtro per stato letto/non letto
    if (letto !== null && letto !== undefined) {
      sql += ` AND m.letto = $${paramCount}`
      params.push(letto === 'true')
      paramCount++
    }

    // Filtro per incarico specifico
    if (incaricoId) {
      sql += ` AND m.incarico_id = $${paramCount}`
      params.push(parseInt(incaricoId))
      paramCount++
    }

    sql += ` ORDER BY m."createdAt" DESC LIMIT $${paramCount}`
    params.push(limit)

    const result = await query(sql, params)

    // Conta messaggi non letti
    const countSql = `
      SELECT COUNT(*) as count
      FROM messaggi m
      WHERE m.letto = false
    `
    const countResult = await query(countSql, [])
    const nonLettiCount = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      success: true,
      data: result.rows,
      nonLettiCount,
    })
  } catch (error: any) {
    console.error('Error in GET /api/admin/messaggi:', error)
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        error: 'Errore del server',
        ...(isDev && { details: error?.message }),
      },
      { status: 500 }
    )
  }
}

// Marca messaggi come letti
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.ruolo !== 'TITOLARE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { messaggioIds } = body

    if (!messaggioIds || !Array.isArray(messaggioIds) || messaggioIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'messaggioIds richiesto' },
        { status: 400 }
      )
    }

    const placeholders = messaggioIds.map((_, i) => `$${i + 1}`).join(', ')
    const sql = `
      UPDATE messaggi
      SET letto = true, data_lettura = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
      RETURNING id
    `

    const result = await query(sql, messaggioIds)

    return NextResponse.json({
      success: true,
      updated: result.rows.length,
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/messaggi:', error)
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        error: 'Errore del server',
        ...(isDev && { details: error?.message }),
      },
      { status: 500 }
    )
  }
}
