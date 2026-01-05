import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FolderKanban,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Euro,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'
import { DashboardMonitors } from '@/components/dashboard-monitors'

async function getIncarichiCollaboratore(utenteId: string, ruolo: string) {
  // Query diversa per TITOLARE (vede tutto) vs altri ruoli (solo assegnati a loro)
  const sql =
    ruolo === 'TITOLARE'
      ? `
    SELECT
      i.id,
      i.codice,
      i.oggetto,
      i.importo_totale as "importoTotale",
      i.stato,
      i.data_inizio as "dataInizio",
      i.data_scadenza as "dataScadenza",
      i.priorita,
      c.codice as "clienteCodice",
      c.nome as "clienteNome",
      c.cognome as "clienteCognome",
      c.ragione_sociale as "clienteRagioneSociale",
      b.nome as "bundleNome",
      (
        SELECT COUNT(*)::int
        FROM documenti d
        WHERE d.incarico_id = i.id
      ) as "documentiCount",
      (
        SELECT COUNT(*)::int
        FROM milestone m
        WHERE m.incarico_id = i.id AND m.stato = 'NON_PAGATO'
      ) as "milestoneNonPagate"
    FROM incarichi i
    LEFT JOIN clienti c ON i.cliente_id = c.id
    LEFT JOIN bundle b ON i.bundle_id = b.id
    ORDER BY i."createdAt" DESC
    LIMIT 50
  `
      : `
    SELECT
      i.id,
      i.codice,
      i.oggetto,
      i.importo_totale as "importoTotale",
      i.stato,
      i.data_inizio as "dataInizio",
      i.data_scadenza as "dataScadenza",
      i.priorita,
      c.codice as "clienteCodice",
      c.nome as "clienteNome",
      c.cognome as "clienteCognome",
      c.ragione_sociale as "clienteRagioneSociale",
      b.nome as "bundleNome",
      (
        SELECT COUNT(*)::int
        FROM documenti d
        WHERE d.incarico_id = i.id
      ) as "documentiCount",
      (
        SELECT COUNT(*)::int
        FROM milestone m
        WHERE m.incarico_id = i.id AND m.stato = 'NON_PAGATO'
      ) as "milestoneNonPagate"
    FROM incarichi i
    LEFT JOIN clienti c ON i.cliente_id = c.id
    LEFT JOIN bundle b ON i.bundle_id = b.id
    WHERE i.responsabile_id = $1
    ORDER BY i."createdAt" DESC
    LIMIT 50
  `

  const params = ruolo === 'TITOLARE' ? [] : [parseInt(utenteId)]
  const result = await query(sql, params)
  return result.rows
}

async function getAttivitaRecenti(utenteId: string, ruolo: string) {
  // Placeholder per attività recenti
  // TODO: Implementare query per log attività, upload documenti, etc.
  return []
}

const STATO_LABELS = {
  BOZZA: { label: 'Bozza', variant: 'secondary' as const, icon: FileText },
  ATTIVO: { label: 'Attivo', variant: 'default' as const, icon: Clock },
  IN_CORSO: { label: 'In Corso', variant: 'default' as const, icon: Clock },
  SOSPESO: { label: 'Sospeso', variant: 'destructive' as const, icon: AlertCircle },
  COMPLETATO: { label: 'Completato', variant: 'success' as const, icon: CheckCircle },
  ANNULLATO: { label: 'Annullato', variant: 'destructive' as const, icon: AlertCircle },
}

const PRIORITA_LABELS = {
  bassa: { label: 'Bassa', color: 'text-gray-600' },
  normale: { label: 'Normale', color: 'text-blue-600' },
  alta: { label: 'Alta', color: 'text-orange-600' },
  urgente: { label: 'Urgente', color: 'text-red-600' },
}

export default async function CollaboratoreDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const incarichi = await getIncarichiCollaboratore(session.user.id, session.user.ruolo)

  // Statistiche
  const stats = {
    totale: incarichi.length,
    attivi: incarichi.filter((i: any) => ['ATTIVO', 'IN_CORSO'].includes(i.stato)).length,
    completati: incarichi.filter((i: any) => i.stato === 'COMPLETATO').length,
    inScadenza: incarichi.filter((i: any) => {
      if (!i.dataScadenza) return false
      const scadenza = new Date(i.dataScadenza)
      const oggi = new Date()
      const diff = scadenza.getTime() - oggi.getTime()
      const giorni = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return giorni >= 0 && giorni <= 7
    }).length,
  }

  // Incarichi urgenti o in scadenza
  const incarichiUrgenti = incarichi
    .filter(
      (i: any) =>
        i.priorita === 'urgente' ||
        i.priorita === 'alta' ||
        (i.dataScadenza &&
          new Date(i.dataScadenza) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    )
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          {session.user.ruolo === 'TITOLARE'
            ? 'Panoramica completa dello studio'
            : 'I tuoi incarichi e attività'}
        </p>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incarichi Totali</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totale}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {session.user.ruolo === 'TITOLARE' ? 'Tutti gli incarichi' : 'Assegnati a te'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Corso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attivi}</div>
            <p className="text-xs text-muted-foreground mt-1">Attualmente attivi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completati</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completati}</div>
            <p className="text-xs text-muted-foreground mt-1">Incarichi conclusi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Scadenza</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inScadenza}</div>
            <p className="text-xs text-muted-foreground mt-1">Prossimi 7 giorni</p>
          </CardContent>
        </Card>
      </div>

      {/* Incarichi Urgenti */}
      {incarichiUrgenti.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priorità Alta & In Scadenza</CardTitle>
            <CardDescription>Incarichi che richiedono attenzione immediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incarichiUrgenti.map((incarico: any) => (
                <div
                  key={incarico.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-gray-500">
                        {incarico.codice}
                      </span>
                      <Badge
                        variant={
                          STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.variant ||
                          'default'
                        }
                      >
                        {STATO_LABELS[incarico.stato as keyof typeof STATO_LABELS]?.label ||
                          incarico.stato}
                      </Badge>
                      <span
                        className={`text-xs font-medium ${
                          PRIORITA_LABELS[incarico.priorita as keyof typeof PRIORITA_LABELS]
                            ?.color || 'text-gray-600'
                        }`}
                      >
                        {PRIORITA_LABELS[incarico.priorita as keyof typeof PRIORITA_LABELS]
                          ?.label || incarico.priorita}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">{incarico.oggetto}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Cliente:{' '}
                      {incarico.clienteRagioneSociale ||
                        `${incarico.clienteNome} ${incarico.clienteCognome}`}
                    </p>
                    {incarico.dataScadenza && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Scadenza: {new Date(incarico.dataScadenza).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/collaboratore/incarichi/${incarico.id}`}>Dettagli</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/collaboratore/incarichi">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderKanban className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tutti gli Incarichi</CardTitle>
                  <CardDescription>Visualizza e gestisci</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/collaboratore/timesheet">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Timesheet</CardTitle>
                  <CardDescription>Registra le ore lavorate</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/collaboratore/documenti">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Documenti</CardTitle>
                  <CardDescription>Upload e gestione</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Monitors: Messaggi e Log AI */}
      <DashboardMonitors isTitolare={session.user.ruolo === 'TITOLARE'} />
    </div>
  )
}
