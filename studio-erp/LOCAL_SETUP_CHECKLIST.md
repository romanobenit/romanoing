# ✅ Checklist Setup Locale - Studio ERP

**Data**: 2025-12-27
**Versione**: 1.0

---

## 📋 Operazioni da Eseguire Localmente

### 1. Pull delle Modifiche da GitHub ✅

```bash
cd /path/to/romanoing/studio-erp

# Pull branch con tutte le modifiche
git checkout claude/code-review-planning-2gHP2
git pull origin claude/code-review-planning-2gHP2
```

**Commit ricevuti**:
- `62429c6` - Compliance E-Commerce + Documenti Legali
- `8cb4f6f` - Documentazione ISO 27001 completa
- `a97cce3` - Piano deployment Hetzner ISO compliant
- `025747f` - Catalogo bundle completo (8 bundle)

---

### 2. Verifica Database Locale 🗄️

```bash
# Controlla se PostgreSQL è in esecuzione
pg_isready

# Se non è running, avvialo:
# macOS:
brew services start postgresql@16

# Linux (Ubuntu/Debian):
sudo systemctl start postgresql

# Windows:
# Avvia PostgreSQL service da Services panel
```

---

### 3. Importa Catalogo Bundle Aggiornato ⚙️

**IMPORTANTE**: Devi importare il catalogo con **8 bundle** (include 2 nuovi: CONSULENZA ed EFFICIENTAMENTO ENERGETICO).

#### Opzione A: Script npm (raccomandato)

```bash
# Verifica che DATABASE_URL sia configurato in .env
cat .env | grep DATABASE_URL

# Importa bundle (cancella vecchi + inserisce 8 nuovi)
npm run db:update-bundle
```

**Output atteso**:
```
DELETE 6  (o numero bundle vecchi)
INSERT 0 8  (8 bundle nuovi)
```

#### Opzione B: Manuale con psql

```bash
# Verifica DATABASE_URL
source .env  # oppure export $(cat .env | xargs)

# Importa SQL
psql $DATABASE_URL -f prisma/update-bundle-completo.sql

# Oppure se hai credenziali separate:
psql -h localhost -U postgres -d studio_erp -f prisma/update-bundle-completo.sql
```

---

### 4. Verifica Bundle Importati ✅

```bash
# Controlla che ci siano 8 bundle attivi
psql $DATABASE_URL -c "SELECT codice, nome, prezzo_min, prezzo_max, fase_mvp FROM bundle ORDER BY fase_mvp, codice;"
```

**Output atteso** (8 bundle):
```
      codice          |              nome                | prezzo_min | prezzo_max | fase_mvp
----------------------+----------------------------------+------------+------------+----------
 BDL-CONSULENZA       | Consulenza Tecnica Iniziale      |        180 |        600 |        1
 BDL-AGIBILITA        | Certificato di Agibilità         |        800 |       2500 |        1
 BDL-SANATORIA        | Sanatoria Edilizia               |       1200 |       3500 |        2
 BDL-RISTRUTTURAZIONE | Ristrutturazione Completa        |       2500 |      12000 |        2
 BDL-AMPLIAMENTO      | Ampliamento Produttivo           |       3500 |      15000 |        2
 BDL-DUE-DILIGENCE    | Due Diligence Immobiliare        |       2000 |       8000 |        2
 BDL-COLLAUDO         | Collaudo Statico                 |       1500 |       5000 |        2
 BDL-EFF-ENERGETICO   | Efficientamento Energetico       |       3000 |      18000 |        3
(8 righe)
```

**Se vedi meno di 8 bundle**: Riesegui import (punto 3).

**Se vedi bundle vecchi** (es. `BDL-AMPL-PRODUTTIVO`, `BDL-COLLAUDO-STATICO`):
- Il DELETE non ha funzionato
- Elimina manualmente: `DELETE FROM bundle WHERE codice LIKE 'BDL-%';`
- Riesegui import

---

### 5. Verifica Prisma Migration 🔄

```bash
# Controlla status migration
npx prisma migrate status

# Se ci sono migration pending:
npx prisma migrate deploy

# Rigenera Prisma Client (importante dopo cambio DB)
npx prisma generate
```

**Output atteso**:
```
Database schema is up to date!
✔ Generated Prisma Client
```

---

### 6. Test Applicazione Locale 🧪

```bash
# Installa dipendenze (se primo pull)
npm install

# Build applicazione
npm run build

# Avvia server development
npm run dev
```

**Apri browser**: http://localhost:3000

#### Test Rapidi:

1. **Login** → http://localhost:3000/auth/signin
   - Usa credenziali utente test (se esistono)
   - O crea nuovo account

2. **Catalogo Bundle** → http://localhost:3000/bundles (o pagina pubblica)
   - Verifica che ci siano **8 bundle**
   - Verifica prezzi aggiornati

3. **Crea Incarico** (se loggato come TITOLARE)
   - Vai a dashboard → Nuovo Incarico
   - Verifica dropdown bundle mostra 8 opzioni
   - Testa creazione incarico con nuovo bundle (es. BDL-CONSULENZA)

4. **Upload Documento**
   - Carica PDF di test
   - Verifica ClamAV scan funziona (no errori)

5. **Audit Log**
   - Verifica che azioni siano loggate
   - `SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 10;`

---

### 7. Verifica Environment Variables 🔑

Controlla che `.env` contenga tutte le variabili necessarie:

```bash
# Variabili obbligatorie
cat .env
```

**Checklist .env**:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studio_erp"

# NextAuth
NEXTAUTH_SECRET="..." # min 32 caratteri random
NEXTAUTH_URL="http://localhost:3000"

# Stripe (test mode per sviluppo locale)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # da stripe CLI: stripe listen

# Email (SendGrid - opzionale per sviluppo)
SENDGRID_API_KEY="SG...." # o lascia vuoto per test

# OpenAI (opzionale)
OPENAI_API_KEY="sk-..." # o lascia vuoto

# Upstash Redis (rate limiting - opzionale locale)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Sentry (error tracking - opzionale locale)
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

**Se mancano variabili**:
```bash
# Copia da template
cp .env.example .env

# Genera NEXTAUTH_SECRET
openssl rand -base64 32

# Configura Stripe test keys da https://dashboard.stripe.com/test/apikeys
```

---

### 8. Test Stripe Webhook (Locale) 💳

Se vuoi testare pagamenti localmente:

```bash
# Installa Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Linux/Windows:
# https://stripe.com/docs/stripe-cli

# Login Stripe
stripe login

# Forward webhook a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output:
# > Ready! Your webhook signing secret is whsec_xxxxx
# Copia whsec_xxxxx in .env come STRIPE_WEBHOOK_SECRET

# In un altro terminale, testa webhook:
stripe trigger checkout.session.completed
```

**Verifica**:
- Log applicazione mostra "Webhook received: checkout.session.completed"
- Milestone aggiornata a PAGATA
- Fattura generata (se implementato)

---

### 9. (Opzionale) Reset Database Completo 🔄

Se vuoi ripartire da zero:

```bash
# ATTENZIONE: Cancella TUTTI i dati

# Drop e ricrea database
dropdb studio_erp
createdb studio_erp

# Applica schema + migration
npx prisma migrate deploy

# Seed dati iniziali (utente test, bundle)
psql $DATABASE_URL -f prisma/seed.sql
npm run db:update-bundle  # Import 8 bundle

# Crea utente test (opzionale)
psql $DATABASE_URL -f prisma/create-test-user.sql
```

---

## 🎯 Checklist Finale

Prima di considerare "setup locale completo":

- [ ] Git pull completato (commit `62429c6` presente)
- [ ] PostgreSQL running
- [ ] Database `studio_erp` esiste
- [ ] 8 bundle importati (query verifica eseguita)
- [ ] Prisma migration status: "up to date"
- [ ] Prisma Client regenerato
- [ ] `.env` configurato con tutte le variabili
- [ ] `npm install` eseguito
- [ ] `npm run build` successful
- [ ] `npm run dev` parte senza errori
- [ ] Login funziona (http://localhost:3000/auth/signin)
- [ ] Catalogo bundle mostra 8 bundle
- [ ] Creazione incarico funziona
- [ ] Upload documento funziona (ClamAV scan)
- [ ] Stripe webhook test (opzionale)

---

## 🆘 Troubleshooting

### Errore: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Errore: "Database schema is not in sync"

```bash
npx prisma migrate deploy
npx prisma generate
```

### Errore: Bundle non aggiornati (ancora 6 invece di 8)

```bash
# Verifica file SQL esiste
ls -la prisma/update-bundle-completo.sql

# Re-import forzato
psql $DATABASE_URL -c "DELETE FROM bundle WHERE codice LIKE 'BDL-%';"
npm run db:update-bundle
```

### Errore: "429 Too Many Requests" al login

Rate limiting troppo aggressivo in development. Già fixato in `lib/rate-limit.ts`:
- Development: 100 req/min (permissivo)
- Production: 5 req/min (sicuro)

Se persiste:
```bash
# Verifica NODE_ENV
echo $NODE_ENV  # dovrebbe essere "development" o vuoto

# Se è "production" in locale, cambia in .env:
echo "NODE_ENV=development" >> .env
```

### Errore: PostgreSQL connection refused

```bash
# Verifica status
pg_isready

# Se offline, avvia:
# macOS:
brew services start postgresql@16

# Linux:
sudo systemctl start postgresql
sudo systemctl enable postgresql  # auto-start on boot

# Windows:
# Services panel → PostgreSQL → Start
```

### Errore: "relation 'bundle' does not exist"

Database non inizializzato:
```bash
# Applica schema completo
psql $DATABASE_URL -f prisma/schema.sql

# O usa Prisma migrate
npx prisma migrate deploy
```

---

## 📞 Supporto

Se hai problemi:
1. Controlla log applicazione: `npm run dev` (terminale output)
2. Controlla log PostgreSQL: `tail -f /var/log/postgresql/postgresql-16-main.log` (Linux)
3. Controlla Sentry dashboard (se configurato): https://sentry.io
4. GitHub Issues: https://github.com/romanobenit/romanoing/issues

---

**Ultimo aggiornamento**: 2025-12-27
**Versione**: 1.0

**End of Document**
