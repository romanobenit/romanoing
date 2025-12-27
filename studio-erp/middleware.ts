import {auth} from '@/lib/auth'
import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import {verifyCsrfToken, addSecurityHeaders} from '@/lib/csrf-protection'

export default auth((req) => {
  const request = req as NextRequest

  // CSRF Protection per API routes (POST, PUT, DELETE, PATCH)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfError = verifyCsrfToken(request)
    if (csrfError) {
      return csrfError
    }
  }

  // Middleware per autenticazione e protezione route
  // La logica di authorized() in auth.config.ts gestisce l'accesso

  // Aggiungi security headers a tutte le response
  const response = NextResponse.next()
  return addSecurityHeaders(response)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

// Use Node.js runtime instead of Edge Runtime to support database queries
export const runtime = 'nodejs'
