import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/bundle/[codice]
 * Restituisce un bundle specifico per codice
 */
export async function GET(
  request: Request,
  { params }: { params: { codice: string } }
) {
  try {
    const bundle = await prisma.bundle.findUnique({
      where: {
        codice: params.codice,
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

    if (!bundle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bundle non trovato',
        },
        { status: 404 }
      )
    }

    if (!bundle.attivo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bundle non disponibile',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: bundle,
    })
  } catch (error) {
    console.error('Errore API /api/bundle/[codice]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Errore nel recupero del bundle',
      },
      { status: 500 }
    )
  }
}
