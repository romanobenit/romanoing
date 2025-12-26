'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Brain, Check, Filter, Eye, Calendar } from 'lucide-react'
import Link from 'next/link'

interface LogAI {
  id: number
  strumento: string
  modello: string | null
  prompt: string
  risposta: string
  verificato: boolean
  dataVerifica: string | null
  contesto: string | null
  createdAt: string
  incaricoId: number | null
  incaricoCodice: string | null
  incaricoOggetto: string | null
  utilizzatoNome: string
  utilizzatoCognome: string
  utilizzatoRuolo: string
  verificatoreNome: string | null
  verificatoreCognome: string | null
}

interface LogAIMonitorProps {
  limit?: number
  showOnlyUnverified?: boolean
  isTitolare?: boolean
}

export function LogAIMonitor({
  limit = 10,
  showOnlyUnverified = false,
  isTitolare = false,
}: LogAIMonitorProps) {
  const [logs, setLogs] = useState<LogAI[]>([])
  const [nonVerificatiCount, setNonVerificatiCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(showOnlyUnverified)
  const [selectedLog, setSelectedLog] = useState<LogAI | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [showUnverifiedOnly])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      })

      if (showUnverifiedOnly) {
        params.append('verificato', 'false')
      }

      const response = await fetch(`/api/log-ai?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.data || [])
        setNonVerificatiCount(data.nonVerificatiCount || 0)
      }
    } catch (error) {
      console.error('Error fetching log AI:', error)
    } finally {
      setLoading(false)
    }
  }

  const verificaMultipli = async (ids: number[]) => {
    try {
      const response = await fetch('/api/log-ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logIds: ids }),
      })

      if (response.ok) {
        fetchLogs() // Ricarica lista
      }
    } catch (error) {
      console.error('Error verifying logs:', error)
    }
  }

  const verificaTutti = () => {
    const nonVerificatiIds = logs.filter((l) => !l.verificato).map((l) => l.id)
    if (nonVerificatiIds.length > 0) {
      verificaMultipli(nonVerificatiIds)
    }
  }

  const getStrumentoColor = (strumento: string) => {
    const colors: Record<string, string> = {
      'ChatGPT': 'bg-green-100 text-green-800',
      'Claude': 'bg-purple-100 text-purple-800',
      'GitHub Copilot': 'bg-blue-100 text-blue-800',
      'Midjourney': 'bg-pink-100 text-pink-800',
      'Altro': 'bg-gray-100 text-gray-800',
    }
    return colors[strumento] || 'bg-gray-100 text-gray-800'
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle>Log Utilizzo AI</CardTitle>
              {isTitolare && nonVerificatiCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {nonVerificatiCount} da verificare
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {isTitolare && (
                <>
                  <Button
                    variant={showUnverifiedOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    {showUnverifiedOnly ? 'Solo non verificati' : 'Tutti'}
                  </Button>
                  {nonVerificatiCount > 0 && (
                    <Button variant="outline" size="sm" onClick={verificaTutti}>
                      <Check className="w-4 h-4 mr-1" />
                      Verifica tutti
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>
                {showUnverifiedOnly
                  ? 'Nessun log da verificare'
                  : 'Nessun utilizzo AI registrato'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                    log.verificato
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStrumentoColor(log.strumento)}>
                          {log.strumento}
                        </Badge>
                        {log.modello && (
                          <span className="text-xs text-gray-500">{log.modello}</span>
                        )}
                        {!log.verificato && <Badge variant="destructive">Da verificare</Badge>}
                        {log.verificato && <Badge variant="outline">Verificato</Badge>}
                      </div>
                      {log.incaricoId && (
                        <Link
                          href={`/collaboratore/incarichi/${log.incaricoId}`}
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {log.incaricoCodice} - {log.incaricoOggetto}
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLog(log)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isTitolare && !log.verificato && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            verificaMultipli([log.id])
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                    <span className="font-medium">Prompt:</span> {log.prompt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {log.utilizzatoNome} {log.utilizzatoCognome}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {log.utilizzatoRuolo}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(log.createdAt).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>

                  {log.verificato && log.verificatoreNome && (
                    <div className="mt-1 text-xs text-green-600">
                      Verificato da {log.verificatoreNome} {log.verificatoreCognome} il{' '}
                      {new Date(log.dataVerifica!).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog dettagli log */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge className={getStrumentoColor(selectedLog.strumento)}>
                  {selectedLog.strumento}
                </Badge>
                {selectedLog.modello && (
                  <span className="text-sm font-normal text-gray-500">
                    {selectedLog.modello}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Info utilizzo */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Utilizzato da:</span>{' '}
                  {selectedLog.utilizzatoNome} {selectedLog.utilizzatoCognome} (
                  {selectedLog.utilizzatoRuolo})
                </div>
                <div>
                  <span className="font-medium">Data:</span>{' '}
                  {new Date(selectedLog.createdAt).toLocaleString('it-IT')}
                </div>
              </div>

              {selectedLog.incaricoId && (
                <div className="text-sm">
                  <span className="font-medium">Incarico:</span>{' '}
                  <Link
                    href={`/collaboratore/incarichi/${selectedLog.incaricoId}`}
                    className="text-primary hover:underline"
                  >
                    {selectedLog.incaricoCodice} - {selectedLog.incaricoOggetto}
                  </Link>
                </div>
              )}

              {/* Prompt */}
              <div>
                <h4 className="font-semibold mb-2">Prompt:</h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedLog.prompt}
                </div>
              </div>

              {/* Risposta */}
              <div>
                <h4 className="font-semibold mb-2">Risposta:</h4>
                <div className="p-3 bg-blue-50 rounded-lg text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedLog.risposta}
                </div>
              </div>

              {/* Contesto */}
              {selectedLog.contesto && (
                <div>
                  <h4 className="font-semibold mb-2">Contesto:</h4>
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedLog.contesto}
                  </div>
                </div>
              )}

              {/* Stato verifica */}
              <div className="pt-4 border-t">
                {selectedLog.verificato ? (
                  <div className="text-sm text-green-600">
                    ✓ Verificato da {selectedLog.verificatoreNome} {selectedLog.verificatoreCognome}{' '}
                    il {new Date(selectedLog.dataVerifica!).toLocaleDateString('it-IT')}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">⚠ Non ancora verificato</span>
                    {isTitolare && (
                      <Button
                        onClick={() => {
                          verificaMultipli([selectedLog.id])
                          setSelectedLog(null)
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Verifica ora
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
