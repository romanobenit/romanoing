import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

/**
 * GET /api/cliente/incarichi/[id]
 * Restituisce il dettaglio di un incarico specifico
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

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
        i.note,
        i.metadati,
        i.created_at as "createdAt",
        b.nome as "bundleNome",
        b.codice as "bundleCodice",
        b.descrizione as "bundleDescrizione",
        b.servizi as "bundleServizi",
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
              'dataPagamento', m.data_pagamento,
              'stripePaymentId', m.stripe_payment_id
            ) ORDER BY m.codice
          )
          FROM milestone m
          WHERE m.incarico_id = i.id
        ) as milestone,
        (
          SELECT json_agg(
            json_build_object(
              'id', d.id,
              'nomeFile', d.nome_file,
              'categoria', d.categoria,
              'versione', d.versione,
              'stato', d.stato,
              'dataConsegna', d.data_consegna,
              'dimensione', d.dimensione,
              'createdAt', d.created_at
            ) ORDER BY d.created_at DESC
          )
          FROM documenti d
          WHERE d.incarico_id = i.id AND d.visibile_cliente = true
        ) as documenti,
        u.nome as "responsabileNome",
        u.cognome as "responsabileCognome",
        u.email as "responsabileEmail"
      FROM incarichi i
      LEFT JOIN bundle b ON i.bundle_id = b.id
      LEFT JOIN utenti u ON i.responsabile_id = u.id
      WHERE i.id = $1 AND i.cliente_id = $2
      LIMIT 1
    `

    const result = await query(sql, [parseInt(id), parseInt(session.user.clienteId!)])
    const incarico = result.rows[0]

    if (!incarico) {
      return NextResponse.json(
        { success: false, error: 'Incarico non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: incarico,
    })
  } catch (error) {
    console.error('Errore API /api/cliente/incarichi/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dell\'incarico',
      },
      { status: 500 }
    )
  }
}
