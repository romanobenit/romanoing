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
        id,
        nome,
        cognome,
        email,
        ruolo
      FROM utenti
      WHERE ruolo IN ('TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO')
        AND attivo = true
      ORDER BY
        CASE
          WHEN ruolo = 'TITOLARE' THEN 1
          WHEN ruolo = 'SENIOR' THEN 2
          WHEN ruolo = 'JUNIOR' THEN 3
          WHEN ruolo = 'ESTERNO' THEN 4
        END,
        cognome, nome
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
