import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/bundle/[codice]
 * Restituisce un bundle specifico per codice
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ codice: string }> }
) {
  try {
    const { codice } = await params

    const sql = `
      SELECT
        id, codice, nome, descrizione, target,
        prezzo_min as "prezzoMin",
        prezzo_max as "prezzoMax",
        durata_mesi as "durataMesi",
        servizi, procedure, milestone,
        fase_mvp as "faseMvp",
        attivo
      FROM bundle
      WHERE codice = $1
      LIMIT 1
    `

    const result = await query(sql, [codice])
    const bundle = result.rows[0]

    if (!bundle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bundle non trovato',
        },
        { status: 404 }
      )
    }

    if (!bundle.attivo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bundle non disponibile',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bundle,
    })
  } catch (error) {
    console.error('Errore API /api/bundle/[codice]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero del bundle',
      },
      { status: 500 }
    )
  }
}
