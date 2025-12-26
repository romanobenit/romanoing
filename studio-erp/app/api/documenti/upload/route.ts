import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    console.log('[API Upload] POST request received')
    const session = await auth()

    // Verifica autenticazione - solo collaboratori possono caricare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    if (!session.user.id) {
      console.error('[API Upload] session.user.id is missing:', session.user)
      return NextResponse.json(
        { success: false, error: 'ID utente mancante nella sessione' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const incaricoId = formData.get('incaricoId') as string
    const categoria = formData.get('categoria') as string
    const visibileCliente = formData.get('visibileCliente') === 'true'

    console.log('[API Upload] Request data:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      incaricoId,
      categoria,
      visibileCliente,
      userId: session.user.id,
      userRole: session.user.ruolo,
    })

    if (!file || !incaricoId || !categoria) {
      return NextResponse.json(
        { success: false, error: 'File, incaricoId e categoria richiesti' },
        { status: 400 }
      )
    }

    // Determina MIME type
    const mimeType = file.type || 'application/octet-stream'

    // Verifica che l'incarico esista
    const incaricoCheck = await query(
      `SELECT id FROM incarichi WHERE id = $1`,
      [parseInt(incaricoId)]
    )

    if (incaricoCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Incarico non trovato' },
        { status: 404 }
      )
    }

    // Crea directory se non esiste
    const uploadDir = join(process.cwd(), 'uploads', 'documenti', incaricoId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Genera nome file univoco
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = join(uploadDir, fileName)
    const pathStorage = `uploads/documenti/${incaricoId}/${fileName}`

    // Salva file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // TODO: Scansione antivirus (placeholder)
    // const scanResult = await scanFile(filePath)
    // if (!scanResult.clean) throw new Error('Virus detected')

    // Inserisci record nel database
    const sql = `
      INSERT INTO documenti (
        incarico_id,
        nome_file,
        categoria,
        dimensione,
        path_storage,
        mime_type,
        visibile_cliente,
        stato,
        versione,
        uploaded_by,
        antivirus_scanned,
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        nome_file as "nomeFile",
        categoria,
        versione,
        stato,
        dimensione,
        "createdAt",
        "updatedAt",
        path_storage as "pathStorage"
    `

    const params = [
      parseInt(incaricoId),
      file.name,
      categoria,
      file.size,
      pathStorage,
      mimeType,
      visibileCliente,
      'BOZZA',
      1,
      parseInt(session.user.id),
      false,
      new Date().toISOString(), // updatedAt
    ]

    console.log('[API Upload] Inserting document with params:', {
      incaricoId: params[0],
      fileName: params[1],
      categoria: params[2],
      size: params[3],
      path: params[4],
      mimeType: params[5],
      visibileCliente: params[6],
      stato: params[7],
      versione: params[8],
      uploadedBy: params[9],
      antivirusScanned: params[10],
      updatedAt: params[11],
    })

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Documento caricato con successo',
    })
  } catch (error: any) {
    console.error('Error in POST /api/documenti/upload:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      detail: error?.detail,
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il caricamento del file',
        details: error?.message || 'Unknown error',
        code: error?.code,
      },
      { status: 500 }
    )
  }
}
