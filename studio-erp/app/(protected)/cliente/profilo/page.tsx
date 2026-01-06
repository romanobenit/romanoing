'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Key,
  Download,
  Eye
} from 'lucide-react'

interface UserProfile {
  nome: string
  cognome: string
  email: string
  telefono?: string
  codice_fiscale?: string
  indirizzo?: string
  citta?: string
  cap?: string
  created_at: string
  ultimo_accesso?: string
  cliente: {
    codice: string
    tipo: string
    ragione_sociale?: string
  }
}

export default function ClienteProfiloPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    codice_fiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.ruolo === 'COMMITTENTE') {
      fetchProfile()
    }
  }, [status, session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/cliente/profilo')
      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setFormData({
          nome: data.profile.nome,
          cognome: data.profile.cognome,
          telefono: data.profile.telefono || '',
          codice_fiscale: data.profile.codice_fiscale || '',
          indirizzo: data.profile.indirizzo || '',
          citta: data.profile.citta || '',
          cap: data.profile.cap || '',
        })
      } else {
        console.error('Error fetching profile:', data.error)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/cliente/profilo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...formData } : null)
        setEditing(false)
        setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error(data.error || 'Errore durante il salvataggio')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Errore durante il salvataggio' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Le password non coincidono' })
      return
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'La password deve essere di almeno 8 caratteri' })
      return
    }

    setChangingPassword(true)
    setMessage(null)

    try {
      const response = await fetch('/api/cliente/profilo/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
        setMessage({ type: 'success', text: 'Password cambiata con successo!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error(data.error || 'Errore durante il cambio password')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Errore durante il cambio password' })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/cliente/profilo/export')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dati-personali-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Errore durante l\'export')
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Errore durante l\'export dei dati' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
  const mockProfile: UserProfile = {
    nome: session.user.nome,
    cognome: session.user.cognome,
    email: session.user.email,
    telefono: '+39 333 1234567',
    created_at: '2025-01-01',
    cliente: {
      codice: 'CLI25001',
      tipo: 'PRIVATO'
    }
  }

  const profileData = profile || mockProfile

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Il Mio Profilo</h1>
        <p className="text-gray-600 mt-2">
          Gestisci i tuoi dati personali e le impostazioni dell'account
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dati Personali
                </CardTitle>
                {!editing ? (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Modifica
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          nome: profileData.nome,
                          cognome: profileData.cognome,
                          telefono: profileData.telefono || '',
                          codice_fiscale: profileData.codice_fiscale || '',
                          indirizzo: profileData.indirizzo || '',
                          citta: profileData.citta || '',
                          cap: profileData.cap || '',
                        })
                      }}
                    >
                      Annulla
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Salvataggio...' : 'Salva'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <Input
                    value={editing ? formData.nome : profileData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                  <Input
                    value={editing ? formData.cognome : profileData.cognome}
                    onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email non può essere modificata. Contatta il supporto se necessario.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                  <Input
                    value={editing ? formData.telefono : (profileData.telefono || '')}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    disabled={!editing}
                    placeholder="+39 333 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Codice Fiscale</label>
                  <Input
                    value={editing ? formData.codice_fiscale : (profileData.codice_fiscale || '')}
                    onChange={(e) => setFormData({...formData, codice_fiscale: e.target.value.toUpperCase()})}
                    disabled={!editing}
                    placeholder="RSSMRA80A01H501Z"
                    maxLength={16}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                <Input
                  value={editing ? formData.indirizzo : (profileData.indirizzo || '')}
                  onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
                  disabled={!editing}
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Città</label>
                  <Input
                    value={editing ? formData.citta : (profileData.citta || '')}
                    onChange={(e) => setFormData({...formData, citta: e.target.value})}
                    disabled={!editing}
                    placeholder="Milano"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CAP</label>
                  <Input
                    value={editing ? formData.cap : (profileData.cap || '')}
                    onChange={(e) => setFormData({...formData, cap: e.target.value})}
                    disabled={!editing}
                    placeholder="20100"
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Cambia Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Attuale</label>
                <Input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  placeholder="Inserisci password attuale"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nuova Password</label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    placeholder="Minimo 8 caratteri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conferma Password</label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    placeholder="Ripeti nuova password"
                  />
                </div>
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.current_password || !passwordData.new_password}
                className="w-full md:w-auto"
              >
                {changingPassword ? 'Cambiando...' : 'Cambia Password'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Info Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{profileData.email}</p>
                  <p className="text-xs text-gray-500">Email account</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{profileData.cliente.codice}</p>
                  <p className="text-xs text-gray-500">Codice cliente</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {profileData.cliente.tipo}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">
                    {new Date(profileData.created_at).toLocaleDateString('it-IT')}
                  </p>
                  <p className="text-xs text-gray-500">Registrato il</p>
                </div>
              </div>

              {profileData.ultimo_accesso && (
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(profileData.ultimo_accesso).toLocaleDateString('it-IT')}
                    </p>
                    <p className="text-xs text-gray-500">Ultimo accesso</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GDPR Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Privacy e Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🔒 I tuoi diritti GDPR</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Accesso ai tuoi dati</li>
                  <li>• Portabilità dei dati</li>
                  <li>• Rettifica dati inesatti</li>
                  <li>• Cancellazione dati</li>
                </ul>
              </div>

              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta i Miei Dati
              </Button>

              <div className="text-sm text-gray-600">
                <p>
                  Per richiedere la cancellazione dell'account o per altre richieste relative ai dati,
                  contatta <strong>privacy@studio-romano.it</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}