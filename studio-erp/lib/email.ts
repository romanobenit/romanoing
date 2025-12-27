/**
 * Email Service - SendGrid Integration
 *
 * Questo modulo gestisce l'invio di email tramite SendGrid.
 * Include templates HTML professionali per tutte le notifiche.
 *
 * Requisiti:
 * - SendGrid API Key configurata in .env
 * - Dominio email verificato in SendGrid
 * - npm install @sendgrid/mail
 *
 * Setup:
 * 1. Crea account SendGrid: https://signup.sendgrid.com/
 * 2. Verifica dominio email
 * 3. Crea API Key con permessi "Mail Send"
 * 4. Aggiungi SENDGRID_API_KEY a .env
 */

import sgMail from '@sendgrid/mail'

// Configurazione SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@studio-romano.it'
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Studio Ing. Romano'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Inizializza SendGrid se API key disponibile
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
  console.log('[Email] SendGrid initialized')
} else {
  console.warn('[Email] ⚠️  SendGrid API key not configured - emails will NOT be sent')
}

/**
 * Risultato invio email
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
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
      max-width: 600px;
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
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1e40af;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    h2 {
      color: #1f2937;
      font-size: 22px;
      margin-top: 0;
    }
    p {
      line-height: 1.6;
      margin: 16px 0;
    }
    ul {
      line-height: 1.8;
      padding-left: 20px;
    }
    .credential {
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Studio Ing. Romano</h1>
      <p>Ingegneria Strutturale</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Studio Ing. Romano</strong></p>
      <p>Via Example, Milano | 📧 info@studio-romano.it | 📞 +39 XXX XXXXXXX</p>
      <p style="margin-top: 20px; font-size: 12px;">
        Hai ricevuto questa email perché hai un account su Studio Ing. Romano.<br>
        <a href="${APP_URL}/cliente/preferenze">Gestisci le tue preferenze email</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Invia email di benvenuto con credenziali
 *
 * @param to - Email destinatario
 * @param nome - Nome cliente
 * @param tempPassword - Password temporanea
 * @param incaricocodice - Codice incarico creato
 */
export async function sendWelcomeEmail(
  to: string,
  nome: string,
  tempPassword: string,
  incaricoCodice: string
): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn(`[Email] Skip welcome email to ${to} (SendGrid not configured)`)
    return {success: false, error: 'SendGrid not configured'}
  }

  const content = `
    <div class="content">
      <h2>Benvenuto in Studio Ing. Romano!</h2>

      <p>Ciao <strong>${nome}</strong>,</p>

      <p>Il tuo ordine è stato confermato con successo! Abbiamo creato il tuo account nell'area riservata dove potrai:</p>

      <ul>
        <li>📋 Monitorare l'avanzamento del tuo incarico <strong>${incaricoCodice}</strong></li>
        <li>📄 Scaricare i documenti del progetto</li>
        <li>💬 Comunicare direttamente con il tecnico</li>
        <li>💳 Pagare le milestone successive online</li>
      </ul>

      <div class="warning-box">
        <p style="margin: 0;"><strong>⚠️ Credenziali di accesso temporanee</strong></p>
        <p style="margin: 8px 0 0 0;">Per motivi di sicurezza, dovrai cambiare la password al primo accesso.</p>
      </div>

      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Le tue credenziali:</strong></p>
        <div class="credential">
          <strong>Email:</strong> ${to}<br>
          <strong>Password temporanea:</strong> <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;">${tempPassword}</span>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #6b7280;">
          💡 Ti consigliamo di salvare queste credenziali in un luogo sicuro
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${APP_URL}/login" class="button">Accedi all'Area Riservata →</a>
      </div>

      <p style="margin-top: 30px;">Entro <strong>24 ore</strong> verrai contattato dal tecnico responsabile per organizzare il primo appuntamento.</p>

      <p>Se hai domande, non esitare a contattarci!</p>

      <p style="margin-top: 30px;">
        Cordiali saluti,<br>
        <strong>Il Team di Studio Ing. Romano</strong>
      </p>
    </div>
  `

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Benvenuto in Studio Ing. Romano - Incarico ${incaricoCodice}`,
      html: getEmailTemplate(content),
    }

    const [response] = await sgMail.send(msg)

    console.log(`[Email] Welcome email sent to ${to} (${response.statusCode})`)

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error: any) {
    console.error('[Email] Error sending welcome email:', error.response?.body || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Invia email conferma pagamento milestone
 *
 * @param to - Email destinatario
 * @param nome - Nome cliente
 * @param milestoneNome - Nome milestone pagata
 * @param importo - Importo pagato (centesimi)
 * @param incaricoCodice - Codice incarico
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  nome: string,
  milestoneNome: string,
  importo: number,
  incaricoCodice: string
): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn(`[Email] Skip payment confirmation to ${to} (SendGrid not configured)`)
    return {success: false, error: 'SendGrid not configured'}
  }

  const importoEuro = (importo / 100).toLocaleString('it-IT', {
    style: 'currency',
    currency: 'EUR',
  })

  const content = `
    <div class="content">
      <h2>Pagamento Ricevuto ✓</h2>

      <p>Ciao <strong>${nome}</strong>,</p>

      <p>Abbiamo ricevuto il tuo pagamento per l'incarico <strong>${incaricoCodice}</strong>.</p>

      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Dettagli pagamento:</strong></p>
        <p style="margin: 5px 0;"><strong>Milestone:</strong> ${milestoneNome}</p>
        <p style="margin: 5px 0;"><strong>Importo:</strong> <span style="font-size: 20px; color: #2563eb;">${importoEuro}</span></p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}</p>
      </div>

      <p>Puoi visualizzare lo stato dei pagamenti e scaricare la ricevuta dalla tua area riservata:</p>

      <div style="text-align: center;">
        <a href="${APP_URL}/cliente/incarichi/${incaricoCodice}" class="button">Vai all'Incarico →</a>
      </div>

      <p style="margin-top: 30px;">Grazie per la fiducia!</p>

      <p>
        Cordiali saluti,<br>
        <strong>Il Team di Studio Ing. Romano</strong>
      </p>
    </div>
  `

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Pagamento Ricevuto - ${milestoneNome} - ${incaricoCodice}`,
      html: getEmailTemplate(content),
    }

    const [response] = await sgMail.send(msg)

    console.log(`[Email] Payment confirmation sent to ${to} (${response.statusCode})`)

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error: any) {
    console.error('[Email] Error sending payment confirmation:', error.response?.body || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Invia email notifica nuovo documento consegnato
 *
 * @param to - Email destinatario
 * @param nome - Nome cliente
 * @param documentoNome - Nome documento
 * @param categoria - Categoria documento
 * @param incaricoCodice - Codice incarico
 */
export async function sendDocumentDeliveredEmail(
  to: string,
  nome: string,
  documentoNome: string,
  categoria: string,
  incaricoCodice: string
): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn(`[Email] Skip document notification to ${to} (SendGrid not configured)`)
    return {success: false, error: 'SendGrid not configured'}
  }

  const content = `
    <div class="content">
      <h2>Nuovo Documento Disponibile</h2>

      <p>Ciao <strong>${nome}</strong>,</p>

      <p>È stato caricato un nuovo documento per il tuo incarico <strong>${incaricoCodice}</strong>.</p>

      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Dettagli documento:</strong></p>
        <p style="margin: 5px 0;"><strong>Nome:</strong> ${documentoNome}</p>
        <p style="margin: 5px 0;"><strong>Categoria:</strong> ${categoria}</p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
      </div>

      <p>Puoi visualizzare e scaricare il documento dalla tua area riservata:</p>

      <div style="text-align: center;">
        <a href="${APP_URL}/cliente/incarichi/${incaricoCodice}" class="button">Visualizza Documento →</a>
      </div>

      <p>
        Cordiali saluti,<br>
        <strong>Il Team di Studio Ing. Romano</strong>
      </p>
    </div>
  `

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Nuovo Documento Disponibile - ${incaricoCodice}`,
      html: getEmailTemplate(content),
    }

    const [response] = await sgMail.send(msg)

    console.log(`[Email] Document notification sent to ${to} (${response.statusCode})`)

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error: any) {
    console.error('[Email] Error sending document notification:', error.response?.body || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Invia email notifica nuovo messaggio
 *
 * @param to - Email destinatario
 * @param nome - Nome destinatario
 * @param mittente - Nome mittente
 * @param messaggio - Testo messaggio (primi 200 caratteri)
 * @param incaricoCodice - Codice incarico
 */
export async function sendNewMessageEmail(
  to: string,
  nome: string,
  mittente: string,
  messaggio: string,
  incaricoCodice: string
): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn(`[Email] Skip message notification to ${to} (SendGrid not configured)`)
    return {success: false, error: 'SendGrid not configured'}
  }

  const messaggioPreview = messaggio.length > 200 ? `${messaggio.substring(0, 200)}...` : messaggio

  const content = `
    <div class="content">
      <h2>Nuovo Messaggio da ${mittente}</h2>

      <p>Ciao <strong>${nome}</strong>,</p>

      <p>Hai ricevuto un nuovo messaggio riguardo l'incarico <strong>${incaricoCodice}</strong>.</p>

      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Da:</strong> ${mittente}</p>
        <p style="margin: 10px 0 0 0; padding: 12px; background-color: white; border-radius: 4px; font-style: italic;">
          "${messaggioPreview}"
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${APP_URL}/cliente/incarichi/${incaricoCodice}" class="button">Rispondi al Messaggio →</a>
      </div>

      <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
        💡 Puoi disattivare le notifiche email dalla tua <a href="${APP_URL}/cliente/preferenze">pagina preferenze</a>
      </p>

      <p>
        Cordiali saluti,<br>
        <strong>Il Team di Studio Ing. Romano</strong>
      </p>
    </div>
  `

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `Nuovo Messaggio da ${mittente} - ${incaricoCodice}`,
      html: getEmailTemplate(content),
    }

    const [response] = await sgMail.send(msg)

    console.log(`[Email] Message notification sent to ${to} (${response.statusCode})`)

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error: any) {
    console.error('[Email] Error sending message notification:', error.response?.body || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Test invio email (development)
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    return {success: false, error: 'SendGrid not configured'}
  }

  const content = `
    <div class="content">
      <h2>Test Email - Studio ERP</h2>
      <p>Questa è una email di test per verificare la configurazione SendGrid.</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <div class="info-box">
        <p>✓ SendGrid configurato correttamente</p>
        <p>✓ Template HTML funzionante</p>
        <p>✓ Email delivery operativo</p>
      </div>
    </div>
  `

  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: 'Test Email - Studio Ing. Romano ERP',
      html: getEmailTemplate(content),
    }

    const [response] = await sgMail.send(msg)

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}
