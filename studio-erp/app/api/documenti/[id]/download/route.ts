import {NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {query} from '@/lib/db'
import {readFile} from 'fs/promises'
import {existsSync} from 'fs'
import {join, resolve} from 'path'
import {logDocumento} from '@/lib/audit-log'

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

    // Ottieni parametro disposition (inline per visualizzazione, attachment per download)
    const { searchParams } = new URL(request.url)
    const dispositionParam = searchParams.get('disposition')
    const disposition = dispositionParam === 'inline' ? 'inline' : 'attachment'

    // Ottieni documento
    const sql = `
      SELECT
        d.id,
        d.nome_file as "nomeFile",
        d.path_storage as "pathStorage",
        d.visibile_cliente as "visibileCliente",
        i.id as "incaricoId",
        i.cliente_id as "clienteId"
      FROM documenti d
      JOIN incarichi i ON d.incarico_id = i.id
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
      // I clienti possono scaricare solo documenti visibili del loro incarico
      if (!documento.visibileCliente || documento.clienteId !== parseInt(session.user.clienteId!)) {
        return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
      }
    }

    // Leggi file con validazione path traversal
    const filePath = join(process.cwd(), documento.pathStorage)
    const uploadDir = join(process.cwd(), 'uploads')

    // Valida che il file sia all'interno della directory uploads
    const resolvedPath = resolve(filePath)
    const resolvedUploadDir = resolve(uploadDir)

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json(
        { success: false, error: 'Accesso negato' },
        { status: 403 }
      )
    }

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'File non trovato sul server' },
        { status: 404 }
      )
    }

    const fileBuffer = await readFile(filePath)

    // Determina MIME type
    const ext = documento.nomeFile.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      dwg: 'application/acad',
      dxf: 'application/dxf',
      zip: 'application/zip',
    }

    const mimeType = mimeTypes[ext || ''] || 'application/octet-stream'

    // Audit log
    await logDocumento(parseInt(session.user.id), 'DOWNLOAD', parseInt(id), request, {
      nomeFile: documento.nomeFile,
      disposition,
      incaricoId: documento.incaricoId,
    })

    // Ritorna file con disposition appropriata (inline per visualizzazione, attachment per download)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `${disposition}; filename="${encodeURIComponent(documento.nomeFile)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/documenti/[id]/download:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
