import {NextRequest, NextResponse} from 'next/server'
import sgMail from '@sendgrid/mail'
import {publicApiRateLimit, getIdentifier, applyRateLimit} from '@/lib/rate-limit'

// Configurazione SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@studio-romano.it'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Studio Ing. Romano'
const PREVENTIVI_EMAIL = process.env.PREVENTIVI_EMAIL || 'preventivi@studio-romano.it'

// Inizializza SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

/** Escape HTML per prevenire XSS nelle email HTML */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
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
      background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
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
      border-left: 4px solid #ea580c;
    }
    .section h3 {
      margin: 0 0 15px 0;
      color: #ea580c;
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
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
      text-align: center;
    }
    .preventivo-box h2 {
      margin: 0 0 10px 0;
      color: #92400e;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .preventivo-amount {
      font-size: 42px;
      font-weight: 700;
      color: #dc2626;
      margin: 10px 0;
    }
    .preventivo-detail {
      font-size: 14px;
      color: #78350f;
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
      color: #ea580c;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #fef3c7;
      color: #92400e;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Studio Ing. Romano</h1>
      <p>Prevenzione Incendi & Sicurezza Antincendio</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Studio Ing. Romano</strong></p>
      <p>Ingegneria della Sicurezza Antincendio</p>
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
  // Rate limiting — prevenzione spam email
  const identifier = getIdentifier(request)
  const rl = await applyRateLimit(publicApiRateLimit, identifier)
  if (rl) return rl

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

    // Validazione email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cliente.email)) {
      return NextResponse.json({error: 'Formato email non valido'}, {status: 400})
    }

    // Verifica SendGrid
    if (!SENDGRID_API_KEY) {
      console.error('[Preventivo Antincendio] SendGrid non configurato')
      return NextResponse.json({error: 'Servizio email non disponibile'}, {status: 500})
    }

    // Formatta i dati per l'email allo studio
    const emailStudioContent = `
      <div class="content">
        <h2>Nuova Richiesta Preventivo Antincendio</h2>

        <p>È stata ricevuta una nuova richiesta di preventivo dal configuratore Bundle Antincendio.</p>

        <!-- Dati Cliente -->
        <div class="section">
          <h3>👤 Dati Cliente</h3>
          <div class="data-row">
            <span class="data-label">Nome:</span>
            <span class="data-value">${escapeHtml(cliente.nome)} ${escapeHtml(cliente.cognome)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Email:</span>
            <span class="data-value">${escapeHtml(cliente.email)}</span>
          </div>
          ${
            cliente.telefono
              ? `<div class="data-row">
            <span class="data-label">Telefono:</span>
            <span class="data-value">${escapeHtml(cliente.telefono)}</span>
          </div>`
              : ''
          }
          ${
            cliente.note
              ? `<div class="data-row">
            <span class="data-label">Note:</span>
            <span class="data-value">${escapeHtml(cliente.note)}</span>
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
              preventivo.maggiorazioneUrgenza > 0
                ? `<p style="margin: 5px 0;"><strong>Maggiorazione Urgenza:</strong> +${preventivo.maggiorazioneUrgenza.toLocaleString('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                  })}</p>`
                : ''
            }
            <p style="margin: 5px 0;"><strong>Costo Trasferta:</strong> ${preventivo.costoTrasferta.toLocaleString('it-IT', {
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
            <span class="data-value">${escapeHtml(configurazione.indirizzo)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Comune:</span>
            <span class="data-value">${escapeHtml(configurazione.cap)} ${escapeHtml(configurazione.comune)} (${escapeHtml(configurazione.provincia)})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Regione:</span>
            <span class="data-value">${escapeHtml(configurazione.regione)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Categoria Attività:</span>
            <span class="data-value">${escapeHtml(configurazione.categoriaAttivita)}</span>
          </div>
          ${
            configurazione.descrizioneAttivita
              ? `<div class="data-row">
            <span class="data-label">Descrizione:</span>
            <span class="data-value">${escapeHtml(configurazione.descrizioneAttivita)}</span>
          </div>`
              : ''
          }
        </div>

        <!-- Dimensionamento -->
        <div class="section">
          <h3>📐 Dimensionamento</h3>
          <div class="data-row">
            <span class="data-label">Superficie Lorda:</span>
            <span class="data-value">${escapeHtml(configurazione.superficieLorda)} m²</span>
          </div>
          <div class="data-row">
            <span class="data-label">Superficie Netta:</span>
            <span class="data-value">${escapeHtml(configurazione.superficieNetta)} m²</span>
          </div>
          <div class="data-row">
            <span class="data-label">Affollamento Max:</span>
            <span class="data-value">${escapeHtml(configurazione.affollamentoMax)} persone</span>
          </div>
          <div class="data-row">
            <span class="data-label">Numero Piani:</span>
            <span class="data-value">${escapeHtml(configurazione.numeroPiani)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Altezza Edificio:</span>
            <span class="data-value">${escapeHtml(configurazione.altezzaEdificio)} m</span>
          </div>
          <div class="data-row">
            <span class="data-label">Piano Ubicazione:</span>
            <span class="data-value">${escapeHtml(configurazione.pianoUbicazione)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Struttura Portante:</span>
            <span class="data-value">${escapeHtml(configurazione.strutturaPortante)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Anno Costruzione:</span>
            <span class="data-value">${escapeHtml(configurazione.annoCostruzione)}</span>
          </div>
          ${
            Array.isArray(configurazione.tipoUtenza) && configurazione.tipoUtenza.length > 0
              ? `<div class="data-row">
            <span class="data-label">Tipo Utenza:</span>
            <span class="data-value">${configurazione.tipoUtenza.map((u: string) => `<span class="badge">${escapeHtml(u)}</span>`).join(' ')}</span>
          </div>`
              : ''
          }
          ${
            Array.isArray(configurazione.compartimentazioneEsistente) && configurazione.compartimentazioneEsistente.length > 0
              ? `<div class="data-row">
            <span class="data-label">Compartimentazione:</span>
            <span class="data-value">${configurazione.compartimentazioneEsistente.map((c: string) => `<span class="badge">${escapeHtml(c)}</span>`).join(' ')}</span>
          </div>`
              : ''
          }
        </div>

        <!-- Servizi Richiesti -->
        <div class="section">
          <h3>🔧 Servizi Richiesti</h3>
          <div class="data-row">
            <span class="data-label">Servizio Principale:</span>
            <span class="data-value"><strong>${escapeHtml(configurazione.servizioprincipale)}</strong></span>
          </div>
          ${
            Array.isArray(configurazione.serviziAggiuntivi) && configurazione.serviziAggiuntivi.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Servizi Aggiuntivi:</p>
            <ul>
              ${configurazione.serviziAggiuntivi.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        <!-- Impianti e Certificazioni -->
        ${
          (Array.isArray(configurazione.impiantiEsistenti) && configurazione.impiantiEsistenti.length > 0) ||
          (Array.isArray(configurazione.certificazioniEsistenti) && configurazione.certificazioniEsistenti.length > 0)
            ? `<div class="section">
          <h3>⚡ Impianti e Certificazioni Esistenti</h3>
          ${
            Array.isArray(configurazione.impiantiEsistenti) && configurazione.impiantiEsistenti.length > 0
              ? `<div style="margin-bottom: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Impianti:</p>
            <ul>
              ${configurazione.impiantiEsistenti.map((i: string) => `<li>${escapeHtml(i)}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
          ${
            Array.isArray(configurazione.certificazioniEsistenti) && configurazione.certificazioniEsistenti.length > 0
              ? `<div>
            <p class="data-label" style="margin-bottom: 10px;">Certificazioni:</p>
            <ul>
              ${configurazione.certificazioniEsistenti.map((c: string) => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>`
            : ''
        }

        <!-- Urgenza e Criticità -->
        <div class="section">
          <h3>⚠️ Urgenza e Criticità</h3>
          <div class="data-row">
            <span class="data-label">Situazione Attuale:</span>
            <span class="data-value"><strong>${escapeHtml(configurazione.situazioneAttuale)}</strong></span>
          </div>
          <div class="data-row">
            <span class="data-label">Vincoli Temporali:</span>
            <span class="data-value">${escapeHtml(configurazione.vincoliTemporali)}</span>
          </div>
          ${
            Array.isArray(configurazione.criticitaNote) && configurazione.criticitaNote.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Criticità Note:</p>
            <ul>
              ${configurazione.criticitaNote.map((c: string) => `<li>${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
          ${
            Array.isArray(configurazione.depositiSpeciali) && configurazione.depositiSpeciali.length > 0
              ? `<div style="margin-top: 15px;">
            <p class="data-label" style="margin-bottom: 10px;">Depositi Speciali:</p>
            <ul>
              ${configurazione.depositiSpeciali.map((d: string) => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
          </div>`
              : ''
          }
        </div>

        <p style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
          <strong>⏰ Azione Richiesta:</strong> Contattare il cliente entro 24 ore per confermare la richiesta e organizzare il sopralluogo.
        </p>
      </div>
    `

    // Formatta email di conferma per il cliente
    const emailClienteContent = `
      <div class="content">
        <h2>Richiesta Preventivo Ricevuta</h2>

        <p>Gentile <strong>${escapeHtml(cliente.nome)} ${escapeHtml(cliente.cognome)}</strong>,</p>

        <p>Abbiamo ricevuto la tua richiesta di preventivo per i servizi di prevenzione incendi. Ti ringraziamo per averci contattato!</p>

        <div class="preventivo-box">
          <h2>Preventivo Indicativo</h2>
          <div class="preventivo-amount">${preventivo.totaleGenerale.toLocaleString('it-IT', {
            style: 'currency',
            currency: 'EUR',
          })}</div>
          <p style="color: #78350f; font-size: 13px; margin-top: 15px;">
            Questo è un preventivo indicativo non vincolante basato sui dati inseriti nel configuratore.
          </p>
        </div>

        <div class="section">
          <h3>📋 Riepilogo Servizio</h3>
          <div class="data-row">
            <span class="data-label">Servizio Richiesto:</span>
            <span class="data-value">${escapeHtml(configurazione.servizioprincipale)}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Localizzazione:</span>
            <span class="data-value">${escapeHtml(configurazione.comune)} (${escapeHtml(configurazione.provincia)})</span>
          </div>
          <div class="data-row">
            <span class="data-label">Categoria Attività:</span>
            <span class="data-value">${escapeHtml(configurazione.categoriaAttivita)}</span>
          </div>
        </div>

        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 30px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">🎯 Prossimi Passi</h3>
          <ul style="margin: 0;">
            <li>Un nostro tecnico ti contatterà entro <strong>24 ore lavorative</strong></li>
            <li>Organizzeremo un sopralluogo per valutare la situazione specifica</li>
            <li>Riceverai un preventivo dettagliato e vincolante</li>
            <li>Potrai procedere con l'incarico una volta approvato il preventivo</li>
          </ul>
        </div>

        <p>Nel frattempo, se hai domande o necessiti di informazioni urgenti, non esitare a contattarci.</p>

        <p style="margin-top: 30px;">
          Cordiali saluti,<br>
          <strong>Il Team di Studio Ing. Romano</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Ingegneria della Sicurezza Antincendio</span>
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
      subject: `🔥 Nuova Richiesta Preventivo Antincendio - ${cliente.cognome} (${configurazione.comune})`,
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
      subject: `Conferma Richiesta Preventivo Bundle Antincendio - Studio Ing. Romano`,
      html: getEmailTemplate(emailClienteContent),
    }

    // Invia entrambe le email
    await Promise.all([sgMail.send(msgStudio), sgMail.send(msgCliente)])

    console.log(
      `[Preventivo Antincendio] Email inviate - Studio: ${PREVENTIVI_EMAIL}, Cliente: ${cliente.email}`
    )

    return NextResponse.json({
      success: true,
      message: 'Richiesta inviata con successo',
    })
  } catch (error: any) {
    console.error('[Preventivo Antincendio] Errore:', error.response?.body || error.message)
    return NextResponse.json(
      {
        error: 'Errore durante l\'invio della richiesta',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      {status: 500}
    )
  }
}
