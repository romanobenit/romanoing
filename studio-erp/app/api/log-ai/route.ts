import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET: Ottieni log AI (con filtri)
export async function GET(request: Request) {
  try {
    const session = await auth()

    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const verificato = searchParams.get('verificato')
    const incaricoId = searchParams.get('incaricoId')
    const strumento = searchParams.get('strumento')
    const limit = parseInt(searchParams.get('limit') || '50')

    let sql = `
      SELECT
        l.id,
        l.strumento,
        l.modello,
        l.prompt,
        l.risposta,
        l.verificato,
        l.data_verifica as "dataVerifica",
        l.contesto,
        l."createdAt",
        l.incarico_id as "incaricoId",
        utilizzato.id as "utilizzatoId",
        utilizzato.nome as "utilizzatoNome",
        utilizzato.cognome as "utilizzatoCognome",
        verificatore.id as "verificatoreId",
        verificatore.nome as "verificatoreNome",
        verificatore.cognome as "verificatoreCognome",
        i.codice as "incaricoCodice",
        i.oggetto as "incaricoOggetto"
      FROM log_ai l
      JOIN utenti utilizzato ON l.utilizzato_da = utilizzato.id
      LEFT JOIN utenti verificatore ON l.verificato_da = verificatore.id
      LEFT JOIN incarichi i ON l.incarico_id = i.id
      WHERE 1=1
    `

    const params: any[] = []
    let paramCount = 1

    // Solo TITOLARE può vedere tutti i log, gli altri solo i propri
    if (session.user.ruolo !== 'TITOLARE') {
      sql += ` AND l.utilizzato_da = $${paramCount}`
      params.push(parseInt(session.user.id))
      paramCount++
    }

    // Filtro per stato verifica
    if (verificato !== null && verificato !== undefined) {
      sql += ` AND l.verificato = $${paramCount}`
      params.push(verificato === 'true')
      paramCount++
    }

    // Filtro per incarico
    if (incaricoId) {
      sql += ` AND l.incarico_id = $${paramCount}`
      params.push(parseInt(incaricoId))
      paramCount++
    }

    // Filtro per strumento
    if (strumento) {
      sql += ` AND l.strumento = $${paramCount}`
      params.push(strumento)
      paramCount++
    }

    sql += ` ORDER BY l."createdAt" DESC LIMIT $${paramCount}`
    params.push(limit)

    const result = await query(sql, params)

    // Conta log non verificati (solo per TITOLARE)
    let nonVerificatiCount = 0
    if (session.user.ruolo === 'TITOLARE') {
      const countSql = `SELECT COUNT(*) as count FROM log_ai WHERE verificato = false`
      const countResult = await query(countSql, [])
      nonVerificatiCount = parseInt(countResult.rows[0].count)
    }

    return NextResponse.json({
      success: true,
      data: result.rows,
      nonVerificatiCount,
    })
  } catch (error: any) {
    console.error('Error in GET /api/log-ai:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server', details: error?.message },
      { status: 500 }
    )
  }
}

// POST: Crea nuovo log AI
export async function POST(request: Request) {
  try {
    const session = await auth()

    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { incaricoId, strumento, modello, prompt, risposta, contesto } = body

    // Validazione campi obbligatori
    if (!strumento || !prompt || !risposta) {
      return NextResponse.json(
        { success: false, error: 'Strumento, prompt e risposta sono obbligatori' },
        { status: 400 }
      )
    }

    const sql = `
      INSERT INTO log_ai (
        incarico_id,
        strumento,
        modello,
        prompt,
        risposta,
        utilizzato_da,
        verificato,
        contesto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        strumento,
        modello,
        "createdAt"
    `

    const result = await query(sql, [
      incaricoId ? parseInt(incaricoId) : null,
      strumento,
      modello || null,
      prompt,
      risposta,
      parseInt(session.user.id),
      false,
      contesto || null,
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Log AI creato con successo',
    })
  } catch (error: any) {
    console.error('Error in POST /api/log-ai:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server', details: error?.message },
      { status: 500 }
    )
  }
}

// PATCH: Verifica log AI (solo TITOLARE)
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.ruolo !== 'TITOLARE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { logIds } = body

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json({ success: false, error: 'logIds richiesto' }, { status: 400 })
    }

    const placeholders = logIds.map((_, i) => `$${i + 2}`).join(', ')
    const sql = `
      UPDATE log_ai
      SET
        verificato = true,
        verificato_da = $1,
        data_verifica = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
      RETURNING id
    `

    const result = await query(sql, [parseInt(session.user.id), ...logIds])

    return NextResponse.json({
      success: true,
      updated: result.rows.length,
    })
  } catch (error: any) {
    console.error('Error in PATCH /api/log-ai:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server', details: error?.message },
      { status: 500 }
    )
  }
}
