import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

/**
 * GET /api/cliente/profilo
 * Restituisce i dati del profilo del cliente loggato
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

    const sql = `
      SELECT
        u.id,
        u.email,
        u.nome,
        u.cognome,
        u.email_verified as "emailVerified",
        c.codice as "clienteCodice",
        c.tipo as "clienteTipo",
        c.ragione_sociale as "ragioneSociale",
        c.codice_fiscale as "codiceFiscale",
        c.partita_iva as "partitaIva",
        c.telefono,
        c.indirizzo,
        c.citta,
        c.provincia,
        c.cap,
        c.note,
        pn.email_attivo as "emailAttivo",
        pn.notifica_nuovo_documento as "notificaNuovoDocumento",
        pn.notifica_messaggio as "notificaMessaggio",
        pn.notifica_richiesta_pagamento as "notificaRichiestaPagamento",
        pn.notifica_stato_incarico as "notificaStatoIncarico",
        pn.notifica_richiesta_documento as "notificaRichiestaDocumento"
      FROM utenti u
      JOIN clienti c ON u.cliente_id = c.id
      LEFT JOIN preferenze_notifiche pn ON pn.utente_id = u.id
      WHERE u.id = $1
      LIMIT 1
    `

    const result = await query(sql, [parseInt(session.user.id)])
    const profilo = result.rows[0]

    if (!profilo) {
      return NextResponse.json(
        { success: false, error: 'Profilo non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profilo,
    })
  } catch (error) {
    console.error('Errore API /api/cliente/profilo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero del profilo',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/cliente/profilo
 * Aggiorna il profilo del cliente (solo campi consentiti)
 */
export async function PATCH(request: Request) {
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

    const body = await request.json()
    const { telefono, indirizzo, citta, provincia, cap } = body

    // Aggiorna solo i campi del cliente (non dell'utente)
    const updateClienteSql = `
      UPDATE clienti
      SET
        telefono = COALESCE($1, telefono),
        indirizzo = COALESCE($2, indirizzo),
        citta = COALESCE($3, citta),
        provincia = COALESCE($4, provincia),
        cap = COALESCE($5, cap),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `

    await query(updateClienteSql, [
      telefono || null,
      indirizzo || null,
      citta || null,
      provincia || null,
      cap || null,
      parseInt(session.user.clienteId!),
    ])

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo',
    })
  } catch (error) {
    console.error('Errore API PATCH /api/cliente/profilo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nell\'aggiornamento del profilo',
      },
      { status: 500 }
    )
  }
}
