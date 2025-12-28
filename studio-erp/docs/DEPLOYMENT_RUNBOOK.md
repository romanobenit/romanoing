# 🚀 Production Deployment Runbook
## Studio ERP - Quick Reference Guide

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: Ing. Romano Domenico
**Tempo totale**: ~3 ore (setup) + 30 min (deploy)

---

## 📌 Quick Links

- **Deployment Checklist Completa**: `docs/DEPLOYMENT_READINESS_CHECKLIST.md`
- **Ansible README**: `ansible/README.md`
- **CI/CD README**: `.github/workflows/README.md`
- **Changelog**: `CHANGELOG.md`

---

## ⚡ Quick Start (Experienced Users)

**Se hai già fatto setup una volta**:

```bash
# 1. Update code
git pull origin main

# 2. Deploy
cd studio-erp/ansible
ansible-playbook playbooks/site.yml --vault-password-file .vault_pass

# 3. Verify
curl https://erp.studioromano.it/api/health
```

**Deploy solo applicazione** (update codice):
```bash
cd studio-erp/ansible
ansible-playbook playbooks/application.yml --tags deploy --vault-password-file .vault_pass
```

---

## 📋 First-Time Deployment (30 min deploy + 3h setup)

### Pre-Flight Checklist (5 min)

**Verifiche rapide**:
- [ ] Hai accesso Hetzner Cloud?
- [ ] Hai access GitHub repository `romanobenit/romanoing`?
- [ ] Hai account Stripe production?
- [ ] Hai account SendGrid?
- [ ] Dominio `studioromano.it` registrato?

**Se NO a qualsiasi domanda**: Vedi `DEPLOYMENT_READINESS_CHECKLIST.md` per setup completo.

---

### Step 1: Provision Server Hetzner (10 min)

**Via Console** (più semplice):

1. https://console.hetzner.cloud → **Add Server**
2. **Location**: Norimberga (nbg1)
3. **Image**: Ubuntu 24.04 LTS
4. **Type**: CX22 (€5.83/mese)
5. **SSH Key**: Upload tua chiave pubblica
   ```bash
   cat ~/.ssh/id_rsa.pub  # Copia output
   ```
6. **Firewall**: Create new → Allow 22, 80, 443
7. **Name**: `studio-erp-prod`
8. **Create & Buy**

**Copia IP server**: `_____._____._____.______`

---

### Step 2: Configure DNS (5 min)

**Provider DNS** (es: Aruba, Register.it, Cloudflare):

1. Accedi pannello DNS
2. Crea record A:
   ```
   Tipo: A
   Nome: erp
   Valore: <IP_HETZNER_COPIATO>
   TTL: 300
   ```
3. Salva

**Verifica propagazione**:
```bash
dig +short erp.studioromano.it
# Dovrebbe restituire IP Hetzner (potrebbe richiedere 5-30 min)
```

---

### Step 3: Configure GitHub Secrets (20 min)

**GitHub → Settings → Secrets and variables → Actions**

**Secrets OBBLIGATORI** (15 minimi):

| Secret Name | Come Ottenerlo | Esempio |
|-------------|----------------|---------|
| `SSH_PRIVATE_KEY` | `cat ~/.ssh/id_rsa` | `-----BEGIN RSA PRIVATE KEY-----...` |
| `PRODUCTION_SERVER_IP` | IP server Hetzner | `123.45.67.89` |
| `ANSIBLE_VAULT_PASSWORD` | `openssl rand -base64 32` | Salva in password manager! |
| `POSTGRESQL_PASSWORD` | `openssl rand -base64 32` | |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | `pk_live_XXX` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | `sk_live_XXX` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks → Signing | `whsec_XXX` |
| `SENDGRID_API_KEY` | SendGrid → API Keys | `SG.XXX` |
| `UPSTASH_REDIS_REST_URL` | Upstash Console → REST API | `https://XXX.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Console → REST API | `AXXXXXXXXXXXXX` |
| `BACKUP_ENCRYPTION_PASSPHRASE` | `openssl rand -base64 48` | |
| `GRAFANA_ADMIN_PASSWORD` | `openssl rand -base64 24` | |
| `HETZNER_API_TOKEN` | Hetzner → Security → API | `XXXXXXXXXXXX` |

**Secrets OPZIONALI** (+7):
- `OPENAI_API_KEY` (se vuoi AI assistant)
- `SENTRY_DSN` + `SENTRY_AUTH_TOKEN` (error tracking)
- `SNYK_TOKEN` (security scan)
- `BACKUP_STORAGE_BOX_*` (3 secrets per off-site backup)

---

### Step 4: Setup Ansible Locale (15 min)

**Install Ansible**:
```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update && sudo apt install ansible python3-pip

# Verify
ansible --version  # >= 2.15
```

**Setup Vault**:
```bash
cd studio-erp/ansible

# Install collections
ansible-galaxy collection install community.general community.postgresql ansible.posix

# Create vault from template
cp group_vars/production/vault.yml.template group_vars/production/vault.yml

# Edit vault (sostituisci TUTTI i placeholder)
vi group_vars/production/vault.yml

# Encrypt vault (usa STESSA password di GitHub Secret)
ansible-vault encrypt group_vars/production/vault.yml
Password: <ANSIBLE_VAULT_PASSWORD>

# Create local password file (NON committare!)
echo "<ANSIBLE_VAULT_PASSWORD>" > .vault_pass
chmod 600 .vault_pass

# Update inventory con IP server
vi inventory/production.yml
# Sostituisci XXX.XXX.XXX.XXX con IP Hetzner
```

**Test connessione**:
```bash
ansible all -m ping --vault-password-file .vault_pass

# Output atteso:
# studio-erp-prod | SUCCESS => {
#     "changed": false,
#     "ping": "pong"
# }
```

---

### Step 5: Deploy Completo (25-30 min)

**Launch deployment**:
```bash
cd studio-erp/ansible

# Deploy TUTTO (prima volta)
time ansible-playbook playbooks/site.yml --vault-password-file .vault_pass

# Prendi caffè ☕ - durata ~27 minuti
```

**Monitor output**:
- ✅ Verde = OK
- 🟡 Giallo = Changed (normale)
- ❌ Rosso = FATAL (problema)

**Se vedi errore FATAL**:
1. Leggi messaggio errore
2. Cerca in `ansible/README.md` → Troubleshooting
3. Oppure: `docs/DEPLOYMENT_READINESS_CHECKLIST.md` → Step correlato

---

### Step 6: Verify Deployment (5 min)

**Test rapidi**:
```bash
# Homepage HTTPS
curl -I https://erp.studioromano.it
# Atteso: HTTP/2 200

# Health check API
curl https://erp.studioromano.it/api/health
# Atteso: {"status":"ok"}

# Bundle catalog
curl -s https://erp.studioromano.it/api/bundles | jq length
# Atteso: 8

# SSL test
openssl s_client -connect erp.studioromano.it:443 -servername erp.studioromano.it < /dev/null 2>&1 | grep "Verify return code"
# Atteso: Verify return code: 0 (ok)
```

**Browser test**:
1. Apri https://erp.studioromano.it
2. Verifica:
   - [ ] Homepage carica (8 bundle visibili)
   - [ ] Badge ISO 9001/27001 presenti
   - [ ] Nessun errore console (F12)
   - [ ] Certificato SSL valido (lucchetto verde)

**Monitoring test**:
```bash
# Grafana
http://<IP_SERVER>:3001
# Login: admin / <GRAFANA_ADMIN_PASSWORD>
```

**SSH test**:
```bash
ssh root@<IP_SERVER>

# Check servizi
systemctl status postgresql  # ✅ active
systemctl status nginx       # ✅ active
pm2 status                   # studio-erp online

# Check backup
ls -lh /backup/daily/
# Dovrebbe esserci 1 file .gpg (backup test eseguito da playbook)

exit
```

---

### Step 7: Application Setup (10 min)

**Import 8 bundle**:
```bash
ssh root@<IP_SERVER>
cd /var/www/studio-erp
sudo -u studio bash

# Import bundle
npm run db:update-bundle

# Output atteso:
# DELETE 3
# INSERT 0 8

# Verify
npx prisma studio
# Browser: http://localhost:5555 (via SSH tunnel se remoto)
# Check: 8 bundle in tabella
```

**Crea primo utente TITOLARE**:
1. Browser: https://erp.studioromano.it/auth/signup
2. Registra:
   - Email: `domenico.romano@studioromano.it`
   - Password: (sicura, salva in password manager)
   - Nome: Domenico Romano
   - P.IVA: (reale)
3. Login: https://erp.studioromano.it/auth/signin
4. Verifica dashboard accessibile

**Promuovi a TITOLARE** (se non auto-promosso):
```bash
# SSH su server
ssh root@<IP_SERVER>
sudo -u postgres psql studio_erp

UPDATE utente SET ruolo = 'TITOLARE' WHERE email = 'domenico.romano@studioromano.it';
\q
```

**Configure Stripe Webhook**:
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: `https://erp.studioromano.it/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copy **Signing secret** (whsec_XXX)
4. Update GitHub Secret `STRIPE_WEBHOOK_SECRET` (se diverso)
5. Send test webhook → Verify 200 OK

---

### Step 8: CI/CD Pipeline Test (10 min)

**Setup Branch Protection**:
1. GitHub → Settings → Branches → Add rule
2. Branch: `main`
3. Enable:
   - ✅ Require pull request (1 approval)
   - ✅ Require status checks:
     - Lint Code
     - Test Build
     - Security Scan
     - Validate Prisma Schema
   - ✅ Require conversation resolution
4. Save

**Setup Environment Protection**:
1. GitHub → Settings → Environments → New: `production`
2. Protection rules:
   - ✅ Required reviewers: 1 (aggiungi te stesso)
   - ✅ Deployment branches: `main` only
3. Save

**Test PR Workflow**:
```bash
# Local
git checkout -b test/deploy-pipeline
echo "# Test" >> README.md
git add README.md
git commit -m "test: CI/CD pipeline verification"
git push origin test/deploy-pipeline
```

**Su GitHub**:
1. Open PR: `test/deploy-pipeline` → `main`
2. Verifica Actions:
   - ✅ Lint Code
   - ✅ Test Build
   - ✅ Security Scan
   - ✅ Validate Prisma Schema
3. Bot commenta PR con risultati
4. Merge PR (se vuoi testare deploy)

**Test Deploy Workflow** (dopo merge):
1. Actions → Deploy to Production → In corso
2. Jobs 1-2 completano automaticamente
3. Job 3 "Deploy" → **PAUSE** → Waiting for approval
4. Click **Review deployments** → **Approve**
5. Deploy continua e completa
6. Verifica email notifica SUCCESS ricevuta

---

## 🔄 Update Deployment (Only Code Changes)

**Scenario**: Hai modificato solo codice applicazione (no infra, no config)

**Quick update** (~3 minuti):
```bash
cd studio-erp/ansible

# Deploy solo app (skip infra)
ansible-playbook playbooks/application.yml \
  --tags deploy \
  --vault-password-file .vault_pass

# Steps eseguiti:
# 1. Git pull latest code
# 2. npm ci
# 3. Prisma generate
# 4. npm run build
# 5. pm2 restart
```

**Via CI/CD** (consigliato):
```bash
# Local
git add .
git commit -m "feat: Nuova funzionalità X"
git push origin main

# GitHub Actions farà deploy automatico dopo approval
```

---

## 🚨 Emergency Procedures

### Rollback (Last Deployment Failed)

**Automatic** (se CI/CD deploy fallisce):
- GitHub Actions esegue rollback automatico a commit precedente
- Email notifica inviata
- Verifica applicazione tornata a versione precedente

**Manual**:
```bash
ssh root@<IP_SERVER>
cd /var/www/studio-erp
sudo -u studio bash

# Vedi commit corrente
git log --oneline -5

# Rollback a commit precedente
git checkout <COMMIT_HASH_PRECEDENTE>

# Rebuild
npm ci
npx prisma generate
npm run build

# Restart
pm2 restart studio-erp

# Verify
pm2 logs studio-erp --lines 20
curl http://localhost:3000/api/health
```

---

### Service Down (App Not Responding)

**Quick fix**:
```bash
ssh root@<IP_SERVER>

# Check pm2
pm2 status
# Se status "errored" o "stopped":

pm2 restart studio-erp
pm2 logs studio-erp --lines 50

# Check Nginx
systemctl status nginx
# Se non running:
systemctl restart nginx

# Check PostgreSQL
systemctl status postgresql
# Se non running:
systemctl start postgresql
```

---

### Database Corruption (Restore from Backup)

**Restore ultimo backup**:
```bash
ssh root@<IP_SERVER>

# Identifica ultimo backup
ls -lt /backup/daily/*.sql.gpg | head -1

# Decrypt backup
LATEST_BACKUP=$(ls -t /backup/daily/*.sql.gpg | head -1)
echo "<BACKUP_ENCRYPTION_PASSPHRASE>" | gpg \
  --batch --passphrase-fd 0 \
  --decrypt "$LATEST_BACKUP" \
  > /tmp/restore.sql

# ATTENZIONE: Questo SOVRASCRIVE database corrente
sudo -u postgres pg_restore \
  -d studio_erp \
  -c \
  /tmp/restore.sql

# Verify
sudo -u postgres psql studio_erp -c "SELECT COUNT(*) FROM bundle;"
# Atteso: 8

# Cleanup
rm /tmp/restore.sql

# Restart app
pm2 restart studio-erp
```

---

### SSL Certificate Expired (Renew)

**Automatic** (dovrebbe rinnovarsi automaticamente):
```bash
# Verifica cron auto-renewal
ssh root@<IP_SERVER>
crontab -l | grep certbot
# Atteso: 0 3 * * * /usr/bin/certbot renew...
```

**Manual renewal**:
```bash
ssh root@<IP_SERVER>

# Renew certificate
certbot renew --nginx

# Se scaduto > 7 giorni:
certbot --nginx -d erp.studioromano.it --force-renewal

# Reload Nginx
systemctl reload nginx

# Verify
openssl s_client -connect erp.studioromano.it:443 < /dev/null 2>&1 | grep "Verify return code"
```

---

### Disk Space Full

**Check disk**:
```bash
ssh root@<IP_SERVER>
df -h

# Se > 90% pieno:
```

**Cleanup**:
```bash
# Old backups
find /backup/daily -type f -mtime +30 -delete

# Docker (se presente)
docker system prune -af

# Logs
journalctl --vacuum-size=500M

# npm cache
sudo -u studio npm cache clean --force

# Old builds
cd /var/www/studio-erp
sudo -u studio rm -rf .next/cache

# Verify
df -h
# Dovrebbe essere < 80%
```

---

## 📊 Monitoring Dashboards

### Grafana (System Metrics)

**URL**: `http://<IP_SERVER>:3001`
**Login**: `admin` / `<GRAFANA_ADMIN_PASSWORD>`

**Dashboard**:
1. **Node Exporter Full**:
   - CPU usage (target < 70%)
   - RAM usage (target < 80%)
   - Disk usage (target < 80%)
   - Network I/O
2. **PostgreSQL Database**:
   - Active connections (max 100)
   - Query rate
   - Cache hit ratio (target > 90%)
   - Slow queries

**Alert soglie**:
- 🟢 Normal: CPU < 70%, RAM < 70%, Disk < 70%
- 🟡 Warning: CPU 70-80%, RAM 70-80%, Disk 70-80%
- 🔴 Critical: CPU > 80%, RAM > 80%, Disk > 80%

---

### Application Logs

**pm2 logs**:
```bash
ssh root@<IP_SERVER>
sudo -u studio pm2 logs studio-erp

# Last 100 lines
pm2 logs studio-erp --lines 100 --nostream

# Only errors
pm2 logs studio-erp --err
```

**Nginx logs**:
```bash
# Access log
tail -f /var/log/nginx/studio-erp-access.log

# Error log
tail -f /var/log/nginx/studio-erp-error.log
```

**PostgreSQL logs**:
```bash
tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 🔒 Security Checklist

**Monthly Tasks**:
- [ ] Review Grafana alerts (CPU/RAM spikes anomali)
- [ ] Check fail2ban banned IPs: `fail2ban-client status sshd`
- [ ] Review audit logs: `aureport --summary`
- [ ] Check backup integrity: `/opt/backup/verify-backup.sh`
- [ ] Update dependencies: `npm audit` + fix

**Quarterly Tasks**:
- [ ] Rotate secrets (NEXTAUTH_SECRET, API keys)
- [ ] Review access control (utenti disabilitati/rimossi)
- [ ] Penetration test (OWASP ZAP)
- [ ] Disaster recovery drill (restore completo)

---

## 📞 Emergency Contacts

**Titolare**: Ing. Romano Domenico
- Tel: +39 XXX XXX XXXX
- Email: domenico.romano@studioromano.it

**Infrastructure**:
- Hetzner Support: https://console.hetzner.cloud/support

**Services**:
- Stripe: https://support.stripe.com
- SendGrid: https://support.sendgrid.com

**GitHub Actions Logs**:
- https://github.com/romanobenit/romanoing/actions

---

## ✅ Post-Deployment Checklist

**Immediate** (entro 1 ora):
- [ ] HTTPS funzionante (certificato valido)
- [ ] 8 bundle visibili su homepage
- [ ] Login funzionante
- [ ] Health check API: 200 OK
- [ ] Grafana dashboards popolate
- [ ] Backup test SUCCESS

**First Week**:
- [ ] Monitoring 24/7 attivo (es: UptimeRobot)
- [ ] Email alerts configurate (Grafana)
- [ ] Stripe webhook testato con pagamento reale test
- [ ] Legal pages pubblicate (Privacy, Terms)
- [ ] Google Analytics configurato (opzionale)

**First Month**:
- [ ] Review performance (Lighthouse score > 70)
- [ ] Review security (SSL Labs A+, securityheaders.com A)
- [ ] Review costs (Hetzner, Stripe fees, SendGrid)
- [ ] User feedback collected
- [ ] Backup restore drill completo

---

**Fine Runbook**

**Last Updated**: 2025-12-27
**Version**: 1.0
