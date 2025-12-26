'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Calendar, Euro, FileText, Clock, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { NuovoIncaricoForm } from '@/components/nuovo-incarico-form'
import { useSession } from 'next-auth/react'

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const },
  ATTIVO: { label: 'Attivo', variant: 'default' as const },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const },
  COMPLETATO: { label: 'Completato', variant: 'success' as const },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const },
}

export default function IncarichiCollaboratorePage() {
  const { data: session } = useSession()
  const [incarichi, setIncarichi] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statoFilter, setStatoFilter] = useState<string>('TUTTI')
  const [showNuovoIncaricoDialog, setShowNuovoIncaricoDialog] = useState(false)

  const isTitolare = session?.user?.ruolo === 'TITOLARE'

  useEffect(() => {
    fetchIncarichi()
  }, [])

  const fetchIncarichi = async () => {
    try {
      const response = await fetch('/api/collaboratore/incarichi')
      if (response.ok) {
        const data = await response.json()
        setIncarichi(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching incarichi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtra incarichi
  const incarichiFiltrati = incarichi.filter((incarico) => {
    const matchSearch =
      searchQuery === '' ||
      incarico.codice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incarico.oggetto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incarico.clienteNome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incarico.clienteCognome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incarico.clienteRagioneSociale?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchStato = statoFilter === 'TUTTI' || incarico.stato === statoFilter

    return matchSearch && matchStato
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incarichi</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi incarichi assegnati</p>
        </div>
        {isTitolare && (
          <Button onClick={() => setShowNuovoIncaricoDialog(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Incarico
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Cerca per codice, oggetto o cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stato Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statoFilter === 'TUTTI' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatoFilter('TUTTI')}
              >
                Tutti
              </Button>
              <Button
                variant={statoFilter === 'IN_CORSO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatoFilter('IN_CORSO')}
              >
                In Corso
              </Button>
              <Button
                variant={statoFilter === 'ATTIVO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatoFilter('ATTIVO')}
              >
                Attivi
              </Button>
              <Button
                variant={statoFilter === 'COMPLETATO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatoFilter('COMPLETATO')}
              >
                Completati
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {incarichiFiltrati.length} incarico{incarichiFiltrati.length !== 1 ? 'i' : ''} trovato
        {incarichiFiltrati.length !== 1 ? 'i' : ''}
      </div>

      {/* Incarichi List */}
      {incarichiFiltrati.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun incarico trovato</h3>
            <p className="text-gray-600">
              {searchQuery || statoFilter !== 'TUTTI'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Non ci sono incarichi assegnati'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {incarichiFiltrati.map((incarico) => (
            <Card key={incarico.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{incarico.codice}</span>
                      <Badge
                        variant={
                          STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.variant ||
                          'default'
                        }
                      >
                        {STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.label ||
                          incarico.stato}
                      </Badge>
                      {incarico.priorita === 'alta' && (
                        <Badge variant="destructive">Alta Priorità</Badge>
                      )}
                      {incarico.priorita === 'urgente' && (
                        <Badge variant="destructive">Urgente</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {incarico.oggetto}
                    </h3>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Cliente:</span>{' '}
                        {incarico.clienteRagioneSociale ||
                          `${incarico.clienteNome} ${incarico.clienteCognome}`}
                      </div>
                      {incarico.bundleNome && (
                        <div>
                          <span className="font-medium">Bundle:</span> {incarico.bundleNome}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                        <span className="font-medium">
                          €{parseFloat(incarico.importoTotale).toLocaleString('it-IT')}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      {incarico.dataInizio && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Inizio: {new Date(incarico.dataInizio).toLocaleDateString('it-IT')}
                        </div>
                      )}
                      {incarico.dataScadenza && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Scadenza: {new Date(incarico.dataScadenza).toLocaleDateString('it-IT')}
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    {incarico.milestoneTotal > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Milestone</span>
                          <span>
                            {incarico.milestonePagate}/{incarico.milestoneTotal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (incarico.milestonePagate / incarico.milestoneTotal) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="ml-4">
                    <Button asChild>
                      <Link href={`/collaboratore/incarichi/${incarico.id}`}>Dettagli</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Nuovo Incarico */}
      <Dialog open={showNuovoIncaricoDialog} onOpenChange={setShowNuovoIncaricoDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crea Nuovo Incarico</DialogTitle>
          </DialogHeader>
          <NuovoIncaricoForm
            onSuccess={(nuovoIncarico) => {
              setShowNuovoIncaricoDialog(false)
              fetchIncarichi() // Ricarica la lista
              alert(`Incarico ${nuovoIncarico.codice} creato con successo!`)
            }}
            onCancel={() => setShowNuovoIncaricoDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
