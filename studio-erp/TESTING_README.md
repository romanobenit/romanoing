# 🧪 Testing Guide - MVP Studio ERP

Questa guida spiega come eseguire tutti i test per validare Sprint 9-12.

---

## 📁 Test Scripts Disponibili

### 1. `validate-sprint9.sh` - Validazione Statica
**Non richiede server in esecuzione**

Verifica che tutti i file, dipendenze e implementazioni siano presenti:
- ✅ Files Sprint 9-12
- ✅ Dipendenze npm
- ✅ Implementazione webhook
- ✅ Bugfix timestamp
- ✅ Rate limiting fix
- ✅ Documentazione

```bash
cd studio-erp
./validate-sprint9.sh
```

**Output atteso**: `30/30 checks passati`

---

### 2. `test-e2e-sprint9.sh` - Test E2E Automatici
**Richiede server in esecuzione**

Testa le API e il database:
- ✅ Connessione database
- ✅ API `/api/checkout/create-session`
- ✅ API bundle pubbliche
- ✅ Rate limiting
- ✅ Files critici
- ✅ Variabili d'ambiente
- ✅ Schema database

**Prerequisiti**:
1. File `.env.local` configurato
2. Database running
3. Server dev: `npm run dev`

**Esecuzione**:
```bash
# Terminal 1: Server
cd studio-erp
npm run dev

# Terminal 2: Test
cd studio-erp
./test-e2e-sprint9.sh
```

---

## 🔧 Setup Environment Variables

Prima di eseguire `test-e2e-sprint9.sh`, crea `.env.local`:

```bash
# studio-erp/.env.local

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studio_erp"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Stripe (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Ottenuto da Stripe CLI

# SendGrid
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@studio-romano.it"
EMAIL_FROM_NAME="Studio Ing. Romano"

# Redis (opzionale, per rate limiting production)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**Genera NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

---

## 🧪 Test Workflow Completo

### Step 1: Validazione Statica
```bash
./validate-sprint9.sh
```
✅ Assicurati che tutti i 30 check passino

### Step 2: Setup Environment
- Crea `.env.local`
- Configura tutte le variabili
- Verifica DATABASE_URL corretto

### Step 3: Avvia Database e Server
```bash
# Assicurati che PostgreSQL sia in esecuzione
psql $DATABASE_URL -c "SELECT 1;"  # Test connessione

# Avvia dev server
npm run dev
```

### Step 4: Test Automatici E2E
```bash
./test-e2e-sprint9.sh
```

Se fallisce:
- Verifica `.env.local`
- Verifica database connesso
- Verifica server su port 3000
- Leggi errori specifici nello script output

### Step 5: Test Manuali Browser

#### 5A. Test Checkout Flow Completo

1. **Apri Checkout**
   ```
   http://localhost:3000/checkout
   ```

2. **Compila Form**
   - Seleziona bundle: PROGETTO_BASE
   - Nome: Test
   - Cognome: E2E
   - Email: `test-$(date +%s)@example.com`
   - Telefono: 3331234567
   - Codice Fiscale: TSTTS180A01H501U
   - Indirizzo: Via Test 1
   - Città: Roma
   - CAP: 00100

3. **Click "Procedi al Pagamento"**
   - Verifica redirect a Stripe Checkout

4. **Compila Carta Test Stripe**
   - Numero: `4242 4242 4242 4242`
   - Exp: `12/34`
   - CVC: `123`
   - Nome: `Test User`

5. **Completa Pagamento**
   - Click "Pay"
   - Verifica redirect a `/checkout/success`

6. **Verifica Success Page**
   - ✅ Messaggio di conferma
   - ✅ Istruzioni "Controlla email"
   - ✅ Link "Accedi all'Area Riservata"
   - ✅ Session ID visualizzato

#### 5B. Verifica Database (Post-Checkout)

```sql
-- Trova ultimo cliente creato
SELECT * FROM clienti ORDER BY id DESC LIMIT 1;

-- Trova incarico associato
SELECT * FROM incarichi WHERE cliente_id = (SELECT id FROM clienti ORDER BY id DESC LIMIT 1);

-- Verifica milestone
SELECT * FROM milestone WHERE incarico_id = (SELECT id FROM incarichi ORDER BY id DESC LIMIT 1);

-- Verifica utente COMMITTENTE
SELECT * FROM utenti WHERE email = 'test-XXXXXXX@example.com';

-- Verifica stato prima milestone
SELECT codice, nome, stato, importo
FROM milestone
WHERE incarico_id = (SELECT id FROM incarichi ORDER BY id DESC LIMIT 1)
ORDER BY codice;
```

**Risultati Attesi**:
- ✅ 1 Cliente creato (codice CLI-XXXXXXXX)
- ✅ 1 Incarico (codice INC-XXXXXXXX, stato ATTIVO)
- ✅ N Milestone (dal bundle JSON)
- ✅ Prima milestone: stato = PAGATO
- ✅ Altre milestone: stato = NON_PAGATO
- ✅ 1 Utente (ruolo COMMITTENTE, email = cliente email)

#### 5C. Verifica Email (Se SendGrid Configurato)

Controlla inbox di `test-XXXXXXX@example.com`:

**Email Benvenuto**:
- ✅ Subject: "Benvenuto in Studio Ing. Romano - Incarico INC-XXXXXXXX"
- ✅ Credenziali temporanee presenti
- ✅ Password temporanea (12 caratteri)
- ✅ Link "Accedi all'Area Riservata"
- ✅ Template HTML formattato

#### 5D. Test Login Cliente

1. **Vai a** `/login`
2. **Usa credenziali email**:
   - Email: da email benvenuto
   - Password: da email benvenuto
3. **Login**
4. **Verifica redirect** a `/cliente/dashboard`
5. **Verifica incarico visibile**

#### 5E. Test Preferenze Notifiche

1. **Login come COMMITTENTE**
2. **Click "Notifiche" in navbar**
3. **Verifica UI**:
   - ✅ Switch "Email Attive"
   - ✅ 5 switch per tipi notifica
   - ✅ Tutti ON by default
4. **Modifica preferenze**:
   - Disattiva "Nuovo Messaggio"
   - Click "Salva"
   - Verifica alert successo verde
5. **Ricarica pagina**:
   - Verifica preferenza salvata

#### 5F. Test Real-time Messaging

**Prerequisiti**: 2 browser (o 1 normale + 1 incognito)

1. **Browser 1**: Login COMMITTENTE
2. **Browser 2**: Login COLLABORATORE
3. **Browser 2**: Invia messaggio al cliente
4. **Browser 1**: Aspetta max 5 secondi
5. **Verifica**:
   - ✅ Messaggio appare automaticamente
   - ✅ Scroll automatico a nuovo messaggio
   - ✅ Indicatore real-time visibile

---

## 🔗 Test Webhook Stripe (Locale)

Per testare il webhook in locale, usa Stripe CLI:

### Setup Stripe CLI

1. **Installa Stripe CLI**:
   ```bash
   # Mac
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Vedi: https://stripe.com/docs/stripe-cli
   ```

2. **Login Stripe**:
   ```bash
   stripe login
   ```

3. **Forward Webhook a localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/cliente/pagamenti/webhook
   ```

4. **Copia webhook secret**:
   ```
   Your webhook signing secret is whsec_... (copy this)
   ```

5. **Aggiungi a .env.local**:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

6. **Restart server**:
   ```bash
   # Ctrl+C nel terminal server
   npm run dev
   ```

### Test Webhook

1. **Esegui checkout** (browser)
2. **Verifica logs Stripe CLI**:
   ```
   [200] POST /api/cliente/pagamenti/webhook [evt_...]
   ```

3. **Verifica server logs**:
   ```
   [Webhook] checkout.session.completed received
   [Webhook] Processing initial_purchase
   [Webhook] Cliente created: CLI-XXXXXXXX
   [Webhook] Incarico created: INC-XXXXXXXX
   [Webhook] Milestone created (x N)
   [Webhook] Utente created
   [Email] Sending welcome email...
   ```

---

## 🐛 Troubleshooting

### Test Automatici Falliscono

**"Server NON in esecuzione"**
- Avvia `npm run dev`
- Verifica porta 3000 libera: `lsof -i :3000`

**"Database NON connesso"**
- Verifica PostgreSQL running: `pg_isready`
- Verifica DATABASE_URL in `.env.local`
- Test connessione: `psql $DATABASE_URL -c "SELECT 1;"`

**"API create-session NON funziona"**
- Verifica STRIPE_SECRET_KEY in `.env.local`
- Verifica bundle PROGETTO_BASE esiste in DB
- Check server logs per errori

### Checkout Fallisce

**"Redirect a Stripe non funziona"**
- Verifica STRIPE_PUBLISHABLE_KEY in `.env.local`
- Check console browser per errori JavaScript
- Verifica API response in Network tab

**"Webhook non riceve eventi"**
- Verifica Stripe CLI running: `stripe listen`
- Verifica STRIPE_WEBHOOK_SECRET corretto
- Check server logs per errori webhook

### Email Non Arrivano

**"Email non ricevuta"**
- Verifica SENDGRID_API_KEY configurato
- Verifica dominio email verificato in SendGrid
- Check server logs: `[Email] Sending...`
- Verifica spam folder

**"Email bloccata da preferenze"**
- Login cliente
- Vai a `/cliente/preferenze`
- Verifica "Email Attive" = ON
- Verifica tipo specifico = ON

### Login Non Funziona

**"429 Too Many Requests"**
- Fix già applicato (100 req/min in dev)
- Se persiste, restart server
- Clear browser cache

**"Credenziali errate"**
- Verifica email da email benvenuto
- Verifica password temporanea
- Case sensitive!

---

## 📊 Test Checklist Completo

### Validazione Statica
- [ ] `./validate-sprint9.sh` passa (30/30)

### Setup
- [ ] `.env.local` creato e configurato
- [ ] Database running e connesso
- [ ] Server dev avviato su :3000
- [ ] Stripe CLI configurato (opzionale)

### Test Automatici
- [ ] `./test-e2e-sprint9.sh` passa

### Test Manuali Browser
- [ ] Checkout flow completo
- [ ] Pagamento Stripe con carta test
- [ ] Success page visualizzata
- [ ] Database: cliente/incarico/milestone creati
- [ ] Email benvenuto ricevuta
- [ ] Login cliente funziona
- [ ] Dashboard mostra incarico
- [ ] Preferenze notifiche salvano
- [ ] Messaging real-time funziona

### Test Webhook (con Stripe CLI)
- [ ] Webhook riceve evento
- [ ] Server processa initial_purchase
- [ ] Tutte le entity create
- [ ] Email inviata

### Test Performance (opzionale)
- [ ] Lighthouse audit > 80
- [ ] Bundle size < 200KB
- [ ] Time to interactive < 3s

---

## ✅ Success Criteria

**Test E2E Considerati Passati Se**:

1. ✅ Validazione statica: 30/30
2. ✅ Test automatici: Tutti passati
3. ✅ Checkout completo: Cliente/Incarico creati
4. ✅ Email benvenuto: Ricevuta con credenziali
5. ✅ Login: Funziona con password temporanea
6. ✅ Preferenze: Salvano e applicano
7. ✅ Messaging: Polling funziona (< 5s latenza)
8. ✅ No errori console browser
9. ✅ No errori 500 server logs

**MVP Pronto per Deploy Se**:
- Tutti i criteri sopra ✅
- Database production configurato
- Stripe production keys configurate
- SendGrid domain verificato
- DNS configurato con SSL

---

**Creato**: 2025-12-27
**Versione**: 1.0
**Sprint**: 9-12 Complete
