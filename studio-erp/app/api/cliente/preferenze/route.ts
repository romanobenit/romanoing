import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { query } from '@/lib/db'
import { authenticatedApiRateLimit, getIdentifier, applyRateLimit } from '@/lib/rate-limit'
import { auditLog } from '@/lib/audit-log'
import { authOptions } from '@/lib/auth.config'

/**
 * GET /api/cliente/preferenze
 * 
 * Recupera le preferenze di notifica dell'utente committente
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

    const userId = parseInt(session.user.id)

    // Recupera preferenze esistenti
    const prefsResult = await query(
      `SELECT
        email_attivo,
        notifica_nuovo_documento,
        notifica_messaggio,
        notifica_richiesta_pagamento,
        notifica_stato_incarico,
        notifica_richiesta_documento
      FROM preferenze_notifiche
      WHERE utente_id = $1`,
      [userId]
    )

    // Se non esistono preferenze, ritorna defaults
    if (prefsResult.rows.length === 0) {
      const defaultPrefs = {
        email_attivo: true,
        notifica_nuovo_documento: true,
        notifica_messaggio: true,
        notifica_richiesta_pagamento: true,
        notifica_stato_incarico: true,
        notifica_richiesta_documento: true,
      }

      // Crea preferenze default nel database
      await query(
        `INSERT INTO preferenze_notifiche (
          utente_id, email_attivo, 
          notifica_nuovo_documento, notifica_messaggio,
          notifica_richiesta_pagamento, notifica_stato_incarico,
          notifica_richiesta_documento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, true, true, true, true, true, true]
      )

      return NextResponse.json({
        success: true,
        preferenze: defaultPrefs,
      })
    }

    const preferenze = prefsResult.rows[0]

    return NextResponse.json({
      success: true,
      preferenze,
    })

  } catch (error: any) {
    console.error('[API] Error fetching notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cliente/preferenze
 * 
 * Aggiorna le preferenze di notifica dell'utente committente
 */
export async function PUT(request: Request) {
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

    const userId = parseInt(session.user.id)
    const body = await request.json()

    const {
      email_attivo,
      notifica_nuovo_documento,
      notifica_messaggio,
      notifica_richiesta_pagamento,
      notifica_stato_incarico,
      notifica_richiesta_documento,
    } = body

    // Validazione input
    const booleanFields = [
      email_attivo,
      notifica_nuovo_documento,
      notifica_messaggio,
      notifica_richiesta_pagamento,
      notifica_stato_incarico,
      notifica_richiesta_documento,
    ]

    for (const field of booleanFields) {
      if (typeof field !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'Tutti i campi devono essere boolean' },
          { status: 400 }
        )
      }
    }

    // Upsert preferenze (INSERT se non esistono, UPDATE se esistono)
    await query(
      `INSERT INTO preferenze_notifiche (
        utente_id, email_attivo, 
        notifica_nuovo_documento, notifica_messaggio,
        notifica_richiesta_pagamento, notifica_stato_incarico,
        notifica_richiesta_documento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (utente_id) DO UPDATE SET
        email_attivo = EXCLUDED.email_attivo,
        notifica_nuovo_documento = EXCLUDED.notifica_nuovo_documento,
        notifica_messaggio = EXCLUDED.notifica_messaggio,
        notifica_richiesta_pagamento = EXCLUDED.notifica_richiesta_pagamento,
        notifica_stato_incarico = EXCLUDED.notifica_stato_incarico,
        notifica_richiesta_documento = EXCLUDED.notifica_richiesta_documento`,
      [
        userId,
        email_attivo,
        notifica_nuovo_documento,
        notifica_messaggio,
        notifica_richiesta_pagamento,
        notifica_stato_incarico,
        notifica_richiesta_documento,
      ]
    )

    // Audit log
    await auditLog(
      userId,
      'UPDATE',
      'preferenze_notifiche',
      userId,
      request,
      {
        email_attivo,
        notifica_nuovo_documento,
        notifica_messaggio,
        notifica_richiesta_pagamento,
        notifica_stato_incarico,
        notifica_richiesta_documento,
      }
    )

    console.log(`[API] Notification preferences updated for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: 'Preferenze aggiornate con successo',
    })

  } catch (error: any) {
    console.error('[API] Error updating notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}