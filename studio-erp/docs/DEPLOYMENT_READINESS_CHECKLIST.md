# 🚀 Production Deployment Readiness Checklist
## Studio Ing. Romano - ERP Platform

**Versione**: 1.0
**Data**: 2025-12-27
**Target Deployment**: Hetzner Cloud CX22
**Responsabile**: Ing. Romano Benedetto

---

## 📋 Overview

Questa checklist garantisce che tutti i prerequisiti siano soddisfatti prima del deployment production.

**Tempo stimato setup completo**: 2-3 ore
**Tempo deployment automatico**: < 30 minuti

---

## ✅ Fase 1: Prerequisiti Infrastructure (30 min)

### 1.1 Account Hetzner Cloud

- [ ] Account Hetzner Cloud attivato
- [ ] Metodo pagamento configurato
- [ ] API Token generato (Read + Write)
  - Console: https://console.hetzner.cloud → Security → API Tokens
  - Nome token: `studio-erp-ci-cd`
  - Salvare in password manager: `HETZNER_API_TOKEN`

### 1.2 SSH Key

- [ ] SSH key pair generata localmente
  ```bash
  ssh-keygen -t rsa -b 4096 -C "deploy@studioromano.it" -f ~/.ssh/studio_erp_deploy
  ```
- [ ] Chiave pubblica caricata su Hetzner
  - Console: Security → SSH Keys → Add SSH Key
  - Nome: `studio-erp-deploy`
- [ ] Chiave privata salvata in password manager
  ```bash
  cat ~/.ssh/studio_erp_deploy  # Salvare output completo
  ```

### 1.3 Dominio e DNS

- [ ] Dominio registrato: `studioromano.it`
- [ ] Record DNS configurati:
  ```
  erp.studioromano.it.  A     XXX.XXX.XXX.XXX  (IP server Hetzner)
  erp.studioromano.it.  AAAA  (opzionale IPv6)
  ```
- [ ] TTL impostato a 300 (5 min) per cambio rapido
- [ ] DNS propagato (test: `dig +short erp.studioromano.it`)

### 1.4 Email (Let's Encrypt)

- [ ] Email valida configurata: `benedetto.romano@studioromano.it`
- [ ] Inbox accessibile per notifiche certificati
- [ ] Whitelist email da `letsencrypt.org` e `expiry@letsencrypt.org`

---

## ✅ Fase 2: Servizi Terzi (45 min)

### 2.1 Stripe (Pagamenti)

**Account Setup**:
- [ ] Account Stripe attivato
- [ ] Business details completati
- [ ] Bank account collegato (IBAN italiano)
- [ ] Identity verification completata

**API Keys**:
- [ ] Dashboard → Developers → API Keys
- [ ] **Publishable key** (pk_live_XXXXX): Copiare
- [ ] **Secret key** (sk_live_XXXXX): Copiare - NON condividere
- [ ] Salvare entrambe in password manager

**Webhook**:
- [ ] Dashboard → Developers → Webhooks → Add endpoint
- [ ] URL: `https://erp.studioromano.it/api/webhooks/stripe`
- [ ] Eventi da ascoltare:
  - [x] `checkout.session.completed`
  - [x] `payment_intent.succeeded`
  - [x] `payment_intent.payment_failed`
- [ ] Signing secret (whsec_XXXXX): Copiare
- [ ] Test webhook: Send test webhook

**Radar (Fraud Prevention)**:
- [ ] Dashboard → Radar → Rules
- [ ] Abilitare rule: "Block if IP country != IT" (opzionale)
- [ ] Review risk threshold: High

### 2.2 SendGrid (Email)

**Account Setup**:
- [ ] Account SendGrid attivato (piano Free: 100 email/giorno)
- [ ] Domain authentication completata:
  - Settings → Sender Authentication → Authenticate Your Domain
  - Aggiungere record DNS CNAME forniti
- [ ] Sender Identity verificata: `noreply@studioromano.it`

**API Key**:
- [ ] Settings → API Keys → Create API Key
- [ ] Nome: `studio-erp-production`
- [ ] Permissions: **Full Access**
- [ ] API Key (SG.XXXXX): Copiare - mostrato UNA SOLA volta
- [ ] Salvare in password manager

**Email Templates** (opzionale):
- [ ] Marketing → Templates → Create Template
- [ ] Template: Welcome email
- [ ] Template: Password reset
- [ ] Template: Invoice

### 2.3 Upstash Redis (Rate Limiting)

**Account Setup**:
- [ ] Account Upstash creato: https://console.upstash.com
- [ ] Database Redis creato:
  - Nome: `studio-erp-ratelimit`
  - Region: **EU-West-1** (Irlanda - GDPR compliant)
  - Type: Pay as you go (gratis fino a 10K request/giorno)

**API Credentials**:
- [ ] Console → Database → REST API
- [ ] **UPSTASH_REDIS_REST_URL**: Copiare
- [ ] **UPSTASH_REDIS_REST_TOKEN**: Copiare
- [ ] Test connessione: curl con token

### 2.4 OpenAI (AI Assistant - Opzionale)

- [ ] Account OpenAI: https://platform.openai.com
- [ ] Billing configurato (richiede carta credito)
- [ ] Usage limits impostati: $10/mese max
- [ ] API Keys → Create new secret key
- [ ] API Key (sk-XXXXX): Copiare
- [ ] **IMPORTANTE**: Implementare data minimization (no PII in prompts)

### 2.5 Sentry (Error Tracking - Opzionale)

- [ ] Account Sentry: https://sentry.io
- [ ] Progetto creato: `studio-erp`
- [ ] Platform: Next.js
- [ ] **DSN** (Client Key): Copiare da Settings → Client Keys (DSN)
- [ ] **Auth Token**: Settings → Account → API → Auth Tokens → Create New Token
  - Scopes: `project:releases`, `project:write`

---

## ✅ Fase 3: GitHub Configuration (30 min)

### 3.1 Repository Settings

- [ ] Repository: `romanobenit/romanoing`
- [ ] Branch protection su `main`:
  - Settings → Branches → Add rule
  - Branch name pattern: `main`
  - [x] Require a pull request before merging (1 approval)
  - [x] Require status checks to pass
    - Status checks: `Lint Code`, `Test Build`, `Security Scan`, `Validate Prisma Schema`
  - [x] Require conversation resolution
  - [x] Do not allow bypassing (anche admin)

### 3.2 GitHub Environment

- [ ] Settings → Environments → New environment
- [ ] Nome: `production`
- [ ] Protection rules:
  - [x] Required reviewers: 1 (selezionare: Ing. Romano)
  - [x] Deployment branches: Only `main`

### 3.3 GitHub Secrets (CRITICO - 22 secrets)

**Vai a**: Settings → Secrets and variables → Actions → New repository secret

**Infrastructure** (4 secrets):
- [ ] `SSH_PRIVATE_KEY`
  ```bash
  cat ~/.ssh/studio_erp_deploy  # Tutto il contenuto incluso -----BEGIN/END-----
  ```
- [ ] `PRODUCTION_SERVER_IP`
  ```
  Inizialmente: TBD (verrà aggiornato dopo provisioning Hetzner)
  Esempio: 123.45.67.89
  ```
- [ ] `ANSIBLE_VAULT_PASSWORD`
  ```bash
  openssl rand -base64 32  # Generare password lunga, salvare in password manager
  ```
- [ ] `HETZNER_API_TOKEN`
  ```
  (copiato da Fase 1.1)
  ```

**Database** (1 secret):
- [ ] `POSTGRESQL_PASSWORD`
  ```bash
  openssl rand -base64 32
  ```

**Application** (2 secrets):
- [ ] `NEXTAUTH_SECRET`
  ```bash
  openssl rand -base64 32
  ```
- [ ] `NEXTAUTH_URL` è hardcoded nel workflow (https://erp.studioromano.it)

**Payments - Stripe** (3 secrets):
- [ ] `STRIPE_PUBLISHABLE_KEY` (da Fase 2.1)
- [ ] `STRIPE_SECRET_KEY` (da Fase 2.1)
- [ ] `STRIPE_WEBHOOK_SECRET` (da Fase 2.1)

**Email - SendGrid** (1 secret):
- [ ] `SENDGRID_API_KEY` (da Fase 2.2)

**Rate Limiting - Upstash** (2 secrets):
- [ ] `UPSTASH_REDIS_REST_URL` (da Fase 2.3)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (da Fase 2.3)

**Monitoring - Sentry** (2 secrets - opzionali):
- [ ] `SENTRY_DSN` (da Fase 2.5)
- [ ] `SENTRY_AUTH_TOKEN` (da Fase 2.5)

**AI - OpenAI** (1 secret - opzionale):
- [ ] `OPENAI_API_KEY` (da Fase 2.4)

**Backup** (2 secrets):
- [ ] `BACKUP_ENCRYPTION_PASSPHRASE`
  ```bash
  openssl rand -base64 48  # Passphrase lunga per GPG
  ```
- [ ] `GRAFANA_ADMIN_PASSWORD`
  ```bash
  openssl rand -base64 24
  ```

**Storage - Hetzner Storage Box** (3 secrets - opzionali):
- [ ] `BACKUP_STORAGE_BOX_USER` (es: `u123456`)
- [ ] `BACKUP_STORAGE_BOX_PASSWORD`
- [ ] `BACKUP_STORAGE_BOX_HOST` (es: `u123456.your-storagebox.de`)

**Security Scan - Snyk** (1 secret - opzionale):
- [ ] `SNYK_TOKEN`
  - Snyk.io → Settings → API Token

### 3.4 Verifica Secrets

- [ ] Totale secrets configurati: **Minimo 15** (obbligatori) / **22** (completi)
- [ ] Nessun secret contiene spazi iniziali/finali
- [ ] Secrets sensibili salvati in password manager (1Password, Bitwarden, etc.)

---

## ✅ Fase 4: Ansible Setup Locale (15 min)

### 4.1 Installazione Ansible

**macOS**:
```bash
brew install ansible
ansible --version  # Verifica >= 2.15
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ansible python3-pip
ansible --version
```

**Windows** (WSL2 richiesto):
```bash
wsl --install  # Se non già installato
# Poi seguire istruzioni Ubuntu sopra
```

- [ ] Ansible 2.15+ installato
- [ ] Python 3.11+ disponibile

### 4.2 Ansible Galaxy Collections

```bash
cd studio-erp/ansible
ansible-galaxy collection install community.general
ansible-galaxy collection install community.postgresql
ansible-galaxy collection install ansible.posix
```

- [ ] 3 collections installate correttamente

### 4.3 Ansible Vault Setup

```bash
cd studio-erp/ansible

# Copia template
cp group_vars/production/vault.yml.template group_vars/production/vault.yml

# Modifica con valori reali (sostituisci tutti i PLACEHOLDER)
vi group_vars/production/vault.yml

# Cifra vault
ansible-vault encrypt group_vars/production/vault.yml
# Password: (usa STESSA password di GitHub Secret ANSIBLE_VAULT_PASSWORD)

# Crea file password locale (NON committare!)
echo "PASSWORD_VAULT_QUI" > .vault_pass
chmod 600 .vault_pass

# Verifica vault
ansible-vault view group_vars/production/vault.yml --vault-password-file .vault_pass
```

- [ ] `vault.yml` cifrato correttamente
- [ ] `.vault_pass` creato localmente
- [ ] `.vault_pass` presente in `.gitignore`
- [ ] Test decrypt funziona

---

## ✅ Fase 5: First Deployment (30 min)

### 5.1 Provisioning Server Hetzner

**Opzione A: Manuale via Console**
- [ ] Console Hetzner → Servers → Add Server
- [ ] Location: Norimberga (nbg1) - Germania, EU
- [ ] Image: Ubuntu 24.04 LTS
- [ ] Type: CX22 (2 vCPU, 4GB RAM, 40GB SSD) - €5.83/mese
- [ ] SSH Key: Selezionare `studio-erp-deploy`
- [ ] Firewall: Create new
  - Allow: 22 (SSH), 80 (HTTP), 443 (HTTPS)
  - Deny: All other
- [ ] Nome server: `studio-erp-prod`
- [ ] Clicca: Create & Buy now
- [ ] **IMPORTANTE**: Copiare IP pubblico assegnato

**Opzione B: Provisioning Ansible** (non ancora implementato nel playbook provision.yml):
```bash
# TODO: Implementare playbook provision.yml per creazione server via API
```

- [ ] Server creato e running
- [ ] IP pubblico annotato: `_____._____._____.______`
- [ ] SSH test funziona:
  ```bash
  ssh -i ~/.ssh/studio_erp_deploy root@<IP_SERVER>
  ```

### 5.2 Update DNS

- [ ] Aggiornare record A DNS:
  ```
  erp.studioromano.it.  A  <IP_SERVER_HETZNER>
  ```
- [ ] Attendere propagazione DNS (5-30 min)
- [ ] Verificare:
  ```bash
  dig +short erp.studioromano.it  # Deve restituire IP Hetzner
  ```

### 5.3 Update Ansible Inventory

```bash
cd studio-erp/ansible
vi inventory/production.yml

# Sostituire XXX.XXX.XXX.XXX con IP reale server
ansible_host: <IP_SERVER_HETZNER>
```

- [ ] IP aggiornato in `inventory/production.yml`
- [ ] File salvato

### 5.4 Update GitHub Secret

- [ ] GitHub → Settings → Secrets → Actions
- [ ] Modifica secret: `PRODUCTION_SERVER_IP`
- [ ] Nuovo valore: `<IP_SERVER_HETZNER>`
- [ ] Save

### 5.5 Test Connettività Ansible

```bash
cd studio-erp/ansible

# Ping test
ansible all -m ping --vault-password-file .vault_pass

# Output atteso:
# studio-erp-prod | SUCCESS => {
#     "changed": false,
#     "ping": "pong"
# }
```

- [ ] Ansible ping SUCCESS
- [ ] SSH connessione funzionante

### 5.6 Deploy Completo

```bash
cd studio-erp/ansible

# Deploy completo (prima volta - include tutto)
ansible-playbook playbooks/site.yml --vault-password-file .vault_pass

# Durata stimata: 25-30 minuti
# Fasi eseguite:
# 1. Common (5 min)
# 2. Security (3 min)
# 3. Database (5 min)
# 4. Application (10 min - include Let's Encrypt)
# 5. Monitoring (5 min)
# 6. Backup (2 min)
```

**Monitorare output** per:
- [ ] Nessun errore FATAL
- [ ] Tutti i task completati
- [ ] Certificato SSL ottenuto da Let's Encrypt
- [ ] Applicazione pm2 running
- [ ] Health check finale SUCCESS

### 5.7 Post-Deployment Verification

**Test Endpoint**:
```bash
# Homepage
curl -I https://erp.studioromano.it
# Atteso: HTTP/2 200

# Health check
curl https://erp.studioromano.it/api/health
# Atteso: {"status":"ok"}

# Bundle API (pubblico)
curl https://erp.studioromano.it/api/bundles | jq
# Atteso: Array di 8 bundle
```

- [ ] HTTPS funzionante (certificato valido)
- [ ] Homepage carica correttamente
- [ ] API health check risponde
- [ ] Bundle catalog visibile

**Test Monitoring**:
```bash
# Prometheus
curl http://<IP_SERVER>:9090/-/healthy
# Atteso: Prometheus is Healthy.

# Grafana
curl -I http://<IP_SERVER>:3001/login
# Atteso: HTTP/1.1 200 OK
```

- [ ] Prometheus UP (porta 9090)
- [ ] Grafana UP (porta 3001)
- [ ] Login Grafana funziona (admin / <GRAFANA_ADMIN_PASSWORD>)

**Test Backup**:
```bash
ssh root@<IP_SERVER>

# Controlla cron backup
crontab -l | grep backup

# Controlla ultimo backup
ls -lh /backup/daily/

# Test manuale backup
/opt/backup/backup-db.sh
tail -50 /var/log/backup.log
```

- [ ] Cron job configurati (4 job)
- [ ] Backup test manuale SUCCESS
- [ ] File backup presente e cifrato (.gpg)
- [ ] Log backup puliti (no errori)

---

## ✅ Fase 6: Application Setup (20 min)

### 6.1 Database Bundle Import

```bash
ssh root@<IP_SERVER>
cd /var/www/studio-erp
sudo -u studio bash

# Import 8 bundle
npm run db:update-bundle

# Verifica
npx prisma studio  # Aprire browser su localhost:5555 (via SSH tunnel)
# O query diretta:
psql -h localhost -U studio_user -d studio_erp -c "SELECT codice, nome FROM bundle;"
```

- [ ] 8 bundle importati correttamente:
  - BDL-CONSULENZA
  - BDL-RISTR-BONUS
  - BDL-DUE-DILIGENCE
  - BDL-VULN-SISMICA
  - BDL-AMPLIAMENTO
  - BDL-COLLAUDO
  - BDL-ANTINCENDIO
  - BDL-EFF-ENERGETICO

### 6.2 Primo Utente Admin

**Opzione A: Via UI** (consigliato):
- [ ] Aprire: https://erp.studioromano.it/auth/signup
- [ ] Registrare primo utente:
  - Email: `benedetto.romano@studioromano.it`
  - Password: (sicura, salvare in password manager)
  - Nome: Benedetto Romano
  - P.IVA: (P.IVA studio)
- [ ] Confermare email (se email verification abilitata)

**Opzione B: Promozione a TITOLARE via DB**:
```bash
ssh root@<IP_SERVER>
sudo -u postgres psql studio_erp

UPDATE utente
SET ruolo = 'TITOLARE'
WHERE email = 'benedetto.romano@studioromano.it';

\q
```

- [ ] Utente TITOLARE creato
- [ ] Login funzionante
- [ ] Dashboard accessibile

### 6.3 Test Stripe Webhook

**Stripe Dashboard**:
- [ ] Developers → Webhooks → Click endpoint `erp.studioromano.it/api/webhooks/stripe`
- [ ] Send test webhook → `checkout.session.completed`
- [ ] Verificare risposta: **200 OK**

**Server logs**:
```bash
ssh root@<IP_SERVER>
sudo -u studio pm2 logs studio-erp --lines 50 | grep webhook
```

- [ ] Webhook ricevuto correttamente
- [ ] Signature verificata
- [ ] Nessun errore nei log

---

## ✅ Fase 7: CI/CD Pipeline Test (15 min)

### 7.1 Test Pull Request Workflow

```bash
# Locale
git checkout -b test/ci-cd-pipeline
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: Verifica CI/CD pipeline"
git push origin test/ci-cd-pipeline
```

- [ ] Aprire PR su GitHub: `test/ci-cd-pipeline` → `main`
- [ ] GitHub Actions esegue `test-pr.yml`
- [ ] Verificare jobs:
  - [ ] Lint Code: ✅ SUCCESS
  - [ ] Test Build: ✅ SUCCESS
  - [ ] Security Scan: ✅ SUCCESS (o warning acceptable)
  - [ ] Validate Prisma Schema: ✅ SUCCESS
- [ ] Bot commenta PR con risultati
- [ ] Merge PR (se test)

### 7.2 Test Deploy Production Workflow

**Dopo merge PR a main**:
- [ ] GitHub Actions esegue `deploy-production.yml`
- [ ] Jobs sequence:
  1. [ ] Test & Build: ✅
  2. [ ] Security Scan: ✅
  3. [ ] **Deploy** → PAUSE per approval
- [ ] Ricevi notifica "Waiting for approval"
- [ ] GitHub → Actions → Deploy to Production → **Review deployments**
- [ ] Clicca: **Approve and deploy**
- [ ] Deploy continua:
  4. [ ] Deploy to Hetzner: ✅ (Ansible run)
  5. [ ] Post-Deployment Verification: ✅
  6. [ ] Notify Success: ✅ (email ricevuta)

**Verifica applicazione**:
- [ ] https://erp.studioromano.it carica nuova versione
- [ ] Commit SHA visibile in Sentry (se configurato)
- [ ] Nessun errore nei log pm2

---

## ✅ Fase 8: Security Hardening Post-Deploy (20 min)

### 8.1 Firewall Verification

```bash
ssh root@<IP_SERVER>

# Controlla UFW
ufw status verbose

# Output atteso:
# Status: active
# To                         Action      From
# --                         ------      ----
# 22/tcp                     LIMIT       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

- [ ] UFW enabled
- [ ] Solo 22, 80, 443 aperti
- [ ] SSH rate-limited (LIMIT)

### 8.2 SSH Hardening Verification

```bash
ssh root@<IP_SERVER>

# Controlla config SSH
grep -E "^(PermitRootLogin|PasswordAuthentication|PubkeyAuthentication)" /etc/ssh/sshd_config

# Output atteso:
# PermitRootLogin prohibit-password
# PasswordAuthentication no
# PubkeyAuthentication yes
```

- [ ] Password authentication disabled
- [ ] Solo key-based login

**Test password login (deve fallire)**:
```bash
# Da laptop (senza -i key)
ssh root@<IP_SERVER>
# Atteso: Permission denied (publickey)
```

- [ ] Password login bloccato ✅

### 8.3 Fail2Ban Verification

```bash
ssh root@<IP_SERVER>

# Status Fail2Ban
systemctl status fail2ban

# Controlla jail SSH
fail2ban-client status sshd

# Output atteso:
# Status for the jail: sshd
# |- Filter
# |  |- Currently failed: 0
# |  |- Total failed:     0
# |  `- File list:        /var/log/auth.log
# `- Actions
#    |- Currently banned: 0
#    `- Total banned:     0
```

- [ ] Fail2Ban running
- [ ] Jail sshd attivo

### 8.4 SSL/TLS Verification

**SSL Labs Test**:
- [ ] Aprire: https://www.ssllabs.com/ssltest/
- [ ] Test: `erp.studioromano.it`
- [ ] Attendere scan completo (2-3 min)
- [ ] **Target score**: A o A+

**Verifica manuale**:
```bash
# Controlla certificato
openssl s_client -connect erp.studioromano.it:443 -servername erp.studioromano.it < /dev/null 2>/dev/null | openssl x509 -noout -dates -issuer

# Verifica HSTS header
curl -I https://erp.studioromano.it | grep -i strict-transport-security
```

- [ ] Certificato valido (Let's Encrypt)
- [ ] Scadenza > 60 giorni
- [ ] HSTS header presente
- [ ] TLS 1.2+ only

### 8.5 Security Headers Verification

```bash
curl -I https://erp.studioromano.it
```

**Verificare presenza headers**:
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy: ...` (presente)

**Security Headers Test**:
- [ ] https://securityheaders.com → Test `erp.studioromano.it`
- [ ] **Target score**: A o A+

---

## ✅ Fase 9: Monitoring Setup (15 min)

### 9.1 Grafana Dashboard Access

```bash
# Aprire browser
http://<IP_SERVER>:3001

# Login:
# Username: admin
# Password: <GRAFANA_ADMIN_PASSWORD> (da GitHub Secret)
```

- [ ] Grafana login funziona
- [ ] Datasource Prometheus configurato (verde)
- [ ] 2 Dashboard importate:
  - [ ] Node Exporter Full (system metrics)
  - [ ] PostgreSQL Database

### 9.2 Dashboard Verification

**Node Exporter Dashboard**:
- [ ] CPU usage visibile
- [ ] Memory usage ~25% (1GB usato / 4GB totale)
- [ ] Disk usage < 20%
- [ ] Network traffic visibile

**PostgreSQL Dashboard**:
- [ ] Connections ~5-10 (normale)
- [ ] Query rate visibile
- [ ] Database size visibile

### 9.3 Alert Configuration (Opzionale)

**Grafana Alerting** (se si vuole notifica email):
- [ ] Grafana → Alerting → Notification channels → Add channel
- [ ] Type: Email
- [ ] Email: `benedetto.romano@studioromano.it`
- [ ] Test: Send Test
- [ ] Save

**Alert Rules** (già configurate in Prometheus):
- [ ] Prometheus → Alerts
- [ ] Verificare 6 alert rules presenti:
  - HighCPUUsage
  - HighMemoryUsage
  - DiskSpaceLow
  - ServiceDown
  - PostgreSQLDown
  - TooManyDatabaseConnections

### 9.4 Metrics Retention

- [ ] Prometheus retention: 15 giorni (configurato)
- [ ] Grafana dashboard salvati permanentemente

---

## ✅ Fase 10: Backup Verification (10 min)

### 10.1 Manual Backup Test

```bash
ssh root@<IP_SERVER>

# Esegui backup manuale
/opt/backup/backup-db.sh

# Controlla output
tail -100 /var/log/backup.log

# Verifica file creato
ls -lh /backup/daily/
ls -lh /backup/postgresql/
```

- [ ] Backup eseguito senza errori
- [ ] File `.gpg` creato
- [ ] File `.sha256` checksum creato
- [ ] Dimensione backup ragionevole (es: 5-50 MB)

### 10.2 Backup Restoration Test

```bash
ssh root@<IP_SERVER>

# Identifica ultimo backup
LATEST_BACKUP=$(ls -t /backup/daily/*.sql.gpg | head -1)

# Test decryption (senza restore effettivo)
echo "{{ vault_backup_encryption_passphrase }}" | gpg \
  --batch --passphrase-fd 0 --decrypt "$LATEST_BACKUP" \
  | head -20

# Output atteso: Header SQL dump PostgreSQL
```

- [ ] Decryption funziona
- [ ] File SQL valido

**Restore test su database temporaneo** (opzionale):
```sql
-- Creare DB test
sudo -u postgres psql -c "CREATE DATABASE studio_erp_test;"

-- Restore
gpg --decrypt /backup/daily/studio_erp_YYYYMMDD.sql.gpg | \
  pg_restore -U postgres -d studio_erp_test

-- Verifica
sudo -u postgres psql studio_erp_test -c "SELECT COUNT(*) FROM bundle;"
-- Atteso: 8

-- Cleanup
sudo -u postgres psql -c "DROP DATABASE studio_erp_test;"
```

- [ ] Restore test SUCCESS

### 10.3 Backup Schedule Verification

```bash
ssh root@<IP_SERVER>

# Controlla cron jobs
crontab -l | grep backup

# Output atteso:
# 0 3 * * * /opt/backup/backup-db.sh >> /var/log/backup.log 2>&1
# 30 3 * * * /opt/backup/backup-files.sh >> /var/log/backup.log 2>&1
# 0 4 * * 0 /opt/backup/verify-backup.sh >> /var/log/backup.log 2>&1
# 0 5 * * * /opt/backup/sync-to-storage-box.sh >> /var/log/backup.log 2>&1 (se Storage Box)
```

- [ ] 3-4 cron job configurati
- [ ] Schedule corretto (3:00, 3:30, 4:00, 5:00 AM)

### 10.4 Storage Box Sync (Se configurato)

```bash
# Test connessione Storage Box
ssh {{ vault_backup_storage_box_user }}@{{ vault_backup_storage_box_host }}

# List backups remoti
ls -lh studio-erp-backups/daily/
```

- [ ] Connessione Storage Box funziona
- [ ] Backup sincronizzati
- [ ] Off-site backup attivo ✅

---

## ✅ Fase 11: Compliance Documentation (15 min)

### 11.1 ISO 27001 Documentation Review

**Verificare documenti presenti**:
- [ ] `docs/iso-27001/RISK_ASSESSMENT.md`
- [ ] `docs/iso-27001/ACCESS_CONTROL.md`
- [ ] `docs/iso-27001/SECURITY_POLICIES.md`
- [ ] `docs/iso-27001/INCIDENT_RESPONSE.md`
- [ ] `docs/iso-27001/DATA_FLOW_DIAGRAM.md`

**Aggiornare documenti con dati reali**:
- [ ] Server IP address
- [ ] SSL certificate details
- [ ] Backup schedule reale
- [ ] Date deployment

### 11.2 Legal Documents Update

**Privacy Policy** (`docs/legal/PRIVACY_POLICY.md`):
- [ ] Sostituire placeholder P.IVA: `IT12345678901` → P.IVA reale
- [ ] Sostituire indirizzo sede legale
- [ ] Sostituire numero telefono
- [ ] Sostituire email DPO (se nominato)

**Terms & Conditions** (`docs/legal/TERMS_CONDITIONS.md`):
- [ ] Sostituire P.IVA
- [ ] Sostituire indirizzo
- [ ] Sostituire telefono
- [ ] Aggiungere polizza assicurazione professionale (numero polizza, massimale)
- [ ] Aggiungere matricola Ordine Ingegneri

### 11.3 Publish Legal Pages

```bash
# Locale - creare route legal
cd studio-erp/app/(public)
mkdir legal
cd legal

# Creare pagine (TODO - da implementare)
# - app/(public)/legal/privacy/page.tsx
# - app/(public)/legal/terms/page.tsx
# - app/(public)/legal/cookies/page.tsx
```

- [ ] Pagine legal pubblicate
- [ ] Link in footer homepage
- [ ] Pre-checkout acceptance checkbox implementato

---

## ✅ Fase 12: Final Checks (10 min)

### 12.1 Performance Test

**Lighthouse CI**:
- [ ] Chrome DevTools → Lighthouse
- [ ] URL: `https://erp.studioromano.it`
- [ ] Mode: Desktop + Mobile
- [ ] Categories: Performance, Accessibility, Best Practices, SEO

**Target Scores**:
- [ ] Performance: > 70 (ideale > 85)
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### 12.2 Load Test (Opzionale)

```bash
# Install Apache Bench (se non presente)
# macOS: brew install httpd
# Ubuntu: sudo apt install apache2-utils

# Test 100 concurrent requests
ab -n 1000 -c 100 https://erp.studioromano.it/

# Verificare:
# - Requests per second: > 50
# - Time per request: < 2000 ms
# - Failed requests: 0
```

- [ ] Load test SUCCESS
- [ ] Nessuna request fallita

### 12.3 Error Tracking Verification

**Sentry** (se configurato):
- [ ] Sentry dashboard → Project: studio-erp
- [ ] Nessun errore critico
- [ ] Source maps uploaded (per debug)

**Server Logs**:
```bash
ssh root@<IP_SERVER>

# pm2 logs (ultime 24 ore)
sudo -u studio pm2 logs studio-erp --lines 200 --nostream

# Nginx error log
tail -100 /var/log/nginx/studio-erp-error.log

# PostgreSQL log
tail -100 /var/log/postgresql/postgresql-16-main.log
```

- [ ] Nessun errore critico nei log
- [ ] Solo warning accettabili

### 12.4 Uptime Monitoring Setup (Opzionale)

**UptimeRobot** (gratuito):
- [ ] Account: https://uptimerobot.com
- [ ] Add New Monitor:
  - Type: HTTPS
  - URL: `https://erp.studioromano.it/api/health`
  - Interval: 5 minutes
  - Alert Contacts: Email `benedetto.romano@studioromano.it`

**Hetrixtools** (alternativa):
- [ ] https://hetrixtools.com

- [ ] Uptime monitor configurato
- [ ] Alert email test ricevuta

---

## 🎉 DEPLOYMENT COMPLETATO!

### Checklist Finale

**Infrastructure**:
- [x] Server Hetzner running
- [x] DNS configurato
- [x] SSL/TLS funzionante (Let's Encrypt)
- [x] Firewall configurato (UFW)

**Application**:
- [x] Next.js deployed e running (pm2)
- [x] Database PostgreSQL 16 operativo
- [x] 8 Bundle importati
- [x] Utente TITOLARE creato
- [x] Stripe webhook funzionante

**Monitoring**:
- [x] Prometheus + Grafana running
- [x] Dashboard configurate
- [x] Alert rules attive

**Backup**:
- [x] Backup automatici configurati
- [x] Encryption funzionante
- [x] Restore test SUCCESS

**Security**:
- [x] SSH hardening
- [x] Fail2Ban attivo
- [x] Security headers configurati
- [x] SSL Labs score: A/A+

**CI/CD**:
- [x] GitHub Actions funzionante
- [x] PR workflow testato
- [x] Deploy automation testato
- [x] Rollback testato (se necessario)

**Compliance**:
- [x] ISO 27001 documentation completa
- [x] Privacy Policy pubblicata
- [x] Terms & Conditions pubblicati

---

## 📞 Support Contacts

**Infrastructure**:
- Hetzner Support: https://console.hetzner.cloud/support

**Services**:
- Stripe: https://support.stripe.com
- SendGrid: https://support.sendgrid.com
- Upstash: https://upstash.com/support

**Emergency**:
- Titolare: +39 XXX XXX XXXX
- Email: benedetto.romano@studioromano.it

---

## 📅 Post-Deployment Schedule

**Daily** (automatico):
- 03:00 - Database backup
- 03:30 - Files backup
- 05:00 - Storage Box sync

**Weekly**:
- [ ] Domenica 04:00 - Backup verification test (automatico)
- [ ] Review Grafana dashboards (CPU, RAM, disk trends)
- [ ] Review error logs

**Monthly**:
- [ ] Security updates review (Snyk alerts)
- [ ] SSL certificate renewal check (automatico Let's Encrypt)
- [ ] Backup restore test manuale
- [ ] Review compliance documentation

**Quarterly**:
- [ ] Secrets rotation (NEXTAUTH_SECRET, API keys)
- [ ] Penetration test (OWASP ZAP)
- [ ] ISO 27001 internal audit
- [ ] Disaster recovery drill

---

**Fine Checklist**

**Deployment Date**: __________________
**Deployed By**: Ing. Romano Benedetto
**Signature**: __________________
