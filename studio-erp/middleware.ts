import { auth } from '@/lib/auth'

export default auth((req) => {
  // Middleware per autenticazione e protezione route
  // La logica di authorized() in auth.config.ts gestisce l'accesso
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
