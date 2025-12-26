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
      WHERE attivo = true
      ORDER BY
        CASE WHEN tipo = 'AZIENDA' THEN ragione_sociale ELSE cognome END
    `

    const result = await query(sql, [])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error: any) {
    console.error('Error in GET /api/clienti:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}
