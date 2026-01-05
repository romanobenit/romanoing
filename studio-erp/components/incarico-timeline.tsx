'use client'

import { CheckCircle, Clock, AlertCircle, FileText, MessageSquare, Euro } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineEvent {
  id: number
  tipo: 'milestone' | 'documento' | 'messaggio' | 'pagamento' | 'stato'
  titolo: string
  descrizione?: string
  data: string
  completato: boolean
}

interface IncaricoTimelineProps {
  eventi: TimelineEvent[]
}

export function IncaricoTimeline({ eventi }: IncaricoTimelineProps) {
  const getIcon = (tipo: string, completato: boolean) => {
    const iconClass = completato ? 'text-green-600' : 'text-gray-400'

    switch (tipo) {
      case 'milestone':
        return <CheckCircle className={`w-5 h-5 ${iconClass}`} />
      case 'documento':
        return <FileText className={`w-5 h-5 ${iconClass}`} />
      case 'messaggio':
        return <MessageSquare className={`w-5 h-5 ${iconClass}`} />
      case 'pagamento':
        return <Euro className={`w-5 h-5 ${iconClass}`} />
      case 'stato':
        return <Clock className={`w-5 h-5 ${iconClass}`} />
      default:
        return <AlertCircle className={`w-5 h-5 ${iconClass}`} />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Progetto</CardTitle>
        <CardDescription>Cronologia degli eventi e milestone</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventi.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nessun evento registrato</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Events */}
              <div className="space-y-6">
                {eventi.map((evento, index) => (
                  <div key={evento.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        evento.completato
                          ? 'bg-green-50 border-green-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {getIcon(evento.tipo, evento.completato)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4
                            className={`font-medium ${
                              evento.completato ? 'text-gray-900' : 'text-gray-600'
                            }`}
                          >
                            {evento.titolo}
                          </h4>
                          {evento.descrizione && (
                            <p className="text-sm text-gray-600 mt-1">{evento.descrizione}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(evento.data).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
