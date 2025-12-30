import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, preventivo } = body;

    // TODO: Implementare invio email effettivo
    // Per ora simula successo
    console.log('Richiesta preventivo ristrutturazione:', {
      cliente: data.nomeCliente,
      email: data.emailCliente,
      dimensione: data.dimensione,
      tipoIntervento: data.tipoIntervento,
      totale: preventivo?.totale
    });

    // Simula delay invio
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo'
    });
  } catch (error) {
    console.error('Errore invio email configuratore ristrutturazione:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'invio' },
      { status: 500 }
    );
  }
}
