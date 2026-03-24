import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

/**
 * GET /api/health
 * Health check endpoint per PM2 e load balancer.
 * Verifica DB connectivity. Ritorna 200 se tutto ok, 503 se degradato.
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // Check database
  try {
    const pool = getPool()
    await pool.query('SELECT 1')
    checks.database = 'ok'
  } catch {
    checks.database = 'error'
  }

  const allOk = Object.values(checks).every((v) => v === 'ok')

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  )
}
