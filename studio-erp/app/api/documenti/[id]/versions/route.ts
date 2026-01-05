import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autenticato' }, { status: 401 })
    }

    // Ottieni documento corrente per verificare permessi
    const currentDoc = await query(
      `SELECT incarico_id, nome_file, visibile_cliente FROM documenti WHERE id = $1`,
      [parseInt(id)]
    )

    if (currentDoc.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    const doc = currentDoc.rows[0]

    // Verifica permessi (come in GET documento)
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    const isCollaboratore = ruoliCollaboratori.includes(session.user.ruolo)
    const isCliente = session.user.ruolo === 'COMMITTENTE'

    if (isCliente) {
      if (!doc.visibile_cliente) {
        return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
      }

      const incaricoCheck = await query(
        `SELECT id FROM incarichi WHERE id = $1 AND cliente_id = $2`,
        [doc.incarico_id, parseInt(session.user.clienteId!)]
      )

      if (incaricoCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
      }
    }

    // Ottieni tutte le versioni del documento
    const sql = `
      SELECT
        d.id,
        d.versione,
        d.stato,
        d.dimensione,
        d.path_storage as "pathStorage",
        d."createdAt",
        json_build_object(
          'nome', u.nome,
          'cognome', u.cognome,
          'email', u.email
        ) as "uploadedBy"
      FROM documenti d
      JOIN utenti u ON d.uploaded_by = u.id
      WHERE d.nome_file = $1 AND d.incarico_id = $2
      ORDER BY d.versione DESC
    `

    const result = await query(sql, [doc.nome_file, doc.incarico_id])

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error in GET /api/documenti/[id]/versions:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
