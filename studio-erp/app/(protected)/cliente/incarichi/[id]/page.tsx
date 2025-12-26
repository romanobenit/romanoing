'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Euro,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  User,
  MessageSquare,
  Upload,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentList } from '@/components/document-list'
import { MessageThread } from '@/components/message-thread'
import { MilestonePayment } from '@/components/milestone-payment'
import { IncaricoTimeline } from '@/components/incarico-timeline'

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
  const [messaggi, setMessaggi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchIncarico()
    fetchMessaggi()
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

  const fetchMessaggi = async () => {
    try {
      const res = await fetch(`/api/cliente/messaggi?incaricoId=${resolvedParams.id}`)
      const data = await res.json()
      if (data.success) {
        setMessaggi(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento messaggi:', error)
    }
  }

  const handleView = (doc: any) => {
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
  }

  const handleDownload = (doc: any) => {
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
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

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="pagamenti">
            <Euro className="w-4 h-4 mr-2" />
            Pagamenti
          </TabsTrigger>
          <TabsTrigger value="documenti">
            <FileText className="w-4 h-4 mr-2" />
            Documenti
          </TabsTrigger>
          <TabsTrigger value="messaggi">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messaggi
            {messaggi.filter((m) => !m.letto).length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {messaggi.filter((m) => !m.letto).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <span className="font-medium">
                        {new Date(incarico.dataInizio).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                  {incarico.dataScadenza && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Scadenza</span>
                      <span className="font-medium">
                        {new Date(incarico.dataScadenza).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                  {incarico.dataFine && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fine Lavori</span>
                      <span className="font-medium text-green-600">
                        {new Date(incarico.dataFine).toLocaleDateString('it-IT')}
                      </span>
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
        </TabsContent>

        {/* Pagamenti Tab */}
        <TabsContent value="pagamenti">
          <Card>
            <CardHeader>
              <CardTitle>Piano di Pagamento</CardTitle>
              <CardDescription>
                Gestisci i pagamenti delle milestone per questo incarico
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incarico.milestone && incarico.milestone.length > 0 ? (
                <div className="space-y-4">
                  {incarico.milestone.map((milestone: any) => (
                    <MilestonePayment
                      key={milestone.id}
                      milestone={milestone}
                      incaricoCodice={incarico.codice}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  Nessuna milestone configurata per questo incarico
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti Tab */}
        <TabsContent value="documenti">
          {incarico.documenti && incarico.documenti.length > 0 ? (
            <DocumentList
              documenti={incarico.documenti}
              userRole="COMMITTENTE"
              onView={handleView}
              onDownload={handleDownload}
            />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nessun documento disponibile</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Messaggi Tab */}
        <TabsContent value="messaggi">
          <MessageThread incaricoId={parseInt(resolvedParams.id)} messages={messaggi} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <IncaricoTimeline
            eventi={[
              {
                tipo: 'creazione',
                titolo: 'Incarico Creato',
                descrizione: `Incarico ${incarico.codice} creato`,
                data: incarico.createdAt,
                completato: true,
              },
              ...(incarico.dataInizio
                ? [
                    {
                      tipo: 'inizio',
                      titolo: 'Inizio Lavori',
                      descrizione: 'Avvio delle attività progettuali',
                      data: incarico.dataInizio,
                      completato: new Date(incarico.dataInizio) <= new Date(),
                    },
                  ]
                : []),
              ...(incarico.milestone || []).map((m: any) => ({
                tipo: m.stato === 'PAGATO' ? 'pagamento' : 'milestone',
                titolo: m.nome,
                descrizione: m.descrizione,
                data: m.dataPagamento || m.dataScadenza,
                completato: m.stato === 'PAGATO',
              })),
              ...(incarico.dataFine
                ? [
                    {
                      tipo: 'completamento',
                      titolo: 'Completamento Lavori',
                      descrizione: 'Fine delle attività progettuali',
                      data: incarico.dataFine,
                      completato: new Date(incarico.dataFine) <= new Date(),
                    },
                  ]
                : []),
            ]}
          />
        </TabsContent>
      </Tabs>

      {/* Keep sidebar for mobile/desktop consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    </div>
  )
}
