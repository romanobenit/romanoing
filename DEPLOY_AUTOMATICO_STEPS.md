# 🚀 Deploy Automatico su Hetzner - Guida Rapida

**Tempo totale**: ~45 minuti (30 min setup secrets + 15 min deploy automatico)

---

## 📍 DOVE SEI ADESSO

✅ **Completato**:
- Ansible playbook configurati
- GitHub Actions workflow pronto
- Inventory aggiornato con IP server (116.203.10.59)
- Guida secrets creata

🔜 **Prossimi step**:
1. Configurare GitHub Secrets (30 minuti - una tantum)
2. Attivare deploy automatico (1 click)
3. Monitorare deploy (15 minuti - automatico)

---

## 🎯 STEP 1: Configura GitHub Secrets (30 min)

### Vai alla pagina Secrets:
```
https://github.com/romanobenit/romanoing/settings/secrets/actions
```

### Segui la guida dettagliata:
Apri il file **`GITHUB_SECRETS_SETUP.md`** nella root del progetto.

La guida contiene istruzioni dettagliate per tutti i 15+ secrets necessari.

### Quick Reference - Secrets Obbligatori (15):

| # | Nome Secret | Come Ottenerlo | Tempo |
|---|-------------|----------------|-------|
| 1 | `SSH_PRIVATE_KEY` | `cat ~/.ssh/id_rsa` | 1 min |
| 2 | `PRODUCTION_SERVER_IP` | `116.203.109.249` | 1 min |
| 3 | `ANSIBLE_VAULT_PASSWORD` | `openssl rand -base64 32` | 1 min |
| 4 | `POSTGRESQL_PASSWORD` | `openssl rand -base64 32` | 1 min |
| 5 | `NEXTAUTH_SECRET` | `openssl rand -base64 32` | 1 min |
| 6 | `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | 3 min |
| 7 | `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | 1 min |
| 8 | `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks (o placeholder) | 3 min |
| 9 | `SENDGRID_API_KEY` | SendGrid → Create API Key | 5 min |
| 10 | `UPSTASH_REDIS_REST_URL` | Upstash Console → Create DB | 5 min |
| 11 | `UPSTASH_REDIS_REST_TOKEN` | Upstash Console | 1 min |
| 12 | `HETZNER_API_TOKEN` | Hetzner Cloud → API Tokens | 2 min |
| 13 | `BACKUP_ENCRYPTION_PASSPHRASE` | `openssl rand -base64 48` | 1 min |
| 14 | `GRAFANA_ADMIN_PASSWORD` | `openssl rand -base64 24` | 1 min |
| 15 | `GITHUB_TOKEN` | Automatico ✅ | 0 min |

**Totale**: ~25-30 minuti

### ⚡ Quick Setup per secrets generati:

Apri Git Bash o Terminal e genera tutti i secrets random:

```bash
# Genera tutti i secrets in una volta
echo "=== SECRETS DA CONFIGURARE SU GITHUB ==="
echo ""
echo "ANSIBLE_VAULT_PASSWORD:"
openssl rand -base64 32
echo ""
echo "POSTGRESQL_PASSWORD:"
openssl rand -base64 32
echo ""
echo "NEXTAUTH_SECRET:"
openssl rand -base64 32
echo ""
echo "BACKUP_ENCRYPTION_PASSPHRASE:"
openssl rand -base64 48
echo ""
echo "GRAFANA_ADMIN_PASSWORD:"
openssl rand -base64 24
echo ""
echo "PRODUCTION_SERVER_IP:"
echo "116.203.109.249"
echo ""
echo "=== COPIA QUESTI VALORI E SALVALI IN PASSWORD MANAGER ==="
```

Copia l'output e salvalo in un file temporaneo o password manager.

### 📋 Checklist Configurazione

Verifica di aver configurato su GitHub:

**Obbligatori** (senza questi il deploy FALLISCE):
- [ ] SSH_PRIVATE_KEY
- [ ] PRODUCTION_SERVER_IP = `116.203.109.249`
- [ ] ANSIBLE_VAULT_PASSWORD
- [ ] POSTGRESQL_PASSWORD
- [ ] NEXTAUTH_SECRET
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET (anche placeholder "whsec_placeholder_temporary")
- [ ] SENDGRID_API_KEY
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] HETZNER_API_TOKEN
- [ ] BACKUP_ENCRYPTION_PASSPHRASE
- [ ] GRAFANA_ADMIN_PASSWORD

**Opzionali** (deploy funziona anche senza):
- [ ] OPENAI_API_KEY
- [ ] SENTRY_DSN
- [ ] SENTRY_AUTH_TOKEN
- [ ] SNYK_TOKEN

---

## 🚀 STEP 2: Attiva Deploy Automatico

### Opzione A: Via Pull Request (CONSIGLIATO - più sicuro)

1. **Vai su GitHub**:
   ```
   https://github.com/romanobenit/romanoing
   ```

2. **Crea Pull Request**:
   - Clicca **"Pull requests"** → **"New pull request"**
   - Base: `main` (o crea branch `main` se non esiste)
   - Compare: `claude/deploy-hetzner-production-b1nyM`
   - Clicca **"Create pull request"**

3. **Titolo PR**: `Deploy to Production - Hetzner Setup`

4. **Descrizione PR**:
   ```markdown
   ## 🚀 Deploy Produzione Hetzner

   Questo PR configura l'infrastruttura completa per il deploy automatico su Hetzner Cloud.

   ### ✅ Modifiche
   - Inventory Ansible configurato con IP production (116.203.109.249)
   - Guida setup GitHub Secrets completa
   - Workflow GitHub Actions pronto

   ### 📋 Pre-requisiti
   - [x] GitHub Secrets configurati (15 obbligatori)
   - [x] Server Hetzner attivo (116.203.10.59)
   - [x] SSH access verificato

   ### 🎯 Cosa succederà dopo il merge
   1. GitHub Actions parte automaticamente
   2. Setup completo infrastruttura (~30 min)
   3. Deploy applicazione Next.js
   4. Configurazione SSL/TLS
   5. Test automatici
   6. Notifica email a completamento

   ### 🔗 URLs dopo deploy
   - Applicazione: https://erp.studioromano.it
   - Grafana: http://116.203.109.249:3001
   ```

5. **Merge PR**:
   - Verifica che tutti i check passino
   - Clicca **"Merge pull request"**
   - Conferma merge

### Opzione B: Push Diretto su main (più veloce, meno sicuro)

Se hai permessi diretti su `main`:

```bash
# Dal tuo computer locale
cd ~/romanoing
git checkout main
git merge claude/deploy-hetzner-production-b1nyM
git push origin main
```

⚠️ **NOTA**: Questo potrebbe essere bloccato da branch protection rules.

---

## 📊 STEP 3: Monitora Deploy

### Vai su GitHub Actions:
```
https://github.com/romanobenit/romanoing/actions
```

### Cosa vedrai:

**Workflow**: "Deploy to Production"

**Jobs** (sequenziali):
1. **Test & Build** (~3 min)
   - Install dependencies
   - Lint code
   - Generate Prisma
   - Build Next.js

2. **Security Scan** (~2 min)
   - Snyk security scan
   - npm audit

3. **Deploy to Hetzner** (~25 min) ⚠️ **Richiede approval manuale**
   - Install Ansible
   - Configure SSH
   - Create vault
   - Run Ansible playbook
   - Health check

4. **Post-Deployment Tests** (~2 min)
   - Test endpoints
   - Test SSL/TLS
   - Test security headers
   - Lighthouse performance

5. **Notify Success** (1 min)
   - Email notifica completamento

**Totale**: ~30-35 minuti

### 🛑 Approval Manuale Richiesto

Al step 3 (Deploy to Hetzner), il workflow si **fermerà** e chiederà approval:

1. Riceverai notifica GitHub
2. Vai su Actions → Workflow run → "Review deployments"
3. Seleziona **production**
4. Clicca **"Approve and deploy"**

Questo è un meccanismo di sicurezza per evitare deploy accidentali.

### 📧 Notifiche Email

Riceverai email a:
- ✅ Deploy completato con successo
- ❌ Deploy fallito (con rollback automatico)

---

## ✅ STEP 4: Verifica Deploy Riuscito

### Test rapidi:

1. **Homepage**:
   ```
   https://erp.studioromano.it
   ```
   Dovresti vedere 8 bundle e certificato SSL valido (lucchetto verde).

2. **API Health Check**:
   ```bash
   curl https://erp.studioromano.it/api/health
   ```
   Output atteso: `{"status":"ok"}`

3. **API Bundle**:
   ```bash
   curl https://erp.studioromano.it/api/bundles | jq length
   ```
   Output atteso: `8`

4. **Grafana Dashboard**:
   ```
   http://116.203.109.249:3001
   ```
   - Username: `admin`
   - Password: `<GRAFANA_ADMIN_PASSWORD>` (secret GitHub)

5. **SSH Server**:
   ```bash
   ssh root@116.203.109.249
   pm2 status
   systemctl status nginx
   systemctl status postgresql
   ```

### Se tutto funziona:

✅ **Deploy completato con successo!**

Ora puoi:
- Accedere all'applicazione
- Creare primo utente TITOLARE
- Configurare Stripe webhook
- Importare bundle
- Configurare SendGrid domain verification

---

## 🔄 Deploy Successivi (Automatici)

Dopo il primo deploy, ogni volta che pushì su `main`:

1. Fai modifiche al codice
2. Commit e push su branch feature
3. Crea PR verso `main`
4. Merge PR
5. **GitHub Actions deploya automaticamente!** 🎉

Deploy incrementale: ~5-10 minuti (solo applicazione)

---

## 🆘 Troubleshooting

### Il workflow non parte

- **Verifica**: Path modificato include `studio-erp/**`
- **Soluzione**: Modifica almeno un file in `studio-erp/`

### Deploy fallisce: "SSH connection refused"

- **Causa**: SSH_PRIVATE_KEY non configurato correttamente
- **Soluzione**: Verifica che sia la chiave PRIVATA (non pubblica)

### Deploy fallisce: "Ansible vault error"

- **Causa**: ANSIBLE_VAULT_PASSWORD mancante o errato
- **Soluzione**: Verifica secret su GitHub

### Health check fallisce

- **Causa**: Applicazione non parte (errore build/runtime)
- **Soluzione**: Controlla logs PM2 via SSH:
  ```bash
  ssh root@116.203.109.249
  sudo -u studio pm2 logs studio-erp --lines 100
  ```

### Rollback automatico eseguito

- **Causa**: Post-deployment test falliti
- **Soluzione**: Controlla email notifica, verifica logs, fixa issue, riprova deploy

---

## 📞 Supporto

**Documentazione**:
- `GITHUB_SECRETS_SETUP.md` - Setup secrets dettagliato
- `DEPLOYMENT_GUIDE.md` - Guida deployment manuale
- `studio-erp/ansible/README.md` - Documentazione Ansible
- `studio-erp/.github/workflows/README.md` - Documentazione CI/CD

**Logs Deploy**:
- GitHub Actions: https://github.com/romanobenit/romanoing/actions
- Server SSH: `ssh root@116.203.109.249`
- PM2: `pm2 logs studio-erp`
- Nginx: `/var/log/nginx/studio-erp-error.log`

---

## 🎉 Next Steps Dopo Deploy

1. **Configura Stripe Webhook**:
   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://erp.studioromano.it/api/webhooks/stripe`
   - Copy signing secret → Update GitHub Secret

2. **Verifica SendGrid Domain**:
   - SendGrid → Settings → Sender Authentication
   - Authenticate Domain: `studioromano.it`
   - Aggiungi DNS records (SPF, DKIM)

3. **Crea Primo Utente TITOLARE**:
   - Vai su https://erp.studioromano.it/auth/signup
   - Registrati
   - Via SSH: promuovi a TITOLARE

4. **Import 8 Bundle**:
   ```bash
   ssh root@116.203.109.249
   cd /var/www/studio-erp
   sudo -u studio npm run db:update-bundle
   ```

5. **Setup Monitoring Alerts**:
   - UptimeRobot per uptime monitoring
   - Grafana alerts via email

6. **Security Hardening**:
   - Review Grafana dashboards
   - Setup fail2ban alerts
   - Review audit logs

---

**Buon deploy! 🚀**
