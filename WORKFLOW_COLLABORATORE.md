# 👨‍💻 Guida Workflow Collaboratore - Studio ERP

Benvenuto nel team! Questa guida spiega come lavorare sul progetto romanoing/studio-erp.

---

## 🎯 Panoramica Progetto

**Applicazione**: Studio ERP (Next.js 16)
**Produzione**: https://romanoing.com
**Repository**: https://github.com/romanobenit/romanoing
**Tuo ruolo**: Admin (pari livello con Romano)

---

## 🌳 Struttura Branch

```
production  ──●──────●──────●────  (Live su romanoing.com)
              │      │      │
develop    ───●──●───●──●───●──●──  (Lavoro quotidiano)
                │      │      │
feature/*       ●      ●      ●     (Tue modifiche)
```

### Branch Permanenti:

| Branch | Scopo | Puoi pushare? |
|--------|-------|---------------|
| **production** | Codice LIVE | ❌ Solo via PR |
| **develop** | Sviluppo quotidiano | ❌ Solo via PR |
| **feature/nome** | Tuo lavoro | ✅ Sì, direttamente |

---

## 🚀 Workflow Quotidiano

### 1️⃣ Inizio Nuovo Task

```bash
# Sempre partire da develop aggiornato
cd /path/to/romanoing/studio-erp
git checkout develop
git pull origin develop

# Crea nuovo branch descrittivo
git checkout -b feature/add-pdf-export
# O: fix/stripe-webhook-timeout
# O: update/homepage-text

# Formato: {tipo}/{descrizione-breve}
# Tipi: feature, fix, update, refactor
```

### 2️⃣ Sviluppo

```bash
# Lavora normalmente...
# Modifica file, testa in locale

# Commit frequenti
git add .
git commit -m "feat: Add PDF export functionality for documents"

# Convenzione commit:
# feat: nuova funzionalità
# fix: correzione bug
# update: aggiornamento contenuti
# refactor: refactoring codice
# docs: documentazione

# Puoi fare più commit
git commit -m "feat: Add download button UI"
git commit -m "feat: Implement server-side PDF generation"
```

### 3️⃣ Push e Pull Request

```bash
# Push del tuo branch
git push -u origin feature/add-pdf-export

# Vai su GitHub (automaticamente suggerisce PR)
# https://github.com/romanobenit/romanoing

# Oppure: Pull Requests → New pull request
Base: develop ⬅ Compare: feature/add-pdf-export

# Compila PR:
Title: "Add PDF export functionality"

Description:
---
## Cosa fa
Aggiunge funzionalità export PDF per documenti clienti.

## Modifiche
- Bottone download su pagina documento
- Generazione PDF server-side con Puppeteer
- API endpoint /api/documents/[id]/export-pdf

## Test
- ✅ Testato localmente
- ✅ Build passa senza errori
- ✅ PDF generato correttamente

## Screenshot
(opzionale - allega se modifica UI)
---

# Assegna reviewer: Romano
# Crea Pull Request
```

### 4️⃣ Code Review

```bash
# Romano riceve notifica e reviewe

# Possibili scenari:

A) Approva immediatamente
   → Tu o lui mergiate
   → Branch auto-cancellato
   → DONE! ✅

B) Richiede modifiche
   → Leggi commenti su GitHub
   → Fai modifiche in locale
   → git add . && git commit -m "fix: Address review comments"
   → git push origin feature/add-pdf-export
   → PR si aggiorna automaticamente
   → Romano ri-reviewe
   → Approve → Merge ✅

C) Tu reviewi PR di Romano
   → Leggi codice su GitHub
   → Commenta se necessario
   → "Approve" se tutto OK
   → Romano (o tu) mergiate
```

### 5️⃣ Aggiorna Locale

```bash
# Dopo merge, aggiorna develop
git checkout develop
git pull origin develop

# Il tuo branch feature è già mergato e cancellato su GitHub
# Puoi cancellarlo anche in locale
git branch -d feature/add-pdf-export

# Pronto per prossimo task! Torna a step 1️⃣
```

---

## 🚢 Deploy Produzione (Settimanale)

### Quando:
Tipicamente **venerdì pomeriggio** o quando develop ha 3-4 feature pronte.

### Chi Deploya:
**Entrambi** possiamo deployare (siamo pari livello).

### Processo:

```bash
# 1. Uno di noi apre PR su GitHub
Base: production ⬅ Compare: develop

Title: "Release 10 Gen - PDF Export + Dashboard"

Description:
---
## Release Notes
- ✅ PDF export documenti
- ✅ Dashboard clienti con grafici
- ✅ Fix timeout Stripe webhook

## Database Migrations
Nessuna

## Breaking Changes
Nessuno

## Rollback Plan
Se problemi: /root/rollback-production.sh → commit abc123
---

# 2. L'altro approva (review veloce)
# Verifica changelog, nessun secret committato

# 3. Chi vuole mergia
# (Tipicamente chi ha aperto PR, ma flessibile)

# 4. Chi ha mergato deploya (o accordo preventivo)

# ⚠️ COMUNICAZIONE IMPORTANTE ⚠️
# Scrivetevi SEMPRE prima di deployare:

WhatsApp/Slack:
"Deploy v1.2 tra 10 min, ok?"
"✅ Procedi"

# 5. Deploy server (se hai accesso SSH)
ssh -i ~/.ssh/deploy_key deploy@116.203.109.249
sudo /root/deploy-production.sh

# (Se non hai ancora accesso SSH, Romano deploya)

# 6. Verifica
# Apri https://romanoing.com
# Testa funzionalità deployate

# 7. Notifica
"✅ Deploy v1.2 completato - PDF export live"
```

---

## 📋 Task Tracking

### Usiamo file `TODO.md` nel repository

```markdown
# Studio ERP - Roadmap

## In Corso (Questa Settimana)
- [ ] PDF export documenti (Collaboratore)
- [ ] Dashboard grafici (Romano)

## Prossimi
- [ ] Email notifiche
- [ ] Mobile menu responsive

## Completati
- [x] Setup produzione ✅
- [x] Configuratori sismica/antincendio ✅
```

### Come usarlo:

```bash
# Prima di iniziare task
git checkout develop && git pull
nano TODO.md
# Sposta task da "Prossimi" a "In Corso"
# Aggiungi tuo nome

git add TODO.md
git commit -m "docs: Update TODO - start PDF export"
git push origin develop

# Task completato
# Sposta da "In Corso" a "Completati"
git add TODO.md
git commit -m "docs: Update TODO - PDF export done"
git push origin develop
```

---

## 🔥 Hotfix Urgente (Bug Produzione)

### Se scopri bug CRITICO in produzione:

```bash
# 1. Crea branch da production (non develop!)
git checkout production
git pull origin production
git checkout -b hotfix/stripe-webhook-critical

# 2. Fix rapido
# ... correggi bug ...

git add .
git commit -m "hotfix: Fix Stripe webhook signature validation

Critical bug causing payment failures.
Changed webhook secret to live key.

Fixes production issue."

# 3. Push e PR IMMEDIATA
git push -u origin hotfix/stripe-webhook-critical

# PR: hotfix/stripe → production
# Etichetta: URGENT, P0

# 4. Notifica Romano SUBITO
WhatsApp: "🚨 Hotfix critico Stripe, reviewo PR #45"

# 5. Fast-track review
# Uno approva, altro mergia SUBITO

# 6. Deploy IMMEDIATO
# Chi è disponibile deploya

# 7. Backport su develop
git checkout develop
git pull origin develop
git merge hotfix/stripe-webhook-critical
git push origin develop

# Hotfix in produzione + develop allineato ✅
```

---

## 🛠️ Comandi Utili

### Setup Iniziale (Una Volta):

```bash
# Clona repository
git clone https://github.com/romanobenit/romanoing.git
cd romanoing/studio-erp

# Installa dipendenze
npm install

# Copia .env per sviluppo locale
cp .env.example .env.local
# Chiedi a Romano credenziali sviluppo

# Testa in locale
npm run dev
# Apri http://localhost:3000
```

### Comandi Quotidiani:

```bash
# Aggiorna develop
git checkout develop && git pull origin develop

# Nuovo task
git checkout -b feature/nome-task

# Stato modifiche
git status

# Commit
git add .
git commit -m "feat: descrizione"

# Push
git push origin feature/nome-task

# Merge develop nel tuo branch (se conflitti)
git checkout feature/nome-task
git merge develop
# Risolvi conflitti se presenti
git commit -m "merge: Merge develop into feature"
git push origin feature/nome-task
```

### Troubleshooting:

```bash
# Ho pushato per errore su branch sbagliato
git reset --soft HEAD~1  # Annulla ultimo commit (mantiene modifiche)

# Ho fatto casino, voglio ricominciare
git checkout develop
git pull origin develop
git checkout -b feature/nuovo-tentativo
# Ricopia modifiche

# Conflitti durante merge
git status  # Vedi file in conflitto
# Apri file, cerca <<<<<<< ======= >>>>>>>
# Risolvi manualmente
git add file-risolto.ts
git commit -m "merge: Resolve conflicts"

# Voglio vedere differenze
git diff  # Modifiche non committate
git diff develop  # Differenze col branch develop
```

---

## 🚨 Regole d'Oro

### ✅ FARE:

- ✅ Sempre partire da `develop` aggiornato
- ✅ Branch descrittivi (feature/fix/update)
- ✅ Commit frequenti con messaggi chiari
- ✅ PR con descrizione dettagliata
- ✅ Revieware PR di Romano attentamente
- ✅ Testare sempre in locale prima di push
- ✅ Comunicare su WhatsApp/Slack prima deploy
- ✅ Aggiornare TODO.md

### ❌ NON FARE:

- ❌ Push diretto su `production` o `develop` (usa PR!)
- ❌ Committare file `.env` con secrets
- ❌ Mergare propria PR senza approval
- ❌ Deployare senza comunicare
- ❌ Force push (git push -f) su branch condivisi
- ❌ Cancellare branch `production` o `develop`
- ❌ Modificare settings repository senza accordo

---

## 📞 Contatti e Supporto

### Comunicazione Giornaliera:
- **WhatsApp/Slack**: Gruppo "Studio ERP Dev"
- **GitHub**: Commenti su PR e Issues

### Quando Scrivere:
- ✅ Blocco tecnico su task
- ✅ Dubbio architetturale
- ✅ Prima di deploy produzione
- ✅ Bug critico scoperto
- ✅ Domande su priorità task

### Meeting (Opzionale):
- **Venerdì 16:00** - Sync settimanale 30 min
  - Cosa abbiamo fatto
  - Cosa facciamo prossima settimana
  - Blocchi/problemi

---

## 🎓 Risorse

### Documentazione Progetto:
- `DEPLOYMENT_GUIDE.md` - Procedura deploy dettagliata
- `TODO.md` - Lista task condivisa
- `README.md` - Overview progetto
- `studio-erp/.env.example` - Variabili ambiente

### Tecnologie Usate:
- Next.js 16 (Turbopack)
- React Server Components
- Prisma ORM + PostgreSQL
- NextAuth.js (autenticazione)
- Stripe (pagamenti)
- Tailwind CSS
- shadcn/ui components

### Link Utili:
- Produzione: https://romanoing.com
- Repository: https://github.com/romanobenit/romanoing
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

---

## ✅ Checklist Primo Giorno

- [ ] Accettato invito GitHub
- [ ] Clonato repository in locale
- [ ] Installato Node.js 20+
- [ ] Eseguito `npm install`
- [ ] Copiato `.env.local` (credenziali da Romano)
- [ ] Testato `npm run dev` (app parte su localhost:3000)
- [ ] Letto questo documento
- [ ] Aggiunto contatto WhatsApp/Slack Romano
- [ ] Primo task assegnato in TODO.md
- [ ] Prova: creare branch feature, modificare file, PR, merge

---

Benvenuto nel team! 🚀

Per domande: scrivi a Romano su WhatsApp/Slack.
