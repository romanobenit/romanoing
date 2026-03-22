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
import {query} from '@/lib/db'

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
 * Tipi di notifica disponibili
 */
type NotificationType =
  | 'nuovo_documento'
  | 'messaggio'
  | 'richiesta_pagamento'
  | 'stato_incarico'
  | 'richiesta_documento'

/**
 * Controlla se l'utente vuole ricevere un tipo specifico di notifica
 *
 * @param userEmail - Email dell'utente
 * @param notificationType - Tipo di notifica da verificare
 * @returns true se l'utente vuole ricevere la notifica, false altrimenti
 */
async function checkUserNotificationPreference(
  userEmail: string,
  notificationType: NotificationType
): Promise<boolean> {
  try {
    // Get user ID
    const userResult = await query(`SELECT id FROM utenti WHERE email = $1`, [userEmail])

    if (userResult.rows.length === 0) {
      console.warn(`[Email] User not found: ${userEmail}`)
      return false
    }

    const userId = userResult.rows[0].id

    // Get preferences
    const prefsResult = await query(
      `SELECT
        email_attivo,
        notifica_nuovo_documento,
        notifica_messaggio,
        notifica_richiesta_pagamento,
        notifica_stato_incarico,
        notifica_richiesta_documento
      FROM preferenze_notifiche
      WHERE utente_id = $1`,
      [userId]
    )

    // If no preferences found, allow by default (opt-in by default)
    if (prefsResult.rows.length === 0) {
      console.log(`[Email] No preferences found for user ${userEmail}, allowing by default`)
      return true
    }

    const prefs = prefsResult.rows[0]

    // Check master switch first
    if (!prefs.email_attivo) {
      console.log(`[Email] Email disabled for user ${userEmail}`)
      return false
    }

    // Check specific notification type
    const fieldMap: Record<NotificationType, string> = {
      nuovo_documento: 'notifica_nuovo_documento',
      messaggio: 'notifica_messaggio',
      richiesta_pagamento: 'notifica_richiesta_pagamento',
      stato_incarico: 'notifica_stato_incarico',
      richiesta_documento: 'notifica_richiesta_documento',
    }

    const fieldName = fieldMap[notificationType]
    const allowed = prefs[fieldName] === true

    console.log(
      `[Email] User ${userEmail} preference for ${notificationType}: ${allowed ? 'ALLOWED' : 'BLOCKED'}`
    )

    return allowed
  } catch (error) {
    console.error('[Email] Error checking notification preference:', error)
    // On error, allow by default (fail-safe)
    return true
  }
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

  // Check user notification preferences
  const allowed = await checkUserNotificationPreference(to, 'richiesta_pagamento')
  if (!allowed) {
    console.log(`[Email] Skip payment confirmation to ${to} (user preference)`)
    return {success: false, error: 'User preference: notification disabled'}
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

  // Check user notification preferences
  const allowed = await checkUserNotificationPreference(to, 'nuovo_documento')
  if (!allowed) {
    console.log(`[Email] Skip document notification to ${to} (user preference)`)
    return {success: false, error: 'User preference: notification disabled'}
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

  // Check user notification preferences
  const allowed = await checkUserNotificationPreference(to, 'messaggio')
  if (!allowed) {
    console.log(`[Email] Skip message notification to ${to} (user preference)`)
    return {success: false, error: 'User preference: notification disabled'}
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

/**
 * Notifica Titolare: nuovo lead preventivo dal Sportello Virtuale
 */
export async function sendLeadNotificationEmail(lead: {
  nome: string;
  email: string;
  telefono?: string;
  note_aggiuntive?: string;
  brief?: Record<string, unknown>;
}): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn('[Email] SendGrid non configurato — lead notifica non inviata');
    return { success: false, error: 'SendGrid non configurato' };
  }

  // Recupera email TITOLARE dal DB
  let titolareEmail = FROM_EMAIL;
  try {
    const r = await query(
      `SELECT u.email FROM utenti u JOIN ruoli r ON u.ruolo_id = r.id WHERE r.codice = 'TITOLARE' LIMIT 1`
    );
    if (r.rows[0]) titolareEmail = r.rows[0].email;
  } catch { /* fallback a FROM_EMAIL */ }

  const briefRows = lead.brief
    ? Object.entries(lead.brief)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#94a3b8;font-size:13px">${k}</td><td style="padding:4px 8px;color:#e2e8f0;font-size:13px">${String(v)}</td></tr>`)
        .join('')
    : '';

  const content = `
    <h2 style="color:#f8fafc;margin:0 0 16px">Nuovo lead preventivo — Sportello Virtuale</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:4px 8px;color:#94a3b8;font-size:13px">Nome</td><td style="padding:4px 8px;color:#e2e8f0;font-size:13px">${lead.nome}</td></tr>
      <tr><td style="padding:4px 8px;color:#94a3b8;font-size:13px">Email</td><td style="padding:4px 8px;color:#e2e8f0;font-size:13px">${lead.email}</td></tr>
      ${lead.telefono ? `<tr><td style="padding:4px 8px;color:#94a3b8;font-size:13px">Telefono</td><td style="padding:4px 8px;color:#e2e8f0;font-size:13px">${lead.telefono}</td></tr>` : ''}
      ${lead.note_aggiuntive ? `<tr><td style="padding:4px 8px;color:#94a3b8;font-size:13px">Note</td><td style="padding:4px 8px;color:#e2e8f0;font-size:13px">${lead.note_aggiuntive}</td></tr>` : ''}
    </table>
    ${briefRows ? `<h3 style="color:#f8fafc;margin:20px 0 8px">Dati tecnici rilevati</h3><table style="width:100%;border-collapse:collapse">${briefRows}</table>` : ''}
    <div style="margin-top:20px">
      <a href="${APP_URL}/collaboratore/dashboard" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
        Vai alla dashboard →
      </a>
    </div>
  `;

  try {
    const msg = {
      to: titolareEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `[Sportello] Nuovo lead da ${lead.nome} — ${lead.email}`,
      html: getEmailTemplate(content),
    };
    const [response] = await sgMail.send(msg);
    return { success: true, messageId: response.headers['x-message-id'] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Notifica Titolare: nuova consulenza acquistata tramite Sportello Virtuale
 */
export async function sendNewConsulenzaEmail(consulenza: {
  incaricoCodice: string;
  titoloServizio: string;
  tipoErogazione: string;
  prezzoCentesimi: number;
  slaOre: number | null;
  customerEmail: string;
}): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    console.warn('[Email] SendGrid non configurato — consulenza notifica non inviata');
    return { success: false, error: 'SendGrid non configurato' };
  }

  let titolareEmail = FROM_EMAIL;
  try {
    const r = await query(
      `SELECT u.email FROM utenti u JOIN ruoli r ON u.ruolo_id = r.id WHERE r.codice = 'TITOLARE' LIMIT 1`
    );
    if (r.rows[0]) titolareEmail = r.rows[0].email;
  } catch { /* fallback */ }

  const TIPO_DESC: Record<string, string> = {
    PLATFORM: '📄 Documento AI (generazione automatica)',
    IMMEDIATA: '🔍 Analisi AI con revisione',
    INGEGNERE: '✍️ Parere firmato dall\'Ingegnere',
  };

  const content = `
    <h2 style="color:#f8fafc;margin:0 0 16px">💰 Nuova consulenza acquistata — Sportello Virtuale</h2>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Incarico</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px;font-weight:bold">${consulenza.incaricoCodice}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Servizio</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px">${consulenza.titoloServizio}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Tipo</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px">${TIPO_DESC[consulenza.tipoErogazione] ?? consulenza.tipoErogazione}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Importo</td><td style="padding:6px 8px;color:#22c55e;font-size:16px;font-weight:bold">€${(consulenza.prezzoCentesimi / 100).toFixed(2)}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Cliente</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px">${consulenza.customerEmail}</td></tr>
      ${consulenza.slaOre ? `<tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">SLA</td><td style="padding:6px 8px;color:#f59e0b;font-size:13px;font-weight:bold">⏱ Consegna entro ${consulenza.slaOre}h</td></tr>` : ''}
    </table>
    <div style="margin-top:20px">
      <a href="${APP_URL}/collaboratore/dashboard" style="background:#3b82f6;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
        Gestisci incarico →
      </a>
    </div>
  `;

  try {
    const [response] = await sgMail.send({
      to: titolareEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `[Sportello] Nuova consulenza ${consulenza.incaricoCodice} — €${(consulenza.prezzoCentesimi / 100).toFixed(0)}`,
      html: getEmailTemplate(content),
    });
    return { success: true, messageId: response.headers['x-message-id'] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Alert SLA: notifica Titolare quando un incarico si avvicina alla scadenza SLA
 */
export async function sendSlaAlertEmail(incarico: {
  codice: string;
  titoloServizio: string;
  slaScadenza: Date;
  oreRimanenti: number;
  customerEmail: string;
}): Promise<EmailResult> {
  if (!SENDGRID_API_KEY) {
    return { success: false, error: 'SendGrid non configurato' };
  }

  let titolareEmail = FROM_EMAIL;
  try {
    const r = await query(
      `SELECT u.email FROM utenti u JOIN ruoli r ON u.ruolo_id = r.id WHERE r.codice = 'TITOLARE' LIMIT 1`
    );
    if (r.rows[0]) titolareEmail = r.rows[0].email;
  } catch { /* fallback */ }

  const urgency = incarico.oreRimanenti <= 4 ? '🚨 URGENTE' : '⚠️ ATTENZIONE';
  const scadenzaStr = incarico.slaScadenza.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

  const content = `
    <h2 style="color:#f59e0b;margin:0 0 16px">${urgency} — SLA in scadenza</h2>
    <p style="color:#e2e8f0;font-size:14px;margin:0 0 16px">
      L'incarico <strong>${incarico.codice}</strong> scade tra <strong>${incarico.oreRimanenti}h</strong> (${scadenzaStr}).
    </p>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Incarico</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px;font-weight:bold">${incarico.codice}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Servizio</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px">${incarico.titoloServizio}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Cliente</td><td style="padding:6px 8px;color:#e2e8f0;font-size:13px">${incarico.customerEmail}</td></tr>
      <tr><td style="padding:6px 8px;color:#94a3b8;font-size:13px">Scadenza SLA</td><td style="padding:6px 8px;color:#ef4444;font-size:13px;font-weight:bold">${scadenzaStr}</td></tr>
    </table>
    <div style="margin-top:20px">
      <a href="${APP_URL}/collaboratore/dashboard" style="background:#ef4444;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
        Gestisci ora →
      </a>
    </div>
  `;

  try {
    const [response] = await sgMail.send({
      to: titolareEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `${urgency} SLA ${incarico.codice} scade in ${incarico.oreRimanenti}h`,
      html: getEmailTemplate(content),
    });
    return { success: true, messageId: response.headers['x-message-id'] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
