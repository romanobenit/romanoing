import {NextResponse} from 'next/server'
import {getServerSession} from 'next-auth'
import {authOptions} from '@/app/api/auth/[...nextauth]/auth-options'
import {query} from '@/lib/db'

/**
 * GET /api/cliente/preferenze
 * Restituisce le preferenze di notifica dell'utente corrente
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {success: false, error: 'Non autenticato'},
        {status: 401}
      )
    }

    // Get user ID
    const userResult = await query(
      `SELECT id FROM utenti WHERE email = $1`,
      [session.user.email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Utente non trovato'},
        {status: 404}
      )
    }

    const userId = userResult.rows[0].id

    // Get or create preferences
    let prefsResult = await query(
      `SELECT
        id,
        utente_id as "utenteId",
        email_attivo as "emailAttivo",
        notifica_nuovo_documento as "notificaNuovoDocumento",
        notifica_messaggio as "notificaMessaggio",
        notifica_richiesta_pagamento as "notificaRichiestaPagamento",
        notifica_stato_incarico as "notificaStatoIncarico",
        notifica_richiesta_documento as "notificaRichiestaDocumento"
      FROM preferenze_notifiche
      WHERE utente_id = $1`,
      [userId]
    )

    // If no preferences exist, create default ones
    if (prefsResult.rows.length === 0) {
      await query(
        `INSERT INTO preferenze_notifiche (
          utente_id,
          email_attivo,
          notifica_nuovo_documento,
          notifica_messaggio,
          notifica_richiesta_pagamento,
          notifica_stato_incarico,
          notifica_richiesta_documento
        ) VALUES ($1, true, true, true, true, true, true)`,
        [userId]
      )

      // Fetch the newly created preferences
      prefsResult = await query(
        `SELECT
          id,
          utente_id as "utenteId",
          email_attivo as "emailAttivo",
          notifica_nuovo_documento as "notificaNuovoDocumento",
          notifica_messaggio as "notificaMessaggio",
          notifica_richiesta_pagamento as "notificaRichiestaPagamento",
          notifica_stato_incarico as "notificaStatoIncarico",
          notifica_richiesta_documento as "notificaRichiestaDocumento"
        FROM preferenze_notifiche
        WHERE utente_id = $1`,
        [userId]
      )
    }

    return NextResponse.json({
      success: true,
      data: prefsResult.rows[0],
    })
  } catch (error) {
    console.error('Errore GET /api/cliente/preferenze:', error)
    return NextResponse.json(
      {success: false, error: 'Errore nel recupero delle preferenze'},
      {status: 500}
    )
  }
}

/**
 * PATCH /api/cliente/preferenze
 * Aggiorna le preferenze di notifica dell'utente corrente
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        {success: false, error: 'Non autenticato'},
        {status: 401}
      )
    }

    const body = await request.json()
    const {
      emailAttivo,
      notificaNuovoDocumento,
      notificaMessaggio,
      notificaRichiestaPagamento,
      notificaStatoIncarico,
      notificaRichiestaDocumento,
    } = body

    // Get user ID
    const userResult = await query(
      `SELECT id FROM utenti WHERE email = $1`,
      [session.user.email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Utente non trovato'},
        {status: 404}
      )
    }

    const userId = userResult.rows[0].id

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (emailAttivo !== undefined) {
      updates.push(`email_attivo = $${paramIndex}`)
      values.push(emailAttivo)
      paramIndex++
    }

    if (notificaNuovoDocumento !== undefined) {
      updates.push(`notifica_nuovo_documento = $${paramIndex}`)
      values.push(notificaNuovoDocumento)
      paramIndex++
    }

    if (notificaMessaggio !== undefined) {
      updates.push(`notifica_messaggio = $${paramIndex}`)
      values.push(notificaMessaggio)
      paramIndex++
    }

    if (notificaRichiestaPagamento !== undefined) {
      updates.push(`notifica_richiesta_pagamento = $${paramIndex}`)
      values.push(notificaRichiestaPagamento)
      paramIndex++
    }

    if (notificaStatoIncarico !== undefined) {
      updates.push(`notifica_stato_incarico = $${paramIndex}`)
      values.push(notificaStatoIncarico)
      paramIndex++
    }

    if (notificaRichiestaDocumento !== undefined) {
      updates.push(`notifica_richiesta_documento = $${paramIndex}`)
      values.push(notificaRichiestaDocumento)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {success: false, error: 'Nessun campo da aggiornare'},
        {status: 400}
      )
    }

    // Add userId as last parameter
    values.push(userId)

    // Execute update (or insert if not exists)
    const updateSql = `
      INSERT INTO preferenze_notifiche (
        utente_id,
        email_attivo,
        notifica_nuovo_documento,
        notifica_messaggio,
        notifica_richiesta_pagamento,
        notifica_stato_incarico,
        notifica_richiesta_documento
      ) VALUES (
        $${paramIndex},
        COALESCE($1, true),
        COALESCE($2, true),
        COALESCE($3, true),
        COALESCE($4, true),
        COALESCE($5, true),
        COALESCE($6, true)
      )
      ON CONFLICT (utente_id)
      DO UPDATE SET
        ${updates.join(', ')}
      RETURNING
        id,
        utente_id as "utenteId",
        email_attivo as "emailAttivo",
        notifica_nuovo_documento as "notificaNuovoDocumento",
        notifica_messaggio as "notificaMessaggio",
        notifica_richiesta_pagamento as "notificaRichiestaPagamento",
        notifica_stato_incarico as "notificaStatoIncarico",
        notifica_richiesta_documento as "notificaRichiestaDocumento"
    `

    const result = await query(updateSql, values)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Preferenze aggiornate con successo',
    })
  } catch (error) {
    console.error('Errore PATCH /api/cliente/preferenze:', error)
    return NextResponse.json(
      {success: false, error: 'Errore nell\'aggiornamento delle preferenze'},
      {status: 500}
    )
  }
}
