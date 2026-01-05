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

    // Solo collaboratori possono approvare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    // Verifica che il documento esista
    const docCheck = await query(`SELECT id, stato FROM documenti WHERE id = $1`, [parseInt(id)])

    if (docCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    // Verifica che non sia già approvato
    if (docCheck.rows[0].stato === 'APPROVATO') {
      return NextResponse.json(
        { success: false, error: 'Documento già approvato' },
        { status: 400 }
      )
    }

    // Aggiorna stato a APPROVATO
    const sql = `
      UPDATE documenti
      SET
        stato = 'APPROVATO',
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        nome_file as "nomeFile",
        stato,
        "updatedAt"
    `

    const result = await query(sql, [parseInt(id)])

    // TODO: Invia notifica al committente se visibile_cliente = true

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Documento approvato con successo',
    })
  } catch (error) {
    console.error('Error in POST /api/documenti/[id]/approve:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
