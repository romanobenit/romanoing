'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEuro } from '@/lib/utils'
import Link from 'next/link'
import { 
  FileText, 
  CreditCard, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface DashboardData {
  incarichi_attivi: number
  documenti_disponibili: number
  importo_da_pagare: number
  messaggi_non_letti: number
  prossimi_incarichi: Array<{
    id: number
    codice: string
    oggetto: string
    stato: string
    avanzamento: number
    prossima_milestone?: {
      nome: string
      importo: number
      scadenza?: string
    }
  }>
}

export default function ClienteDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.ruolo === 'COMMITTENTE') {
      fetchDashboardData()
    }
  }, [status, session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/cliente/dashboard')
      const data = await response.json()
      
      if (data.success) {
        setDashboardData(data.data)
      } else {
        console.error('Dashboard error:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
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

  // Mock data se API non implementata ancora
  const mockData: DashboardData = {
    incarichi_attivi: 2,
    documenti_disponibili: 8,
    importo_da_pagare: 2400,
    messaggi_non_letti: 1,
    prossimi_incarichi: [
      {
        id: 1,
        codice: 'INC25001',
        oggetto: 'Ristrutturazione Villa Rossi',
        stato: 'IN_CORSO',
        avanzamento: 80,
        prossima_milestone: {
          nome: 'Direzione Lavori',
          importo: 2400,
          scadenza: '2025-02-15'
        }
      }
    ]
  }

  const data = dashboardData || mockData

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'IN_CORSO': return 'bg-blue-100 text-blue-800'
      case 'COMPLETATO': return 'bg-green-100 text-green-800'
      case 'IN_ATTESA': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatoIcon = (stato: string) => {
    switch (stato) {
      case 'IN_CORSO': return <Clock className="w-4 h-4" />
      case 'COMPLETATO': return <CheckCircle className="w-4 h-4" />
      case 'IN_ATTESA': return <AlertCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Benvenuto, {session.user.nome}!
        </h1>
        <p className="text-gray-600 mt-2">
          Panoramica dei tuoi incarichi e attività
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Incarichi Attivi</p>
                <p className="text-2xl font-bold text-gray-900">{data.incarichi_attivi}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documenti</p>
                <p className="text-2xl font-bold text-gray-900">{data.documenti_disponibili}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Da Pagare</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatEuro(data.importo_da_pagare)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messaggi</p>
                <p className="text-2xl font-bold text-gray-900">{data.messaggi_non_letti}</p>
                {data.messaggi_non_letti > 0 && (
                  <p className="text-xs text-red-600">non letti</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incarichi in Corso */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>I Tuoi Incarichi</span>
            <Link href="/cliente/incarichi">
              <Button variant="outline" size="sm">
                Vedi Tutti
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.prossimi_incarichi.length > 0 ? (
            <div className="space-y-4">
              {data.prossimi_incarichi.map((incarico) => (
                <div key={incarico.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        📋 {incarico.codice} - {incarico.oggetto}
                      </h3>
                    </div>
                    <Badge className={getStatoColor(incarico.stato)}>
                      <span className="flex items-center gap-1">
                        {getStatoIcon(incarico.stato)}
                        {incarico.stato.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Avanzamento</span>
                      <span>{incarico.avanzamento}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${incarico.avanzamento}%` }}
                      ></div>
                    </div>
                  </div>

                  {incarico.prossima_milestone && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">
                            Prossima milestone: {incarico.prossima_milestone.nome}
                          </p>
                          <p className="text-sm text-blue-700">
                            Importo: <strong>{formatEuro(incarico.prossima_milestone.importo)}</strong>
                          </p>
                          {incarico.prossima_milestone.scadenza && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Scadenza: {new Date(incarico.prossima_milestone.scadenza).toLocaleDateString('it-IT')}
                            </p>
                          )}
                        </div>
                        <Button size="sm">
                          Paga Ora
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/cliente/incarichi/${incarico.codice}`}>
                      <Button variant="outline" size="sm">
                        Vedi Dettagli
                      </Button>
                    </Link>
                    <Link href={`/cliente/incarichi/${incarico.codice}/messaggi`}>
                      <Button variant="outline" size="sm">
                        💬 {data.messaggi_non_letti > 0 ? `${data.messaggi_non_letti} nuovo` : 'Messaggi'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun incarico attivo</h3>
              <p className="text-gray-500">
                I tuoi incarichi appariranno qui una volta confermati.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cosa Succede Dopo */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Cosa Succede Dopo?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contatto Tecnico</h3>
              <p className="text-sm text-gray-600">
                Entro 24h verrai contattato dal tecnico responsabile per il primo appuntamento
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Monitoraggio</h3>
              <p className="text-sm text-gray-600">
                Monitora l'avanzamento in tempo reale dall'area riservata
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pagamenti</h3>
              <p className="text-sm text-gray-600">
                Paga le milestone successive online in modo sicuro
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}