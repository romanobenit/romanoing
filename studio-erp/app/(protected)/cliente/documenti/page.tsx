'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download, 
  Calendar, 
  Eye,
  Filter,
  Search
} from 'lucide-react'

interface Documento {
  id: number
  nome_file: string
  categoria: string
  dimensione: number
  mime_type: string
  data_upload: string
  data_consegna?: string
  incarico_codice: string
  incarico_oggetto: string
}

export default function ClienteDocumentiPage() {
  const { data: session, status } = useSession()
  const [documenti, setDocumenti] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('tutti')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.ruolo === 'COMMITTENTE') {
      fetchDocumenti()
    }
  }, [status, session])

  const fetchDocumenti = async () => {
    try {
      const response = await fetch('/api/cliente/documenti')
      const data = await response.json()
      
      if (data.success) {
        setDocumenti(data.documenti)
      } else {
        console.error('Error fetching documenti:', data.error)
      }
    } catch (error) {
      console.error('Error fetching documenti:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (documentoId: number, nomeFile: string) => {
    try {
      const response = await fetch(`/api/cliente/documenti/${documentoId}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = nomeFile
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Error downloading document')
        alert('Errore durante il download del documento')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Errore durante il download del documento')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel')) return '📊'
    if (mimeType.includes('zip')) return '📦'
    return '📎'
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'progetto': return 'bg-blue-100 text-blue-800'
      case 'documenti': return 'bg-green-100 text-green-800'
      case 'relazioni': return 'bg-purple-100 text-purple-800'
      case 'pratiche': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.ruolo !== 'COMMITTENTE') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
        <p className="text-gray-600">Non sei autorizzato a visualizzare questa pagina.</p>
      </div>
    )
  }

  // Mock data se API non implementata
  const mockDocumenti: Documento[] = [
    {
      id: 1,
      nome_file: 'Relazione_Strutturale_v1.pdf',
      categoria: 'Relazioni',
      dimensione: 2048576,
      mime_type: 'application/pdf',
      data_upload: '2025-01-15',
      data_consegna: '2025-01-15',
      incarico_codice: 'INC25001',
      incarico_oggetto: 'Ristrutturazione Villa Rossi'
    },
    {
      id: 2,
      nome_file: 'Planimetrie_Piano_Terra.dwg',
      categoria: 'Progetto',
      dimensione: 1536000,
      mime_type: 'application/acad',
      data_upload: '2025-01-10',
      data_consegna: '2025-01-10',
      incarico_codice: 'INC25001',
      incarico_oggetto: 'Ristrutturazione Villa Rossi'
    }
  ]

  const documentiData = documenti.length > 0 ? documenti : mockDocumenti

  const filteredDocumenti = documentiData.filter(doc => {
    const matchesSearch = doc.nome_file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.incarico_codice.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'tutti') return matchesSearch
    return matchesSearch && doc.categoria.toLowerCase() === filter.toLowerCase()
  })

  const categorie = Array.from(new Set(documentiData.map(d => d.categoria)))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">I Miei Documenti</h1>
        <p className="text-gray-600 mt-2">
          Tutti i documenti consegnati per i tuoi incarichi
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cerca documenti o incarichi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="tutti">Tutte le categorie</option>
            {categorie.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totale Documenti</p>
                <p className="text-2xl font-bold">{documentiData.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dimensione Totale</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(documentiData.reduce((sum, doc) => sum + doc.dimensione, 0))}
                </p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ultimo Documento</p>
                <p className="text-lg font-semibold">
                  {documentiData.length > 0 ? 
                    new Date(Math.max(...documentiData.map(d => new Date(d.data_consegna || d.data_upload).getTime())))
                      .toLocaleDateString('it-IT') : 
                    'Nessuno'
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {filteredDocumenti.length > 0 ? (
        <div className="space-y-4">
          {filteredDocumenti.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-3xl">
                      {getFileIcon(documento.mime_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {documento.nome_file}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Incarico: <span className="font-medium">{documento.incarico_codice}</span> - {documento.incarico_oggetto}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(documento.dimensione)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {documento.data_consegna ? 
                            `Consegnato il ${new Date(documento.data_consegna).toLocaleDateString('it-IT')}` :
                            `Caricato il ${new Date(documento.data_upload).toLocaleDateString('it-IT')}`
                          }
                        </span>
                        <Badge className={getCategoriaColor(documento.categoria)}>
                          {documento.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/api/cliente/documenti/${documento.id}/preview`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Anteprima
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleDownload(documento.id, documento.nome_file)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Scarica
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nessun documento trovato' : 'Nessun documento disponibile'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 
                'Prova a modificare i termini di ricerca.' :
                'I documenti consegnati dal tecnico appariranno qui.'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilter('tutti')
                }}
              >
                Cancella Filtri
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}