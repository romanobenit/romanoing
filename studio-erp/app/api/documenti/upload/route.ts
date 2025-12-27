import {NextResponse} from 'next/server'
import {auth} from '@/lib/auth'
import {query} from '@/lib/db'
import {writeFile, mkdir, unlink} from 'fs/promises'
import {join} from 'path'
import {existsSync} from 'fs'
import {uploadRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'
import {logDocumento} from '@/lib/audit-log'
import {scanFile} from '@/lib/antivirus'

export async function POST(request: Request) {
  try {
    console.log('[API Upload] POST request received')
    const session = await auth()

    // Verifica autenticazione - solo collaboratori possono caricare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({success: false, error: 'Non autorizzato'}, {status: 401})
    }

    if (!session.user.id) {
      console.error('[API Upload] session.user.id is missing:', session.user)
      return NextResponse.json(
        {success: false, error: 'ID utente mancante nella sessione'},
        {status: 401}
      )
    }

    // Rate limiting per upload (20 upload/ora per utente)
    const identifier = getIdentifier(request, session.user.id)
    const rateLimitResponse = await applyRateLimit(uploadRateLimit, identifier)
    if (rateLimitResponse) return rateLimitResponse

    const formData = await request.formData()
    const file = formData.get('file') as File
    const incaricoIdRaw = formData.get('incaricoId') as string
    const categoria = formData.get('categoria') as string
    const visibileCliente = formData.get('visibileCliente') === 'true'

    // Validazione incaricoId per prevenire path traversal
    const incaricoId = parseInt(incaricoIdRaw)
    if (isNaN(incaricoId) || incaricoId <= 0) {
      return NextResponse.json(
        { success: false, error: 'ID incarico non valido' },
        { status: 400 }
      )
    }

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

    if (!file || !categoria) {
      return NextResponse.json(
        { success: false, error: 'File e categoria richiesti' },
        { status: 400 }
      )
    }

    // Determina MIME type
    const mimeType = file.type || 'application/octet-stream'

    // Verifica che l'incarico esista
    const incaricoCheck = await query(
      `SELECT id FROM incarichi WHERE id = $1`,
      [incaricoId]
    )

    if (incaricoCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Incarico non trovato' },
        { status: 404 }
      )
    }

    // Crea directory se non esiste (usa toString() del numero validato per prevenire path traversal)
    const uploadDir = join(process.cwd(), 'uploads', 'documenti', incaricoId.toString())
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Genera nome file univoco
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = join(uploadDir, fileName)
    const pathStorage = `uploads/documenti/${incaricoId.toString()}/${fileName}`

    // Salva file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    console.log('[API Upload] File saved, starting antivirus scan...')

    // Scansione antivirus con ClamAV
    let antivirusScanned = false
    let antivirusStatus: 'pending' | 'clean' | 'infected' | 'error' = 'pending'

    try {
      const scanResult = await scanFile(filePath)

      antivirusScanned = true

      if (!scanResult.isClean) {
        // VIRUS RILEVATO - elimina file e blocca upload
        antivirusStatus = 'infected'

        console.error(
          `[API Upload] 🦠 VIRUS DETECTED in ${file.name}: ${scanResult.virus}`
        )

        // Elimina file infetto (fail-safe: ClamAV dovrebbe già averlo fatto)
        try {
          await unlink(filePath)
        } catch (unlinkErr) {
          console.warn('[API Upload] File already removed by ClamAV')
        }

        // Audit log dell'attacco
        await logDocumento(parseInt(session.user.id), 'UPLOAD', 0, request, {
          nomeFile: file.name,
          categoria,
          dimensione: file.size,
          incaricoId,
          status: 'VIRUS_DETECTED',
          virus: scanResult.virus,
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Virus rilevato nel file caricato',
            details: scanResult.virus,
            virusDetected: true,
          },
          { status: 400 }
        )
      }

      // File pulito
      antivirusStatus = 'clean'
      console.log(`[API Upload] ✓ File clean: ${file.name} (${scanResult.scanTimeMs}ms)`)

    } catch (scanError: any) {
      // Errore durante scansione
      antivirusStatus = 'error'

      console.error('[API Upload] Antivirus scan error:', scanError.message)

      // In produzione: se scan fallisce, RIFIUTA file (fail-safe)
      if (process.env.NODE_ENV === 'production') {
        try {
          await unlink(filePath)
        } catch {}

        return NextResponse.json(
          {
            success: false,
            error: 'Impossibile verificare la sicurezza del file',
            scanError: true,
          },
          { status: 500 }
        )
      }

      // In development: permetti upload con warning (solo per testing)
      console.warn('[API Upload] ⚠️  File uploaded WITHOUT scan (development only)')
    }

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
        antivirus_status,
        "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING
        id,
        nome_file as "nomeFile",
        categoria,
        versione,
        stato,
        dimensione,
        "createdAt",
        "updatedAt",
        path_storage as "pathStorage",
        antivirus_scanned as "antivirusScanned",
        antivirus_status as "antivirusStatus"
    `

    const params = [
      incaricoId,
      file.name,
      categoria,
      file.size,
      pathStorage,
      mimeType,
      visibileCliente,
      'BOZZA',
      1,
      parseInt(session.user.id),
      antivirusScanned,
      antivirusStatus,
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
      antivirusStatus: params[11],
      updatedAt: params[12],
    })

    const result = await query(sql, params)
    const documento = result.rows[0]

    // Audit log
    await logDocumento(parseInt(session.user.id), 'UPLOAD', documento.id, request, {
      nomeFile: file.name,
      categoria,
      dimensione: file.size,
      incaricoId,
      visibileCliente,
    })

    return NextResponse.json({
      success: true,
      data: documento,
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
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il caricamento del file',
        ...(isDev && { details: error?.message || 'Unknown error' }),
        ...(isDev && error?.code && { code: error.code }),
      },
      { status: 500 }
    )
  }
}
