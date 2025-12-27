import {NextRequest} from 'next/server'
import {handlers} from '@/lib/auth'
import {authRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(authRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  return handlers.GET(request)
}

export async function POST(request: NextRequest) {
  const identifier = getIdentifier(request)
  const rateLimitResponse = await applyRateLimit(authRateLimit, identifier)
  if (rateLimitResponse) return rateLimitResponse

  return handlers.POST(request)
}
