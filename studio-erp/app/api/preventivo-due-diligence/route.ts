import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Configurazione SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@studio-romano.it';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Studio Ing. Romano';
const PREVENTIVI_EMAIL = process.env.PREVENTIVI_EMAIL || 'preventivi@studio-romano.it';

// Inizializza SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/**
 * Template email base HTML
 */
function getEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Studio Ing. Romano</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
    }
    .container {
      max-width: 650px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #475569 0%, #1e293b 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #475569;
    }
    .section h3 {
      margin: 0 0 15px 0;
      color: #475569;
      font-size: 18px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .data-row:last-child {
      border-bottom: none;
    }
    .data-label {
      font-weight: 600;
      color: #6b7280;
    }
    .data-value {
      color: #1f2937;
    }
    .preventivo-box {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
      text-align: center;
    }
    .preventivo-box h2 {
      margin: 0 0 10px 0;
      color: #1e293b;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .preventivo-box .amount {
      font-size: 42px;
      font-weight: 700;
      color: #475569;
      margin: 10px 0;
    }
    .preventivo-box .note {
      font-size: 14px;
      color: #64748b;
      margin-top: 10px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #475569;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .list-item {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .list-item:last-child {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #dbeafe;
      color: #1e40af;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
    }
    .badge-red {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .badge-green {
      background-color: #dcfce7;
      color: #166534;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏢 Preventivo Due Diligence</h1>
      <p>Studio Ingegneria Romano</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Studio Ingegneria Romano</strong></p>
      <p>Email: info@studio-romano.it | Tel: +39 081 1234567</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 15px;">
        Questo preventivo è valido 30 giorni dalla data di emissione
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

interface Preventivo {
  prezzoBase: number;
  livelloMultiplicatore: number;
  prezzoLivello: number;
  maggiorazioni: { descrizione: string; importo: number }[];
  totaleMaggiorazioni: number;
  riduzioni: { descrizione: string; importo: number }[];
  totaleRiduzioni: number;
  serviziAggiuntivi: { descrizione: string; importo: number }[];
  totaleServiziAggiuntivi: number;
  costoTrasferta: number;
  costoSopralluoghi: number;
  totale: number;
}

export async function POST(request: NextRequest) {
  try {
    const { data, preventivo }: { data: any; preventivo: Preventivo } = await request.json();

    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY non configurata');
      return NextResponse.json(
        { error: 'Servizio email non configurato' },
        { status: 500 }
      );
    }

    // Mappa tipologie operazione
    const tipoOperazioneLabels: Record<string, string> = {
      compravendita: 'Compravendita immobiliare singola',
      acquisizione: 'Acquisizione societaria (M&A)',
      cartolarizzazione: 'Cartolarizzazione portafoglio',
      finanziamento: 'Finanziamento bancario',
      investimento: 'Valutazione investimento (fondi immobiliari)',
      ristrutturazione: 'Ristrutturazione aziendale',
    };

    const urgenzaLabels: Record<string, string> = {
      standard: 'Standard (30-45 gg)',
      prioritaria: 'Prioritaria (15-20 gg)',
      fasttrack: 'Fast-track (7-10 gg)',
      emergency: 'Emergency (<7 gg)',
    };

    const tipologiaImmobileLabels: Record<string, string> = {
      residenziale: 'Residenziale',
      uffici: 'Uffici/Direzionale',
      commerciale: 'Commerciale/Retail',
      industriale: 'Industriale/Logistica',
      alberghiero: 'Alberghiero/Turistico',
      sanitario: 'Sanitario/RSA',
      mixeduse: 'Mixed-use',
    };

    const livelloLabels: Record<string, string> = {
      livello1: 'Livello 1 - Desktop DD',
      livello2: 'Livello 2 - Standard DD',
      livello3: 'Livello 3 - Enhanced DD',
    };

    // Genera contenuto email cliente
    const clientContent = `
      <div class="content">
        <p>Gentile <strong>${data.nomeCliente}</strong>,</p>
        <p>Grazie per aver utilizzato il nostro configuratore per la Due Diligence Tecnica Immobiliare.</p>
        <p>Di seguito il riepilogo della tua richiesta:</p>

        <div class="section">
          <h3>📋 Tipologia Operazione</h3>
          <div class="data-row">
            <span class="data-label">Tipo operazione</span>
            <span class="data-value">${tipoOperazioneLabels[data.tipoOperazione] || data.tipoOperazione}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Urgenza</span>
            <span class="data-value">${urgenzaLabels[data.urgenza] || data.urgenza}</span>
          </div>
        </div>

        <div class="section">
          <h3>🏢 Caratteristiche Asset</h3>
          <div class="data-row">
            <span class="data-label">Tipologia immobile</span>
            <span class="data-value">${tipologiaImmobileLabels[data.tipologiaImmobile] || data.tipologiaImmobile}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Superficie commerciale</span>
            <span class="data-value">${data.superficieCommerciale} mq</span>
          </div>
          <div class="data-row">
            <span class="data-label">Numero unità</span>
            <span class="data-value">${data.numeroUnita}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Ubicazione</span>
            <span class="data-value">${data.indirizzo ? data.indirizzo + ', ' : ''}${data.comune || ''} ${data.provincia ? '(' + data.provincia + ')' : ''}</span>
          </div>
        </div>

        <div class="section">
          <h3>🔍 Livello Approfondimento</h3>
          <div class="data-row">
            <span class="data-label">Livello DD</span>
            <span class="data-value">${livelloLabels[data.livelloApprofondimento] || data.livelloApprofondimento}</span>
          </div>
        </div>

        ${preventivo.maggiorazioni.length > 0 ? `
        <div class="section">
          <h3>⚠️ Maggiorazioni Applicate</h3>
          ${preventivo.maggiorazioni.map(m => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 14px;">${m.descrizione}</span>
                <span style="color: #dc2626; font-weight: 600;">+€${m.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${preventivo.riduzioni.length > 0 ? `
        <div class="section">
          <h3>✅ Riduzioni Applicate</h3>
          ${preventivo.riduzioni.map(r => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 14px;">${r.descrizione}</span>
                <span style="color: #16a34a; font-weight: 600;">-€${r.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${preventivo.serviziAggiuntivi.length > 0 ? `
        <div class="section">
          <h3>➕ Servizi Aggiuntivi</h3>
          ${preventivo.serviziAggiuntivi.map(s => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 14px;">${s.descrizione}</span>
                <span style="font-weight: 600;">+€${s.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="preventivo-box">
          <h2>Preventivo Totale</h2>
          <div class="amount">€${preventivo.totale.toLocaleString('it-IT')}</div>
          <div class="note">IVA esclusa (22%)</div>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Disclaimer:</strong> Il presente preventivo è indicativo e soggetto a verifica documentale preliminare.
            Eventuali criticità emerse potrebbero richiedere approfondimenti aggiuntivi quotati separatamente.
          </p>
        </div>

        <p>Un nostro tecnico ti contatterà a breve per discutere i dettagli dell'incarico.</p>
        <p>Per qualsiasi informazione, non esitare a contattarci.</p>
        <p style="margin-top: 30px;">
          Cordiali saluti,<br>
          <strong>Studio Ingegneria Romano</strong>
        </p>
      </div>
    `;

    // Genera contenuto email studio
    const studioContent = `
      <div class="content">
        <h2 style="color: #475569; margin-top: 0;">Nuova Richiesta Preventivo Due Diligence</h2>
        <p>Ricevuta richiesta di preventivo dal configuratore online.</p>

        <div class="section">
          <h3>👤 Dati Cliente</h3>
          <div class="data-row">
            <span class="data-label">Nome</span>
            <span class="data-value">${data.nomeCliente}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Email</span>
            <span class="data-value">${data.emailCliente}</span>
          </div>
          ${data.telefonoCliente ? `
          <div class="data-row">
            <span class="data-label">Telefono</span>
            <span class="data-value">${data.telefonoCliente}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <h3>📋 Dettagli Operazione</h3>
          <div class="data-row">
            <span class="data-label">Tipo operazione</span>
            <span class="data-value">${tipoOperazioneLabels[data.tipoOperazione] || data.tipoOperazione}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Urgenza</span>
            <span class="data-value">${urgenzaLabels[data.urgenza] || data.urgenza}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Tipologia immobile</span>
            <span class="data-value">${tipologiaImmobileLabels[data.tipologiaImmobile] || data.tipologiaImmobile}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Superficie</span>
            <span class="data-value">${data.superficieCommerciale} mq</span>
          </div>
          <div class="data-row">
            <span class="data-label">N° Unità</span>
            <span class="data-value">${data.numeroUnita}</span>
          </div>
          <div class="data-row">
            <span class="data-label">N° Edifici</span>
            <span class="data-value">${data.numeroEdifici}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Ubicazione</span>
            <span class="data-value">${data.indirizzo ? data.indirizzo + ', ' : ''}${data.comune || ''} ${data.provincia ? '(' + data.provincia + ')' : ''}</span>
          </div>
        </div>

        <div class="section">
          <h3>🔍 Livello Due Diligence</h3>
          <div class="data-row">
            <span class="data-label">Livello</span>
            <span class="data-value">${livelloLabels[data.livelloApprofondimento] || data.livelloApprofondimento}</span>
          </div>
        </div>

        <div class="section">
          <h3>✓ Aree di Verifica Richieste</h3>
          ${data.verificaAmministrativa ? '<div class="list-item">✓ Verifica Amministrativa (sempre inclusa)</div>' : ''}
          ${data.verificaUrbanistica ? '<div class="list-item">✓ Verifica Urbanistica/Edilizia</div>' : ''}
          ${data.verificaStrutturale ? '<div class="list-item">✓ Verifica Strutturale</div>' : ''}
          ${data.verificaImpiantistica ? '<div class="list-item">✓ Verifica Impiantistica</div>' : ''}
          ${data.verificaAmbientale ? '<div class="list-item">✓ Verifica Ambientale</div>' : ''}
          ${data.verificaEnergetica ? '<div class="list-item">✓ Verifica Energetica</div>' : ''}
          ${data.verificaContrattuale ? '<div class="list-item">✓ Verifica Contrattuale</div>' : ''}
        </div>

        ${preventivo.maggiorazioni.length > 0 ? `
        <div class="section">
          <h3>⚠️ Maggiorazioni (€${preventivo.totaleMaggiorazioni.toLocaleString('it-IT')})</h3>
          ${preventivo.maggiorazioni.map(m => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span>${m.descrizione}</span>
                <span style="color: #dc2626; font-weight: 600;">+€${m.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${preventivo.riduzioni.length > 0 ? `
        <div class="section">
          <h3>✅ Riduzioni (€${preventivo.totaleRiduzioni.toLocaleString('it-IT')})</h3>
          ${preventivo.riduzioni.map(r => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span>${r.descrizione}</span>
                <span style="color: #16a34a; font-weight: 600;">-€${r.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${preventivo.serviziAggiuntivi.length > 0 ? `
        <div class="section">
          <h3>➕ Servizi Aggiuntivi (€${preventivo.totaleServiziAggiuntivi.toLocaleString('it-IT')})</h3>
          ${preventivo.serviziAggiuntivi.map(s => `
            <div class="list-item">
              <div style="display: flex; justify-content: space-between;">
                <span>${s.descrizione}</span>
                <span style="font-weight: 600;">+€${s.importo.toLocaleString('it-IT')}</span>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${data.noteCliente ? `
        <div class="section">
          <h3>📝 Note Cliente</h3>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">${data.noteCliente}</p>
        </div>
        ` : ''}

        <div class="preventivo-box">
          <h2>Preventivo Totale</h2>
          <div class="amount">€${preventivo.totale.toLocaleString('it-IT')}</div>
          <div class="note">IVA esclusa (22%)</div>
          <div style="margin-top: 15px; font-size: 14px; color: #64748b;">
            <div>Prezzo base (${data.tipologiaImmobile}, ${data.superficieCommerciale} mq): €${preventivo.prezzoBase.toLocaleString('it-IT')}</div>
            <div>Livello DD (${preventivo.livelloMultiplicatore}x): €${preventivo.prezzoLivello.toLocaleString('it-IT')}</div>
            ${preventivo.costoTrasferta > 0 ? `<div>Trasferta: €${preventivo.costoTrasferta.toLocaleString('it-IT')}</div>` : ''}
            ${preventivo.costoSopralluoghi > 0 ? `<div>Sopralluoghi aggiuntivi: €${preventivo.costoSopralluoghi.toLocaleString('it-IT')}</div>` : ''}
          </div>
        </div>

        <p style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <strong>⏰ Azione richiesta:</strong> Contattare il cliente entro 24 ore per confermare disponibilità e dettagli tecnici.
        </p>
      </div>
    `;

    // Email al cliente
    const msgCliente = {
      to: data.emailCliente,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Preventivo Due Diligence - ${data.comune || 'Richiesta'}`,
      html: getEmailTemplate(clientContent),
    };

    // Email allo studio
    const msgStudio = {
      to: PREVENTIVI_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `[DD] Nuovo Preventivo - ${data.nomeCliente} - €${preventivo.totale.toLocaleString('it-IT')}`,
      html: getEmailTemplate(studioContent),
      replyTo: data.emailCliente,
    };

    // Invia entrambe le email
    await Promise.all([sgMail.send(msgCliente), sgMail.send(msgStudio)]);

    return NextResponse.json({
      success: true,
      message: 'Email inviate con successo',
    });
  } catch (error: any) {
    console.error('Errore invio email:', error);

    if (error.response) {
      console.error('SendGrid error:', error.response.body);
    }

    return NextResponse.json(
      {
        error: 'Errore nell\'invio delle email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
