import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { LogoutButton } from '@/components/logout-button'
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  User,
  FileText,
  Building2,
} from 'lucide-react'

export default async function CollaboratoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Verifica che l'utente sia autenticato e sia un collaboratore
  if (!session?.user) {
    redirect('/login')
  }

  const ruoliCollaboratori = ['TITOLARE', 'SENIOR', 'JUNIOR', 'ESTERNO']
  if (!ruoliCollaboratori.includes(session.user.ruolo)) {
    redirect('/cliente/dashboard')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/collaboratore/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Incarichi',
      href: '/collaboratore/incarichi',
      icon: FolderKanban,
    },
    {
      name: 'Timesheet',
      href: '/collaboratore/timesheet',
      icon: Clock,
    },
    {
      name: 'Documenti',
      href: '/collaboratore/documenti',
      icon: FileText,
    },
    {
      name: 'Profilo',
      href: '/collaboratore/profilo',
      icon: User,
    },
  ]

  // Badge ruolo con colori
  const ruoloBadgeColor = {
    TITOLARE: 'bg-purple-100 text-purple-800 border-purple-200',
    SENIOR: 'bg-blue-100 text-blue-800 border-blue-200',
    JUNIOR: 'bg-green-100 text-green-800 border-green-200',
    ESTERNO: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        {/* Logo e Nome Studio */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">Studio Romano</h1>
            <p className="text-xs text-gray-500">Area Collaboratori</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                ruoloBadgeColor[session.user.ruolo as keyof typeof ruoloBadgeColor]
              }`}
            >
              {session.user.ruolo}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
