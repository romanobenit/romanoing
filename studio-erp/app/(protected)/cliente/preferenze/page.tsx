'use client'

import {useState, useEffect} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Switch} from '@/components/ui/switch'
import {Separator} from '@/components/ui/separator'
import {Bell, Mail, FileText, MessageSquare, CreditCard, AlertCircle, Check} from 'lucide-react'
import {Alert, AlertDescription} from '@/components/ui/alert'

interface Preferenze {
  id: number
  utenteId: number
  emailAttivo: boolean
  notificaNuovoDocumento: boolean
  notificaMessaggio: boolean
  notificaRichiestaPagamento: boolean
  notificaStatoIncarico: boolean
  notificaRichiestaDocumento: boolean
}

export default function PreferenzePage() {
  const [preferenze, setPreferenze] = useState<Preferenze | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null)

  // Fetch preferences on mount
  useEffect(() => {
    fetchPreferenze()
  }, [])

  const fetchPreferenze = async () => {
    try {
      const response = await fetch('/api/cliente/preferenze')
      const data = await response.json()

      if (data.success) {
        setPreferenze(data.data)
      } else {
        setMessage({type: 'error', text: 'Errore nel caricamento delle preferenze'})
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      setMessage({type: 'error', text: 'Errore di connessione'})
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preferenze) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/cliente/preferenze', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          emailAttivo: preferenze.emailAttivo,
          notificaNuovoDocumento: preferenze.notificaNuovoDocumento,
          notificaMessaggio: preferenze.notificaMessaggio,
          notificaRichiestaPagamento: preferenze.notificaRichiestaPagamento,
          notificaStatoIncarico: preferenze.notificaStatoIncarico,
          notificaRichiestaDocumento: preferenze.notificaRichiestaDocumento,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({type: 'success', text: 'Preferenze salvate con successo'})
        setPreferenze(data.data)
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({type: 'error', text: data.error || 'Errore nel salvataggio'})
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setMessage({type: 'error', text: 'Errore di connessione'})
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof Preferenze, value: boolean) => {
    if (!preferenze) return
    setPreferenze({...preferenze, [key]: value})
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento preferenze...</p>
        </div>
      </div>
    )
  }

  if (!preferenze) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossibile caricare le preferenze. Riprova più tardi.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferenze Notifiche</h1>
        <p className="text-gray-600">
          Gestisci come e quando vuoi ricevere le notifiche via email
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className="mb-6">
          {message.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Notifiche Email</CardTitle>
          </div>
          <CardDescription>
            Scegli quali notifiche ricevere via email. Puoi disattivare tutte le notifiche o
            selezionare solo quelle che ti interessano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-700" />
              <div>
                <Label htmlFor="email-attivo" className="text-base font-semibold cursor-pointer">
                  Email Attive
                </Label>
                <p className="text-sm text-gray-600">
                  Abilita o disabilita tutte le notifiche email
                </p>
              </div>
            </div>
            <Switch
              id="email-attivo"
              checked={preferenze.emailAttivo}
              onCheckedChange={(checked) => updatePreference('emailAttivo', checked)}
            />
          </div>

          <Separator />

          {/* Individual Notification Types */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Tipi di Notifica</h3>

            {/* Nuovo Documento */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <Label
                    htmlFor="notifica-documento"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Nuovo Documento Disponibile
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ricevi una notifica quando un nuovo documento è pronto per il download
                  </p>
                </div>
              </div>
              <Switch
                id="notifica-documento"
                checked={preferenze.notificaNuovoDocumento}
                onCheckedChange={(checked) => updatePreference('notificaNuovoDocumento', checked)}
                disabled={!preferenze.emailAttivo}
              />
            </div>

            {/* Nuovo Messaggio */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <Label
                    htmlFor="notifica-messaggio"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Nuovo Messaggio
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ricevi una notifica quando il tecnico ti invia un messaggio
                  </p>
                </div>
              </div>
              <Switch
                id="notifica-messaggio"
                checked={preferenze.notificaMessaggio}
                onCheckedChange={(checked) => updatePreference('notificaMessaggio', checked)}
                disabled={!preferenze.emailAttivo}
              />
            </div>

            {/* Richiesta Pagamento */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <Label
                    htmlFor="notifica-pagamento"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Richiesta Pagamento Milestone
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ricevi una notifica quando è richiesto il pagamento di una milestone
                  </p>
                </div>
              </div>
              <Switch
                id="notifica-pagamento"
                checked={preferenze.notificaRichiestaPagamento}
                onCheckedChange={(checked) =>
                  updatePreference('notificaRichiestaPagamento', checked)
                }
                disabled={!preferenze.emailAttivo}
              />
            </div>

            {/* Cambio Stato Incarico */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <Label
                    htmlFor="notifica-stato"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Cambio Stato Incarico
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ricevi una notifica quando lo stato del tuo incarico cambia
                  </p>
                </div>
              </div>
              <Switch
                id="notifica-stato"
                checked={preferenze.notificaStatoIncarico}
                onCheckedChange={(checked) => updatePreference('notificaStatoIncarico', checked)}
                disabled={!preferenze.emailAttivo}
              />
            </div>

            {/* Richiesta Documento */}
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <Label
                    htmlFor="notifica-richiesta"
                    className="cursor-pointer font-medium text-gray-900"
                  >
                    Richiesta Documento da Caricare
                  </Label>
                  <p className="text-sm text-gray-600">
                    Ricevi una notifica quando il tecnico richiede un documento
                  </p>
                </div>
              </div>
              <Switch
                id="notifica-richiesta"
                checked={preferenze.notificaRichiestaDocumento}
                onCheckedChange={(checked) =>
                  updatePreference('notificaRichiestaDocumento', checked)
                }
                disabled={!preferenze.emailAttivo}
              />
            </div>
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={fetchPreferenze} disabled={saving}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvataggio...
                </>
              ) : (
                'Salva Preferenze'
              )}
            </Button>
          </div>

          {/* GDPR Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium mb-1">ℹ️ Informativa Privacy</p>
            <p className="text-gray-600">
              Le tue preferenze sono salvate in modo sicuro e puoi modificarle in qualsiasi
              momento. Rispettiamo la tua privacy e invieremo email solo secondo le tue
              preferenze. Per maggiori informazioni, consulta la nostra{' '}
              <a href="/privacy" className="text-blue-600 underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
