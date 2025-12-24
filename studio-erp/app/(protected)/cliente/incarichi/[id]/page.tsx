'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Euro, FileText, Download, CheckCircle, Clock, XCircle, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const },
  ATTIVO: { label: 'Attivo', variant: 'default' as const },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const },
  COMPLETATO: { label: 'Completato', variant: 'success' as const },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const },
}

const STATO_MILESTONE = {
  NON_PAGATO: { label: 'Da Pagare', icon: Clock, color: 'text-yellow-600' },
  PAGATO: { label: 'Pagato', icon: CheckCircle, color: 'text-green-600' },
  RIMBORSATO: { label: 'Rimborsato', icon: XCircle, color: 'text-gray-600' },
}

export default function IncaricoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [incarico, setIncarico] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncarico()
  }, [resolvedParams.id])

  const fetchIncarico = async () => {
    try {
      const res = await fetch(`/api/cliente/incarichi/${resolvedParams.id}`)
      const data = await res.json()
      if (data.success) {
        setIncarico(data.data)
      }
    } catch (error) {
      console.error('Errore caricamento incarico:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento incarico...</p>
        </div>
      </div>
    )
  }

  if (!incarico) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Incarico non trovato</h2>
        <p className="text-gray-600 mb-6">L'incarico richiesto non esiste o non hai i permessi per visualizzarlo.</p>
        <Link href="/cliente/incarichi">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna agli Incarichi
          </Button>
        </Link>
      </div>
    )
  }

  const statoConfig = STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/cliente/incarichi">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna agli Incarichi
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{incarico.oggetto}</h1>
              <Badge variant={statoConfig?.variant || 'default'}>
                {statoConfig?.label || incarico.stato}
              </Badge>
            </div>
            <p className="text-gray-600 mb-2">{incarico.bundleNome || 'Incarico personalizzato'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{incarico.codice}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Creato il {new Date(incarico.createdAt).toLocaleDateString('it-IT')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Importo Totale</p>
            <p className="text-3xl font-bold text-gray-900">
              €{parseFloat(incarico.importoTotale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Grid principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrizione */}
          {incarico.descrizione && (
            <Card>
              <CardHeader>
                <CardTitle>Descrizione</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{incarico.descrizione}</p>
              </CardContent>
            </Card>
          )}

          {/* Servizi inclusi */}
          {incarico.bundleServizi && incarico.bundleServizi.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Servizi Inclusi</CardTitle>
                <CardDescription>{incarico.bundleDescrizione}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {incarico.bundleServizi.map((servizio: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{servizio}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Timeline Milestone */}
          {incarico.milestone && incarico.milestone.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Piano di Pagamento</CardTitle>
                <CardDescription>
                  Stato dei pagamenti per questo incarico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incarico.milestone.map((milestone: any, index: number) => {
                    const statoMilestone = STATO_MILESTONE[milestone.stato as keyof typeof STATO_MILESTONE]
                    const Icon = statoMilestone.icon

                    return (
                      <div
                        key={milestone.id}
                        className="relative pl-8 pb-6 last:pb-0 border-l-2 border-gray-200 last:border-0"
                      >
                        <div className="absolute left-0 top-0 transform -translate-x-1/2">
                          <div className={`w-4 h-4 rounded-full ${
                            milestone.stato === 'PAGATO' ? 'bg-green-600' :
                            milestone.stato === 'RIMBORSATO' ? 'bg-gray-400' :
                            'bg-yellow-500'
                          }`} />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{milestone.nome}</h4>
                              <p className="text-sm text-gray-600">{milestone.descrizione}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-lg">
                                €{parseFloat(milestone.importo).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {milestone.percentuale}%
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className={`flex items-center gap-2 ${statoMilestone.color}`}>
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{statoMilestone.label}</span>
                            </div>
                            {milestone.stato === 'PAGATO' && milestone.dataPagamento && (
                              <span className="text-xs text-gray-500">
                                Pagato il {new Date(milestone.dataPagamento).toLocaleDateString('it-IT')}
                              </span>
                            )}
                            {milestone.stato === 'NON_PAGATO' && (
                              <Button size="sm" disabled>
                                Paga Ora
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documenti */}
          {incarico.documenti && incarico.documenti.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documenti</CardTitle>
                <CardDescription>
                  Documenti disponibili per il download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incarico.documenti.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.nomeFile}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            {doc.categoria && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{doc.categoria}</span>
                            )}
                            <span>v{doc.versione}</span>
                            {doc.dataConsegna && (
                              <span>{new Date(doc.dataConsegna).toLocaleDateString('it-IT')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" disabled>
                        <Download className="w-4 h-4 mr-2" />
                        Scarica
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Responsabile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Responsabile Progetto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {incarico.responsabileNome} {incarico.responsabileCognome}
                  </p>
                  <p className="text-sm text-gray-500">{incarico.responsabileEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date importanti */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Importanti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incarico.dataInizio && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Inizio</span>
                  <span className="font-medium">{new Date(incarico.dataInizio).toLocaleDateString('it-IT')}</span>
                </div>
              )}
              {incarico.dataScadenza && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Scadenza</span>
                  <span className="font-medium">{new Date(incarico.dataScadenza).toLocaleDateString('it-IT')}</span>
                </div>
              )}
              {incarico.dataFine && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fine Lavori</span>
                  <span className="font-medium text-green-600">{new Date(incarico.dataFine).toLocaleDateString('it-IT')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          {incarico.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{incarico.note}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
