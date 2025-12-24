'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfiloPage() {
  const [profilo, setProfilo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    telefono: '',
    indirizzo: '',
    citta: '',
    provincia: '',
    cap: '',
  })

  useEffect(() => {
    fetchProfilo()
  }, [])

  const fetchProfilo = async () => {
    try {
      const res = await fetch('/api/cliente/profilo')
      const data = await res.json()
      if (data.success) {
        setProfilo(data.data)
        setFormData({
          telefono: data.data.telefono || '',
          indirizzo: data.data.indirizzo || '',
          citta: data.data.citta || '',
          provincia: data.data.provincia || '',
          cap: data.data.cap || '',
        })
      }
    } catch (error) {
      console.error('Errore caricamento profilo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/cliente/profilo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
        await fetchProfilo()
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore durante l\'aggiornamento' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante l\'aggiornamento del profilo' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento profilo...</p>
        </div>
      </div>
    )
  }

  if (!profilo) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Errore</h2>
        <p className="text-gray-600">Impossibile caricare il profilo</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Il Mio Profilo</h1>
        <p className="mt-2 text-gray-600">
          Gestisci le tue informazioni personali e le preferenze
        </p>
      </div>

      {/* Messaggi */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Account (non modificabili) */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informazioni Account</CardTitle>
              <CardDescription>
                Dati non modificabili
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  Nome Completo
                </label>
                <p className="text-gray-900">{profilo.nome} {profilo.cognome}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900">{profilo.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Codice Cliente
                </label>
                <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                  {profilo.clienteCodice}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo Cliente
                </label>
                <p className="text-gray-900 capitalize">{profilo.clienteTipo}</p>
              </div>

              {profilo.clienteTipo !== 'privato' && profilo.ragioneSociale && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ragione Sociale
                  </label>
                  <p className="text-gray-900">{profilo.ragioneSociale}</p>
                </div>
              )}

              {profilo.codiceFiscale && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Codice Fiscale
                  </label>
                  <p className="font-mono text-sm">{profilo.codiceFiscale}</p>
                </div>
              )}

              {profilo.partitaIva && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Partita IVA
                  </label>
                  <p className="font-mono text-sm">{profilo.partitaIva}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dati Modificabili */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dati di Contatto</CardTitle>
              <CardDescription>
                Aggiorna i tuoi dati di contatto e indirizzo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Telefono
                  </label>
                  <Input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="Es. 333 1234567"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Indirizzo
                  </label>
                  <Input
                    type="text"
                    value={formData.indirizzo}
                    onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                    placeholder="Via, numero civico"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Città
                    </label>
                    <Input
                      type="text"
                      value={formData.citta}
                      onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                      placeholder="Es. Roma"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Provincia
                    </label>
                    <Input
                      type="text"
                      value={formData.provincia}
                      onChange={(e) => setFormData({ ...formData, provincia: e.target.value.toUpperCase() })}
                      placeholder="Es. RM"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      CAP
                    </label>
                    <Input
                      type="text"
                      value={formData.cap}
                      onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                      placeholder="Es. 00100"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salva Modifiche
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preferenze Notifiche */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preferenze Notifiche</CardTitle>
              <CardDescription>
                Gestisci le notifiche email (funzionalità disponibile in Sprint 1.4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 opacity-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Nuovi Documenti</p>
                    <p className="text-xs text-gray-500">Ricevi email quando viene caricato un nuovo documento</p>
                  </div>
                  <input type="checkbox" disabled checked={profilo.notificaNuovoDocumento ?? true} className="cursor-not-allowed" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Nuovi Messaggi</p>
                    <p className="text-xs text-gray-500">Ricevi email per nuovi messaggi</p>
                  </div>
                  <input type="checkbox" disabled checked={profilo.notificaMessaggio ?? true} className="cursor-not-allowed" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Richieste di Pagamento</p>
                    <p className="text-xs text-gray-500">Ricevi email per milestone da pagare</p>
                  </div>
                  <input type="checkbox" disabled checked={profilo.notificaRichiestaPagamento ?? true} className="cursor-not-allowed" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
