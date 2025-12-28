# 🚀 CI/CD Pipeline - Studio ERP
## GitHub Actions Workflows

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: Ing. Romano Domenico

---

## 📋 Overview

Automazione completa del processo di sviluppo, test e deployment:

1. **`test-pr.yml`**: Test automatici su ogni Pull Request
2. **`deploy-production.yml`**: Deploy automatico su Hetzner dopo merge a `main`

---

## 🔄 Workflow 1: Test Pull Request

### Trigger
- Apertura nuova PR verso `main`
- Aggiornamento PR esistente (nuovo commit)

### Jobs

#### 1. **Lint Code**
- ESLint con configurazione Next.js
- TypeScript type checking (`tsc --noEmit`)
- Failfast: blocca merge se errori

#### 2. **Test Build**
- `npm ci` (reproducible build)
- `npx prisma generate`
- `npm run build`
- Verifica dimensione build (warning se > 50MB)

#### 3. **Security Scan**
- `npm audit` (soglia: moderate)
- TruffleHog (ricerca secrets in codice)
- Continua anche se fallisce (solo warning)

#### 4. **Validate Prisma Schema**
- `npx prisma validate`
- Verifica esistenza migration files

#### 5. **Comment PR**
- Commenta automaticamente risultati su PR
- Tabella riassuntiva: ✅ success | ❌ failure
- Link a workflow run completo

### Status Checks

GitHub richiede **tutti i job success** prima di permettere merge (configurabile in branch protection rules).

---

## 🚢 Workflow 2: Deploy Production

### Trigger
- Push a branch `main` (post-merge PR)
- Modifiche in `studio-erp/**` o workflow stesso
- Trigger manuale da UI GitHub (workflow_dispatch)

### Jobs

#### 1. **Test & Build** (CI)
**Durata**: ~3 minuti

- Checkout code
- Setup Node.js 20 con cache npm
- Install dependencies (`npm ci`)
- Lint (non-blocking)
- Generate Prisma Client
- Build Next.js
- Upload artifacts (.next, node_modules)

**Environment Variables**:
- `NEXT_PUBLIC_SENTRY_DSN`: Build-time (pubblico)

---

#### 2. **Security Scan** (SAST)
**Durata**: ~2 minuti

- Snyk security scan (soglia: high)
- npm audit (soglia: high)
- Continua anche se fallisce (solo notifica)

**Prerequisito**: Secret `SNYK_TOKEN` configurato

---

#### 3. **Deploy to Hetzner** (CD)
**Durata**: ~5 minuti

**Environment Protection**:
- Richiede approval manuale (configurabile in GitHub Environment `production`)
- Solo utenti autorizzati possono approvare

**Step**:
1. Setup Python 3.11 + Ansible 2.15
2. Install Ansible Galaxy collections:
   - `community.general`
   - `community.postgresql`
   - `ansible.posix`
3. Configure SSH key (da secret)
4. Create Ansible Vault file da secrets GitHub
5. Update inventory con IP server
6. **Run Ansible playbook**: `application.yml --tags deploy`
7. Health check: `curl https://erp.studioromano.it/api/health`
8. Notify Sentry deployment
9. Cleanup sensitive files

**Secrets Richiesti** (GitHub Secrets):
- `SSH_PRIVATE_KEY`: Chiave SSH per accesso server (formato PEM)
- `PRODUCTION_SERVER_IP`: IP pubblico server Hetzner
- `ANSIBLE_VAULT_PASSWORD`: Password Ansible Vault
- `POSTGRESQL_PASSWORD`: Password database
- `NEXTAUTH_SECRET`: Secret NextAuth (32 bytes)
- `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`: API key SendGrid
- `OPENAI_API_KEY`: API key OpenAI (opzionale)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- `HETZNER_API_TOKEN`: Token API Hetzner Cloud
- `BACKUP_ENCRYPTION_PASSPHRASE`: Passphrase backup GPG
- `GRAFANA_ADMIN_PASSWORD`: Password Grafana admin

---

#### 4. **Post-Deployment Verification**
**Durata**: ~1 minuto

**Test Automatici**:
1. Homepage (HTTP 200)
2. Health check API
3. Bundle catalog API (public)
4. SSL certificate validity
5. TLS 1.2+ enforcement
6. Security headers (HSTS, X-Frame-Options, CSP)
7. Lighthouse CI (performance score)

**Lighthouse Thresholds**:
- Performance: > 70
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

#### 5. **Rollback on Failure** (Conditional)
**Trigger**: Solo se deploy o verify falliscono

**Azioni**:
1. Checkout code con full history
2. Identifica commit precedente (`HEAD~1`)
3. SSH su server → rollback Git
4. Rebuild applicazione
5. Restart pm2
6. Verify rollback (health check)
7. **Email notifica** a team

**Email Include**:
- Commit fallito (SHA)
- Commit rollback (SHA)
- Link a workflow run
- Istruzioni per fix

---

#### 6. **Notify Success** (Conditional)
**Trigger**: Solo se tutto success

**Email Include**:
- Commit deployato (SHA, author, message)
- Link applicazione
- Link monitoring (Grafana)
- Link workflow run

---

## ⚙️ Setup GitHub Repository

### 1. Secrets Configuration

Vai a: `Settings → Secrets and variables → Actions → New repository secret`

**Critico (deployment fallisce senza questi)**:
```bash
SSH_PRIVATE_KEY          # cat ~/.ssh/id_rsa
PRODUCTION_SERVER_IP     # es: 123.45.67.89
ANSIBLE_VAULT_PASSWORD   # Password usata per cifrare vault.yml
POSTGRESQL_PASSWORD      # openssl rand -base64 32
NEXTAUTH_SECRET          # openssl rand -base64 32
STRIPE_SECRET_KEY        # sk_live_XXX da Stripe dashboard
STRIPE_PUBLISHABLE_KEY   # pk_live_XXX
STRIPE_WEBHOOK_SECRET    # whsec_XXX da Stripe Webhooks
SENDGRID_API_KEY         # SG.XXX da SendGrid
```

**Opzionali (warning se mancanti)**:
```bash
SNYK_TOKEN               # Snyk.io → Settings → API Token
SENTRY_DSN               # Sentry → Project → Client Keys
SENTRY_AUTH_TOKEN        # Sentry → Settings → Auth Tokens
OPENAI_API_KEY           # OpenAI → API Keys
UPSTASH_REDIS_REST_URL   # Upstash Console → Database → REST API
UPSTASH_REDIS_REST_TOKEN
HETZNER_API_TOKEN        # Hetzner Cloud → Security → API Tokens
BACKUP_ENCRYPTION_PASSPHRASE  # openssl rand -base64 48
GRAFANA_ADMIN_PASSWORD   # openssl rand -base64 24
```

---

### 2. Environment Configuration

Vai a: `Settings → Environments → New environment`

**Nome**: `production`

**Protection Rules**:
- ✅ Required reviewers: 1 (solo Titolare può approvare)
- ✅ Wait timer: 0 minutes (approva immediatamente)
- ✅ Deployment branches: Only `main`

**Environment Secrets** (sovrascrive repository secrets se necessario):
- Nessuno (usa repository secrets di default)

---

### 3. Branch Protection Rules

Vai a: `Settings → Branches → Add rule`

**Branch name pattern**: `main`

**Protection Rules**:
- ✅ Require a pull request before merging
  - Required approvals: 1
  - Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - Status checks required:
    - `Lint Code`
    - `Test Build`
    - `Security Scan`
    - `Validate Prisma Schema`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings (anche per admin)

---

## 📊 Monitoring CI/CD

### GitHub Actions Dashboard

- **Workflow runs**: `Actions` tab
- **Filtri**: Branch, Status, Evento
- **Re-run**: Pulsante "Re-run all jobs" se fallimento temporaneo

### Metriche Chiave

| Metrica | Target | Attuale |
|---------|--------|---------|
| **Build time** | < 5 min | ~3 min |
| **Deploy time** | < 10 min | ~5 min |
| **Success rate** | > 95% | TBD |
| **MTTR** (Mean Time To Recovery) | < 15 min | TBD |

---

## 🔧 Troubleshooting

### Errore: "SSH connection failed"

**Causa**: Chiave SSH non configurata o IP server errato.

**Fix**:
```bash
# Verifica secret SSH_PRIVATE_KEY sia valido
cat ~/.ssh/id_rsa | pbcopy  # macOS
cat ~/.ssh/id_rsa | xclip   # Linux

# Incolla in GitHub Secrets → SSH_PRIVATE_KEY

# Verifica IP server
echo "Production IP: $PRODUCTION_SERVER_IP"
```

---

### Errore: "Ansible vault decrypt failed"

**Causa**: Password vault GitHub != password usata per cifrare file.

**Fix**:
```bash
# Decifra vault locale con password corretta
ansible-vault decrypt ansible/group_vars/production/vault.yml

# Ri-cifra con STESSA password che userai in GitHub Secret
ansible-vault encrypt ansible/group_vars/production/vault.yml

# Aggiorna GitHub Secret ANSIBLE_VAULT_PASSWORD
```

---

### Errore: "Health check failed"

**Causa**: Applicazione non risponde dopo deploy.

**Debug**:
```bash
# SSH su server
ssh root@<IP_SERVER>

# Controlla log pm2
pm2 logs studio-erp --lines 50

# Controlla status
pm2 status

# Test manuale health check
curl http://localhost:3000/api/health
```

**Rollback Manuale** (se automatico fallisce):
```bash
ssh root@<IP_SERVER>
cd /var/www/studio-erp
sudo -u studio git log --oneline -5  # Trova commit precedente
sudo -u studio git checkout <COMMIT_SHA>
sudo -u studio npm ci
sudo -u studio npx prisma generate
sudo -u studio npm run build
sudo -u studio pm2 restart studio-erp
```

---

### Errore: "Lighthouse performance score < 70"

**Causa**: Bundle JavaScript troppo grande o rendering lento.

**Fix**:
```bash
# Analizza bundle
npm run build
npx @next/bundle-analyzer

# Ottimizzazioni:
# 1. Dynamic imports per route pesanti
# 2. Image optimization (next/image)
# 3. Font optimization (next/font)
# 4. Rimuovi dipendenze inutilizzate
```

---

## 🚀 Deployment Workflow

### 1. Sviluppo Locale
```bash
# Crea feature branch
git checkout -b feature/nuova-funzionalita

# Sviluppa e testa
npm run dev

# Commit
git add .
git commit -m "feat: Nuova funzionalità X"
```

### 2. Apri Pull Request
```bash
# Push branch
git push origin feature/nuova-funzionalita

# Apri PR su GitHub
# Titolo: "feat: Nuova funzionalità X"
# Descrizione: Spiega cosa fa, perché, screenshot

# GitHub Actions runs automaticamente test-pr.yml
# Attendi commento bot con risultati ✅
```

### 3. Code Review
- Revisione codice da Titolare o collaboratore senior
- Richiedi modifiche se necessario
- Approva PR quando pronta

### 4. Merge a Main
```bash
# Merge PR (da UI GitHub)
# "Squash and merge" (consigliato per history pulita)

# GitHub Actions runs automaticamente deploy-production.yml
```

### 5. Approvazione Deploy (Manuale)
- Ricevi notifica "Waiting for approval"
- Vai a Actions → Deploy to Production → Review deployments
- Clicca "Approve and deploy"

### 6. Monitoring Post-Deploy
```bash
# Controlla email notifica success
# Verifica applicazione: https://erp.studioromano.it
# Controlla Grafana: http://<IP>:3001
# Monitora Sentry per errori: https://sentry.io
```

---

## 📚 Best Practices

### Commit Messages

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Aggiungi bundle consulenza
fix: Correggi SQL injection in /api/incarichi
docs: Aggiorna README deployment
chore: Bump dependencies
refactor: Estrai logica autenticazione in hook
perf: Ottimizza query database incarichi
test: Aggiungi test preventivi API
```

### Branch Naming

```
feature/nome-funzionalita   # Nuova feature
fix/bug-descrizione          # Bug fix
hotfix/critical-fix          # Fix urgente produzione
docs/update-readme           # Solo documentazione
chore/upgrade-deps           # Maintenance
```

### Pull Request Template

Crea `.github/pull_request_template.md`:

```markdown
## Descrizione
<!-- Descrivi le modifiche -->

## Tipo di Cambiamento
- [ ] Bug fix (non-breaking)
- [ ] Nuova feature (non-breaking)
- [ ] Breaking change (fix o feature che rompe funzionalità esistenti)
- [ ] Documentazione

## Checklist
- [ ] Build locale passa (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testato manualmente
- [ ] Screenshot allegati (se UI)
- [ ] Documentazione aggiornata
- [ ] Prisma migration (se schema DB modificato)

## Screenshot
<!-- Se applicabile -->
```

---

## 🔐 Security Considerations

### Secrets Rotation

**Frequenza**: Ogni 90 giorni

**Procedura**:
1. Genera nuovo secret (es: `openssl rand -base64 32`)
2. Aggiorna GitHub Secret
3. Re-deploy applicazione (trigger manuale workflow)
4. Verifica applicazione funziona con nuovo secret
5. Invalida vecchio secret

**Secrets da ruotare**:
- `NEXTAUTH_SECRET` (ogni 90 giorni)
- `STRIPE_SECRET_KEY` (solo se compromesso)
- `SENDGRID_API_KEY` (ogni 180 giorni)
- `SSH_PRIVATE_KEY` (ogni 365 giorni)

### Audit Log

GitHub mantiene log audit di:
- Workflow runs (90 giorni)
- Secret access (non il valore, solo timestamp)
- Deployment approvals

**Esporta log**:
```bash
# Via GitHub CLI
gh api /repos/romanobenit/romanoing/actions/runs \
  --paginate > workflow-runs.json
```

---

## 📞 Support

**Problemi CI/CD**:
- GitHub Issues: https://github.com/romanobenit/romanoing/issues
- Email: domenico.romano@studioromano.it

**GitHub Actions Docs**:
- https://docs.github.com/en/actions

---

**Ultimo Aggiornamento**: 2025-12-27
**Versione**: 1.0

**Fine Documento**
