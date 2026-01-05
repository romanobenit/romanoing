'use client'

import { useState } from 'react'
import { Plus, Calendar, Clock, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TimesheetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')

  // Mock data - TODO: Replace with real API call
  const timeEntries = [
    {
      id: 1,
      data: '2025-01-20',
      incaricocodice: 'INC25001',
      incaricoOggetto: 'Ristrutturazione Appartamento',
      ore: 4.5,
      descrizione: 'Sopralluogo e rilievo misure',
      categoria: 'Sopralluogo',
    },
    {
      id: 2,
      data: '2025-01-19',
      incaricoCodice: 'INC25002',
      incaricoOggetto: 'Progetto Vulnerabilità Sismica',
      ore: 8,
      descrizione: 'Modellazione FEM struttura esistente',
      categoria: 'Progettazione',
    },
    {
      id: 3,
      data: '2025-01-18',
      incaricoCodice: 'INC25001',
      incaricoOggetto: 'Ristrutturazione Appartamento',
      ore: 6,
      descrizione: 'Redazione tavole architettoniche',
      categoria: 'Progettazione',
    },
  ]

  const totalOre = timeEntries.reduce((sum, entry) => sum + entry.ore, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timesheet</h1>
          <p className="mt-2 text-gray-600">Registra e monitora le ore lavorate</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuova Registrazione
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ore Questa Settimana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOre}h</div>
            <p className="text-xs text-muted-foreground mt-1">Target: 40h</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(totalOre / 40) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questo Mese</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.5h</div>
            <p className="text-xs text-muted-foreground mt-1">Media: 20.6h/settimana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incarichi Attivi</CardTitle>
            <Badge>3</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mt-2">
              Con ore registrate questa settimana
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Azioni</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Esporta Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              Questa Settimana
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              Questo Mese
            </Button>
            <div className="flex-1" />
            <div className="text-sm text-gray-600">
              21 Gen - 27 Gen 2025
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Registrazioni</CardTitle>
          <CardDescription>Dettaglio ore lavorate per incarico</CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna registrazione
              </h3>
              <p className="text-gray-600 mb-4">
                Inizia a registrare le ore lavorate sui tuoi incarichi
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuova Registrazione
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(entry.data).toLocaleDateString('it-IT', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <Badge variant="outline">{entry.categoria}</Badge>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm font-mono text-gray-500">
                        {entry.incaricoCodice}
                      </p>
                      <p className="font-medium text-gray-900">{entry.incaricoOggetto}</p>
                    </div>
                    <p className="text-sm text-gray-600">{entry.descrizione}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-primary">{entry.ore}h</div>
                    <Button variant="ghost" size="sm" className="mt-2">
                      Modifica
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Riepilogo per Incarico */}
      <Card>
        <CardHeader>
          <CardTitle>Riepilogo per Incarico</CardTitle>
          <CardDescription>Ore lavorate raggruppate per incarico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-mono text-gray-500">INC25001</p>
                <p className="font-medium text-gray-900">Ristrutturazione Appartamento</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">10.5h</p>
                <p className="text-sm text-gray-600">Budget: 80h</p>
                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: '13%' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-mono text-gray-500">INC25002</p>
                <p className="font-medium text-gray-900">Progetto Vulnerabilità Sismica</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">8h</p>
                <p className="text-sm text-gray-600">Budget: 120h</p>
                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: '6.7%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
