import { NextRequest, NextResponse } from 'next/server';
import zonizzazioneSismica from '@/data/zonizzazione-sismica-completa.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';
  const comune = searchParams.get('comune');

  try {
    // Se è richiesto un comune specifico, restituisci i suoi dati completi
    if (comune) {
      const comuneData = zonizzazioneSismica.comuni.find(
        (c) => c.comune.toLowerCase() === comune.toLowerCase()
      );

      if (comuneData) {
        return NextResponse.json({
          success: true,
          data: comuneData,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Comune non trovato nel database',
        }, { status: 404 });
      }
    }

    // Altrimenti, restituisci tutti i comuni che matchano la query
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        comuni: [],
      });
    }

    const filtered = zonizzazioneSismica.comuni
      .filter((c) => c.comune.toLowerCase().includes(query))
      .slice(0, 50) // Limita a 50 risultati
      .map((c) => ({
        comune: c.comune,
        provincia: c.provincia,
        regione: c.regione,
        cap: c.cap,
      }));

    return NextResponse.json({
      success: true,
      comuni: filtered,
    });
  } catch (error) {
    console.error('Errore API comuni-sismica:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore durante la ricerca',
    }, { status: 500 });
  }
}
