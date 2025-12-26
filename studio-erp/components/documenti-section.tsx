'use client'

import { useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentUpload } from '@/components/document-upload'
import { DocumentList } from '@/components/document-list'

interface DocumentiSectionProps {
  incaricoId: number
  incaricoCodice: string
  documenti: any[]
  onRefresh?: () => void
}

export function DocumentiSection({
  incaricoId,
  incaricoCodice,
  documenti: initialDocumenti,
  onRefresh,
}: DocumentiSectionProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [documenti, setDocumenti] = useState(initialDocumenti)

  const handleUploadComplete = async () => {
    // Refresh documenti list
    const res = await fetch(`/api/collaboratore/documenti?incaricoId=${incaricoId}`)
    const data = await res.json()
    if (data.success) {
      setDocumenti(data.data || [])
      setShowUpload(false)
      onRefresh?.()
    }
  }

  const handleView = (doc: any) => {
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
  }

  const handleDownload = (doc: any) => {
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
  }

  const handleApprove = async (doc: any) => {
    try {
      const res = await fetch(`/api/documenti/${doc.id}/approve`, { method: 'POST' })
      if (res.ok) {
        handleUploadComplete() // Reload list
      }
    } catch (error) {
      console.error('Errore approvazione:', error)
    }
  }

  const handleReject = async (doc: any) => {
    const motivo = prompt('Motivo del rifiuto:')
    if (!motivo) return

    try {
      const res = await fetch(`/api/documenti/${doc.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      })
      if (res.ok) {
        handleUploadComplete() // Reload list
      }
    } catch (error) {
      console.error('Errore rifiuto:', error)
    }
  }

  const handleDelete = async (doc: any) => {
    if (!confirm(`Sei sicuro di voler eliminare "${doc.nomeFile}"?`)) return

    try {
      const res = await fetch(`/api/documenti/${doc.id}`, { method: 'DELETE' })
      if (res.ok) {
        handleUploadComplete() // Reload list
      }
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  return (
    <div className="space-y-6">
      {showUpload ? (
        <div>
          <DocumentUpload
            incaricoId={incaricoId}
            incaricoCodice={incaricoCodice}
            onUploadComplete={handleUploadComplete}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documenti</CardTitle>
                <CardDescription>File caricati per questo incarico</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Carica
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {documenti.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">Nessun documento caricato</p>
                <Button onClick={() => setShowUpload(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Carica Primo Documento
                </Button>
              </div>
            ) : (
              <DocumentList
                documenti={documenti}
                userRole="COLLABORATORE"
                onView={handleView}
                onDownload={handleDownload}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
