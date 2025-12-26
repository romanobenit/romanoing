import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()
    console.log('[API] /api/collaboratore/documenti - Session:', session?.user?.id, session?.user?.ruolo)

    // Verifica autenticazione
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      console.log('[API] /api/collaboratore/documenti - Unauthorized')
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const incaricoId = searchParams.get('incaricoId')
    console.log('[API] /api/collaboratore/documenti - incaricoId:', incaricoId)

    let sql: string
    let params: any[]

    if (incaricoId) {
      // Ottieni documenti di un incarico specifico
      sql = `
        SELECT
          d.id,
          d.nome_file as "nomeFile",
          d.categoria,
          d.descrizione,
          d.versione,
          d.stato,
          d.dimensione,
          d.visibile_cliente as "visibileCliente",
          d.path_storage as "pathStorage",
          d."createdAt",
          u.nome as "uploadedByNome",
          u.cognome as "uploadedByCognome"
        FROM documenti d
        JOIN utenti u ON d.uploaded_by = u.id
        WHERE d.incarico_id = $1
        ORDER BY d."createdAt" DESC
      `
      params = [parseInt(incaricoId)]
    } else if (session.user.ruolo === 'TITOLARE') {
      // TITOLARE vede tutti i documenti
      sql = `
        SELECT
          d.id,
          d.nome_file as "nomeFile",
          d.categoria,
          d.descrizione,
          d.versione,
          d.stato,
          d.dimensione,
          d.visibile_cliente as "visibileCliente",
          d.path_storage as "pathStorage",
          d."createdAt",
          u.nome as "uploadedByNome",
          u.cognome as "uploadedByCognome"
        FROM documenti d
        JOIN utenti u ON d.uploaded_by = u.id
        ORDER BY d."createdAt" DESC
      `
      params = []
    } else {
      // Altri collaboratori vedono solo documenti degli incarichi assegnati
      const userId = parseInt(session.user.id as string)
      if (isNaN(userId)) {
        console.error('[API] Invalid user ID:', session.user.id)
        return NextResponse.json({ success: false, error: 'ID utente non valido' }, { status: 400 })
      }

      sql = `
        SELECT
          d.id,
          d.nome_file as "nomeFile",
          d.categoria,
          d.descrizione,
          d.versione,
          d.stato,
          d.dimensione,
          d.visibile_cliente as "visibileCliente",
          d.path_storage as "pathStorage",
          d."createdAt",
          u.nome as "uploadedByNome",
          u.cognome as "uploadedByCognome"
        FROM documenti d
        JOIN utenti u ON d.uploaded_by = u.id
        JOIN incarichi i ON d.incarico_id = i.id
        WHERE i.responsabile_id = $1
        ORDER BY d."createdAt" DESC
      `
      params = [userId]
    }

    console.log('[API] /api/collaboratore/documenti - Executing query with params:', params)
    const result = await query(sql, params)
    console.log('[API] /api/collaboratore/documenti - Query result count:', result.rows.length)

    return NextResponse.json({
      success: true,
      data: result.rows || [],
    })
  } catch (error: any) {
    console.error('[API] Error in GET /api/collaboratore/documenti:', error)
    console.error('[API] Error details:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack?.split('\n').slice(0, 3),
    })

    return NextResponse.json({
      success: false,
      error: 'Errore del server',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
