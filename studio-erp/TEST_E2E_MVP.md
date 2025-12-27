# 🧪 Test E2E Completo - MVP Studio ERP

**Data**: 2025-12-27
**Branch**: `claude/code-review-planning-2gHP2`
**Scenario**: Scenario B - MVP Completo (Sprints 9, 10, 11, 12)

---

## 📋 Checklist Pre-Test

### Ambiente
- [ ] Database PostgreSQL running
- [ ] Redis running (rate limiting)
- [ ] ClamAV daemon running
- [ ] Development server: `npm run dev`
- [ ] `.env` configurato con tutte le variabili

### Variabili d'Ambiente Necessarie
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SendGrid
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@studio-romano.it"
EMAIL_FROM_NAME="Studio Ing. Romano"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🎯 Test Suite Completa

### 1️⃣ Test Sprint 9 - Stripe Checkout Iniziale

#### Test 1.1: Flusso Acquisto Bundle Completo

**Prerequisiti**:
- Stripe in test mode
- Webhook Stripe configurato (usa Stripe CLI per local testing)

**Steps**:
1. Apri `http://localhost:3000`
2. Click su "Scopri i Servizi" o naviga a `/checkout`
3. Seleziona bundle "PROGETTO_BASE" (o altro bundle attivo)
4. Compila form con dati test:
   ```
   Nome: Mario
   Cognome: Rossi
   Email: mario.rossi@test.com
   Telefono: 3331234567
   Codice Fiscale: RSSMRA80A01H501U
   Indirizzo: Via Roma 1
   Città: Roma
   CAP: 00100
   ```
5. Click "Procedi al Pagamento"
6. Verifica redirect a Stripe Checkout
7. Usa carta test: `4242 4242 4242 4242`, exp: 12/34, CVC: 123
8. Completa il pagamento
9. Verifica redirect a `/checkout/success`

**Risultati Attesi**:
- ✅ Form validation OK
- ✅ Redirect a Stripe Checkout
- ✅ Pagamento completato
- ✅ Redirect a success page con messaggio di conferma
- ✅ Session ID visualizzato

**Database Checks** (tramite SQL):
```sql
-- Verifica cliente creato
SELECT * FROM clienti WHERE email = 'mario.rossi@test.com';

-- Verifica incarico creato
SELECT * FROM incarichi WHERE cliente_id = (SELECT id FROM clienti WHERE email = 'mario.rossi@test.com');

-- Verifica milestone create
SELECT * FROM milestone WHERE incarico_id IN (SELECT id FROM incarichi WHERE cliente_id = (SELECT id FROM clienti WHERE email = 'mario.rossi@test.com'));

-- Verifica utente COMMITTENTE creato
SELECT * FROM utenti WHERE email = 'mario.rossi@test.com';

-- Verifica prima milestone pagata
SELECT * FROM milestone WHERE stato = 'PAGATO' AND incarico_id IN (SELECT id FROM incarichi WHERE cliente_id = (SELECT id FROM clienti WHERE email = 'mario.rossi@test.com'));
```

**Risultati DB Attesi**:
- ✅ 1 Cliente creato con codice `CLI-XXXXXXXX`
- ✅ 1 Incarico creato con codice `INC-XXXXXXXX`, stato `ATTIVO`
- ✅ N Milestone create (basate sul bundle)
- ✅ Prima milestone con stato `PAGATO`
- ✅ Altre milestone con stato `NON_PAGATO`
- ✅ 1 Utente con ruolo `COMMITTENTE`, email = cliente email
- ✅ Cliente con `stato_accesso_portale = 'attivo'`

---

#### Test 1.2: API `/api/checkout/create-session`

**Manual API Test** (Postman/curl):
```bash
curl -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "bundleCode": "PROGETTO_BASE",
    "cliente": {
      "nome": "Test",
      "cognome": "API",
      "email": "test.api@example.com",
      "telefono": "3331234567",
      "codiceFiscale": "TSTAPI80A01H501U",
      "indirizzo": "Via Test 1",
      "citta": "Test City",
      "cap": "00100"
    }
  }'
```

**Risultato Atteso**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

#### Test 1.3: Stripe Webhook

**Setup Stripe CLI** (per local testing):
```bash
stripe listen --forward-to localhost:3000/api/cliente/pagamenti/webhook
# Copia il webhook secret e aggiorna STRIPE_WEBHOOK_SECRET in .env
```

**Test Webhook**:
1. Completa un pagamento (Test 1.1)
2. Verifica logs Stripe CLI:
   ```
   ✓ Event checkout.session.completed received
   ✓ Webhook handler returned 200
   ```
3. Verifica server logs:
   ```
   [Webhook] checkout.session.completed received
   [Webhook] Processing initial_purchase
   [Webhook] Cliente created: CLI-XXXXXXXX
   [Webhook] Incarico created: INC-XXXXXXXX
   [Webhook] Milestone created (x N)
   [Webhook] Utente created
   [Webhook] Email sent
   ```

**Risultato Atteso**:
- ✅ Webhook ricevuto e processato
- ✅ HTTP 200 returned
- ✅ Entità create in database
- ✅ Email inviata (check logs)

---

### 2️⃣ Test Sprint 11 - Email Notifiche

#### Test 2.1: Email Benvenuto (Welcome)

**Trigger**: Completare Test 1.1 (acquisto bundle)

**Verifica**:
1. Check server logs:
   ```
   [Email] Sending welcome email to mario.rossi@test.com
   [Email] Welcome email sent successfully, messageId: ...
   ```
2. Check email inbox (mario.rossi@test.com)
3. Verifica email ricevuta con:
   - Subject: "Benvenuto in Studio Ing. Romano - Incarico INC-XXXXXXXX"
   - Header con logo/nome studio
   - Messaggio di benvenuto personalizzato con nome
   - Box warning con credenziali temporanee
   - Email: mario.rossi@test.com
   - Password temporanea: (12 caratteri random)
   - Link "Accedi all'Area Riservata" → `/login`
   - Footer con contatti studio

**Risultato Atteso**:
- ✅ Email ricevuta entro 30 secondi
- ✅ Template HTML formattato correttamente
- ✅ Credenziali temporanee presenti
- ✅ Link funzionante
- ✅ Design professionale (logo, colori, spacing)

---

#### Test 2.2: Email Conferma Pagamento

**Trigger**: Pagare una milestone (non la prima)

**Steps**:
1. Login come COMMITTENTE (Test 1.1 credentials)
2. Vai a `/cliente/incarichi/[id]`
3. Click "Paga" su milestone successiva
4. Completa pagamento Stripe
5. Verifica email ricevuta

**Email Attesa**:
- Subject: "Pagamento Ricevuto - Milestone [NOME] - Incarico INC-XXXXXXXX"
- Dettagli pagamento: milestone, importo, data
- Link all'area riservata
- Contatti studio

**Risultato Atteso**:
- ✅ Email ricevuta
- ✅ Dati corretti (milestone, importo)
- ✅ Template HTML professionale

---

#### Test 2.3: Email Nuovo Documento

**Trigger**: Collaboratore carica documento per cliente

**Steps**:
1. Login come COLLABORATORE
2. Vai a gestione documenti incarico
3. Upload nuovo documento con categoria "RELAZIONE"
4. Approva documento
5. Verifica email cliente

**Email Attesa**:
- Subject: "Nuovo Documento Disponibile - Incarico INC-XXXXXXXX"
- Nome documento
- Categoria
- Link download

**Risultato Atteso**:
- ✅ Email ricevuta dal cliente
- ✅ Dettagli documento corretti

---

#### Test 2.4: Email Nuovo Messaggio

**Trigger**: Collaboratore invia messaggio

**Steps**:
1. Login come COLLABORATORE
2. Area messaggi incarico
3. Invia messaggio al cliente
4. Verifica email cliente

**Email Attesa**:
- Subject: "Nuovo Messaggio da [TECNICO] - Incarico INC-XXXXXXXX"
- Preview messaggio (primi 200 caratteri)
- Link messaggi area riservata

**Risultato Atteso**:
- ✅ Email ricevuta
- ✅ Preview messaggio corretta

---

#### Test 2.5: Test Email Manuale

**API Test**:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

**Risultato Atteso**:
```json
{
  "success": true,
  "message": "Test email sent",
  "to": "your-email@example.com",
  "messageId": "..."
}
```

**Email Attesa**:
- Subject: "Test Email - Studio Ing. Romano"
- Messaggio di test
- Template formattato

---

### 3️⃣ Test Sprint 10 - Real-time Messaging (Polling)

#### Test 3.1: Polling Automatico

**Steps**:
1. Login come COMMITTENTE
2. Vai a `/cliente/incarichi/[id]`
3. Sezione messaggi
4. Apri browser inspector → Network tab
5. Filtra richieste a `/api/cliente/messaggi`
6. Osserva polling ogni 5 secondi

**Risultato Atteso**:
- ✅ Richiesta GET ogni ~5 secondi
- ✅ URL: `/api/cliente/messaggi?incaricoId=X`
- ✅ Status: 200
- ✅ Response: `{success: true, data: [...]}`
- ✅ No errori console

---

#### Test 3.2: Auto-refresh Messaggi

**Steps**:
1. Login come COMMITTENTE (browser 1)
2. Login come COLLABORATORE (browser 2 / incognito)
3. Committente: apri messaggi incarico
4. Collaboratore: invia nuovo messaggio
5. Committente: aspetta max 5 secondi

**Risultato Atteso**:
- ✅ Nuovo messaggio appare automaticamente in browser 1
- ✅ No refresh manuale necessario
- ✅ Scroll automatico a nuovo messaggio
- ✅ Animazione smooth scroll

---

#### Test 3.3: Refresh Manuale

**Steps**:
1. Area messaggi
2. Click pulsante refresh (icona RefreshCw)
3. Verifica animazione spinning
4. Verifica messaggi aggiornati

**Risultato Atteso**:
- ✅ Icona spinning durante fetch
- ✅ Messaggi aggiornati
- ✅ Durata animazione ~500ms
- ✅ Testo "Aggiornamento..." durante fetch

---

#### Test 3.4: Real-time Indicator

**Verifica UI**:
- ✅ Pallino verde pulsante visibile
- ✅ Testo: "Messaggi aggiornati automaticamente ogni 5 secondi"
- ✅ Posizionato sopra input messaggio

---

#### Test 3.5: Invio Messaggio

**Steps**:
1. Area messaggi
2. Scrivi messaggio in textarea
3. Click "Invia" o premi Enter
4. Verifica invio

**Risultato Atteso**:
- ✅ Messaggio inviato
- ✅ Textarea svuotata
- ✅ Messaggio appare nella lista (fetch immediato)
- ✅ Enter invia, Shift+Enter va a capo

---

### 4️⃣ Test Sprint 12 - Preferenze Notifiche

#### Test 4.1: Accesso Pagina Preferenze

**Steps**:
1. Login come COMMITTENTE
2. Click link "Notifiche" in navbar
3. Verifica redirect a `/cliente/preferenze`

**Risultato Atteso**:
- ✅ Link visibile in navbar (icona Bell)
- ✅ Redirect corretto
- ✅ Pagina carica senza errori
- ✅ Loading state durante fetch

---

#### Test 4.2: Caricamento Preferenze

**Verifica UI**:
1. Pagina preferenze caricata
2. Verifica preferenze default (se nuovo utente)

**Stato Atteso**:
- ✅ Email Attive: ON (switch verde)
- ✅ Nuovo Documento: ON
- ✅ Nuovo Messaggio: ON
- ✅ Richiesta Pagamento: ON
- ✅ Cambio Stato Incarico: ON
- ✅ Richiesta Documento: ON
- ✅ No errori, no loading infinito

---

#### Test 4.3: Modifica Preferenze

**Steps**:
1. Pagina preferenze
2. Disattiva "Email Attive" (master switch)
3. Verifica tutti gli switch figli disabilitati (grayed out)
4. Riattiva "Email Attive"
5. Disattiva "Nuovo Messaggio"
6. Click "Salva Preferenze"
7. Verifica messaggio successo

**Risultato Atteso**:
- ✅ Master switch disabilita tutti i figli
- ✅ Switch individuali funzionano indipendentemente
- ✅ Alert successo verde: "Preferenze salvate con successo"
- ✅ Alert sparisce dopo 3 secondi
- ✅ Button "Salvataggio..." durante POST

---

#### Test 4.4: API Preferenze

**GET Test**:
```bash
curl http://localhost:3000/api/cliente/preferenze \
  -H "Cookie: next-auth.session-token=..."
```

**Risultato Atteso**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "utenteId": 5,
    "emailAttivo": true,
    "notificaNuovoDocumento": true,
    "notificaMessaggio": true,
    "notificaRichiestaPagamento": true,
    "notificaStatoIncarico": true,
    "notificaRichiestaDocumento": true
  }
}
```

**PATCH Test**:
```bash
curl -X PATCH http://localhost:3000/api/cliente/preferenze \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "emailAttivo": false
  }'
```

**Risultato Atteso**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Preferenze aggiornate con successo"
}
```

---

#### Test 4.5: Rispetto Preferenze Email

**Setup**:
1. Login come COMMITTENTE
2. Vai a preferenze
3. Disattiva "Nuovo Messaggio"
4. Salva

**Test**:
1. Logout
2. Login come COLLABORATORE
3. Invia messaggio al cliente
4. Verifica server logs:
   ```
   [Email] User test@example.com preference for messaggio: BLOCKED
   [Email] Skip message notification to test@example.com (user preference)
   ```
5. Verifica email NON ricevuta

**Risultato Atteso**:
- ✅ Email NON inviata
- ✅ Log "BLOCKED" visibile
- ✅ Messaggio comunque salvato in DB
- ✅ Visibile in area messaggi

---

#### Test 4.6: Preferenze Default per Nuovi Utenti

**Steps**:
1. Crea nuovo cliente (via checkout)
2. Login con credenziali temporanee
3. Vai a preferenze
4. Verifica tutte ON by default

**Risultato Atteso**:
- ✅ Row `preferenze_notifiche` creata automaticamente
- ✅ Tutti i campi = `true`
- ✅ Email inviate normalmente

---

### 5️⃣ Test Integrazione E2E

#### Test 5.1: Flusso Cliente Completo

**Scenario**: Dal primo acquisto al primo messaggio ricevuto

**Steps**:
1. Visitatore apre sito
2. Seleziona bundle
3. Checkout + pagamento
4. Riceve email benvenuto con credenziali
5. Login area riservata
6. Visualizza incarico
7. Visualizza milestone (prima pagata)
8. Visualizza documenti (vuoto)
9. Riceve messaggio da tecnico
10. Email notifica messaggio
11. Risponde al messaggio
12. Modifica preferenze (disattiva notifiche messaggi)
13. Riceve altro messaggio (no email)
14. Paga seconda milestone
15. Email conferma pagamento
16. Logout

**Risultato Atteso**: Tutto funziona senza errori

---

#### Test 5.2: Flusso Collaboratore

**Steps**:
1. Login collaboratore
2. Visualizza lista incarichi
3. Apre incarico cliente
4. Upload documento
5. Invia messaggio
6. Verifica email cliente (se preferenze ON)
7. Riceve risposta cliente

**Risultato Atteso**: Workflow completo funzionante

---

### 6️⃣ Test Sicurezza

#### Test 6.1: Rate Limiting

**Test**:
```bash
# 100 richieste in rapida successione
for i in {1..100}; do
  curl http://localhost:3000/api/bundle/PROGETTO_BASE
done
```

**Risultato Atteso**:
- Prime richieste: 200 OK
- Dopo limite: 429 Too Many Requests
- Header: `Retry-After: X`

---

#### Test 6.2: CSRF Protection

**Test**: Prova POST da origin diverso senza CSRF token

**Risultato Atteso**:
- ✅ Richiesta bloccata
- ✅ Error: CSRF token mismatch

---

#### Test 6.3: ClamAV Scan

**Test**:
1. Download EICAR test file
2. Upload come documento
3. Verifica scan

**Risultato Atteso**:
- ✅ File bloccato
- ✅ Error: Virus detected

---

#### Test 6.4: Audit Logging

**Verifica DB**:
```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
```

**Risultato Atteso**:
- ✅ Eventi registrati:
  - login
  - documento_upload
  - milestone_pagamento
  - preferenze_update

---

### 7️⃣ Test Performance

#### Test 7.1: Lighthouse Audit

**Steps**:
1. Apri Chrome DevTools
2. Lighthouse tab
3. Run audit su pagine chiave:
   - `/` (landing)
   - `/checkout`
   - `/cliente/dashboard`
   - `/cliente/preferenze`

**Risultato Atteso**:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

---

#### Test 7.2: Bundle Size

**Check**:
```bash
npm run build
```

**Risultato Atteso**:
- First Load JS: < 200 KB
- No warning bundle size

---

### 8️⃣ Test Browser Compatibility

**Browsers da testare**:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)

**Features da verificare**:
- Layout responsivo
- Switch funzionanti
- Polling messaggi
- Stripe checkout
- Email rendering

---

## 📊 Risultati Finali

### Checklist Completamento MVP

#### Funzionalità Core
- [ ] Acquisto bundle online funzionante
- [ ] Cliente creato automaticamente
- [ ] Incarico + milestone creati
- [ ] Utente COMMITTENTE generato
- [ ] Email benvenuto con credenziali
- [ ] Area cliente accessibile
- [ ] Messaggi real-time (polling)
- [ ] Preferenze notifiche UI
- [ ] Email rispettano preferenze

#### Sicurezza
- [ ] Rate limiting attivo
- [ ] CSRF protection verificato
- [ ] Audit log popolato
- [ ] ClamAV scansione documenti
- [ ] Session JWT sicure
- [ ] Password bcrypt hashed

#### Email Service
- [ ] SendGrid configurato
- [ ] 5 email templates funzionanti
- [ ] Fail-safe su errori
- [ ] Logging dettagliato
- [ ] HTML rendering corretto

#### UX
- [ ] Navigation intuitiva
- [ ] Loading states
- [ ] Error handling
- [ ] Success feedback
- [ ] Responsive design
- [ ] GDPR compliance notice

---

## 🐛 Bug Tracking

### Bug Trovati Durante Test

| # | Descrizione | Severity | Status | Fix Commit |
|---|-------------|----------|--------|------------|
| 1 | ... | ... | ... | ... |

*(Compila durante test)*

---

## 📝 Note Finali

### Problemi Noti
- Nessuno (da compilare durante test)

### Miglioramenti Futuri (Post-MVP)
- WebSocket per real-time vero (invece di polling)
- Email templates ancora più ricchi (immagini, CTA)
- Notifiche in-app (oltre email)
- Dashboard analytics cliente

### Performance Baseline
- Tempo caricamento dashboard: X ms
- Polling overhead: Y ms
- Email delivery time: Z secondi

---

**Test Completati**: ____ / ____
**Success Rate**: ____%
**Blockers**: _____
**MVP Ready**: ☐ YES  ☐ NO

---

**Tester**: Claude Code
**Data Inizio Test**: 2025-12-27
**Data Fine Test**: _______
