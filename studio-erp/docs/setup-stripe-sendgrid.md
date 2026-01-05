# Setup Stripe e SendGrid

Configurazione dei servizi esterni per pagamenti ed email.

---

## 💳 Stripe - Pagamenti Online

### 1. Crea Account Stripe

1. Vai su https://stripe.com
2. Registra account business
3. Completa verifica identità (richiesto per pagamenti reali)
4. Compila profilo business

### 2. Ottieni API Keys

**Dashboard Stripe** → **Developers** → **API keys**

#### Test Mode (Sviluppo)
```env
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
```

#### Live Mode (Produzione)
```env
STRIPE_SECRET_KEY="sk_live_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51..."
```

### 3. Configura Webhook

I webhook permettono a Stripe di notificare la tua app quando un pagamento è completato.

#### Crea Webhook Endpoint

**Dashboard Stripe** → **Developers** → **Webhooks** → **Add endpoint**

- **Endpoint URL**: `https://studio-romano.it/api/stripe/webhook`
- **Eventi da ascoltare**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.created`

#### Ottieni Webhook Secret
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Crea Prodotti e Prezzi

#### Opzione A: Via Dashboard

**Dashboard Stripe** → **Products** → **Add product**

Esempio: Bundle Ristrutturazione
- Nome: `Ristrutturazione con Bonus - Anticipo M0`
- Descrizione: `Anticipo 30% per incarico ristrutturazione`
- Prezzo: €2.400 (30% di €8.000)
- Tipo: One-time payment

#### Opzione B: Via API (Consigliato)

Creiamo prodotti dinamicamente dal codice.

File: `lib/stripe.ts`
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

/**
 * Crea sessione checkout per acquisto bundle
 */
export async function createCheckoutSession(params: {
  bundleId: string
  bundleNome: string
  importo: number // in centesimi (es. 800000 = €8000)
  clienteEmail: string
  clienteNome: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: params.bundleNome,
            description: 'Anticipo 30% (M0)',
          },
          unit_amount: Math.round(params.importo * 0.3), // 30% anticipo
        },
        quantity: 1,
      },
    ],
    customer_email: params.clienteEmail,
    client_reference_id: params.bundleId,
    metadata: {
      bundleId: params.bundleId,
      clienteNome: params.clienteNome,
      clienteEmail: params.clienteEmail,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  return session
}

/**
 * Crea sessione checkout per milestone
 */
export async function createMilestoneCheckoutSession(params: {
  milestoneId: string
  incaricoId: string
  milestonNome: string
  importo: number
  clienteEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${params.milestonNome}`,
            description: `Incarico #${params.incaricoId}`,
          },
          unit_amount: params.importo,
        },
        quantity: 1,
      },
    ],
    customer_email: params.clienteEmail,
    client_reference_id: params.milestoneId,
    metadata: {
      milestoneId: params.milestoneId,
      incaricoId: params.incaricoId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  })

  return session
}
```

### 5. Test Carte di Credito

Per testare in modalità sviluppo, usa queste carte:

| Carta | Numero | CVC | Data | Risultato |
|-------|--------|-----|------|-----------|
| Successo | 4242 4242 4242 4242 | Qualsiasi | Futura | ✅ Pagamento riuscito |
| Rifiutata | 4000 0000 0000 0002 | Qualsiasi | Futura | ❌ Carta rifiutata |
| 3D Secure | 4000 0027 6000 3184 | Qualsiasi | Futura | 🔒 Richiede autenticazione |

### 6. Commissioni Stripe

**Tariffe Italia**:
- Carte EU: **1,4% + €0,25** per transazione
- Carte extra-EU: **2,9% + €0,25**
- Nessun costo mensile

Esempio: Pagamento €2.400
- Commissione: €2.400 × 1,4% + €0,25 = **€33,85**
- Netto ricevuto: **€2.366,15**

---

## 📧 SendGrid - Email Transazionali

### 1. Crea Account SendGrid

1. Vai su https://sendgrid.com
2. Registra account (Free tier: 100 email/giorno)
3. Verifica email

### 2. Verifica Dominio (Domain Authentication)

**Importante**: Per evitare che le email finiscano in spam.

**Dashboard SendGrid** → **Settings** → **Sender Authentication** → **Authenticate Your Domain**

1. Inserisci dominio: `studio-romano.it`
2. SendGrid fornisce record DNS da aggiungere:

```
Tipo    Nome                              Valore
CNAME   em1234.studio-romano.it           u1234567.wl.sendgrid.net
CNAME   s1._domainkey.studio-romano.it    s1.domainkey.u1234567.wl.sendgrid.net
CNAME   s2._domainkey.studio-romano.it    s2.domainkey.u1234567.wl.sendgrid.net
```

3. Aggiungi questi record al tuo provider DNS
4. Torna su SendGrid e clicca "Verify"
5. Attendi 24-48h per propagazione completa

### 3. Crea API Key

**Dashboard SendGrid** → **Settings** → **API Keys** → **Create API Key**

- Nome: `Studio ERP Production`
- Permessi: **Full Access** (o solo Mail Send per sicurezza)
- Copia API Key:

```env
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

⚠️ **IMPORTANTE**: Salva subito la chiave, non sarà più visibile!

### 4. Configura Sender Email

**Dashboard SendGrid** → **Settings** → **Sender Authentication** → **Single Sender Verification**

- From Email: `noreply@studio-romano.it`
- From Name: `Studio Ing. Romano`
- Reply To: `info@studio-romano.it`

Verifica email ricevuta.

### 5. Implementazione nel Codice

File: `lib/email.ts`
```typescript
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@studio-romano.it'
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Studio Ing. Romano'

/**
 * Invia email di benvenuto con credenziali
 */
export async function sendWelcomeEmail(params: {
  to: string
  nome: string
  cognome: string
  resetPasswordUrl: string
}) {
  const msg = {
    to: params.to,
    from: {
      email: FROM_EMAIL,
      name: APP_NAME,
    },
    subject: 'Benvenuto - Attiva il tuo account',
    text: `
Ciao ${params.nome},

Benvenuto su ${APP_NAME}!

Il tuo account è stato creato. Per completare l'attivazione, imposta la tua password:

${params.resetPasswordUrl}

Il link è valido per 24 ore.

Se hai domande, rispondi a questa email.

Cordiali saluti,
${APP_NAME}
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer { margin-top: 40px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Benvenuto, ${params.nome}!</h1>
    <p>Il tuo account su <strong>${APP_NAME}</strong> è stato creato con successo.</p>
    <p>Per completare l'attivazione, imposta la tua password cliccando sul pulsante qui sotto:</p>
    <a href="${params.resetPasswordUrl}" class="button">Imposta Password</a>
    <p><small>Oppure copia questo link nel browser:<br>${params.resetPasswordUrl}</small></p>
    <p>Il link è valido per 24 ore.</p>
    <div class="footer">
      <p>Se non hai richiesto questo account, ignora questa email.</p>
      <p>&copy; 2025 ${APP_NAME} - Tutti i diritti riservati</p>
    </div>
  </div>
</body>
</html>
    `,
  }

  await sgMail.send(msg)
}

/**
 * Invia notifica nuovo documento consegnato
 */
export async function sendDocumentDeliveredEmail(params: {
  to: string
  nome: string
  incaricoId: string
  nomeDocumento: string
  downloadUrl: string
}) {
  const msg = {
    to: params.to,
    from: { email: FROM_EMAIL, name: APP_NAME },
    subject: `Nuovo documento disponibile - ${params.incaricoId}`,
    html: `
<h2>Nuovo documento disponibile</h2>
<p>Ciao ${params.nome},</p>
<p>È stato caricato un nuovo documento per il tuo incarico <strong>${params.incaricoId}</strong>:</p>
<p><strong>${params.nomeDocumento}</strong></p>
<a href="${params.downloadUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Scarica Documento</a>
<p>Accedi alla tua area riservata per visualizzare tutti i documenti.</p>
    `,
  }

  await sgMail.send(msg)
}

/**
 * Invia notifica richiesta pagamento milestone
 */
export async function sendPaymentRequestEmail(params: {
  to: string
  nome: string
  incaricoId: string
  milestonNome: string
  importo: number
  paymentUrl: string
}) {
  const importoFormatted = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(params.importo / 100)

  const msg = {
    to: params.to,
    from: { email: FROM_EMAIL, name: APP_NAME },
    subject: `Richiesta pagamento - ${params.milestonNome}`,
    html: `
<h2>Richiesta di pagamento</h2>
<p>Ciao ${params.nome},</p>
<p>È stata completata la milestone <strong>${params.milestonNome}</strong> per l'incarico <strong>${params.incaricoId}</strong>.</p>
<p>Importo da pagare: <strong>${importoFormatted}</strong></p>
<a href="${params.paymentUrl}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">Paga Ora</a>
<p>Puoi effettuare il pagamento accedendo alla tua area riservata.</p>
    `,
  }

  await sgMail.send(msg)
}

/**
 * Invia notifica nuovo messaggio
 */
export async function sendNewMessageEmail(params: {
  to: string
  nome: string
  mittente: string
  incaricoId: string
  testo: string
  viewUrl: string
}) {
  const msg = {
    to: params.to,
    from: { email: FROM_EMAIL, name: APP_NAME },
    subject: `Nuovo messaggio da ${params.mittente}`,
    html: `
<h2>Nuovo messaggio</h2>
<p>Ciao ${params.nome},</p>
<p>Hai ricevuto un nuovo messaggio da <strong>${params.mittente}</strong> riguardo all'incarico <strong>${params.incaricoId}</strong>:</p>
<blockquote style="border-left:4px solid #2563eb;padding-left:16px;color:#666;font-style:italic;">${params.testo.substring(0, 200)}${params.testo.length > 200 ? '...' : ''}</blockquote>
<a href="${params.viewUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Leggi Messaggio</a>
    `,
  }

  await sgMail.send(msg)
}
```

### 6. Template Email (Opzionale)

Per email più complesse, puoi usare i **Dynamic Templates** di SendGrid:

1. **Dashboard SendGrid** → **Email API** → **Dynamic Templates**
2. Crea template con editor drag-and-drop
3. Usa nel codice:

```typescript
const msg = {
  to: params.to,
  from: FROM_EMAIL,
  templateId: 'd-xxxxxxxxxxxxx',
  dynamicTemplateData: {
    nome: params.nome,
    incaricoId: params.incaricoId,
    // ... altri dati
  },
}
```

### 7. Test Email

```bash
# Nel tuo ambiente dev, testa invio email
npm run dev

# Oppure usa SendGrid Test Email API
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "noreply@studio-romano.it"},
    "subject": "Test Email",
    "content": [{
      "type": "text/plain",
      "value": "This is a test email"
    }]
  }'
```

### 8. Monitoraggio Email

**Dashboard SendGrid** → **Activity**

Monitora:
- Email inviate
- Email consegnate
- Email aperte
- Click sui link
- Bounce (email non consegnate)
- Spam reports

### 9. Prezzi SendGrid

| Piano | Email/Mese | Prezzo |
|-------|------------|--------|
| Free | 3.000 (100/giorno) | €0 |
| Essentials | 50.000 | €14.95 |
| Pro | 100.000 | €89.95 |

Per MVP, il piano Free è sufficiente.

---

## 🔗 Integrazione Completa

### Variabili d'Ambiente Finali

File: `.env`
```env
# Database
DATABASE_URL="postgresql://studio_user:PASSWORD@localhost:5432/studio_erp"

# NextAuth
NEXTAUTH_URL="https://studio-romano.it"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_live_51xxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51xxxxxx"

# SendGrid
SENDGRID_API_KEY="SG.xxxxxx"
EMAIL_FROM="noreply@studio-romano.it"

# App
NEXT_PUBLIC_APP_URL="https://studio-romano.it"
NEXT_PUBLIC_APP_NAME="Studio Ing. Romano"
NODE_ENV="production"
```

### Test Flusso Completo

1. **Cliente acquista bundle**
   - Redirect a Stripe Checkout
   - Cliente paga con carta
   - Stripe webhook notifica app
   - App crea: Cliente, Incarico, Milestone, Utente COMMITTENTE
   - SendGrid invia email benvenuto

2. **Cliente attiva account**
   - Click su link email
   - Imposta password
   - Login nell'area riservata

3. **Titolare consegna documento**
   - Upload documento in area admin
   - Marca come "consegnato al cliente"
   - SendGrid invia notifica

4. **Cliente paga milestone**
   - Click "Paga" in dashboard
   - Redirect a Stripe Checkout
   - Pagamento completato
   - Webhook aggiorna milestone
   - SendGrid conferma pagamento

---

## ✅ Checklist Finale

- [ ] Account Stripe creato e verificato
- [ ] Webhook Stripe configurato
- [ ] Test pagamento con carta test
- [ ] Account SendGrid creato
- [ ] Dominio verificato su SendGrid
- [ ] Sender email verificato
- [ ] Test invio email
- [ ] Template email create
- [ ] Variabili d'ambiente configurate
- [ ] Flusso completo testato in staging

---

## 📚 Documentazione Ufficiale

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [SendGrid API Docs](https://docs.sendgrid.com/)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
