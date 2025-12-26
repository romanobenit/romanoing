'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, FolderOpen, Plus, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentList } from '@/components/document-list'
import { DocumentUpload } from '@/components/document-upload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DocumentStats {
  totale: number
  caricatiDaMe: number
  categorie: number
  daApprovare: number
}

export default function DocumentiCollaboratorePage() {
  const [documenti, setDocumenti] = useState<any[]>([])
  const [stats, setStats] = useState<DocumentStats>({
    totale: 0,
    caricatiDaMe: 0,
    categorie: 0,
    daApprovare: 0,
  })
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedIncarico, setSelectedIncarico] = useState<any>(null)

  useEffect(() => {
    fetchDocumenti()
  }, [])

  const fetchDocumenti = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/collaboratore/documenti')
      const data = await res.json()
      if (data.success) {
        setDocumenti(data.data || [])
        calculateStats(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento documenti:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (docs: any[]) => {
    const categorie = new Set(docs.map((d) => d.categoria)).size
    const daApprovare = docs.filter((d) => d.stato === 'IN_REVISIONE').length

    setStats({
      totale: docs.length,
      caricatiDaMe: docs.length, // Tutti i documenti sono caricati da collaboratori
      categorie,
      daApprovare,
    })
  }

  const handleView = (doc: any) => {
    // Apri in una nuova finestra o modale
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
  }

  const handleDownload = (doc: any) => {
    window.open(`/api/documenti/${doc.id}/download`, '_blank')
  }

  const handleApprove = async (doc: any) => {
    try {
      const res = await fetch(`/api/documenti/${doc.id}/approve`, { method: 'POST' })
      if (res.ok) {
        fetchDocumenti() // Ricarica lista
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
        fetchDocumenti() // Ricarica lista
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
        fetchDocumenti() // Ricarica lista
      }
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  const handleNewVersion = (doc: any) => {
    // TODO: Implementa caricamento nuova versione
    alert('Funzionalità in arrivo: caricamento nuova versione')
  }

  const handleViewHistory = (doc: any) => {
    // TODO: Implementa visualizzazione storico versioni
    alert('Funzionalità in arrivo: storico versioni')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documenti</h1>
          <p className="mt-2 text-gray-600">Gestisci i documenti degli incarichi</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Carica Documento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Documenti</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totale}</div>
            <p className="text-xs text-muted-foreground mt-1">Tutti gli incarichi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caricati da Te</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.caricatiDaMe}</div>
            <p className="text-xs text-muted-foreground mt-1">Totale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorie</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categorie}</div>
            <p className="text-xs text-muted-foreground mt-1">Tipi di documento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Da Approvare</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.daApprovare}</div>
            <p className="text-xs text-muted-foreground mt-1">In revisione</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento documenti...</p>
          </CardContent>
        </Card>
      ) : (
        <DocumentList
          documenti={documenti}
          userRole="COLLABORATORE"
          onView={handleView}
          onDownload={handleDownload}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          onNewVersion={handleNewVersion}
          onViewHistory={handleViewHistory}
        />
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carica Documenti</DialogTitle>
            <DialogDescription>
              Seleziona o trascina i file da caricare. Puoi caricare più file contemporaneamente.
            </DialogDescription>
          </DialogHeader>

          {/* TODO: Add incarico selector */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              Seleziona un incarico dalla lista documenti per caricare i file.
              Per ora, visita la pagina di dettaglio di un incarico per caricare documenti.
            </p>
          </div>

          <Button onClick={() => setUploadDialogOpen(false)} variant="outline">
            Chiudi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
