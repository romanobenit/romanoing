import {NextResponse} from 'next/server'
import {getClamAVStatus, testEICAR} from '@/lib/antivirus'

/**
 * GET /api/health/antivirus
 *
 * Health check endpoint per verificare status ClamAV
 *
 * @returns Status ClamAV (disponibile, versione, daemon attivo)
 *
 * @example
 * ```bash
 * curl http://localhost:3000/api/health/antivirus
 * ```
 *
 * Response:
 * ```json
 * {
 *   "available": true,
 *   "version": "ClamAV 1.0.0/27469/Wed Dec 27 10:00:00 2025",
 *   "daemonActive": true,
 *   "mode": "daemon",
 *   "eicarTest": true
 * }
 * ```
 */
export async function GET(request: Request) {
  try {
    // Get ClamAV status
    const status = await getClamAVStatus()

    // Run EICAR test (opzionale, solo se disponibile)
    let eicarTest: boolean | null = null
    if (status.available) {
      try {
        eicarTest = await testEICAR()
      } catch {
        eicarTest = null
      }
    }

    const response = {
      ...status,
      eicarTest,
      timestamp: new Date().toISOString(),
    }

    // Return 200 se disponibile, 503 se non disponibile
    const statusCode = status.available ? 200 : 503

    return NextResponse.json(response, {status: statusCode})
  } catch (error: any) {
    console.error('[Health Check] Antivirus check failed:', error.message)

    return NextResponse.json(
      {
        available: false,
        mode: 'unavailable' as const,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      {status: 503}
    )
  }
}
