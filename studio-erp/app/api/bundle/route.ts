import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/bundle
 * Restituisce tutti i bundle attivi della Fase 1 MVP
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const faseMvp = searchParams.get('fase') || '1'
    const target = searchParams.get('target')

    const where: any = {
      attivo: true,
      faseMvp: parseInt(faseMvp),
    }

    if (target) {
      where.target = target
    }

    const bundles = await prisma.bundle.findMany({
      where,
      orderBy: {
        prezzoMin: 'asc',
      },
      select: {
        id: true,
        codice: true,
        nome: true,
        descrizione: true,
        target: true,
        prezzoMin: true,
        prezzoMax: true,
        durataMesi: true,
        servizi: true,
        procedure: true,
        milestone: true,
        faseMvp: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: bundles,
      count: bundles.length,
    })
  } catch (error) {
    console.error('Errore API /api/bundle:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero dei bundle',
      },
      { status: 500 }
    )
  }
}
