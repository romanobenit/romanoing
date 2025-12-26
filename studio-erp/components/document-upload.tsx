'use client'

import { useState, useCallback } from 'react'
import { Upload, X, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface UploadFile {
  file: File
  id: string
  categoria: string
  descrizione: string
  visibileCliente: boolean
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface DocumentUploadProps {
  incaricoId: number
  incaricoCodice: string
  onUploadComplete?: () => void
}

const CATEGORIE_DOCUMENTO = [
  { value: 'elaborato', label: 'Elaborato Tecnico' },
  { value: 'relazione', label: 'Relazione' },
  { value: 'planimetria', label: 'Planimetria' },
  { value: 'computo', label: 'Computo Metrico' },
  { value: 'pratica', label: 'Pratica Edilizia' },
  { value: 'certificato', label: 'Certificato' },
  { value: 'fattura', label: 'Fattura' },
  { value: 'altro', label: 'Altro' },
]

export function DocumentUpload({ incaricoId, incaricoCodice, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }, [])

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      categoria: 'altro',
      descrizione: '',
      visibileCliente: false,
      status: 'pending',
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const uploadFile = async (uploadFile: UploadFile) => {
    updateFile(uploadFile.id, { status: 'uploading', progress: 0 })

    const formData = new FormData()
    formData.append('file', uploadFile.file)
    formData.append('incaricoId', incaricoId.toString())
    formData.append('categoria', uploadFile.categoria)
    formData.append('descrizione', uploadFile.descrizione)
    formData.append('visibileCliente', uploadFile.visibileCliente.toString())

    try {
      const response = await fetch('/api/documenti/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        updateFile(uploadFile.id, { status: 'success', progress: 100 })
      } else {
        const error = await response.json()
        updateFile(uploadFile.id, {
          status: 'error',
          error: error.error || 'Errore durante l\'upload',
        })
      }
    } catch (error) {
      updateFile(uploadFile.id, {
        status: 'error',
        error: 'Errore di connessione',
      })
    }
  }

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')

    for (const file of pendingFiles) {
      await uploadFile(file)
    }

    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const allUploaded = files.length > 0 && files.every((f) => f.status === 'success')
  const hasErrors = files.some((f) => f.status === 'error')
  const isUploading = files.some((f) => f.status === 'uploading')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carica Documenti - {incaricoCodice}</CardTitle>
        <CardDescription>
          Carica uno o più documenti. Trascina i file o clicca per selezionarli.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Trascina i file qui
          </p>
          <p className="text-sm text-gray-600 mb-4">
            oppure
          </p>
          <label>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.doc,.docx,.dwg,.xls,.xlsx,.jpg,.png"
            />
            <Button variant="outline" asChild>
              <span>Seleziona File</span>
            </Button>
          </label>
          <p className="text-xs text-gray-500 mt-4">
            Formati supportati: PDF, DOC, DWG, XLS, JPG, PNG (max 50MB)
          </p>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                File da caricare ({files.length})
              </h4>
              {files.length > 0 && !allUploaded && (
                <Button
                  onClick={uploadAll}
                  disabled={isUploading || files.filter((f) => f.status === 'pending').length === 0}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Carica Tutti
                    </>
                  )}
                </Button>
              )}
            </div>

            {files.map((uploadFile) => (
              <Card key={uploadFile.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="ml-2">
                        {uploadFile.status === 'success' && (
                          <Badge variant="success">
                            <Check className="w-3 h-3 mr-1" />
                            Caricato
                          </Badge>
                        )}
                        {uploadFile.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Errore
                          </Badge>
                        )}
                        {uploadFile.status === 'uploading' && (
                          <Badge>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            {uploadFile.progress}%
                          </Badge>
                        )}
                        {uploadFile.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    {uploadFile.status === 'pending' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Categoria
                          </label>
                          <Select
                            value={uploadFile.categoria}
                            onValueChange={(value) =>
                              updateFile(uploadFile.id, { categoria: value })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIE_DOCUMENTO.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={uploadFile.visibileCliente}
                              onChange={(e) =>
                                updateFile(uploadFile.id, {
                                  visibileCliente: e.target.checked,
                                })
                              }
                              className="rounded border-gray-300"
                            />
                            <span className="text-xs text-gray-700">
                              Visibile al cliente
                            </span>
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Descrizione (opzionale)
                          </label>
                          <Input
                            value={uploadFile.descrizione}
                            onChange={(e) =>
                              updateFile(uploadFile.id, {
                                descrizione: e.target.value,
                              })
                            }
                            placeholder="Breve descrizione del documento..."
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-600 mt-2">{uploadFile.error}</p>
                    )}

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Success Message */}
        {allUploaded && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Tutti i file sono stati caricati con successo!</p>
              <p className="text-sm text-green-700 mt-1">
                I documenti sono ora disponibili nell'incarico.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
