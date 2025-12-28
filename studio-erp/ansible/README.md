# 🤖 Ansible Automation - Studio ERP
## Infrastructure as Code per Deployment Hetzner

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: Ing. Romano Domenico
**Target**: Hetzner Cloud (Ubuntu 24.04 LTS)

---

## 📋 Indice

1. [Overview](#1-overview)
2. [Prerequisiti](#2-prerequisiti)
3. [Struttura Directory](#3-struttura-directory)
4. [Quick Start](#4-quick-start)
5. [Playbook Disponibili](#5-playbook-disponibili)
6. [Variabili Configurazione](#6-variabili-configurazione)
7. [Sicurezza Secrets](#7-sicurezza-secrets)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

Questa directory contiene playbook Ansible per automazione completa:
- ✅ Provisioning server Hetzner Cloud
- ✅ Hardening sicurezza (firewall, fail2ban, auto-updates)
- ✅ Setup PostgreSQL 16 con backup automatici
- ✅ Deploy applicazione Next.js (pm2)
- ✅ Configurazione Nginx + SSL (Let's Encrypt)
- ✅ Monitoring stack (Prometheus + Grafana + Node Exporter)
- ✅ Compliance ISO 27001 (audit logging, encryption)

**Obiettivo**: Zero-touch deployment da laptop a produzione in < 30 minuti.

---

## 2. Prerequisiti

### 2.1 Software Necessario (Control Node)

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update
sudo apt install ansible python3-pip

# Verifica installazione
ansible --version  # >= 2.15
```

### 2.2 Credenziali Necessarie

**Hetzner Cloud**:
- API Token (Read + Write): https://console.hetzner.cloud → Security → API Tokens
- SSH Key caricata: https://console.hetzner.cloud → Security → SSH Keys

**Domain DNS**:
- Record A: `erp.studioromano.it` → IP server Hetzner
- Record TXT: `_acme-challenge.erp.studioromano.it` (per Let's Encrypt DNS challenge, opzionale)

**Let's Encrypt**:
- Email valida per notifiche scadenza certificati

**GitHub**:
- Personal Access Token (se repository privato): Settings → Developer Settings → PAT

### 2.3 File Secrets

Crea file `group_vars/production/vault.yml` (cifrato con Ansible Vault):

```yaml
---
# Database
vault_postgresql_password: "PASSWORD_SUPER_SICURA_32_CARATTERI"

# Applicazione
vault_nextauth_secret: "RANDOM_32_BYTES_BASE64"
vault_stripe_secret_key: "sk_live_XXXXXX"
vault_stripe_webhook_secret: "whsec_XXXXXX"
vault_sendgrid_api_key: "SG.XXXXXX"
vault_openai_api_key: "sk-XXXXXX"  # opzionale

# Hetzner
vault_hetzner_api_token: "HETZNER_CLOUD_API_TOKEN"

# Backup
vault_backup_encryption_passphrase: "PASSPHRASE_BACKUP_GPG"
```

Cifra il file:
```bash
ansible-vault encrypt group_vars/production/vault.yml
# Inserisci password vault (salva in password manager!)
```

---

## 3. Struttura Directory

```
ansible/
├── README.md                     ← Questo file
├── ansible.cfg                   ← Configurazione Ansible
├── inventory/
│   ├── production.yml            ← Inventory server produzione
│   └── staging.yml               ← Inventory server staging (opzionale)
├── group_vars/
│   ├── all/
│   │   └── vars.yml              ← Variabili comuni (non sensitive)
│   └── production/
│       ├── vars.yml              ← Variabili produzione
│       └── vault.yml             ← Secrets cifrati (Ansible Vault)
├── playbooks/
│   ├── site.yml                  ← Playbook master (esegue tutto)
│   ├── provision.yml             ← 1. Crea server Hetzner
│   ├── security.yml              ← 2. Hardening sicurezza
│   ├── database.yml              ← 3. Setup PostgreSQL
│   ├── application.yml           ← 4. Deploy Next.js
│   ├── monitoring.yml            ← 5. Setup Prometheus + Grafana
│   └── backup.yml                ← 6. Configurazione backup
├── roles/
│   ├── common/                   ← Configurazione base OS
│   ├── security/                 ← Firewall, fail2ban, SSH hardening
│   ├── postgresql/               ← PostgreSQL 16 + tuning
│   ├── nodejs/                   ← Node.js 20 LTS + pm2
│   ├── nginx/                    ← Nginx + SSL Let's Encrypt
│   ├── application/              ← Deploy Studio ERP
│   ├── monitoring/               ← Prometheus + Grafana + Node Exporter
│   └── backup/                   ← Cron backup + Hetzner Storage Box
└── files/
    ├── nginx/
    │   └── studio-erp.conf.j2    ← Template Nginx vhost
    ├── systemd/
    │   └── studio-erp.service    ← Systemd unit file
    └── scripts/
        └── backup-db.sh          ← Script backup PostgreSQL
```

---

## 4. Quick Start

### 4.1 Setup Iniziale

```bash
# 1. Clona repository
git clone https://github.com/romanobenit/romanoing.git
cd romanoing/studio-erp/ansible

# 2. Installa dipendenze Ansible
ansible-galaxy install -r requirements.yml

# 3. Configura inventory (modifica IP/hostname)
vi inventory/production.yml

# 4. Configura variabili
vi group_vars/production/vars.yml

# 5. Crea e cifra secrets
vi group_vars/production/vault.yml
ansible-vault encrypt group_vars/production/vault.yml

# 6. Test connettività
ansible all -m ping --ask-vault-pass
```

### 4.2 Deployment Completo (Prima Volta)

```bash
# Esegue TUTTI i playbook in sequenza
ansible-playbook playbooks/site.yml --ask-vault-pass

# Durata stimata: 25-30 minuti
# Include:
# - Provisioning server Hetzner (5 min)
# - Security hardening (3 min)
# - PostgreSQL setup (5 min)
# - Applicazione deploy (7 min)
# - Monitoring setup (5 min)
# - Backup configuration (2 min)
```

### 4.3 Deploy Solo Applicazione (Update Codice)

```bash
# Solo update applicazione (no infrastruttura)
ansible-playbook playbooks/application.yml --ask-vault-pass --tags deploy

# Durata: 2-3 minuti
# Include:
# - Git pull latest code
# - npm ci
# - npm run build
# - pm2 restart
```

### 4.4 Verifica Deployment

```bash
# SSH su server
ssh root@<IP_SERVER>

# Verifica servizi
systemctl status postgresql
systemctl status nginx
pm2 status

# Verifica applicazione
curl -I https://erp.studioromano.it
# Dovrebbe rispondere: HTTP/2 200

# Verifica monitoring
curl http://localhost:9090  # Prometheus
curl http://localhost:3001  # Grafana
```

---

## 5. Playbook Disponibili

### 5.1 `site.yml` - Deployment Completo

**Descrizione**: Master playbook che esegue tutti gli altri in sequenza.

**Quando usare**: Prima installazione o disaster recovery completo.

```bash
ansible-playbook playbooks/site.yml --ask-vault-pass
```

---

### 5.2 `provision.yml` - Provisioning Server Hetzner

**Descrizione**: Crea server Hetzner Cloud via API.

**Risorse create**:
- CX22 server (2 vCPU, 4GB RAM, 40GB SSD) - €5.83/mese
- Ubuntu 24.04 LTS
- Cloud Firewall (HTTP, HTTPS, SSH)
- Private network (opzionale)
- Floating IP (opzionale per HA)

**Variabili richieste**:
```yaml
hetzner_api_token: "{{ vault_hetzner_api_token }}"
server_name: "studio-erp-prod"
server_type: "cx22"
server_location: "nbg1"  # Norimberga (EU)
```

**Esecuzione**:
```bash
ansible-playbook playbooks/provision.yml --ask-vault-pass
```

**Output**:
- IP pubblico server (salvato in `inventory/production.yml` automaticamente)

---

### 5.3 `security.yml` - Hardening Sicurezza

**Descrizione**: Applica best practices sicurezza ISO 27001.

**Configurazioni applicate**:
- ✅ Firewall UFW (solo 22, 80, 443)
- ✅ Fail2Ban (SSH brute-force protection)
- ✅ SSH hardening (no password login, solo key-based)
- ✅ Automatic security updates (unattended-upgrades)
- ✅ Audit logging (auditd)
- ✅ Time synchronization (chrony)
- ✅ Kernel hardening (sysctl)

**Esecuzione**:
```bash
ansible-playbook playbooks/security.yml --ask-vault-pass
```

**Verifica**:
```bash
# SSH su server
ssh root@<IP>

# Controlla firewall
ufw status

# Controlla fail2ban
fail2ban-client status sshd
```

---

### 5.4 `database.yml` - Setup PostgreSQL

**Descrizione**: Installa e configura PostgreSQL 16 ottimizzato.

**Configurazioni**:
- PostgreSQL 16 (repository ufficiale apt.postgresql.org)
- Database `studio_erp` creato
- Utente `studio_user` con password cifrata
- Tuning performance (shared_buffers, effective_cache_size)
- Backup giornalieri automatici (pg_dump)
- SSL/TLS abilitato
- Binding solo localhost (no accesso esterno)

**Esecuzione**:
```bash
ansible-playbook playbooks/database.yml --ask-vault-pass
```

**Verifica**:
```bash
ssh root@<IP>
sudo -u postgres psql -c "\l"  # Lista database
# Dovrebbe mostrare: studio_erp
```

---

### 5.5 `application.yml` - Deploy Next.js

**Descrizione**: Deploy applicazione Studio ERP.

**Step**:
1. Installa Node.js 20 LTS (via NodeSource)
2. Clona repository Git
3. Installa dipendenze (`npm ci`)
4. Genera Prisma Client (`npx prisma generate`)
5. Build Next.js (`npm run build`)
6. Configura pm2 (process manager)
7. Setup Nginx reverse proxy
8. Ottieni certificato SSL Let's Encrypt
9. Configura auto-restart on reboot

**Esecuzione**:
```bash
ansible-playbook playbooks/application.yml --ask-vault-pass
```

**Verifica**:
```bash
ssh root@<IP>
pm2 status  # Dovrebbe mostrare: studio-erp online
curl http://localhost:3000  # Next.js risponde
```

---

### 5.6 `monitoring.yml` - Setup Monitoring Stack

**Descrizione**: Installa Prometheus + Grafana + Node Exporter.

**Componenti**:
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Dashboard visualizzazione (port 3001)
- **Node Exporter**: Metriche OS (CPU, RAM, disk, network)
- **PostgreSQL Exporter**: Metriche database

**Dashboard pre-configurate**:
- Sistema operativo (CPU, memoria, disco, network)
- PostgreSQL (connections, queries, slow queries)
- Next.js (error rate, response time)

**Esecuzione**:
```bash
ansible-playbook playbooks/monitoring.yml --ask-vault-pass
```

**Accesso**:
- Prometheus: `http://<IP>:9090`
- Grafana: `http://<IP>:3001` (user: admin, password: vedere output playbook)

---

### 5.7 `backup.yml` - Configurazione Backup

**Descrizione**: Setup backup automatici giornalieri.

**Configurazione**:
- **PostgreSQL dump**: `pg_dump` daily (3:00 AM)
- **File applicazione**: rsync incrementale
- **Retention**: 30 giorni daily, 12 mesi monthly
- **Destinazione**: Hetzner Storage Box (20GB inclusi CX22)
- **Encryption**: GPG con passphrase
- **Verifica**: Test restore automatico settimanale

**Esecuzione**:
```bash
ansible-playbook playbooks/backup.yml --ask-vault-pass
```

**Test manuale**:
```bash
ssh root@<IP>
/opt/backup/backup-db.sh  # Esegue backup immediato
ls -lh /backup/daily/  # Verifica file creato
```

---

## 6. Variabili Configurazione

### 6.1 `group_vars/all/vars.yml` (Non Sensitive)

```yaml
---
# Applicazione
app_name: "studio-erp"
app_domain: "erp.studioromano.it"
app_port: 3000
app_user: "studio"
app_directory: "/var/www/studio-erp"

# Node.js
nodejs_version: "20"

# PostgreSQL
postgresql_version: "16"
postgresql_database: "studio_erp"
postgresql_user: "studio_user"

# Nginx
nginx_worker_processes: "auto"
nginx_client_max_body_size: "10M"

# SSL/TLS
letsencrypt_email: "domenico.romano@studioromano.it"
ssl_protocols: "TLSv1.2 TLSv1.3"

# Backup
backup_retention_days: 30
backup_time: "03:00"

# Monitoring
prometheus_retention: "15d"
grafana_port: 3001
```

### 6.2 `group_vars/production/vault.yml` (Cifrato)

Vedi sezione [2.3 File Secrets](#23-file-secrets).

---

## 7. Sicurezza Secrets

### 7.1 Generare Password Sicure

```bash
# Password PostgreSQL (32 caratteri)
openssl rand -base64 32

# NEXTAUTH_SECRET (32 bytes)
openssl rand -base64 32

# Backup encryption passphrase (64 caratteri)
openssl rand -base64 48
```

### 7.2 Gestione Ansible Vault

```bash
# Crea vault nuovo
ansible-vault create group_vars/production/vault.yml

# Modifica vault esistente
ansible-vault edit group_vars/production/vault.yml

# Cambio password vault
ansible-vault rekey group_vars/production/vault.yml

# Visualizza contenuto (temporaneo)
ansible-vault view group_vars/production/vault.yml

# Decifra permanentemente (NON RACCOMANDATO)
ansible-vault decrypt group_vars/production/vault.yml
```

### 7.3 Password Vault in File

Invece di `--ask-vault-pass` ogni volta:

```bash
# Crea file password (NON committare su Git!)
echo "PASSWORD_VAULT_QUI" > .vault_pass
chmod 600 .vault_pass

# Aggiungi a .gitignore
echo ".vault_pass" >> .gitignore

# Usa in playbook
ansible-playbook playbooks/site.yml --vault-password-file .vault_pass
```

---

## 8. Troubleshooting

### 8.1 Errore: "Unable to connect to server"

**Problema**: Ansible non riesce a connettersi via SSH.

**Soluzione**:
```bash
# Verifica SSH manuale
ssh root@<IP_SERVER>

# Se fallisce, controlla:
# 1. IP corretto in inventory/production.yml
# 2. SSH key aggiunta a ssh-agent
ssh-add -l

# 3. Firewall permette SSH (porta 22)
# Hetzner Console → Firewall → Allow TCP 22

# 4. Server è running
# Hetzner Console → Servers → Status: Running
```

---

### 8.2 Errore: "Database connection failed"

**Problema**: Applicazione non riesce a connettersi a PostgreSQL.

**Soluzione**:
```bash
ssh root@<IP>

# Verifica PostgreSQL running
systemctl status postgresql

# Testa connessione manuale
psql -h localhost -U studio_user -d studio_erp
# Password: (quella in vault_postgresql_password)

# Verifica DATABASE_URL in .env
cat /var/www/studio-erp/.env | grep DATABASE_URL

# Dovrebbe essere:
# DATABASE_URL="postgresql://studio_user:PASSWORD@localhost:5432/studio_erp?schema=public"
```

---

### 8.3 Errore: "SSL certificate not found"

**Problema**: Let's Encrypt non ha generato certificato.

**Soluzione**:
```bash
ssh root@<IP>

# Verifica DNS punta correttamente
dig +short erp.studioromano.it
# Dovrebbe restituire IP server

# Riprova ottenimento certificato
certbot --nginx -d erp.studioromano.it

# Se fallisce, controlla email Let's Encrypt per rate limit
# Limit: 5 tentativi/ora, 50/settimana per dominio
```

---

### 8.4 Errore: "pm2 process not running"

**Problema**: Applicazione Next.js non è avviata.

**Soluzione**:
```bash
ssh root@<IP>
sudo -u studio bash

# Controlla log pm2
pm2 logs studio-erp --lines 50

# Errori comuni:
# - "Cannot find module '@prisma/client'"
#   → Soluzione: npx prisma generate

# - "Error: connect ECONNREFUSED 127.0.0.1:5432"
#   → Soluzione: PostgreSQL non running, systemctl start postgresql

# - "Missing environment variable: NEXTAUTH_SECRET"
#   → Soluzione: Verifica /var/www/studio-erp/.env contiene tutte le variabili

# Restart manuale
cd /var/www/studio-erp
pm2 restart studio-erp
```

---

### 8.5 Errore: "Backup script failed"

**Problema**: Cron job backup non funziona.

**Soluzione**:
```bash
ssh root@<IP>

# Testa backup manuale
/opt/backup/backup-db.sh

# Controlla log
cat /var/log/backup.log

# Errori comuni:
# - "pg_dump: permission denied"
#   → Soluzione: Aggiungi utente backup a gruppo postgres

# - "gpg: encryption failed"
#   → Soluzione: Verifica passphrase in script backup
```

---

## 9. Best Practices

### 9.1 Development Workflow

**Locale → Staging → Production**:

```bash
# 1. Sviluppo locale (laptop)
npm run dev  # Test su localhost:3000

# 2. Deploy su staging (se disponibile)
ansible-playbook playbooks/application.yml -i inventory/staging.yml --ask-vault-pass --tags deploy

# 3. Test staging
curl https://staging.erp.studioromano.it

# 4. Deploy su production
ansible-playbook playbooks/application.yml -i inventory/production.yml --ask-vault-pass --tags deploy

# 5. Verifica production
curl https://erp.studioromano.it
```

---

### 9.2 Rollback Deployment

**Scenario**: Deploy produzione fallito, serve rollback a versione precedente.

```bash
# SSH su server
ssh root@<IP_SERVER>
sudo -u studio bash
cd /var/www/studio-erp

# Vedi commit Git corrente
git log --oneline -5

# Rollback a commit precedente
git checkout <COMMIT_HASH_PRECEDENTE>

# Reinstalla dipendenze (se package.json cambiato)
npm ci

# Rebuild
npm run build

# Restart
pm2 restart studio-erp

# Verifica
pm2 logs studio-erp --lines 20
```

---

### 9.3 Monitoraggio Post-Deployment

**Checklist** (primi 30 minuti dopo deploy):

- [ ] Health check: `curl https://erp.studioromano.it/api/health`
- [ ] Error rate Grafana: < 1% (dashboard "Application Errors")
- [ ] Response time: < 500ms P95 (dashboard "Performance")
- [ ] CPU usage: < 50% (dashboard "System Overview")
- [ ] Memory usage: < 70%
- [ ] Disk usage: < 80%
- [ ] PostgreSQL connections: < 50 (max 100)
- [ ] Logs pm2: No errori critici (`pm2 logs --err`)
- [ ] Backup eseguito: Controlla `/backup/daily/` (se deploy alle 3 AM)

---

## 10. Riferimenti

- **Ansible Documentation**: https://docs.ansible.com/
- **Hetzner Cloud API**: https://docs.hetzner.cloud/
- **PostgreSQL Tuning**: https://pgtune.leopard.in.ua/
- **Nginx Best Practices**: https://nginx.org/en/docs/
- **Let's Encrypt Rate Limits**: https://letsencrypt.org/docs/rate-limits/
- **ISO 27001 Controls**: docs/iso-27001/

---

## 11. Support

**Problemi Ansible**:
- GitHub Issues: https://github.com/romanobenit/romanoing/issues
- Email: domenico.romano@studioromano.it

**Problemi Hetzner**:
- Support Portal: https://console.hetzner.cloud/support
- Email: support@hetzner.com

---

**Ultimo Aggiornamento**: 2025-12-27
**Versione**: 1.0

**Fine Documento**
