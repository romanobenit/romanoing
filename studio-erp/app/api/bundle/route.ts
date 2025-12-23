import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/bundle
 * Restituisce tutti i bundle attivi della Fase 1 MVP
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const faseMvp = searchParams.get('fase') || '1'
    const target = searchParams.get('target')

    let sql = `
      SELECT
        id, codice, nome, descrizione, target,
        prezzo_min as "prezzoMin",
        prezzo_max as "prezzoMax",
        durata_mesi as "durataMesi",
        servizi, procedure, milestone,
        fase_mvp as "faseMvp"
      FROM bundle
      WHERE attivo = true AND fase_mvp = $1
    `
    const params: any[] = [parseInt(faseMvp)]

    if (target) {
      sql += ` AND target = $2`
      params.push(target)
    }

    sql += ` ORDER BY prezzo_min ASC`

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error('Errore API /api/bundle:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei bundle',
      },
      { status: 500 }
    )
  }
}
