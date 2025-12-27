import {Ratelimit} from '@upstash/ratelimit'
import {Redis} from '@upstash/redis'

// Configurazione Redis - usa env vars o fallback in-memory per development
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// In-memory cache per development (se Redis non configurato)
class InMemoryCache extends Map {
  private ttls = new Map<string, number>()

  set(key: string, value: unknown, ttl?: number) {
    super.set(key, value)
    if (ttl) {
      this.ttls.set(key, Date.now() + ttl)
      setTimeout(() => {
        this.delete(key)
        this.ttls.delete(key)
      }, ttl)
    }
    return this
  }

  get(key: string) {
    const ttl = this.ttls.get(key)
    if (ttl && Date.now() > ttl) {
      this.delete(key)
      this.ttls.delete(key)
      return undefined
    }
    return super.get(key)
  }
}

const inMemoryCache = new InMemoryCache()

// Helper per in-memory rate limiting (development fallback)
const inMemoryRateLimit = (identifier: string, limit: number, window: number) => {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowMs = window * 1000

  const record = (inMemoryCache.get(key) as {count: number; resetTime: number}) || {
    count: 0,
    resetTime: now + windowMs,
  }

  if (now > record.resetTime) {
    record.count = 1
    record.resetTime = now + windowMs
  } else {
    record.count++
  }

  inMemoryCache.set(key, record, windowMs)

  return {
    success: record.count <= limit,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: new Date(record.resetTime),
  }
}

/**
 * Rate limiter per autenticazione (login/signup)
 * 5 tentativi per minuto per IP
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : {
      limit: async (identifier: string) => inMemoryRateLimit(identifier, 5, 60),
    }

/**
 * Rate limiter per API pubbliche
 * 100 richieste per minuto per IP
 */
export const publicApiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:public',
    })
  : {
      limit: async (identifier: string) => inMemoryRateLimit(identifier, 100, 60),
    }

/**
 * Rate limiter per API autenticate
 * 1000 richieste per minuto per utente
 */
export const authenticatedApiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 m'),
      analytics: true,
      prefix: 'ratelimit:authenticated',
    })
  : {
      limit: async (identifier: string) => inMemoryRateLimit(identifier, 1000, 60),
    }

/**
 * Rate limiter per upload documenti
 * 20 upload per ora per utente
 */
export const uploadRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'ratelimit:upload',
    })
  : {
      limit: async (identifier: string) => inMemoryRateLimit(identifier, 20, 3600),
    }

/**
 * Helper per ottenere l'identificatore dalla richiesta
 * Usa IP o user ID se autenticato
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Ottieni IP da headers (compatibile con proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'

  return `ip:${ip}`
}

/**
 * Applica rate limiting e restituisce response se superato il limite
 */
export async function applyRateLimit(
  rateLimit: typeof authRateLimit,
  identifier: string
): Promise<Response | null> {
  const {success, limit, remaining, reset} = await rateLimit.limit(identifier)

  if (!success) {
    const resetDate = reset instanceof Date ? reset : new Date(reset)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Troppi tentativi. Riprova più tardi.',
        retryAfter: resetDate.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetDate.toISOString(),
          'Retry-After': Math.ceil((resetDate.getTime() - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null
}

/**
 * Aggiungi headers rate limit alla response
 */
export function addRateLimitHeaders(
  response: Response,
  result: {limit: number; remaining: number; reset: Date}
): Response {
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-RateLimit-Limit', result.limit.toString())
  newHeaders.set('X-RateLimit-Remaining', result.remaining.toString())
  newHeaders.set('X-RateLimit-Reset', result.reset.toISOString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}
