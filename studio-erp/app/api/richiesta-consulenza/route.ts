import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefono, servizio, messaggio } = body;

    console.log('Richiesta Consulenza ricevuta:', {
      nome,
      email,
      telefono,
      servizio,
      messaggio,
      timestamp: new Date().toISOString()
    });

    // TODO: Integrare invio email effettivo (Resend, SendGrid, etc.)
    // Per ora simuliamo l'invio con un delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log per verifica
    console.log(`✅ Email consulenza inviata a: ${email}`);
    console.log(`📋 Servizio richiesto: ${servizio || 'Non specificato'}`);

    return NextResponse.json({
      success: true,
      message: 'Richiesta di consulenza inviata con successo'
    });

  } catch (error) {
    console.error('Errore nell\'invio richiesta consulenza:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante l\'invio della richiesta'
      },
      { status: 500 }
    );
  }
}
