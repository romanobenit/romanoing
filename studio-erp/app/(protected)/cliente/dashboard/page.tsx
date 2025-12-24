import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertCircle, Euro, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

async function getIncarichiDashboard() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/cliente/incarichi`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return { success: false, data: [] }
  }

  return res.json()
}

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const, icon: FileText },
  ATTIVO: { label: 'Attivo', variant: 'default' as const, icon: Clock },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const, icon: Clock },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const, icon: AlertCircle },
  COMPLETATO: { label: 'Completato', variant: 'success' as const, icon: CheckCircle },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const, icon: AlertCircle },
}

export default async function DashboardPage() {
  const { data: incarichi } = await getIncarichiDashboard()

  // Statistiche
  const stats = {
    totale: incarichi.length,
    attivi: incarichi.filter((i: any) => ['ATTIVO', 'IN_CORSO'].includes(i.stato)).length,
    completati: incarichi.filter((i: any) => i.stato === 'COMPLETATO').length,
    importoTotale: incarichi.reduce((sum: number, i: any) => sum + parseFloat(i.importoTotale || 0), 0),
  }

  // Milestone da pagare
  const milestoneDaPagare = incarichi
    .flatMap((i: any) => i.milestone || [])
    .filter((m: any) => m.stato === 'NON_PAGATO')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Benvenuto! Qui puoi monitorare lo stato dei tuoi incarichi.
        </p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incarichi Totali</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totale}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tutti i tuoi incarichi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Corso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attivi}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Attualmente in lavorazione
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completati</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completati}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Incarichi conclusi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valore Totale</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.importoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Somma di tutti gli incarichi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestone da pagare */}
      {milestoneDaPagare.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Pagamenti in Attesa
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Hai {milestoneDaPagare.length} milestone da pagare
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestoneDaPagare.slice(0, 3).map((milestone: any) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">{milestone.nome}</p>
                    <p className="text-xs text-gray-500">{milestone.descrizione}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      €{parseFloat(milestone.importo).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </p>
                    {milestone.dataScadenza && (
                      <p className="text-xs text-gray-500">
                        Scadenza: {new Date(milestone.dataScadenza).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {milestoneDaPagare.length > 3 && (
              <Link href="/cliente/incarichi">
                <Button variant="link" className="mt-4 w-full">
                  Vedi tutti i pagamenti
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista Incarichi Recenti */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>I Tuoi Incarichi</CardTitle>
              <CardDescription className="mt-1">
                Panoramica completa dei tuoi progetti
              </CardDescription>
            </div>
            <Link href="/cliente/incarichi">
              <Button variant="outline">Vedi Tutti</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {incarichi.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nessun incarico presente</p>
              <Link href="/">
                <Button>Scopri i Nostri Servizi</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {incarichi.slice(0, 5).map((incarico: any) => {
                const statoConfig = STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]
                const Icon = statoConfig?.icon || FileText

                return (
                  <Link
                    key={incarico.id}
                    href={`/cliente/incarichi/${incarico.id}`}
                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{incarico.oggetto}</h3>
                          <Badge variant={statoConfig?.variant || 'default'}>
                            <Icon className="w-3 h-3 mr-1" />
                            {statoConfig?.label || incarico.stato}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{incarico.bundleNome}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(incarico.createdAt).toLocaleDateString('it-IT')}
                          </span>
                          <span>{incarico.codice}</span>
                          {incarico.documentiCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {incarico.documentiCount} documenti
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-gray-900">
                          €{parseFloat(incarico.importoTotale).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </p>
                        {incarico.milestone && (
                          <p className="text-xs text-gray-500 mt-1">
                            {incarico.milestone.filter((m: any) => m.stato === 'PAGATO').length}/{incarico.milestone.length} milestone pagate
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
