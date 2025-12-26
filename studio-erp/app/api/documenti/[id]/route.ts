import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// GET - Ottieni dettagli documento
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

    const sql = `
      SELECT
        d.id,
        d.nome_file as "nomeFile",
        d.categoria,
        d.descrizione,
        d.versione,
        d.stato,
        d.dimensione,
        d.path_storage as "pathStorage",
        d.visibile_cliente as "visibileCliente",
        d."createdAt",
        d."updatedAt",
        i.id as "incaricoId",
        i.codice as "incaricoCodice",
        i.oggetto as "incaricoOggetto",
        json_build_object(
          'id', u.id,
          'nome', u.nome,
          'cognome', u.cognome,
          'email', u.email
        ) as "uploadedBy"
      FROM documenti d
      JOIN incarichi i ON d.incarico_id = i.id
      JOIN utenti u ON d.created_by = u.id
      WHERE d.id = $1
      LIMIT 1
    `

    const result = await query(sql, [parseInt(id)])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    const documento = result.rows[0]

    // Verifica permessi
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    const isCollaboratore = ruoliCollaboratori.includes(session.user.ruolo)
    const isCliente = session.user.ruolo === 'COMMITTENTE'

    if (isCliente) {
      // I clienti vedono solo documenti visibili e del loro incarico
      if (!documento.visibileCliente) {
        return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
      }

      const incaricoCheck = await query(
        `SELECT id FROM incarichi WHERE id = $1 AND cliente_id = $2`,
        [documento.incaricoId, parseInt(session.user.clienteId!)]
      )

      if (incaricoCheck.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
      }
    }

    return NextResponse.json({
      success: true,
      data: documento,
    })
  } catch (error) {
    console.error('Error in GET /api/documenti/[id]:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}

// DELETE - Elimina documento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    // Solo collaboratori possono eliminare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    // Ottieni informazioni documento
    const docResult = await query(
      `SELECT path_storage FROM documenti WHERE id = $1`,
      [parseInt(id)]
    )

    if (docResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    const pathStorage = docResult.rows[0].path_storage

    // Elimina dal database
    await query(`DELETE FROM documenti WHERE id = $1`, [parseInt(id)])

    // Elimina file fisico
    try {
      const filePath = join(process.cwd(), pathStorage)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (error) {
      console.error('Error deleting physical file:', error)
      // Non interrompiamo se il file non esiste
    }

    return NextResponse.json({
      success: true,
      message: 'Documento eliminato con successo',
    })
  } catch (error) {
    console.error('Error in DELETE /api/documenti/[id]:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
