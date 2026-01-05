import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'
import { query } from '@/lib/db'

async function getUserProfile(userId: string) {
  const sql = `
    SELECT
      u.id,
      u.email,
      u.nome,
      u.cognome,
      u.attivo,
      u.email_verified as "emailVerified",
      u."createdAt",
      r.codice as "ruoloCodice",
      r.nome as "ruoloNome",
      r.descrizione as "ruoloDescrizione",
      r.livello as "ruoloLivello"
    FROM utenti u
    JOIN ruoli r ON u.ruolo_id = r.id
    WHERE u.id = $1
    LIMIT 1
  `

  const result = await query(sql, [parseInt(userId)])
  return result.rows[0] || null
}

export default async function ProfiloCollaboratorePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const profile = await getUserProfile(session.user.id)

  if (!profile) {
    redirect('/collaboratore/dashboard')
  }

  const ruoloBadgeColor = {
    TITOLARE: 'bg-purple-100 text-purple-800 border-purple-200',
    SENIOR: 'bg-blue-100 text-blue-800 border-blue-200',
    JUNIOR: 'bg-green-100 text-green-800 border-green-200',
    ESTERNO: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profilo</h1>
        <p className="mt-2 text-gray-600">Gestisci le tue informazioni personali</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {profile.nome} {profile.cognome}
              </CardTitle>
              <CardDescription className="text-base mt-1">{profile.email}</CardDescription>
              <div className="mt-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${
                    ruoloBadgeColor[profile.ruoloCodice as keyof typeof ruoloBadgeColor]
                  }`}
                >
                  {profile.ruoloNome}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Informazioni Personali */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Personali</CardTitle>
          <CardDescription>I tuoi dati anagrafici e di contatto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Nome</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{profile.nome}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Cognome</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{profile.cognome}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 block mb-2">Email</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{profile.email}</p>
                {profile.emailVerified && (
                  <Badge variant="success" className="ml-auto">
                    Verificata
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline">Modifica Informazioni</Button>
          </div>
        </CardContent>
      </Card>

      {/* Ruolo e Permessi */}
      <Card>
        <CardHeader>
          <CardTitle>Ruolo e Permessi</CardTitle>
          <CardDescription>Il tuo livello di accesso nel sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-gray-900">{profile.ruoloNome}</h3>
            </div>
            <p className="text-sm text-gray-600">{profile.ruoloDescrizione}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Livello</p>
              <p className="text-gray-900">Livello {profile.ruoloLivello}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tipo</p>
              <p className="text-gray-900">Collaboratore Interno</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Permessi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Visualizza incarichi assegnati</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Upload documenti</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Registra ore (timesheet)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Visualizza documenti incarico</span>
              </div>
              {profile.ruoloCodice === 'TITOLARE' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">Visualizza tutti gli incarichi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">Gestione completa studio</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Membro dal</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Stato Account</span>
            <Badge variant={profile.attivo ? 'success' : 'destructive'}>
              {profile.attivo ? 'Attivo' : 'Disattivato'}
            </Badge>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Cambia Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
