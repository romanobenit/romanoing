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
    `

    const result = await query(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error: any) {
    console.error('Error in GET /api/collaboratori:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}
