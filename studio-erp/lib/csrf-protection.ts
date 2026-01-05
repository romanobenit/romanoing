import {NextRequest, NextResponse} from 'next/server'

/**
 * CSRF Protection Middleware
 * Verifica Origin/Referer headers per prevenire CSRF attacks
 */
export function verifyCsrfToken(request: NextRequest): Response | null {
  // Skip CSRF per GET, HEAD, OPTIONS (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return null
  }

  // Skip CSRF per API pubbliche specifiche (webhooks esterni)
  const publicPaths = ['/api/cliente/pagamenti/webhook']
  const pathname = new URL(request.url).pathname
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return null
  }

  // Ottieni allowed origins dalla configurazione
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
  ]

  // Check Origin header (preferito)
  const origin = request.headers.get('origin')
  if (origin) {
    if (!allowedOrigins.includes(origin)) {
      console.warn('[CSRF] Invalid origin:', origin)
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF validation failed: Invalid origin',
        },
        {status: 403}
      )
    }
    return null
  }

  // Fallback a Referer header
  const referer = request.headers.get('referer')
  if (referer) {
    const refererUrl = new URL(referer)
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`

    if (!allowedOrigins.includes(refererOrigin)) {
      console.warn('[CSRF] Invalid referer:', refererOrigin)
      return NextResponse.json(
        {
          success: false,
          error: 'CSRF validation failed: Invalid referer',
        },
        {status: 403}
      )
    }
    return null
  }

  // Nessun Origin o Referer header (possibile CSRF attack)
  // Permetti solo se la richiesta ha un session token valido
  // (verificato dal middleware auth)
  console.warn('[CSRF] Missing origin/referer headers')

  // Per richieste autenticate, consideriamo il session token sufficiente
  // Il middleware auth verificherà la sessione
  return null
}

/**
 * Aggiungi security headers alla response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // CSRF Token per client-side
  const csrfToken = crypto.randomUUID()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-CSRF-Token', csrfToken)

  // Strict-Transport-Security (solo in produzione con HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

/**
 * Helper per verificare che una richiesta provenga dallo stesso sito
 */
export function isSameSite(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
  ]

  if (origin && allowedOrigins.includes(origin)) {
    return true
  }

  if (referer) {
    const refererUrl = new URL(referer)
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
    if (allowedOrigins.includes(refererOrigin)) {
      return true
    }
  }

  return false
}
