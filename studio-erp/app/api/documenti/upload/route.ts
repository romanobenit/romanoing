import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verifica autenticazione - solo collaboratori possono caricare documenti
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const incaricoId = formData.get('incaricoId') as string
    const categoria = formData.get('categoria') as string
    const descrizione = formData.get('descrizione') as string | null
    const visibileCliente = formData.get('visibileCliente') === 'true'

    if (!file || !incaricoId || !categoria) {
      return NextResponse.json(
        { success: false, error: 'File, incaricoId e categoria richiesti' },
        { status: 400 }
      )
    }

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
        descrizione,
        dimensione,
        path_storage,
        visibile_cliente,
        stato,
        versione,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        nome_file as "nomeFile",
        categoria,
        versione,
        stato,
        dimensione,
        "createdAt",
        path_storage as "pathStorage"
    `

    const result = await query(sql, [
      parseInt(incaricoId),
      file.name,
      categoria,
      descrizione || null,
      file.size,
      pathStorage,
      visibileCliente,
      'BOZZA',
      1,
      parseInt(session.user.id),
    ])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Documento caricato con successo',
    })
  } catch (error) {
    console.error('Error in POST /api/documenti/upload:', error)
    return NextResponse.json(
      { success: false, error: 'Errore durante il caricamento del file' },
      { status: 500 }
    )
  }
}
