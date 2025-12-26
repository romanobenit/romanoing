import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - Ottieni messaggi per un incarico
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const incaricoId = searchParams.get('incaricoId')

    if (!incaricoId) {
      return NextResponse.json(
        { success: false, error: 'incaricoId richiesto' },
        { status: 400 }
      )
    }

    // Verifica che il committente abbia accesso all'incarico
    const incaricoCheck = await query(
      `SELECT id FROM incarichi WHERE id = $1 AND cliente_id = $2`,
      [parseInt(incaricoId), parseInt(session.user.clienteId!)]
    )

    if (incaricoCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Incarico non trovato' }, { status: 404 })
    }

    // Ottieni messaggi
    const sql = `
      SELECT
        m.id,
        m.testo,
        m.letto,
        m."createdAt",
        json_build_object(
          'nome', u.nome,
          'cognome', u.cognome,
          'ruolo', r.codice
        ) as mittente
      FROM messaggi m
      JOIN utenti u ON m.mittente_id = u.id
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE m.incarico_id = $1
      ORDER BY m."createdAt" ASC
    `

    const result = await query(sql, [parseInt(incaricoId)])

    // Marca come letti i messaggi non letti inviati al committente
    await query(
      `UPDATE messaggi
       SET letto = true
       WHERE incarico_id = $1
         AND destinatario_id = $2
         AND letto = false`,
      [parseInt(incaricoId), parseInt(session.user.id)]
    )

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error in GET /api/cliente/messaggi:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}

// POST - Invia nuovo messaggio
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.ruolo !== 'COMMITTENTE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { incaricoId, testo } = body

    if (!incaricoId || !testo) {
      return NextResponse.json(
        { success: false, error: 'incaricoId e testo richiesti' },
        { status: 400 }
      )
    }

    // Verifica accesso incarico
    const incaricoCheck = await query(
      `SELECT responsabile_id FROM incarichi WHERE id = $1 AND cliente_id = $2`,
      [parseInt(incaricoId), parseInt(session.user.clienteId!)]
    )

    if (incaricoCheck.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Incarico non trovato' }, { status: 404 })
    }

    const responsabileId = incaricoCheck.rows[0].responsabile_id

    // Inserisci messaggio
    const sql = `
      INSERT INTO messaggi (incarico_id, mittente_id, destinatario_id, testo)
      VALUES ($1, $2, $3, $4)
      RETURNING id, testo, "createdAt"
    `

    const result = await query(sql, [
      parseInt(incaricoId),
      parseInt(session.user.id),
      responsabileId,
      testo,
    ])

    // TODO: Invia notifica email al responsabile

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Messaggio inviato con successo',
    })
  } catch (error) {
    console.error('Error in POST /api/cliente/messaggi:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
