'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Check, Eye, Filter } from 'lucide-react'
import Link from 'next/link'

interface Messaggio {
  id: number
  testo: string
  letto: boolean
  dataLettura: string | null
  createdAt: string
  incaricoId: number
  incaricoCodice: string
  incaricoOggetto: string
  mittenteNome: string
  mittenteCognome: string
  mittenteRuolo: string
  destinatarioNome?: string
  destinatarioCognome?: string
  destinatarioRuolo?: string
  clienteNome: string
}

interface MessaggiMonitorProps {
  limit?: number
  showOnlyUnread?: boolean
}

export function MessaggiMonitor({ limit = 10, showOnlyUnread = false }: MessaggiMonitorProps) {
  const [messaggi, setMessaggi] = useState<Messaggio[]>([])
  const [nonLettiCount, setNonLettiCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(showOnlyUnread)

  useEffect(() => {
    fetchMessaggi()
  }, [showUnreadOnly])

  const fetchMessaggi = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      })

      if (showUnreadOnly) {
        params.append('letto', 'false')
      }

      const response = await fetch(`/api/admin/messaggi?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMessaggi(data.data || [])
        setNonLettiCount(data.nonLettiCount || 0)
      }
    } catch (error) {
      console.error('Error fetching messaggi:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcaComeLettoMultiplo = async (ids: number[]) => {
    try {
      const response = await fetch('/api/admin/messaggi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaggioIds: ids }),
      })

      if (response.ok) {
        fetchMessaggi() // Ricarica lista
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const marcaTuttiComeLetti = () => {
    const nonLettiIds = messaggi.filter((m) => !m.letto).map((m) => m.id)
    if (nonLettiIds.length > 0) {
      marcaComeLettoMultiplo(nonLettiIds)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>Messaggi Recenti</CardTitle>
            {nonLettiCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {nonLettiCount} non letti
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={showUnreadOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="w-4 h-4 mr-1" />
              {showUnreadOnly ? 'Solo non letti' : 'Tutti'}
            </Button>
            {nonLettiCount > 0 && (
              <Button variant="outline" size="sm" onClick={marcaTuttiComeLetti}>
                <Check className="w-4 h-4 mr-1" />
                Segna tutti come letti
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messaggi.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>
              {showUnreadOnly
                ? 'Nessun messaggio non letto'
                : 'Nessun messaggio recente'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messaggi.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg border transition-colors ${
                  msg.letto ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/collaboratore/incarichi/${msg.incaricoId}`}
                        className="font-medium text-sm text-primary hover:underline"
                      >
                        {msg.incaricoCodice}
                      </Link>
                      {!msg.letto && <Badge variant="destructive">Nuovo</Badge>}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{msg.incaricoOggetto}</p>
                  </div>
                  {!msg.letto && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => marcaComeLettoMultiplo([msg.id])}
                      className="ml-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-gray-800 mb-2 line-clamp-2">{msg.testo}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {msg.mittenteNome} {msg.mittenteCognome}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {msg.mittenteRuolo}
                    </Badge>
                    {msg.destinatarioNome && (
                      <>
                        <span>→</span>
                        <span>
                          {msg.destinatarioNome} {msg.destinatarioCognome}
                        </span>
                      </>
                    )}
                  </div>
                  <span>{new Date(msg.createdAt).toLocaleDateString('it-IT')}</span>
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Cliente: <span className="font-medium">{msg.clienteNome}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {messaggi.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link href="/collaboratore/messaggi">Vedi tutti i messaggi</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
