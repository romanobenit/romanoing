import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

// Funzione per generare codice incarico univoco
async function generateIncaricoCode(): Promise<string> {
  const year = new Date().getFullYear()
  const yearShort = year.toString().slice(-2)

  // Trova ultimo numero progressivo per l'anno corrente
  const sql = `
    SELECT codice FROM incarichi
    WHERE codice LIKE $1
    ORDER BY codice DESC
    LIMIT 1
  `
  const result = await query(sql, [`INC${yearShort}%`])

  let nextNum = 1
  if (result.rows.length > 0) {
    const lastCode = result.rows[0].codice
    const lastNum = parseInt(lastCode.slice(-3))
    nextNum = lastNum + 1
  }

  return `INC${yearShort}${nextNum.toString().padStart(3, '0')}`
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Verifica autenticazione
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che sia un collaboratore
    const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
    if (!ruoliCollaboratori.includes(session.user.ruolo)) {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    // Query diversa per TITOLARE (vede tutto) vs altri ruoli (solo assegnati)
    const sql =
      session.user.ruolo === 'TITOLARE'
        ? `
      SELECT
        i.id,
        i.codice,
        i.oggetto,
        i.descrizione,
        i.importo_totale as "importoTotale",
        i.stato,
        i.data_inizio as "dataInizio",
        i.data_fine as "dataFine",
        i.data_scadenza as "dataScadenza",
        i.priorita,
        c.codice as "clienteCodice",
        c.nome as "clienteNome",
        c.cognome as "clienteCognome",
        c.ragione_sociale as "clienteRagioneSociale",
        b.nome as "bundleNome",
        (SELECT COUNT(*)::int FROM milestone m WHERE m.incarico_id = i.id) as "milestoneTotal",
        (SELECT COUNT(*)::int FROM milestone m WHERE m.incarico_id = i.id AND m.stato = 'PAGATO') as "milestonePagate",
        (SELECT COUNT(*)::int FROM documenti d WHERE d.incarico_id = i.id) as "documentiCount"
      FROM incarichi i
      LEFT JOIN clienti c ON i.cliente_id = c.id
      LEFT JOIN bundle b ON i.bundle_id = b.id
      ORDER BY i."createdAt" DESC
    `
        : `
      SELECT
        i.id,
        i.codice,
        i.oggetto,
        i.descrizione,
        i.importo_totale as "importoTotale",
        i.stato,
        i.data_inizio as "dataInizio",
        i.data_fine as "dataFine",
        i.data_scadenza as "dataScadenza",
        i.priorita,
        c.codice as "clienteCodice",
        c.nome as "clienteNome",
        c.cognome as "clienteCognome",
        c.ragione_sociale as "clienteRagioneSociale",
        b.nome as "bundleNome",
        (SELECT COUNT(*)::int FROM milestone m WHERE m.incarico_id = i.id) as "milestoneTotal",
        (SELECT COUNT(*)::int FROM milestone m WHERE m.incarico_id = i.id AND m.stato = 'PAGATO') as "milestonePagate",
        (SELECT COUNT(*)::int FROM documenti d WHERE d.incarico_id = i.id) as "documentiCount"
      FROM incarichi i
      LEFT JOIN clienti c ON i.cliente_id = c.id
      LEFT JOIN bundle b ON i.bundle_id = b.id
      WHERE i.responsabile_id = $1
      ORDER BY i."createdAt" DESC
    `

    const params = session.user.ruolo === 'TITOLARE' ? [] : [parseInt(session.user.id)]
    const result = await query(sql, params)

    return NextResponse.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error in GET /api/collaboratore/incarichi:', error)
    return NextResponse.json(
      { success: false, error: 'Errore del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Solo TITOLARE può creare incarichi
    if (!session?.user || session.user.ruolo !== 'TITOLARE') {
      return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const {
      cliente_id,
      bundle_id,
      oggetto,
      descrizione,
      importo_totale,
      responsabile_id,
      data_inizio,
      data_scadenza,
      priorita,
      note,
    } = body

    // Validazione campi obbligatori
    if (!cliente_id || !oggetto || !importo_totale || !responsabile_id) {
      return NextResponse.json(
        { success: false, error: 'Campi obbligatori mancanti' },
        { status: 400 }
      )
    }

    // Genera codice univoco
    const codice = await generateIncaricoCode()

    // Inserisci incarico
    const insertSql = `
      INSERT INTO incarichi (
        codice, cliente_id, bundle_id, responsabile_id,
        oggetto, descrizione, importo_totale,
        stato, data_inizio, data_scadenza, priorita, note,
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, codice
    `

    const incaricoResult = await query(insertSql, [
      codice,
      parseInt(cliente_id),
      bundle_id ? parseInt(bundle_id) : null,
      parseInt(responsabile_id),
      oggetto,
      descrizione || null,
      parseFloat(importo_totale),
      'BOZZA',
      data_inizio || null,
      data_scadenza || null,
      priorita || 'MEDIA',
      note || null,
    ])

    const incarico = incaricoResult.rows[0]

    // Se c'è un bundle, copia le milestone predefinite
    if (bundle_id) {
      const bundleSql = `SELECT milestone FROM bundle WHERE id = $1`
      const bundleResult = await query(bundleSql, [parseInt(bundle_id)])

      if (bundleResult.rows.length > 0 && bundleResult.rows[0].milestone) {
        const milestones = bundleResult.rows[0].milestone

        for (const m of milestones) {
          const importoMilestone = (parseFloat(importo_totale) * m.percentuale) / 100

          await query(
            `INSERT INTO milestone (
              incarico_id, codice, nome, descrizione,
              percentuale, importo, stato,
              "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              incarico.id,
              m.codice,
              m.nome,
              m.descrizione || null,
              m.percentuale,
              importoMilestone,
              'NON_PAGATO',
            ]
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: incarico,
    })
  } catch (error: any) {
    console.error('Error in POST /api/collaboratore/incarichi:', error)
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        success: false,
        error: 'Errore del server',
        ...(isDev && { details: error?.message }),
      },
      { status: 500 }
    )
  }
}
