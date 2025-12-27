'use client'

import { useState } from 'react'
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Check,
  X,
  Clock,
  Upload,
  MoreVertical,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Documento {
  id: number
  nomeFile: string
  categoria: string
  versione: number
  stato: string
  dimensione: number
  createdAt: string
  uploadedByNome?: string
  uploadedByCognome?: string
  visibileCliente: boolean
  pathStorage: string
}

interface DocumentListProps {
  documenti: Documento[]
  userRole: string
  onView?: (doc: Documento) => void
  onDownload?: (doc: Documento) => void
  onApprove?: (doc: Documento) => void
  onReject?: (doc: Documento) => void
  onDelete?: (doc: Documento) => void
  onNewVersion?: (doc: Documento) => void
  onViewHistory?: (doc: Documento) => void
}

const CATEGORIA_LABELS: Record<string, { label: string; color: string }> = {
  elaborato: { label: 'Elaborato', color: 'bg-blue-100 text-blue-800' },
  relazione: { label: 'Relazione', color: 'bg-purple-100 text-purple-800' },
  planimetria: { label: 'Planimetria', color: 'bg-green-100 text-green-800' },
  computo: { label: 'Computo', color: 'bg-orange-100 text-orange-800' },
  pratica: { label: 'Pratica', color: 'bg-red-100 text-red-800' },
  certificato: { label: 'Certificato', color: 'bg-teal-100 text-teal-800' },
  fattura: { label: 'Fattura', color: 'bg-yellow-100 text-yellow-800' },
  altro: { label: 'Altro', color: 'bg-gray-100 text-gray-800' },
}

const STATO_LABELS: Record<string, { label: string; icon: any; variant: any }> = {
  BOZZA: { label: 'Bozza', icon: Clock, variant: 'secondary' as const },
  IN_REVISIONE: { label: 'In Revisione', icon: Clock, variant: 'default' as const },
  APPROVATO: { label: 'Approvato', icon: Check, variant: 'success' as const },
  RIFIUTATO: { label: 'Rifiutato', icon: X, variant: 'destructive' as const },
  CONSEGNATO: { label: 'Consegnato', icon: Check, variant: 'success' as const },
}

export function DocumentList({
  documenti,
  userRole,
  onView,
  onDownload,
  onApprove,
  onReject,
  onDelete,
  onNewVersion,
  onViewHistory,
}: DocumentListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    // Potresti aggiungere icone diverse per tipo file
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  const filteredDocumenti = documenti.filter((doc) => {
    const categoryMatch = selectedCategory === 'all' || doc.categoria === selectedCategory
    const statusMatch = selectedStatus === 'all' || doc.stato === selectedStatus
    return categoryMatch && statusMatch
  })

  const isCollaboratore = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO'].includes(userRole)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Tutti
        </Button>
        {Object.entries(CATEGORIA_LABELS).map(([key, { label }]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Documents List */}
      {filteredDocumenti.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nessun documento trovato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocumenti.map((doc) => {
            const categoria = CATEGORIA_LABELS[doc.categoria] || CATEGORIA_LABELS.altro
            const stato = STATO_LABELS[doc.stato] || STATO_LABELS.BOZZA
            const StatoIcon = stato.icon

            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">{getFileIcon(doc.nomeFile)}</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{doc.nomeFile}</h4>
                          <p className="text-sm text-gray-600">
                            {doc.uploadedByNome && doc.uploadedByCognome && (
                              <>Caricato da {doc.uploadedByNome} {doc.uploadedByCognome} •{' '}</>
                            )}
                            {new Date(doc.createdAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(doc)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizza
                              </DropdownMenuItem>
                            )}
                            {onDownload && (
                              <DropdownMenuItem onClick={() => onDownload(doc)}>
                                <Download className="w-4 h-4 mr-2" />
                                Scarica
                              </DropdownMenuItem>
                            )}

                            {isCollaboratore && (
                              <>
                                <DropdownMenuSeparator />
                                {onNewVersion && (
                                  <DropdownMenuItem onClick={() => onNewVersion(doc)}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Nuova Versione
                                  </DropdownMenuItem>
                                )}
                                {onViewHistory && doc.versione > 1 && (
                                  <DropdownMenuItem onClick={() => onViewHistory(doc)}>
                                    <History className="w-4 h-4 mr-2" />
                                    Storico Versioni ({doc.versione})
                                  </DropdownMenuItem>
                                )}
                                {onApprove && doc.stato !== 'APPROVATO' && (
                                  <DropdownMenuItem onClick={() => onApprove(doc)}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Approva
                                  </DropdownMenuItem>
                                )}
                                {onReject && doc.stato !== 'RIFIUTATO' && (
                                  <DropdownMenuItem onClick={() => onReject(doc)}>
                                    <X className="w-4 h-4 mr-2" />
                                    Rifiuta
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {onDelete && (
                                  <DropdownMenuItem
                                    onClick={() => onDelete(doc)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={categoria.color}>{categoria.label}</Badge>

                        <Badge variant={stato.variant}>
                          <StatoIcon className="w-3 h-3 mr-1" />
                          {stato.label}
                        </Badge>

                        {doc.versione > 1 && (
                          <Badge variant="outline">v{doc.versione}</Badge>
                        )}

                        {doc.visibileCliente && (
                          <Badge variant="outline">Visibile Cliente</Badge>
                        )}

                        <span className="text-xs text-gray-500">{formatFileSize(doc.dimensione)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
