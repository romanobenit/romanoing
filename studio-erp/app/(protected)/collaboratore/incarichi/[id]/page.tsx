import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building,
  Calendar,
  Euro,
  FileText,
  CheckCircle,
  Clock,
  User,
  Upload,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

async function getIncaricoDetail(id: string, utenteId: string, ruolo: string) {
  // Query per ottenere dettagli incarico
  const sql = `
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
      i.note,
      i."createdAt",
      c.id as "clienteId",
      c.codice as "clienteCodice",
      c.tipo as "clienteTipo",
      c.nome as "clienteNome",
      c.cognome as "clienteCognome",
      c.ragione_sociale as "clienteRagioneSociale",
      c.email as "clienteEmail",
      c.telefono as "clienteTelefono",
      b.nome as "bundleNome",
      b.codice as "bundleCodice",
      u.nome as "responsabileNome",
      u.cognome as "responsabileCognome",
      u.email as "responsabileEmail"
    FROM incarichi i
    LEFT JOIN clienti c ON i.cliente_id = c.id
    LEFT JOIN bundle b ON i.bundle_id = b.id
    LEFT JOIN utenti u ON i.responsabile_id = u.id
    WHERE i.id = $1
      ${ruolo !== 'TITOLARE' ? 'AND i.responsabile_id = $2' : ''}
    LIMIT 1
  `

  const params = ruolo === 'TITOLARE' ? [parseInt(id)] : [parseInt(id), parseInt(utenteId)]
  const result = await query(sql, params)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0]
}

async function getMilestone(incaricoId: string) {
  const sql = `
    SELECT
      id,
      codice,
      nome,
      descrizione,
      percentuale,
      importo,
      stato,
      data_scadenza as "dataScadenza",
      data_pagamento as "dataPagamento"
    FROM milestone
    WHERE incarico_id = $1
    ORDER BY codice ASC
  `

  const result = await query(sql, [parseInt(incaricoId)])
  return result.rows
}

async function getDocumenti(incaricoId: string) {
  const sql = `
    SELECT
      d.id,
      d.nome_file as "nomeFile",
      d.categoria,
      d.versione,
      d.stato,
      d.dimensione,
      d."createdAt",
      u.nome as "uploadedByNome",
      u.cognome as "uploadedByCognome"
    FROM documenti d
    LEFT JOIN utenti u ON d.uploaded_by = u.id
    WHERE d.incarico_id = $1
    ORDER BY d."createdAt" DESC
  `

  const result = await query(sql, [parseInt(incaricoId)])
  return result.rows
}

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const },
  ATTIVO: { label: 'Attivo', variant: 'default' as const },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const },
  COMPLETATO: { label: 'Completato', variant: 'success' as const },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const },
}

const STATO_MILESTONE_LABELS = {
  NON_PAGATO: { label: 'Da pagare', variant: 'destructive' as const },
  PAGATO: { label: 'Pagato', variant: 'success' as const },
  PARZIALE: { label: 'Parziale', variant: 'default' as const },
}

export default async function IncaricoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const incarico = await getIncaricoDetail(id, session.user.id, session.user.ruolo)

  if (!incarico) {
    redirect('/collaboratore/incarichi')
  }

  const milestone = await getMilestone(id)
  const documenti = await getDocumenti(id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/collaboratore/incarichi">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-gray-500">{incarico.codice}</span>
              <Badge
                variant={
                  STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.variant || 'default'
                }
              >
                {STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.label ||
                  incarico.stato}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{incarico.oggetto}</h1>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrizione */}
          <Card>
            <CardHeader>
              <CardTitle>Descrizione</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {incarico.descrizione || 'Nessuna descrizione disponibile'}
              </p>
              {incarico.note && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 mb-1">Note:</p>
                  <p className="text-sm text-yellow-800">{incarico.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestone */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone</CardTitle>
              <CardDescription>Traguardi e pagamenti del progetto</CardDescription>
            </CardHeader>
            <CardContent>
              {milestone.length === 0 ? (
                <p className="text-sm text-gray-600">Nessuna milestone definita</p>
              ) : (
                <div className="space-y-4">
                  {milestone.map((m: any) => (
                    <div key={m.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {m.stato === 'PAGATO' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {m.codice}: {m.nome}
                          </h4>
                          <Badge
                            variant={
                              STATO_MILESTONE_LABELS[
                                m.stato as keyof typeof STATO_MILESTONE_LABELS
                              ]?.variant || 'default'
                            }
                          >
                            {STATO_MILESTONE_LABELS[
                              m.stato as keyof typeof STATO_MILESTONE_LABELS
                            ]?.label || m.stato}
                          </Badge>
                        </div>
                        {m.descrizione && (
                          <p className="text-sm text-gray-600 mb-2">{m.descrizione}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-medium">
                            {m.percentuale}% - €
                            {parseFloat(m.importo).toLocaleString('it-IT')}
                          </span>
                          {m.dataScadenza && (
                            <span>
                              Scadenza: {new Date(m.dataScadenza).toLocaleDateString('it-IT')}
                            </span>
                          )}
                          {m.dataPagamento && (
                            <span className="text-green-600">
                              Pagato il: {new Date(m.dataPagamento).toLocaleDateString('it-IT')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documenti */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documenti</CardTitle>
                  <CardDescription>File caricati per questo incarico</CardDescription>
                </div>
                <Button size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Carica
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documenti.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Nessun documento caricato</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documenti.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.nomeFile}</p>
                          <p className="text-xs text-gray-500">
                            Caricato da {doc.uploadedByNome} {doc.uploadedByCognome} •{' '}
                            {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.categoria}</Badge>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Generali */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Euro className="w-4 h-4" />
                  <span className="font-medium">Importo Totale</span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  €{parseFloat(incarico.importoTotale).toLocaleString('it-IT')}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Data Inizio</span>
                </div>
                <p className="text-sm text-gray-900">
                  {incarico.dataInizio
                    ? new Date(incarico.dataInizio).toLocaleDateString('it-IT')
                    : 'Non specificata'}
                </p>
              </div>

              {incarico.dataScadenza && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Scadenza</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {new Date(incarico.dataScadenza).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}

              {incarico.dataFine && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Data Fine</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {new Date(incarico.dataFine).toLocaleDateString('it-IT')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Building className="w-4 h-4" />
                  <span className="font-medium">Nome</span>
                </div>
                <p className="text-sm text-gray-900">
                  {incarico.clienteRagioneSociale ||
                    `${incarico.clienteNome} ${incarico.clienteCognome}`}
                </p>
              </div>

              {incarico.clienteEmail && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${incarico.clienteEmail}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {incarico.clienteEmail}
                  </a>
                </div>
              )}

              {incarico.clienteTelefono && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Telefono</p>
                  <a
                    href={`tel:${incarico.clienteTelefono}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {incarico.clienteTelefono}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsabile */}
          <Card>
            <CardHeader>
              <CardTitle>Responsabile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {incarico.responsabileNome} {incarico.responsabileCognome}
                  </p>
                  <a
                    href={`mailto:${incarico.responsabileEmail}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {incarico.responsabileEmail}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
