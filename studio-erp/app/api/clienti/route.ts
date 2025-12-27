import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Solo collaboratori autorizzati
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
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
        id,
        codice,
        tipo,
        nome,
        cognome,
        ragione_sociale,
        email,
        telefono
      FROM clienti
      ORDER BY
        CASE WHEN tipo = 'AZIENDA' THEN ragione_sociale ELSE cognome END
      LIMIT $1 OFFSET $2
    `

    // Conta totale per paginazione
    const countSql = `SELECT COUNT(*) as total FROM clienti`

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
    console.error('Error in GET /api/clienti:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}
