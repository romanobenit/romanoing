import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    // Solo collaboratori possono rifiutare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const body = await request.json()
    const { motivo } = body

    // Verifica che il documento esista
    const docCheck = await query(`SELECT id, stato FROM documenti WHERE id = $1`, [parseInt(id)])

    if (docCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    // Aggiorna stato a RIFIUTATO
    const sql = `
      UPDATE documenti
      SET
        stato = 'RIFIUTATO',
        note = $2,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        nome_file as "nomeFile",
        stato,
        note,
        "updatedAt"
    `

    const result = await query(sql, [parseInt(id), motivo || 'Rifiutato senza motivo specificato'])

    // TODO: Invia notifica al creatore del documento

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Documento rifiutato',
    })
  } catch (error) {
    console.error('Error in POST /api/documenti/[id]/reject:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
