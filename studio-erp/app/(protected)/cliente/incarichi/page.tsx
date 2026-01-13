'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEuro } from '@/lib/utils'
import { 
  FileText, 
  Calendar, 
  CreditCard, 
  MessageSquare,
  Eye,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Incarico {
  id: number
  codice: string
  oggetto: string
  descrizione: string
  stato: string
  importo_totale: number
  data_inizio: string
  data_fine?: string
  avanzamento: number
  milestone_totali: number
  milestone_pagate: number
  prossima_milestone?: {
    nome: string
    importo: number
    scadenza?: string
  }
  bundle_nome?: string
}

export default function ClienteIncarichiPage() {
  const { data: session, status } = useSession()
  const [incarichi, setIncarichi] = useState<Incarico[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'tutti' | 'attivi' | 'completati'>('attivi')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.ruolo === 'COMMITTENTE') {
      fetchIncarichi()
    }
  }, [status, session, filter])

  const fetchIncarichi = async () => {
    try {
      const response = await fetch(`/api/cliente/incarichi?filter=${filter}`)
      const data = await response.json()
      
      if (data.success) {
        setIncarichi(data.incarichi)
      } else {
        console.error('Error fetching incarichi:', data.error)
      }
    } catch (error) {
      console.error('Error fetching incarichi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'ATTIVO':
      case 'IN_CORSO': return 'bg-blue-100 text-blue-800'
      case 'COMPLETATO': return 'bg-green-100 text-green-800'
      case 'IN_ATTESA': return 'bg-yellow-100 text-yellow-800'
      case 'SOSPESO': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'ATTIVO':
      case 'IN_CORSO': return <Clock className="w-4 h-4" />
      case 'COMPLETATO': return <CheckCircle className="w-4 h-4" />
      case 'IN_ATTESA': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.ruolo !== 'COMMITTENTE') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
        <p className="text-gray-600">Non sei autorizzato a visualizzare questa pagina.</p>
      </div>
    )
  }

  const filteredIncarichi = incarichi.filter(incarico => {
    switch (filter) {
      case 'attivi':
        return ['ATTIVO', 'IN_CORSO'].includes(incarico.stato)
      case 'completati':
        return incarico.stato === 'COMPLETATO'
      default:
        return true
    }
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">I Miei Incarichi</h1>
        <p className="text-gray-600 mt-2">
          Tutti i tuoi progetti con Studio Ing. Romano
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'attivi', label: 'Attivi', count: incarichi.filter(i => ['ATTIVO', 'IN_CORSO'].includes(i.stato)).length },
            { key: 'completati', label: 'Completati', count: incarichi.filter(i => i.stato === 'COMPLETATO').length },
            { key: 'tutti', label: 'Tutti', count: incarichi.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Incarichi List */}
      {filteredIncarichi.length > 0 ? (
        <div className="space-y-6">
          {filteredIncarichi.map((incarico) => (
            <Card key={incarico.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      📋 {incarico.codice}
                      <Badge className={getStatoColor(incarico.stato)}>
                        <span className="flex items-center gap-1">
                          {getStatoIcon(incarico.stato)}
                          {incarico.stato.replace('_', ' ')}
                        </span>
                      </Badge>
                    </CardTitle>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">
                      {incarico.oggetto}
                    </h3>
                    {incarico.bundle_nome && (
                      <p className="text-sm text-blue-600 font-medium">
                        Servizio: {incarico.bundle_nome}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatEuro(incarico.importo_totale)}
                    </p>
                    <p className="text-sm text-gray-600">Valore totale</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Descrizione */}
                {incarico.descrizione && (
                  <p className="text-gray-700">{incarico.descrizione}</p>
                )}

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Avanzamento Progetto</span>
                    <span>{incarico.avanzamento}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${incarico.avanzamento}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{incarico.milestone_pagate}/{incarico.milestone_totali} milestone completate</span>
                    <span>
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {incarico.avanzamento > 80 ? 'Quasi completato' : incarico.avanzamento > 50 ? 'In buon progresso' : 'Iniziato'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Inizio: {new Date(incarico.data_inizio).toLocaleDateString('it-IT')}</span>
                  </div>
                  {incarico.data_fine && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Completato: {new Date(incarico.data_fine).toLocaleDateString('it-IT')}</span>
                    </div>
                  )}
                </div>

                {/* Prossima Milestone */}
                {incarico.prossima_milestone && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                          🎯 Prossima milestone: {incarico.prossima_milestone.nome}
                        </h4>
                        <p className="text-blue-700">
                          <strong>{formatEuro(incarico.prossima_milestone.importo)}</strong>
                        </p>
                        {incarico.prossima_milestone.scadenza && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Scadenza: {new Date(incarico.prossima_milestone.scadenza).toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Paga Ora
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Link href={`/cliente/incarichi/${incarico.codice}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Vedi Dettagli
                    </Button>
                  </Link>
                  
                  <Link href={`/cliente/incarichi/${incarico.codice}/documenti`}>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Documenti
                    </Button>
                  </Link>
                  
                  <Link href={`/cliente/incarichi/${incarico.codice}/messaggi`}>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messaggi
                    </Button>
                  </Link>
                  
                  {incarico.prossima_milestone && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Paga {formatEuro(incarico.prossima_milestone.importo)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'attivi' ? 'Nessun incarico attivo' : 
               filter === 'completati' ? 'Nessun incarico completato' : 
               'Nessun incarico trovato'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'attivi' 
                ? 'I tuoi incarichi attivi appariranno qui.'
                : 'Non hai ancora incarichi in questa categoria.'
              }
            </p>
            {filter === 'attivi' && (
              <Link href="/#servizi">
                <Button>
                  Richiedi un Preventivo
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}