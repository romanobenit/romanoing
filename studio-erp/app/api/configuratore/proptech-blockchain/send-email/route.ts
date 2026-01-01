import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, preventivo, files } = body;

    // TODO: Implement actual email sending with attachments
    console.log('Richiesta preventivo PropTech/Blockchain:', {
      cliente: data.nomeCliente,
      email: data.emailCliente,
      telefono: data.telefonoCliente,
      azienda: data.azienda,
      servizi: {
        fattibilita: data.servizioFattibilita,
        poc: data.servizioPoc,
        architettura: data.servizioArchitettura
      },
      opzionePoc: data.opzionePoc,
      progetto: {
        tipologiaAsset: data.tipologiaAsset,
        valoreStimatoAsset: data.valoreStimatoAsset,
        obiettiviProgetto: data.obiettiviProgetto,
        tempisticheDesiderate: data.tempisticheDesiderate,
        requirementsAggiuntivi: data.requirementsAggiuntivi
      },
      preventivo: {
        totaleMin: preventivo?.totaleMin,
        totaleMax: preventivo?.totaleMax,
        scontoPercentuale: preventivo?.scontoPercentuale,
        serviziInclusi: preventivo?.serviziInclusi
      },
      fileAllegati: files?.length || 0,
      files: files?.map((f: any) => `${f.name} (${(f.size / 1024).toFixed(2)} KB)`),
      noteAggiuntive: data.noteAggiuntive
    });

    // Simulazione invio email
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo'
    });
  } catch (error) {
    console.error('Errore invio email configuratore PropTech/Blockchain:', error);
    return NextResponse.json(
      { success: false, error: 'Errore durante l\'invio' },
      { status: 500 }
    );
  }
}
