import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, FileText, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.ruolo !== 'COMMITTENTE') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/cliente/dashboard" className="text-xl font-bold text-primary">
                Studio Ing. Romano
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/cliente/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/cliente/incarichi"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  I Miei Incarichi
                </Link>
                <Link
                  href="/cliente/profilo"
                  className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profilo
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {session.user.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-2" />
                  Esci
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Studio di Ingegneria Ing. Domenico Romano. Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  )
}
