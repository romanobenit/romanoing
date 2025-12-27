# Test Manuali - Sprint Completati

## 🎯 Obiettivo
Verificare il corretto funzionamento di tutti gli sprint completati in ambiente staging/development.

---

## ✅ Sprint 1: Build TypeScript & Linting

### Test 1.1: Build Compilation
```bash
cd /home/user/romanoing/studio-erp
npm run build
```

**Risultato Atteso**:
- ✅ `✓ Compiled successfully`
- ✅ Nessun errore TypeScript
- ✅ Build completa senza crash

**Verifiche**:
- [ ] Build compila senza errori
- [ ] Nessun warning TypeScript critico
- [ ] Output in `.next/` generato

---

## 🔒 Sprint 2: Rate Limiting

### Test 2.1: Rate Limit su Login (5 req/min)
```bash
# Terminal 1: Avvia dev server
npm run dev

# Terminal 2: Test rate limit
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n" \
    -s | grep -E "(Status|error|RateLimit)"
  sleep 1
done
```

**Risultato Atteso**:
- ✅ Prime 5 richieste: Status 401 (Unauthorized)
- ✅ Richieste 6-10: Status 429 (Too Many Requests)
- ✅ Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

**Verifiche**:
- [ ] Rate limit attivo dopo 5 tentativi
- [ ] Response 429 con messaggio appropriato
- [ ] Headers rate limit presenti
- [ ] Retry-After header corretto

### Test 2.2: Rate Limit su API Pubbliche (100 req/min)
```bash
# Test API bundle (pubbliche)
for i in {1..105}; do
  curl -s http://localhost:3000/api/bundle \
    -w "\nStatus: %{http_code}\n" | tail -1
done | grep -c "429"
```

**Risultato Atteso**:
- ✅ Prime 100 richieste: Status 200
- ✅ Richieste 101+: Status 429

**Verifiche**:
- [ ] Limite a 100 richieste rispettato
- [ ] Response 429 dopo il limite
- [ ] In-memory fallback funziona senza Redis

### Test 2.3: Rate Limit su Upload (20/ora)
```bash
# Login come collaboratore
# Vai a /collaboratore/documenti
# Carica 21 file consecutivamente
```

**Risultato Atteso**:
- ✅ Primi 20 upload: Successo
- ✅ Upload 21: Rate limit error

**Verifiche**:
- [ ] Upload 1-20 vanno a buon fine
- [ ] Upload 21 viene bloccato con 429
- [ ] Messaggio utente chiaro sul rate limit
- [ ] Upload riprende dopo 1 ora

---

## 📝 Sprint 3: Audit Logging

### Test 3.1: Log Upload Documento
```sql
-- Prima: Count log esistenti
SELECT COUNT(*) FROM audit_log WHERE azione = 'UPLOAD';

-- Esegui: Carica un documento da /collaboratore/documenti

-- Dopo: Verifica nuovo log
SELECT
  id, utente_id, azione, entita, entita_id,
  dettagli, ip_address, user_agent, "createdAt"
FROM audit_log
WHERE azione = 'UPLOAD'
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Risultato Atteso**:
```json
{
  "id": 123,
  "utente_id": 1,
  "azione": "UPLOAD",
  "entita": "Documento",
  "entita_id": 45,
  "dettagli": {
    "nomeFile": "test.pdf",
    "categoria": "elaborato",
    "dimensione": 12345,
    "incaricoId": 5,
    "visibileCliente": true
  },
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0...",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Verifiche**:
- [ ] Log creato con azione = 'UPLOAD'
- [ ] Dettagli JSON completi
- [ ] IP e User-Agent tracciati
- [ ] Timestamp corretto

### Test 3.2: Log Download Documento
```sql
-- Esegui: Download/Visualizza un documento

-- Verifica log
SELECT * FROM audit_log
WHERE azione = 'DOWNLOAD'
ORDER BY "createdAt" DESC LIMIT 1;
```

**Risultato Atteso**:
- ✅ Log con azione = 'DOWNLOAD'
- ✅ Dettagli: nomeFile, disposition (inline/attachment), incaricoId

**Verifiche**:
- [ ] Log per visualizzazione (disposition=inline)
- [ ] Log per download (disposition=attachment)
- [ ] Dettagli completi tracciati

### Test 3.3: Log Pagamento Stripe
```bash
# Simula webhook Stripe
curl -X POST http://localhost:3000/api/cliente/pagamenti/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "amount_total": 50000,
        "currency": "eur",
        "metadata": {
          "milestoneId": "1",
          "incaricoId": "1"
        }
      }
    }
  }'
```

**Risultato Atteso**:
```sql
SELECT * FROM audit_log
WHERE azione = 'PAYMENT'
ORDER BY "createdAt" DESC LIMIT 1;
```

**Verifiche**:
- [ ] Log pagamento creato
- [ ] Dettagli: stripeSessionId, importo, valuta
- [ ] Associato a milestone corretta

---

## 🎨 Sprint 4: Type Safety

### Test 4.1: Verifica Type Errors
```bash
# Compila TypeScript
npm run build 2>&1 | grep "Type error"
```

**Risultato Atteso**:
- ✅ Nessun errore nei file aggiornati:
  - `collaboratore/documenti/page.tsx`
  - `cliente/dashboard/page.tsx`

**Verifiche**:
- [ ] Build senza errori TypeScript
- [ ] Autocompletamento IDE funziona
- [ ] Nessun errore runtime per type mismatch

### Test 4.2: Verifica Interfacce Condivise
```typescript
// In console TypeScript o IDE
import { Documento, Incarico } from '@/types/documento'

const doc: Documento = {
  id: 1,
  nomeFile: "test.pdf",
  categoria: "elaborato",
  // ... verifica autocompletamento
}
```

**Verifiche**:
- [ ] Import types/documento.ts funziona
- [ ] Autocompletamento mostra tutte le proprietà
- [ ] Campi opzionali gestiti correttamente

---

## 🛡️ Sprint 7: CSRF Protection

### Test 7.1: CSRF Headers Presenti
```bash
# Verifica security headers
curl -I http://localhost:3000

# Verifica API response headers
curl -I -X GET http://localhost:3000/api/bundle
```

**Risultato Atteso**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: on
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-CSRF-Token: [UUID]
```

**Verifiche**:
- [ ] Tutti i security headers presenti
- [ ] X-CSRF-Token generato (UUID)
- [ ] Headers applicati a tutte le route

### Test 7.2: CSRF Protection POST da Origin Esterna
```bash
# POST da origin non permesso (simula CSRF attack)
curl -X POST http://localhost:3000/api/collaboratori \
  -H "Origin: http://evil.com" \
  -H "Content-Type: application/json" \
  -H "Cookie: session-token=..." \
  -d '{"test":"data"}'
```

**Risultato Atteso**:
```json
{
  "success": false,
  "error": "CSRF validation failed: Invalid origin"
}
```
**Status**: 403 Forbidden

**Verifiche**:
- [ ] Request da origin esterno bloccato
- [ ] Status 403
- [ ] Messaggio errore chiaro
- [ ] Log CSRF warning in console server

### Test 7.3: CSRF Protection POST da Origin Valido
```bash
# POST da origin permesso
curl -X POST http://localhost:3000/api/documenti/123/approve \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Cookie: session-token=..." \
  -d '{}'
```

**Risultato Atteso**:
- ✅ Request permessa (se autenticato)
- ✅ Status 200 o 401 (se non autenticato)
- ✅ NO 403 CSRF error

**Verifiche**:
- [ ] Request da localhost permessa
- [ ] CSRF check passa per origin valido
- [ ] Verifica solo auth, non CSRF

### Test 7.4: Webhook Stripe Escluso da CSRF
```bash
# Webhook Stripe (origin esterno, ma escluso da CSRF)
curl -X POST http://localhost:3000/api/cliente/pagamenti/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: whsec_..." \
  -d '{"type":"test"}'
```

**Risultato Atteso**:
- ✅ Request NON bloccata da CSRF
- ✅ Verifica solo Stripe signature
- ✅ Path `/api/cliente/pagamenti/webhook` escluso da CSRF

**Verifiche**:
- [ ] Webhook Stripe funziona
- [ ] Nessun errore CSRF 403
- [ ] Solo validazione signature Stripe

---

## 🧪 Test Integrazione Completa

### Test I.1: Flusso Upload + Audit + Rate Limit
1. Login come TITOLARE
2. Vai a `/collaboratore/documenti`
3. Carica 5 documenti consecutivamente
4. Per ogni upload:
   - [ ] Rate limit non blocca (sotto limite 20/ora)
   - [ ] Audit log creato
   - [ ] File salvato correttamente
5. Verifica database:
```sql
SELECT COUNT(*) FROM audit_log
WHERE azione = 'UPLOAD'
AND "createdAt" > NOW() - INTERVAL '5 minutes';
-- Expected: 5
```

### Test I.2: Flusso Download + Audit
1. Visualizza un documento (inline)
2. Scarica un documento (attachment)
3. Verifica audit log:
```sql
SELECT azione, dettagli->>'disposition' as disposition
FROM audit_log
WHERE entita = 'Documento'
AND "createdAt" > NOW() - INTERVAL '5 minutes'
ORDER BY "createdAt" DESC;

-- Expected:
-- DOWNLOAD | attachment
-- DOWNLOAD | inline
```

### Test I.3: Flusso Login + Rate Limit + CSRF
1. Logout completamente
2. Prova login 6 volte con password errata
3. Verifica:
   - [ ] Primi 5: Status 401
   - [ ] Sesto: Status 429 (rate limited)
4. Attendi 1 minuto
5. Prova login con credenziali corrette
6. Verifica:
   - [ ] Login riuscito
   - [ ] Session creata
   - [ ] Headers CSRF presenti

---

## 📊 Checklist Finale

### Build & Deploy
- [ ] `npm run build` completa senza errori
- [ ] `npm run lint` passa (o solo warnings accettabili)
- [ ] Nessun errore TypeScript

### Sicurezza
- [ ] Rate limiting funziona su tutte le API
- [ ] CSRF protection blocca origin esterni
- [ ] Security headers presenti su tutte le response
- [ ] Audit logging traccia tutte le azioni critiche

### Funzionalità
- [ ] Upload documenti funziona
- [ ] Download documenti funziona (inline + attachment)
- [ ] Login/Logout funziona
- [ ] Dashboard mostra dati correttamente

### Database
- [ ] Audit log popolato correttamente
- [ ] Query audit log performanti
- [ ] Dettagli JSON ben formattati

---

## 🔧 Troubleshooting

### Rate Limiting Non Funziona
```bash
# Verifica Redis (se in produzione)
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# In development usa in-memory (dovrebbe sempre funzionare)
# Check console per "[Ratelimit]" logs
```

### CSRF Blocca Request Valide
```bash
# Verifica env vars
echo $NEXT_PUBLIC_APP_URL
echo $NEXTAUTH_URL

# Verifica che Origin header sia corretto
curl -v http://localhost:3000/api/test | grep "Origin"
```

### Audit Log Non Crea Record
```sql
-- Verifica tabella esiste
SELECT COUNT(*) FROM audit_log;

-- Verifica permessi
INSERT INTO audit_log (utente_id, azione, entita, entita_id, "createdAt")
VALUES (1, 'TEST', 'Test', 1, NOW());
```

---

## 📈 Metriche Success

### Obiettivi Minimi
- [ ] Build compila: ✅
- [ ] Rate limit attivo: ✅
- [ ] CSRF blocca attacchi: ✅
- [ ] Audit log funziona: ✅
- [ ] Type safety migliorata: ✅

### Obiettivi Ideali
- [ ] Zero errori TypeScript
- [ ] 100% coverage audit logging
- [ ] Response time < 200ms (con rate limit)
- [ ] Security score A+

---

## 🚀 Prossimi Passi

Dopo aver completato tutti i test:
1. Documentare eventuali bug trovati
2. Creare issue per fix necessari
3. Aggiornare documentazione con findings
4. Procedere con deploy in staging
5. Pianificare deploy in produzione
