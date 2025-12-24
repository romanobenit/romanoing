'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Euro, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const, icon: FileText },
  ATTIVO: { label: 'Attivo', variant: 'default' as const, icon: Clock },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const, icon: Clock },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const, icon: AlertCircle },
  COMPLETATO: { label: 'Completato', variant: 'success' as const, icon: CheckCircle },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const, icon: AlertCircle },
}

export default function IncarichiPage() {
  const [incarichi, setIncarichi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroStato, setFiltroStato] = useState<string>('')

  useEffect(() => {
    fetchIncarichi()
  }, [])

  const fetchIncarichi = async () => {
    try {
      const res = await fetch('/api/cliente/incarichi')
      const data = await res.json()
      if (data.success) {
        setIncarichi(data.data)
      }
    } catch (error) {
      console.error('Errore caricamento incarichi:', error)
    } finally {
      setLoading(false)
    }
  }

  const incarichiFiltrati = incarichi.filter((incarico) => {
    const matchSearch = search === '' ||
      incarico.oggetto.toLowerCase().includes(search.toLowerCase()) ||
      incarico.codice.toLowerCase().includes(search.toLowerCase())

    const matchStato = filtroStato === '' || incarico.stato === filtroStato

    return matchSearch && matchStato
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento incarichi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">I Miei Incarichi</h1>
        <p className="mt-2 text-gray-600">
          Gestisci e monitora tutti i tuoi progetti in un unico posto
        </p>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cerca per oggetto o codice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <select
                value={filtroStato}
                onChange={(e) => setFiltroStato(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Tutti gli stati</option>
                {Object.entries(STATO_LABELS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista Incarichi */}
      {incarichiFiltrati.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {search || filtroStato
                  ? 'Nessun incarico trovato con i filtri selezionati'
                  : 'Nessun incarico presente'}
              </p>
              {!search && !filtroStato && (
                <Link href="/">
                  <Button className="mt-4">Scopri i Nostri Servizi</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incarichiFiltrati.map((incarico) => {
            const statoConfig = STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]
            const Icon = statoConfig?.icon || FileText
            const milestonePagate = incarico.milestone?.filter((m: any) => m.stato === 'PAGATO').length || 0
            const milestoneTotali = incarico.milestone?.length || 0

            return (
              <Link key={incarico.id} href={`/cliente/incarichi/${incarico.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{incarico.oggetto}</h3>
                          <Badge variant={statoConfig?.variant || 'default'}>
                            <Icon className="w-3 h-3 mr-1" />
                            {statoConfig?.label || incarico.stato}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3">{incarico.bundleNome || 'Incarico personalizzato'}</p>

                        {incarico.descrizione && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {incarico.descrizione}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Creato il {new Date(incarico.createdAt).toLocaleDateString('it-IT')}
                          </span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {incarico.codice}
                          </span>
                          {incarico.documentiCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {incarico.documentiCount} {incarico.documentiCount === 1 ? 'documento' : 'documenti'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="mb-2">
                          <p className="text-2xl font-bold text-gray-900">
                            €{parseFloat(incarico.importoTotale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {milestoneTotali > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Milestone</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${(milestonePagate / milestoneTotali) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                {milestonePagate}/{milestoneTotali}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Footer statistiche */}
      <div className="text-center text-sm text-gray-500 pt-4">
        Visualizzati {incarichiFiltrati.length} di {incarichi.length} incarichi
      </div>
    </div>
  )
}
