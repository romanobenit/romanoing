'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, User, FileText, CreditCard, MessageSquare, Settings, Home } from 'lucide-react'

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/cliente/dashboard',
      icon: Home,
    },
    {
      name: 'I miei Incarichi',
      href: '/cliente/incarichi',
      icon: FileText,
    },
    {
      name: 'Documenti',
      href: '/cliente/documenti',
      icon: FileText,
    },
    {
      name: 'Pagamenti',
      href: '/cliente/pagamenti',
      icon: CreditCard,
    },
    {
      name: 'Messaggi',
      href: '/cliente/messaggi',
      icon: MessageSquare,
    },
    {
      name: 'Profilo',
      href: '/cliente/profilo',
      icon: User,
    },
    {
      name: 'Preferenze',
      href: '/cliente/preferenze',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-8 border-b">
            <Link href="/cliente/dashboard" className="text-xl font-bold text-gray-900">
              Studio Ing. Romano
            </Link>
            <p className="text-sm text-gray-600 mt-1">Area Cliente</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info & Logout */}
          <div className="px-6 py-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.nome} {session?.user?.cognome}
                </p>
                <p className="text-xs text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Esci
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main>{children}</main>
      </div>
    </div>
  )
}