import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Verifica autenticazione
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!session?.user || !ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const incaricoId = searchParams.get('incaricoId')

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
          json_build_object(
            'nome', u.nome,
            'cognome', u.cognome
          ) as "uploadedBy"
        FROM documenti d
        JOIN utenti u ON d.created_by = u.id
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
          json_build_object(
            'nome', u.nome,
            'cognome', u.cognome
          ) as "uploadedBy"
        FROM documenti d
        JOIN utenti u ON d.created_by = u.id
        ORDER BY d."createdAt" DESC
      `
      params = []
    } else {
      // Altri collaboratori vedono solo documenti degli incarichi assegnati
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
          json_build_object(
            'nome', u.nome,
            'cognome', u.cognome
          ) as "uploadedBy"
        FROM documenti d
        JOIN utenti u ON d.created_by = u.id
        JOIN incarichi i ON d.incarico_id = i.id
        WHERE i.responsabile_id = $1
        ORDER BY d."createdAt" DESC
      `
      params = [parseInt(session.user.id)]
    }

    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error in GET /api/collaboratore/documenti:', error)
    return NextResponse.json({ success: false, error: 'Errore del server' }, { status: 500 })
  }
}
