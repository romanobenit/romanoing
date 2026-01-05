import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Solo TITOLARE può vedere lista collaboratori
    if (!session?.user || session.user.ruolo !== 'TITOLARE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    // Paginazione
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Validazione parametri
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Parametri di paginazione non validi' },
        { status: 400 }
      )
    }

    const sql = `
      SELECT
        u.id,
        u.nome,
        u.cognome,
        u.email,
        r.codice as ruolo
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE r.codice IN ('TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO')
        AND u.attivo = true
      ORDER BY
        CASE
          WHEN r.codice = 'TITOLARE' THEN 1
          WHEN r.codice = 'SENIOR' THEN 2
          WHEN r.codice = 'JUNIOR' THEN 3
          WHEN r.codice = 'ESTERNO' THEN 4
        END,
        u.cognome, u.nome
      LIMIT $1 OFFSET $2
    `

    // Conta totale per paginazione
    const countSql = `
      SELECT COUNT(*) as total
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE r.codice IN ('TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO')
        AND u.attivo = true
    `

    const [result, countResult] = await Promise.all([
      query(sql, [limit, offset]),
      query(countSql, []),
    ])

    const total = parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/collaboratori:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}
