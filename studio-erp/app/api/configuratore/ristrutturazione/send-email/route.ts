import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, preventivo, files } = body;

    // TODO: Implementare invio email effettivo con allegati
    // Per ora simula successo e logga info
    console.log('Richiesta preventivo ristrutturazione:', {
      cliente: data.nomeCliente,
      email: data.emailCliente,
      dimensione: data.dimensione,
      tipoIntervento: data.tipoIntervento,
      totale: preventivo?.totale,
      fileAllegati: files?.length || 0,
      files: files?.map((f: any) => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`)
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
