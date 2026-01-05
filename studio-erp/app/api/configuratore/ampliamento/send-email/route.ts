import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, preventivo, files } = body;

    // TODO: Implementare invio email effettivo con allegati
    // Per ora simula successo e logga info
    console.log('Richiesta preventivo ampliamento:', {
      cliente: data.nomeCliente,
      email: data.emailCliente,
      dimensione: data.dimensione,
      tipoAmpliamento: data.tipoAmpliamento,
      vincoli: {
        centroStorico: data.centroStorico,
        vincoloPaesaggistico: data.vincoloPaesaggistico,
        vincoloIdrogeologico: data.vincoloIdrogeologico
      },
      serviziAggiuntivi: data.serviziAggiuntivi,
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
    console.error('Errore invio email configuratore ampliamento:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'invio' },
      { status: 500 }
    );
  }
}
