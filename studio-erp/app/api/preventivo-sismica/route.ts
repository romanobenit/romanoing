import {NextRequest, NextResponse} from 'next/server'
import sgMail from '@sendgrid/mail'

// Configurazione SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@studio-romano.it'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Studio Ing. Romano'
const PREVENTIVI_EMAIL = process.env.PREVENTIVI_EMAIL || 'preventivi@studio-romano.it'

// Inizializza SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
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
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
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
      border-left: 4px solid #2563eb;
    }
    .section h3 {
      margin: 0 0 15px 0;
      color: #2563eb;
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
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
      text-align: center;
    }
    .preventivo-box h2 {
      margin: 0 0 10px 0;
      color: #1e40af;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .preventivo-amount {
      font-size: 42px;
      font-weight: 700;
      color: #2563eb;
      margin: 10px 0;
    }
    .preventivo-detail {
      font-size: 14px;
      color: #1e40af;
      margin-top: 15px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 15px 0;
    }
    ul li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    ul li:before {
      content: "•";
      color: #2563eb;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin: 2px;
    }
    .alert-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Studio Ing. Romano</h1>
      <p>Vulnerabilità Sismica & NTC 2018</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Studio Ing. Romano</strong></p>
      <p>Ingegneria Strutturale e Sismica</p>
      <p style="margin-top: 15px; color: #9ca3af; font-size: 12px;">
        Questa è una richiesta di preventivo automatica generata dal configuratore online
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {configurazione, preventivo, cliente} = body

    // Validazione dati
    if (!configurazione || !preventivo || !cliente) {
      return NextResponse.json({error: 'Dati incompleti'}, {status: 400})
    }

    if (!cliente.email || !cliente.nome || !cliente.cognome) {
      return NextResponse.json({error: 'Dati cliente incompleti'}, {status: 400})
    }

    // Verifica SendGrid
    if (!SENDGRID_API_KEY) {
      console.error('[Preventivo Sismica] SendGrid non configurato')
      return NextResponse.json({error: 'Servizio email non disponibile'}, {status: 500})
    }

    // Labels per le scelte
    const tipologieStrutturali: Record<string, string> = {
      muratura: 'Muratura portante',
      ca_telaio: 'Cemento armato (telaio)',
      ca_pareti: 'Cemento armato (pareti/setti)',
      acciaio: 'Acciaio',
      legno: 'Legno',
      mista: 'Mista',
    }

    const periodiCostruzione: Record<string, string> = {
      pre1971: 'Prima del 1971 (pre-normativa)',
      '1971-1984': '1972-1984 (L. 64/74)',
      '1984-1996': '1984-1996 (DM 84)',
      '1996-2003': '1996-2003 (DM 96)',
      '2003-2008': '2003-2008 (OPCM 3274)',
      '2008-2018': '2008-2018 (NTC 2008)',
      post2018: 'Dopo 2018 (NTC 2018)',
    }

    const destinazioniUso: Record<string, string> = {
      classe1: 'Classe I - Edifici agricoli, depositi',
      classe2: 'Classe II - Residenziale, commerciale, uffici',
      classe3: 'Classe III - Scuole, ospedali, musei',
      classe4: 'Classe IV - Edifici strategici',
    }

    const statiConservazione: Record<string, string> = {
      ottimo: 'Ottimo',
      buono: 'Buono',
      discreto: 'Discreto',
      mediocre: 'Mediocre',
      pessimo: 'Pessimo',
    }

    // Formatta email allo studio
    const emailStudioContent = `
      <div class="content">
        <h2>Nuova Richiesta Preventivo Vulnerabilità Sismica</h2>

        <p>È stata ricevuta una nuova richiesta di preventivo dal configuratore Vulnerabilità Sismica.</p>

        <!-- Dati Cliente -->
        <div class="section">
          <h3>👤 Dati Cliente</h3>
          <div class="data-row">
            <span class="data-label">Nome:</span>
            <span class="data-value">${cliente.nome} ${cliente.cognome}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Email:</span>
            <span class="data-value">${cliente.email}</span>
          </div>
          ${
            cliente.telefono
              ? `<div class="data-row">
            <span class="data-label">Telefono:</span>
            <span class="data-value">${cliente.telefono}</span>
          </div>`
              : ''
          }
          ${
            cliente.note
              ? `<div class="data-row">
            <span class="data-label">Note:</span>
            <span class="data-value">${cliente.note}</span>
          </div>`
              : ''
          }
        </div>

        <!-- Preventivo -->
        <div class="preventivo-box">
          <h2>Preventivo Totale</h2>
          <div class="preventivo-amount">${preventivo.totaleGenerale.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
          })}</div>
          <div class="preventivo-detail">
            <p style="margin: 5px 0;"><strong>Servizio Principale:</strong> ${preventivo.servizioBase.toLocaleString('it-IT', {
              style: 'currency',
              currency: 'EUR',
            })}</p>
            ${
              preventivo.totaleServiziAggiuntivi > 0
                ? `<p style="margin: 5px 0;"><strong>Servizi Aggiuntivi:</strong> ${preventivo.totaleServiziAggiuntivi.toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })}</p>`
                : ''
            }
            ${
              preventivo.urgenza > 0
                ? `<p style="margin: 5px 0;"><strong>Maggiorazione Urgenza:</strong> +${preventivo.urgenza.toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })}</p>`
                : ''
            }
            <p style="margin: 5px 0;"><strong>Costo Trasferta:</strong> ${preventivo.trasferta.toLocaleString('it-IT', {
              style: 'currency',
              currency: 'EUR',
            })}</p>
          </div>
        </div>

        <!-- Localizzazione -->
        <div class="section">
          <h3>📍 Localizzazione</h3>
          <div class="data-row">
            <span class="data-label">Indirizzo:</span>
            <span class="data-value">${configurazione.indirizzo || 'Non specificato'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Comune:</span>
            <span class="data-value">${configurazione.cap} ${configurazione.comune} (${configurazione.provincia})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Regione:</span>
            <span class="data-value">${configurazione.regione}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Zona Sismica:</span>
            <span class="data-value"><strong>Zona ${configurazione.zonaSismica}</strong></span>
          </div>
          ${
            configurazione.categoriaSottosuolo
              ? `<div class="data-row">
            <span class="data-label">Categoria Sottosuolo:</span>
            <span class="data-value">${configurazione.categoriaSottosuolo}</span>
          </div>`
              : ''
          }
          <div class="data-row">
            <span class="data-label">Categoria Topografica:</span>
            <span class="data-value">${configurazione.categoriaTopografica}</span>
          </div>
        </div>

        <!-- Caratteristiche Edificio -->
        <div class="section">
          <h3>🏗️ Caratteristiche Edificio</h3>
          <div class="data-row">
            <span class="data-label">Tipologia Strutturale:</span>
            <span class="data-value"><strong>${tipologieStrutturali[configurazione.tipologiaStrutturale] || configurazione.tipologiaStrutturale}</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Superficie Totale:</span>
            <span class="data-value">${configurazione.superficieTotale} m²</span>
          </div>
          <div class="data-row">
            <span class="data-label">Piani fuori terra / interrati:</span>
            <span class="data-value">${configurazione.numeroPianiFuoriTerra} / ${configurazione.numeroPianiInterrati}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Altezza totale:</span>
            <span class="data-value">${configurazione.altezzaTotale} m</span>
          </div>
          <div class="data-row">
            <span class="data-label">Anno di Costruzione:</span>
            <span class="data-value"><strong>${periodiCostruzione[configurazione.annoCostruzione] || configurazione.annoCostruzione}</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Destinazione d'Uso:</span>
            <span class="data-value">${destinazioniUso[configurazione.destinazioneUso] || configurazione.destinazioneUso}</span>
          </div>
        </div>

        <!-- Stato Conservazione -->
        <div class="section">
          <h3>📄 Stato di Conservazione</h3>
          <div class="data-row">
            <span class="data-label">Stato:</span>
            <span class="data-value"><strong>${statiConservazione[configurazione.statoConservazione] || configurazione.statoConservazione}</strong></span>
          </div>
          ${
            configurazione.documentazioneDisponibile.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Documentazione disponibile:</p>
            <ul>
              ${configurazione.documentazioneDisponibile.map((doc: string) => `<li>${doc}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
          ${
            configurazione.interventiPregressi.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Interventi pregressi:</p>
            <ul>
              ${configurazione.interventiPregressi.map((int: string) => `<li>${int}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        <!-- Servizi Richiesti -->
        <div class="section">
          <h3>🔧 Servizi Richiesti</h3>
          <div class="data-row">
            <span class="data-label">Servizio Principale:</span>
            <span class="data-value"><strong>${preventivo.nomeServizio}</strong></span>
          </div>
          ${
            configurazione.serviziAggiuntivi.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Servizi Aggiuntivi:</p>
            <ul>
              ${preventivo.serviziAggiuntivi.map((s: any) => `<li>${s.descrizione} - €${s.importo.toLocaleString('it-IT')}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        <!-- Complessità Strutturale -->
        <div class="section">
          <h3>⚙️ Complessità Strutturale</h3>
          <div class="data-row">
            <span class="data-label">Irregolarità Planimetrica:</span>
            <span class="data-value">${configurazione.irregolaritaPlanimetrica}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Irregolarità in Altezza:</span>
            <span class="data-value">${configurazione.irregolaritaAltezza}</span>
          </div>
          ${
            configurazione.elementiCritici.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Elementi Critici (${configurazione.elementiCritici.length}):</p>
            <ul>
              ${configurazione.elementiCritici.map((elem: string) => `<li>${elem}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        <!-- Urgenza -->
        <div class="section">
          <h3>⏰ Urgenza e Tempistiche</h3>
          <div class="data-row">
            <span class="data-label">Situazione Attuale:</span>
            <span class="data-value">${configurazione.situazioneAttuale || 'Non specificata'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Tempistiche:</span>
            <span class="data-value"><strong>${configurazione.vincoliTemporali}</strong></span>
          </div>
          ${
            configurazione.criticitaParticolari.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Criticità particolari:</p>
            <ul>
              ${configurazione.criticitaParticolari.map((crit: string) => `<li>${crit}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        ${
          configurazione.interessatoSismabonus && preventivo.sismabonus
            ? `<div class="section" style="background-color: #f0fdf4; border-left-color: #22c55e;">
          <h3 style="color: #16a34a;">💰 Sismabonus</h3>
          <div class="data-row">
            <span class="data-label">Classe Ante:</span>
            <span class="data-value"><strong>${configurazione.classeRischioAnte}</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Classe Post (prevista):</span>
            <span class="data-value"><strong>${configurazione.classeRischioPost}</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Salto di Classe:</span>
            <span class="data-value"><strong>+${preventivo.sismabonus.saltoClassi} classi</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Detrazione Fiscale:</span>
            <span class="data-value"><strong>${preventivo.sismabonus.percentualeDetrazione}%</strong> (${preventivo.sismabonus.descrizione})</span>
          </div>
          <div class="alert-box" style="margin-top: 15px;">
            <p style="margin: 0; font-size: 14px;"><strong>⚠️ Nota:</strong> I dati sul Sismabonus sono indicativi. La classe effettiva sarà determinata dopo valutazione strutturale completa.</p>
          </div>
        </div>`
            : ''
        }

        <p style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <strong>⏰ Azione Richiesta:</strong> Contattare il cliente entro 24 ore per confermare la richiesta e organizzare il sopralluogo tecnico.
        </p>
      </div>
    `

    // Email di conferma al cliente
    const emailClienteContent = `
      <div class="content">
        <h2>Richiesta Preventivo Ricevuta</h2>

        <p>Gentile <strong>${cliente.nome} ${cliente.cognome}</strong>,</p>

        <p>Abbiamo ricevuto la tua richiesta di preventivo per la valutazione di vulnerabilità sismica. Ti ringraziamo per averci contattato!</p>

        <div class="preventivo-box">
          <h2>Preventivo Indicativo</h2>
          <div class="preventivo-amount">${preventivo.totaleGenerale.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
          })}</div>
          <p style="color: #1e40af; font-size: 13px; margin-top: 15px;">
            Questo è un preventivo indicativo non vincolante basato sui dati inseriti nel configuratore.
          </p>
        </div>

        <div class="section">
          <h3>📋 Riepilogo Servizio</h3>
          <div class="data-row">
            <span class="data-label">Servizio Richiesto:</span>
            <span class="data-value">${preventivo.nomeServizio}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Localizzazione:</span>
            <span class="data-value">${configurazione.comune} (${configurazione.provincia}) - Zona Sismica ${configurazione.zonaSismica}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Tipologia Strutturale:</span>
            <span class="data-value">${tipologieStrutturali[configurazione.tipologiaStrutturale] || configurazione.tipologiaStrutturale}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Anno Costruzione:</span>
            <span class="data-value">${periodiCostruzione[configurazione.annoCostruzione] || configurazione.annoCostruzione}</span>
          </div>
        </div>

        ${
          configurazione.interessatoSismabonus && preventivo.sismabonus
            ? `<div class="section" style="background-color: #f0fdf4; border-left-color: #22c55e;">
          <h3 style="color: #16a34a;">💰 Sismabonus (Simulazione Indicativa)</h3>
          <p style="font-size: 14px; margin-bottom: 15px;">
            Basandoci sui dati inseriti, il tuo edificio potrebbe beneficiare di:
          </p>
          <div class="data-row">
            <span class="data-label">Salto di Classe Stimato:</span>
            <span class="data-value"><strong>${configurazione.classeRischioAnte} → ${configurazione.classeRischioPost}</strong> (+${preventivo.sismabonus.saltoClassi})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Detrazione Fiscale:</span>
            <span class="data-value"><strong>${preventivo.sismabonus.percentualeDetrazione}%</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Detrazione Massima:</span>
            <span class="data-value"><strong>€${preventivo.sismabonus.detrazioneMassima.toLocaleString('it-IT')}</strong></span>
          </div>
          <div class="alert-box" style="margin-top: 15px;">
            <p style="margin: 0; font-size: 13px;"><strong>⚠️ IMPORTANTE:</strong> Questi dati sono puramente indicativi. La classe di rischio effettiva e le detrazioni spettanti saranno determinate solo dopo una valutazione strutturale completa con modellazione secondo le Linee Guida MIT.</p>
          </div>
        </div>`
            : ''
        }

        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 30px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">🎯 Prossimi Passi</h3>
          <ul style="margin: 0;">
            <li>Un nostro ingegnere strutturista ti contatterà entro <strong>24 ore lavorative</strong></li>
            <li>Organizzeremo un sopralluogo tecnico per valutare l'edificio</li>
            <li>Riceverai un preventivo dettagliato e vincolante</li>
            <li>Potrai procedere con la valutazione sismica una volta approvato</li>
          </ul>
        </div>

        <p>Nel frattempo, se hai domande o necessiti di informazioni urgenti, non esitare a contattarci.</p>

        <p style="margin-top: 30px;">
          Cordiali saluti,<br>
          <strong>Il Team di Studio Ing. Romano</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Ingegneria Strutturale e Sismica - NTC 2018</span>
        </p>
      </div>
    `

    // Invia email allo studio
    const msgStudio = {
      to: PREVENTIVI_EMAIL,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `🛡️ Nuova Richiesta Preventivo Sismica - ${cliente.cognome} (${configurazione.comune}, Zona ${configurazione.zonaSismica})`,
      html: getEmailTemplate(emailStudioContent),
      replyTo: cliente.email,
    }

    // Invia email di conferma al cliente
    const msgCliente = {
      to: cliente.email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Conferma Richiesta Preventivo Vulnerabilità Sismica - Studio Ing. Romano`,
      html: getEmailTemplate(emailClienteContent),
    }

    // Invia entrambe le email
    await Promise.all([sgMail.send(msgStudio), sgMail.send(msgCliente)])

    console.log(
      `[Preventivo Sismica] Email inviate - Studio: ${PREVENTIVI_EMAIL}, Cliente: ${cliente.email}`
    )

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo',
    })
  } catch (error: any) {
    console.error('[Preventivo Sismica] Errore:', error.response?.body || error.message)
    return NextResponse.json(
      {
        error: "Errore durante l'invio della richiesta",
        details: error.message,
      },
      {status: 500}
    )
  }
}
