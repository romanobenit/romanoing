# 📚 Documentazione Studio ERP

Guida completa alla configurazione e deployment della piattaforma.

---

## 📖 Indice Guide

### 🏗️ Setup Sviluppo
1. **[Setup Database Locale](./setup-database.md)**
   - Installazione PostgreSQL
   - Configurazione database
   - Migrazioni Prisma
   - Seed dati iniziali
   - **Tempo stimato**: 30 minuti

### 🚀 Setup Produzione
2. **[Setup Produzione Hetzner](./setup-produzione-hetzner.md)**
   - Creazione VPS Hetzner
   - Configurazione server Ubuntu
   - Installazione Node.js, PostgreSQL, Nginx
   - Setup SSL con Let's Encrypt
   - Deploy applicazione Next.js
   - PM2 process manager
   - Backup automatici
   - **Tempo stimato**: 3-4 ore

### 💳 Servizi Esterni
3. **[Setup Stripe e SendGrid](./setup-stripe-sendgrid.md)**
   - Configurazione Stripe per pagamenti
   - Webhook Stripe
   - Configurazione SendGrid per email
   - Verifica dominio email
   - Template email
   - **Tempo stimato**: 1-2 ore

---

## 🎯 Quick Start - Sviluppo Locale

### Prerequisiti
- Node.js 18+ installato
- PostgreSQL 14+ installato
- Git installato

### Setup Rapido (15 minuti)

```bash
# 1. Clone repository
git clone <repo-url>
cd studio-erp

# 2. Installa dipendenze
npm install

# 3. Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue credenziali PostgreSQL

# 4. Setup database
createdb studio_erp
npm run db:generate
npm run db:push
npm run db:seed

# 5. Avvia server sviluppo
npm run dev
```

Apri http://localhost:3000

**Credenziali default**:
- Email: `romano@studio-ingegneria.it`
- Password: `admin123`
- Ruolo: TITOLARE

---

## 🚀 Quick Start - Produzione

### Checklist Pre-Deploy

- [ ] VPS Hetzner creato (CX22 - €4.51/mese)
- [ ] Dominio registrato e DNS configurato
- [ ] Account Stripe creato (per pagamenti)
- [ ] Account SendGrid creato (per email)
- [ ] Repository GitHub privato creato

### Deployment (3-4 ore)

Segui in ordine:

1. **[Setup Produzione Hetzner](./setup-produzione-hetzner.md)** (2-3 ore)
   - Configurazione server
   - Deploy applicazione
   - SSL e sicurezza

2. **[Setup Stripe e SendGrid](./setup-stripe-sendgrid.md)** (1 ora)
   - Integrazione pagamenti
   - Integrazione email

3. **Test Finale**
   - Acquisto bundle di test
   - Pagamento milestone
   - Invio email
   - Login area committente

---

## 📁 Architettura Infrastruttura

### Sviluppo Locale
```
┌─────────────────────────────────────┐
│  Laptop Developer                   │
│  ┌─────────────────────────────┐   │
│  │  Next.js Dev Server         │   │
│  │  http://localhost:3000      │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  PostgreSQL                 │   │
│  │  localhost:5432             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Produzione (Fase 1 MVP)
```
┌──────────────────────────────────────────────────┐
│           HETZNER CLOUD                          │
│  ┌────────────────────────────────────────────┐ │
│  │  VPS CX22 (€4.51/mese)                     │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │  Nginx (Reverse Proxy + SSL)         │  │ │
│  │  │  https://studio-romano.it            │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │  Next.js App (PM2)                   │  │ │
│  │  │  localhost:3000                      │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │  PostgreSQL 16                       │  │ │
│  │  │  localhost:5432                      │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │  Redis (Rate Limiting)               │  │ │
│  │  │  ClamAV (Antivirus)                  │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │  Object Storage (€5/mese)                 │ │
│  │  - Backup database giornalieri            │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
                    │
                    │ API Calls
                    ▼
┌──────────────────────────────────────────────────┐
│           SERVIZI ESTERNI                        │
│  ┌─────────────────┐  ┌──────────────────────┐  │
│  │  Stripe         │  │  SendGrid            │  │
│  │  Pagamenti      │  │  Email transazionali │  │
│  └─────────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 🔧 Variabili d'Ambiente

### Template Completo

Copia in `.env`:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# ============================================
# NEXTAUTH.JS
# ============================================
NEXTAUTH_URL="https://tuo-dominio.it"
# Genera con: openssl rand -base64 32
NEXTAUTH_SECRET="tua-chiave-segreta-super-sicura"

# ============================================
# STRIPE
# ============================================
# Test mode (sviluppo)
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# Live mode (produzione)
# STRIPE_SECRET_KEY="sk_live_51..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# SENDGRID
# ============================================
SENDGRID_API_KEY="SG.xxxxxxxx"
EMAIL_FROM="noreply@tuo-dominio.it"

# ============================================
# STORAGE (FASE 2)
# ============================================
# QNAP MinIO
MINIO_ENDPOINT="192.168.1.100"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="password"
MINIO_BUCKET="documenti"
MINIO_USE_SSL="false"

# Hetzner Object Storage
HETZNER_S3_ENDPOINT="fsn1.your-objectstorage.com"
HETZNER_S3_ACCESS_KEY="..."
HETZNER_S3_SECRET_KEY="..."
HETZNER_S3_BUCKET="studio-backup"

# ============================================
# UPSTASH REDIS (FASE 2 - Rate Limiting)
# ============================================
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="https://tuo-dominio.it"
NEXT_PUBLIC_APP_NAME="Studio Ing. Romano"
NODE_ENV="production"

# ============================================
# CLAMAV (FASE 2 - Antivirus)
# ============================================
CLAMAV_HOST="localhost"
CLAMAV_PORT="3310"
```

### Variabili per Ambiente

#### Sviluppo Locale
```env
DATABASE_URL="postgresql://studio_user:password@localhost:5432/studio_erp"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..." # Test mode
NODE_ENV="development"
```

#### Produzione
```env
DATABASE_URL="postgresql://studio_user:STRONG_PASS@127.0.0.1:5432/studio_erp"
NEXTAUTH_URL="https://studio-romano.it"
STRIPE_SECRET_KEY="sk_live_..." # Live mode
NODE_ENV="production"
```

---

## 🧪 Test e Verifica

### Test Locale

```bash
# 1. Build produzione locale
npm run build
npm run start

# 2. Verifica endpoints
curl http://localhost:3000
curl http://localhost:3000/api/auth/signin

# 3. Test database
npm run db:studio
# Verifica dati in http://localhost:5555
```

### Test Produzione

```bash
# 1. Verifica HTTPS
curl https://studio-romano.it

# 2. Verifica SSL
openssl s_client -connect studio-romano.it:443

# 3. Test webhook Stripe
stripe listen --forward-to https://studio-romano.it/api/stripe/webhook

# 4. Test email SendGrid
# (vedi setup-stripe-sendgrid.md)
```

---

## 🆘 Troubleshooting Comune

### Database connection error

**Problema**: `Error: P1001: Can't reach database server`

**Soluzione**:
```bash
# Verifica PostgreSQL running
sudo systemctl status postgresql

# Verifica credenziali in .env
psql -U studio_user -d studio_erp -h localhost

# Verifica firewall
sudo ufw status
```

### Build error

**Problema**: `Error: Cannot find module '@prisma/client'`

**Soluzione**:
```bash
# Rigenera Prisma Client
npm run db:generate

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

### Stripe webhook non funziona

**Problema**: Pagamento completato ma app non riceve notifica

**Soluzione**:
```bash
# Verifica endpoint pubblicamente raggiungibile
curl https://studio-romano.it/api/stripe/webhook

# Verifica STRIPE_WEBHOOK_SECRET in .env
# Controlla logs webhook in Dashboard Stripe
```

### Email non arrivano

**Problema**: SendGrid non invia email

**Soluzione**:
1. Verifica API key valida
2. Verifica dominio verificato su SendGrid
3. Controlla Activity su Dashboard SendGrid
4. Verifica email non in spam

---

## 📊 Monitoring Produzione

### Logs Applicazione
```bash
# PM2 logs
pm2 logs studio-erp --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/studio-erp-access.log
sudo tail -f /var/log/nginx/studio-erp-error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Metriche Server
```bash
# CPU e RAM
htop

# Spazio disco
df -h

# Processi
ps aux | grep node

# Connessioni database
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

### Uptime e Disponibilità

**Tool consigliati**:
- [UptimeRobot](https://uptimerobot.com/) - Free, monitor ogni 5min
- [Sentry](https://sentry.io/) - Error tracking
- [Better Uptime](https://betteruptime.com/) - Monitoring completo

---

## 💰 Costi Mensili Totali

| Servizio | Piano | Costo |
|----------|-------|-------|
| Hetzner VPS CX22 | Standard | €4.51 |
| Hetzner Object Storage | 250GB | €5.00 |
| Dominio .it | Annuale | ~€1-2 |
| Stripe | Pay-as-you-go | 1.4% + €0.25/tx |
| SendGrid | Free | €0 (fino 100 email/giorno) |
| SSL Certificate | Let's Encrypt | €0 |
| **TOTALE BASE** | | **~€11-12/mese** |

**Costi aggiuntivi con crescita**:
- SendGrid Essentials (50k email/mese): +€15
- Hetzner VPS CPX21 (4 vCPU, 8GB): +€10
- Backup offsite aggiuntivi: +€5

**Scalabilità**: Con l'architettura scelta, puoi gestire 1000+ incarichi/anno rimanendo sotto €50/mese.

---

## 📞 Supporto

### Risorse Ufficiali
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Hetzner Docs](https://docs.hetzner.com/)
- [Stripe Docs](https://stripe.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)

### Community
- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Discord](https://pris.ly/discord)

---

## ✅ Checklist Deployment Completo

### Pre-Deployment
- [ ] Repository GitHub creato e configurato
- [ ] Dominio acquistato e DNS configurato
- [ ] Account Hetzner creato
- [ ] Account Stripe verificato
- [ ] Account SendGrid verificato
- [ ] Variabili d'ambiente configurate

### Deployment
- [ ] VPS Hetzner creato e configurato
- [ ] PostgreSQL installato e database creato
- [ ] Node.js e PM2 installati
- [ ] Nginx configurato
- [ ] SSL Let's Encrypt attivo
- [ ] Applicazione deployata e running
- [ ] Backup automatici configurati

### Post-Deployment
- [ ] Test acquisto bundle completo
- [ ] Test pagamento milestone
- [ ] Test invio email
- [ ] Test login committente
- [ ] Test upload documenti
- [ ] Monitoring configurato
- [ ] Documentazione aggiornata

---

**Ultimo aggiornamento**: Dicembre 2025
**Versione**: MVP 1.0
