'use client'

import {useState, useEffect} from 'react'
import {FileText, Upload, FolderOpen, Plus, X} from 'lucide-react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {DocumentList} from '@/components/document-list'
import {DocumentUpload} from '@/components/document-upload'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Documento} from '@/types/documento'

interface DocumentStats {
  totale: number
  caricatiDaMe: number
  categorie: number
  daApprovare: number
}

export default function DocumentiCollaboratorePage() {
  const [documenti, setDocumenti] = useState<Documento[]>([])
  const [stats, setStats] = useState<DocumentStats>({
    totale: 0,
    caricatiDaMe: 0,
    categorie: 0,
    daApprovare: 0,
  })
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedIncarico, setSelectedIncarico] = useState<any>(null)
  const [incarichi, setIncarichi] = useState<any[]>([])
  const [loadingIncarichi, setLoadingIncarichi] = useState(false)

  useEffect(() => {
    fetchDocumenti()
  }, [])

  useEffect(() => {
    if (uploadDialogOpen && incarichi.length === 0) {
      fetchIncarichi()
    }
  }, [uploadDialogOpen])

  const fetchIncarichi = async () => {
    try {
      setLoadingIncarichi(true)
      const res = await fetch('/api/collaboratore/incarichi')
      const data = await res.json()
      if (data.success) {
        setIncarichi(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento incarichi:', error)
    } finally {
      setLoadingIncarichi(false)
    }
  }

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

  const calculateStats = (docs: Documento[]) => {
    const categorie = new Set(docs.map((d) => d.categoria)).size
    const daApprovare = docs.filter((d) => d.stato === 'IN_REVISIONE').length

    setStats({
      totale: docs.length,
      caricatiDaMe: docs.length, // Tutti i documenti sono caricati da collaboratori
      categorie,
      daApprovare,
    })
  }

  const handleView = (doc: Documento) => {
    // Apri il documento nel browser per visualizzazione inline
    window.open(`/api/documenti/${doc.id}/download?disposition=inline`, '_blank')
  }

  const handleDownload = async (doc: Documento) => {
    try {
      // Scarica il file usando fetch per evitare blocco popup
      const response = await fetch(`/api/documenti/${doc.id}/download?disposition=attachment`)

      if (!response.ok) {
        throw new Error('Errore durante il download del file')
      }

      // Converti la response in blob
      const blob = await response.blob()

      // Crea un URL temporaneo per il blob
      const url = window.URL.createObjectURL(blob)

      // Crea un link temporaneo e simula il click
      const a = document.createElement('a')
      a.href = url
      a.download = doc.nomeFile
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore download:', error)
      alert('Impossibile scaricare il file. Riprova.')
    }
  }

  const handleApprove = async (doc: Documento) => {
    try {
      const res = await fetch(`/api/documenti/${doc.id}/approve`, { method: 'POST' })
      if (res.ok) {
        fetchDocumenti() // Ricarica lista
      }
    } catch (error) {
      console.error('Errore approvazione:', error)
    }
  }

  const handleReject = async (doc: Documento) => {
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

  const handleDelete = async (doc: Documento) => {
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

  const handleNewVersion = (doc: Documento) => {
    // TODO: Implementa caricamento nuova versione
    alert('Funzionalità in arrivo: caricamento nuova versione')
  }

  const handleViewHistory = (doc: Documento) => {
    // TODO: Implementa visualizzazione storico versioni
    alert('Funzionalità in arrivo: storico versioni')
  }

  const handleUploadComplete = () => {
    fetchDocumenti() // Ricarica lista documenti
    setSelectedIncarico(null) // Reset selezione
    setUploadDialogOpen(false) // Chiudi dialog
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
              Seleziona un incarico e poi trascina o seleziona i file da caricare.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selettore Incarico */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Incarico</label>
              {loadingIncarichi ? (
                <div className="text-sm text-gray-600">Caricamento incarichi...</div>
              ) : (
                <Select
                  value={selectedIncarico?.id?.toString()}
                  onValueChange={(value) => {
                    const incarico = incarichi.find((i) => i.id.toString() === value)
                    setSelectedIncarico(incarico)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un incarico" />
                  </SelectTrigger>
                  <SelectContent>
                    {incarichi.map((incarico) => (
                      <SelectItem key={incarico.id} value={incarico.id.toString()}>
                        {incarico.codice} - {incarico.oggetto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Componente Upload */}
            {selectedIncarico ? (
              <DocumentUpload
                incaricoId={selectedIncarico.id}
                incaricoCodice={selectedIncarico.codice}
                onUploadComplete={handleUploadComplete}
              />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Seleziona un incarico dal menu sopra per iniziare a caricare i documenti.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setSelectedIncarico(null)
                  setUploadDialogOpen(false)
                }}
                variant="outline"
              >
                Chiudi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
