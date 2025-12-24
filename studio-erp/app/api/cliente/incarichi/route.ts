import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

/**
 * GET /api/cliente/incarichi
 * Restituisce tutti gli incarichi del cliente loggato
 */
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Non autenticato' },
        { status: 401 }
      )
    }

    if (session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json(
        { success: false, error: 'Accesso negato' },
        { status: 403 }
      )
    }

    if (!session.user.clienteId) {
      return NextResponse.json(
        { success: false, error: 'Cliente non trovato' },
        { status: 404 }
      )
    }

    const sql = `
      SELECT
        i.id,
        i.codice,
        i.oggetto,
        i.descrizione,
        i.importo_totale as "importoTotale",
        i.stato,
        i.data_inizio as "dataInizio",
        i.data_fine as "dataFine",
        i.data_scadenza as "dataScadenza",
        i.priorita,
        i.created_at as "createdAt",
        b.nome as "bundleNome",
        b.codice as "bundleCodice",
        (
          SELECT json_agg(
            json_build_object(
              'id', m.id,
              'codice', m.codice,
              'nome', m.nome,
              'descrizione', m.descrizione,
              'percentuale', m.percentuale,
              'importo', m.importo,
              'stato', m.stato,
              'dataScadenza', m.data_scadenza,
              'dataPagamento', m.data_pagamento
            ) ORDER BY m.codice
          )
          FROM milestone m
          WHERE m.incarico_id = i.id
        ) as milestone,
        (
          SELECT COUNT(*)::int
          FROM documenti d
          WHERE d.incarico_id = i.id AND d.visibile_cliente = true
        ) as "documentiCount"
      FROM incarichi i
      LEFT JOIN bundle b ON i.bundle_id = b.id
      WHERE i.cliente_id = $1
      ORDER BY i.created_at DESC
    `

    const result = await query(sql, [parseInt(session.user.clienteId)])

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    })
  } catch (error) {
    console.error('Errore API /api/cliente/incarichi:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero degli incarichi',
      },
      { status: 500 }
    )
  }
}
