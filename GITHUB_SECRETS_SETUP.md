# 🔐 GitHub Secrets Configuration Guide
## Deploy Automatico Studio ERP su Hetzner

**Repository**: romanobenit/romanoing
**URL Secrets**: https://github.com/romanobenit/romanoing/settings/secrets/actions

---

## 📋 Secrets Obbligatori (15)

### 1. SSH_PRIVATE_KEY
**Descrizione**: Chiave privata SSH per accesso al server Hetzner

**Come ottenerla**:
```bash
# Dalla tua macchina locale (Windows/Linux/Mac)
cat ~/.ssh/id_rsa
# Oppure su Windows:
# type C:\Users\Romano\.ssh\id_rsa
```

**Valore**: Copia TUTTO il contenuto, incluse le righe:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

### 2. PRODUCTION_SERVER_IP
**Descrizione**: IP pubblico del server Hetzner

**Valore**: `116.203.10.59`

(Già presente nel DEPLOYMENT_GUIDE.md)

---

### 3. ANSIBLE_VAULT_PASSWORD
**Descrizione**: Password per cifrare secrets Ansible

**Come generarla**:
```bash
openssl rand -base64 32
```

**Formato**: 44 caratteri alfanumerici casuali (es: `XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx`)

⚠️ **IMPORTANTE**: Salva questa password in un password manager! Ti servirà anche per deploy manuali.

---

### 4. POSTGRESQL_PASSWORD
**Descrizione**: Password database PostgreSQL production

**Come generarla**:
```bash
openssl rand -base64 32
```

**Formato**: 44 caratteri alfanumerici casuali

⚠️ **IMPORTANTE**: Password database, salvala in password manager!

---

### 5. NEXTAUTH_SECRET
**Descrizione**: Secret per NextAuth.js (autenticazione)

**Come generarla**:
```bash
openssl rand -base64 32
```

**Formato**: 44 caratteri alfanumerici casuali

---

### 6. STRIPE_PUBLISHABLE_KEY
**Descrizione**: Chiave pubblica Stripe per pagamenti (LIVE mode)

**Come ottenerla**:
1. Vai su https://dashboard.stripe.com/
2. Disattiva **Test mode** (switch in alto a destra)
3. Vai su **Developers** → **API Keys**
4. Copia **Publishable key** (inizia con `pk_` + `live_` + caratteri alfanumerici)

**Formato**: La chiave pubblica Stripe inizia con prefisso `pk_` seguito da `live_` e 50+ caratteri alfanumerici

---

### 7. STRIPE_SECRET_KEY
**Descrizione**: Chiave segreta Stripe per pagamenti (LIVE mode)

**Come ottenerla**:
1. Nella stessa pagina (**API Keys**)
2. Clicca **Reveal live key** su **Secret key**
3. Copia la chiave (inizia con `sk_` + `live_` + caratteri alfanumerici)

**Formato**: La chiave Stripe live inizia con prefisso `sk_` seguito da `live_` e 50+ caratteri alfanumerici

⚠️ **ATTENZIONE**: Questa chiave NON deve mai essere committata nel codice!

---

### 8. STRIPE_WEBHOOK_SECRET
**Descrizione**: Secret per validare webhook Stripe

**Come ottenerla**:
1. Vai su **Developers** → **Webhooks**
2. Clicca **Add endpoint**
3. URL endpoint: `https://erp.studioromano.it/api/webhooks/stripe`
4. Eventi da selezionare:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clicca **Add endpoint**
6. Nella pagina del webhook, copia **Signing secret** (inizia con `whsec_`)

**Formato**: Webhook secret inizia con prefisso `whsec_` seguito da 50+ caratteri alfanumerici

⚠️ **NOTA**: Dovrai configurare il webhook DOPO il primo deploy (quando il dominio sarà attivo).
Per ora puoi usare un valore placeholder o lasciarlo vuoto.

---

### 9. SENDGRID_API_KEY
**Descrizione**: API Key SendGrid per invio email

**Come ottenerla**:
1. Vai su https://app.sendgrid.com/
2. **Settings** → **API Keys** → **Create API Key**
3. Nome: `studio-erp-production`
4. Permission: **Full Access** (o almeno **Mail Send**)
5. Clicca **Create & View**
6. Copia la chiave (inizia con `SG.`)

**Formato**: API key SendGrid nel formato `SG.` + 20 caratteri + `.` + 60 caratteri

⚠️ **IMPORTANTE**: SendGrid mostra la chiave UNA SOLA VOLTA. Salvala immediatamente!

**Alternative gratuite**:
- **SendGrid Free**: 100 email/giorno
- **Mailgun Free**: 100 email/giorno
- **Brevo (ex Sendinblue)**: 300 email/giorno

---

### 10. UPSTASH_REDIS_REST_URL
**Descrizione**: URL REST API Upstash Redis (rate limiting)

**Come ottenerla**:
1. Vai su https://console.upstash.com/
2. Crea account gratuito (se non hai)
3. **Create Database**:
   - Name: `studio-erp-production`
   - Type: **Regional**
   - Region: **EU-West-1** (più vicino a Germania)
   - TLS: **Enabled**
4. Nella dashboard del database, copia **UPSTASH_REDIS_REST_URL**

**Formato**: `https://eu1-xxxxx-xxxxx-12345.upstash.io`

---

### 11. UPSTASH_REDIS_REST_TOKEN
**Descrizione**: Token autenticazione Upstash Redis

**Come ottenerla**:
1. Nella stessa dashboard del database Upstash
2. Copia **UPSTASH_REDIS_REST_TOKEN**

**Formato**: `AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXxMA` (60+ caratteri)

---

### 12. HETZNER_API_TOKEN
**Descrizione**: API Token Hetzner Cloud (per provisioning/backup)

**Come ottenerla**:
1. Vai su https://console.hetzner.cloud/
2. Vai nel progetto **Studio-ERP-Production**
3. **Security** → **API Tokens** → **Generate API Token**
4. Nome: `GitHub Actions Deploy`
5. Permission: **Read & Write**
6. Copia il token

**Formato**: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (50 caratteri)

---

### 13. BACKUP_ENCRYPTION_PASSPHRASE
**Descrizione**: Passphrase per cifrare backup database con GPG

**Come generarla**:
```bash
openssl rand -base64 48
```

**Formato**: 64 caratteri alfanumerici casuali

⚠️ **CRITICO**: Senza questa passphrase NON potrai ripristinare i backup! Salvala in password manager!

---

### 14. GRAFANA_ADMIN_PASSWORD
**Descrizione**: Password admin Grafana (monitoring dashboards)

**Come generarla**:
```bash
openssl rand -base64 24
```

**Formato**: 32 caratteri alfanumerici casuali

⚠️ **NOTA**: Userai questa password per accedere a Grafana su `http://116.203.10.59:3001`

---

### 15. GITHUB_TOKEN
**Descrizione**: Token GitHub per CI/CD (già disponibile automaticamente)

**Valore**: `${{ secrets.GITHUB_TOKEN }}`

⚠️ **NON configurare manualmente**: GitHub lo fornisce automaticamente ad ogni workflow run.

---

## 🔧 Secrets Opzionali (5)

### 16. OPENAI_API_KEY (Opzionale)
**Descrizione**: API Key OpenAI per assistente AI (se abilitato)

**Come ottenerla**:
1. Vai su https://platform.openai.com/api-keys
2. **Create new secret key**
3. Nome: `studio-erp-production`
4. Copia la chiave (inizia con `sk-proj-`)

**Formato**: API key OpenAI nel formato `sk-proj-` seguito da 100+ caratteri alfanumerici

⚠️ **Costo**: OpenAI è a pagamento. Valuta se necessario.

---

### 17. SENTRY_DSN (Opzionale)
**Descrizione**: Data Source Name Sentry per error tracking

**Come ottenerla**:
1. Vai su https://sentry.io/
2. Crea progetto `studio-erp`
3. Copia **DSN** dalla dashboard

**Formato**: `https://XXXXXXXXXXXX@oXXXXXX.ingest.sentry.io/XXXXXX`

---

### 18. SENTRY_AUTH_TOKEN (Opzionale)
**Descrizione**: Auth token Sentry per notifiche deploy

**Come ottenerla**:
1. Sentry → **Settings** → **Auth Tokens**
2. **Create New Token**
3. Scopes: `project:releases`
4. Copia il token

---

### 19. SNYK_TOKEN (Opzionale)
**Descrizione**: Token Snyk per security scanning

**Come ottenerla**:
1. Vai su https://snyk.io/
2. Account Settings → **API Token**
3. Copia il token

**Formato**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID format)

---

## ✅ Checklist Configurazione

Prima di procedere al deploy, verifica di aver configurato:

### Obbligatori (15):
- [ ] SSH_PRIVATE_KEY
- [ ] PRODUCTION_SERVER_IP = `116.203.10.59`
- [ ] ANSIBLE_VAULT_PASSWORD
- [ ] POSTGRESQL_PASSWORD
- [ ] NEXTAUTH_SECRET
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET (anche placeholder temporaneo)
- [ ] SENDGRID_API_KEY
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] HETZNER_API_TOKEN
- [ ] BACKUP_ENCRYPTION_PASSPHRASE
- [ ] GRAFANA_ADMIN_PASSWORD
- [ ] GITHUB_TOKEN (automatico)

### Opzionali (4):
- [ ] OPENAI_API_KEY (se vuoi AI assistant)
- [ ] SENTRY_DSN (se vuoi error tracking)
- [ ] SENTRY_AUTH_TOKEN (se vuoi notifiche deploy)
- [ ] SNYK_TOKEN (se vuoi security scan avanzato)

---

## 🚀 Come Configurare i Secrets su GitHub

### Step 1: Vai alla pagina Secrets
```
https://github.com/romanobenit/romanoing/settings/secrets/actions
```

### Step 2: Crea ogni Secret
Per ogni secret nell'elenco sopra:

1. Clicca **New repository secret**
2. **Name**: Nome del secret (es: `POSTGRESQL_PASSWORD`)
3. **Value**: Valore generato/copiato seguendo le istruzioni sopra
4. Clicca **Add secret**

### Step 3: Verifica Secrets Configurati
Nella pagina Secrets dovresti vedere almeno 15 secrets (obbligatori).

⚠️ **NOTA**: GitHub NON mostra mai il valore dei secrets dopo la creazione (per sicurezza).

---

## 🔒 Sicurezza

### Best Practices:
- ✅ Salva TUTTI i secrets in un **password manager** (1Password, Bitwarden, LastPass)
- ✅ NON committare MAI secrets nel codice
- ✅ Usa secrets diversi per development/production
- ✅ Ruota periodicamente i secrets (ogni 3-6 mesi)
- ✅ Limita accesso GitHub repository a persone fidate
- ✅ Abilita 2FA su tutti gli account (GitHub, Stripe, Hetzner, ecc.)

### Cosa salvare nel Password Manager:
Crea una cartella **"Studio ERP Production"** e salva:
- Tutte le password generate (ANSIBLE_VAULT_PASSWORD, POSTGRESQL_PASSWORD, ecc.)
- Tutte le API keys (Stripe, SendGrid, Upstash, ecc.)
- URL Grafana + password admin
- Credenziali SSH server Hetzner
- URL repository GitHub

---

## 📞 Troubleshooting

**Q: Ho perso un secret, come lo recupero?**
A: I secrets GitHub NON sono recuperabili. Devi rigenerare la chiave dal servizio originale (Stripe, SendGrid, ecc.) e aggiornare il secret.

**Q: Stripe webhook secret non funziona**
A: Normale se non hai ancora fatto il primo deploy. Configuralo DOPO che il dominio `erp.studioromano.it` è attivo.

**Q: Upstash Redis free tier è sufficiente?**
A: Sì! Il free tier offre:
- 10,000 comandi/giorno
- 256 MB storage
- Più che sufficiente per rate limiting e cache sessioni

**Q: SendGrid richiede verifica dominio?**
A: Sì, per produzione. SendGrid ti chiederà di verificare il dominio `studioromano.it` aggiungendo record DNS (SPF, DKIM). Segui wizard SendGrid.

---

## 🎯 Prossimi Step

Dopo aver configurato tutti i secrets:

1. ✅ Verifica checklist completa
2. ✅ Fai merge del PR su `main`
3. ✅ Workflow GitHub Actions parte automaticamente
4. ✅ Monitora deploy su https://github.com/romanobenit/romanoing/actions
5. ✅ Dopo deploy, configura Stripe webhook
6. ✅ Test applicazione su https://erp.studioromano.it

---

**Fine guida**

Tempo stimato configurazione: **20-30 minuti** (prima volta)
