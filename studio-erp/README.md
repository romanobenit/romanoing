# Studio Ing. Romano - ERP + eCommerce Platform

Piattaforma integrata per la gestione di incarichi di ingegneria con eCommerce demand-driven.

## 🚀 Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Autenticazione**: NextAuth.js v5
- **UI**: Tailwind CSS + shadcn/ui
- **Pagamenti**: Stripe
- **Storage**: QNAP MinIO (Fase 1) → Hetzner Object Storage (Fase 2)

## 📋 Fase 1 MVP - Funzionalità

### Bundle Disponibili
- 🏗️ Ristrutturazione con Bonus (`BDL-RISTR-BONUS`)
- 🏛️ Vulnerabilità Sismica (`BDL-VULN-SISMICA`)
- 🔥 Antincendio (`BDL-ANTINCENDIO`)

### Ruoli
- **TITOLARE**: Accesso completo
- **COMMITTENTE**: Area cliente con:
  - Dashboard personale
  - Visualizzazione incarichi
  - Download documenti
  - Pagamento milestone
  - Messaggistica real-time

## 🛠️ Setup Locale

### Prerequisiti
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Installazione

1. **Clona il repository**
```bash
git clone <repo-url>
cd studio-erp
```

2. **Installa dipendenze**
```bash
npm install
```

3. **Configura variabili d'ambiente**
```bash
cp .env.example .env
# Modifica .env con le tue credenziali
```

4. **Setup database**
```bash
# Crea database PostgreSQL
createdb studio_erp

# Genera Prisma Client
npm run db:generate

# Esegui migrazioni
npm run db:migrate

# (Opzionale) Seed dati iniziali
npm run db:seed
```

5. **Avvia server di sviluppo**
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 📁 Struttura Progetto

```
studio-erp/
├── app/                      # Next.js App Router
│   ├── (public)/            # Pagine pubbliche (landing, quiz, checkout)
│   ├── (auth)/
│   │   ├── (cliente)/       # Area Committente
│   │   ├── (collaboratore)/ # Area Collaboratori (Fase 3)
│   │   └── (admin)/         # Area Titolare
│   ├── api/                 # API Routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/              # Componenti React
│   ├── ui/                  # shadcn/ui components
│   ├── cliente/             # Componenti area cliente
│   └── ...
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helper functions
├── prisma/
│   └── schema.prisma       # Database schema
└── types/                   # TypeScript types
```

## 🗄️ Database Schema

### Principali Entità
- **Utenti** + Ruoli (TITOLARE, COMMITTENTE, etc)
- **Clienti** con stato accesso portale (ENUM)
- **Bundle** (servizi predefiniti)
- **Incarichi** con workflow
- **Milestone** per pagamenti frazionati
- **Documenti** con validazione MIME + ClamAV
- **Messaggi** (WebSocket real-time)
- **Log AI** (POP-AI-01 tracciabilità)

## 🔒 Sicurezza

- ✅ Rate limiting API committente (100 req/15min)
- ✅ Validazione MIME type upload
- ✅ ClamAV antivirus scan obbligatorio
- ✅ JWT authentication con NextAuth
- ✅ HTTPS obbligatorio in produzione
- ✅ CSRF protection built-in Next.js

## 📚 Script NPM

```bash
npm run dev          # Server sviluppo
npm run build        # Build produzione
npm run start        # Avvia build produzione
npm run lint         # ESLint
npm run db:generate  # Genera Prisma Client
npm run db:push      # Push schema (dev)
npm run db:migrate   # Esegui migrations
npm run db:studio    # Prisma Studio GUI
```

## 🚀 Deployment

Vedere documentazione completa in `claude.md` sezione "Infrastruttura".

### Ambiente Produzione (Hetzner)
- VPS CX22 (Ubuntu 24.04)
- PostgreSQL
- Nginx + SSL (Let's Encrypt)
- ClamAV
- Redis (rate limiting)

## 📄 Licenza

Proprietario - Studio Ing. Romano

## 📞 Supporto

Per assistenza tecnica contattare il team di sviluppo.
