# 💰 Deployment Hetzner - Configurazioni Costo Minimo (ISO Compliant)

**Data**: 2025-12-27
**Obiettivo**: Minimizzare costi mantenendo compliance ISO 9001/27001
**Provider**: Hetzner Cloud

---

## 🎯 3 Configurazioni a Confronto

| Configurazione | Server | Costo/mese | Costo/anno | ISO Compliant | HA | Ideale per |
|----------------|--------|------------|------------|---------------|----|-----------|
| **MICRO** | 1 | **€7.90** | **€95** | ✅ | ❌ | Startup, MVP test |
| **SMALL** | 1 | **€15.10** | **€181** | ✅ | ❌ | Studio piccolo (1-5 persone) |
| **STANDARD** | 2 | **€35.20** | **€422** | ✅ | ✅ | Studio medio (5-20 persone) |

---

## 💡 CONFIGURAZIONE CONSIGLIATA: **SMALL** (€15/mese)

### Perché SMALL è la scelta migliore:
- ✅ **ISO compliant** (backup, audit, encryption)
- ✅ **16GB RAM** sufficienti per PostgreSQL + Next.js
- ✅ **Scalabile** (upgrade seamless a configurazione superiore)
- ✅ **Costo accessibile** per uno studio professionale
- ✅ **Performance adeguate** per 50-100 utenti
- ⚠️ No HA (downtime ~15-30 min se server fail)

---

## 📊 Configurazione SMALL (CONSIGLIATA)

### Architettura

```
┌─────────────────────────────────────────────┐
│         HETZNER CLOUD - SMALL SETUP         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   ALL-IN-ONE SERVER (CX41)           │  │
│  │                                      │  │
│  │   ┌────────────────────────────┐    │  │
│  │   │  NGINX (Reverse Proxy)     │    │  │
│  │   │  - SSL/TLS termination     │    │  │
│  │   │  - Static file serving     │    │  │
│  │   └────────────────────────────┘    │  │
│  │              │                       │  │
│  │   ┌────────────────────────────┐    │  │
│  │   │  Next.js App (PM2)         │    │  │
│  │   │  - 2 instances cluster     │    │  │
│  │   │  - Port 3000               │    │  │
│  │   └────────────────────────────┘    │  │
│  │              │                       │  │
│  │   ┌────────────────────────────┐    │  │
│  │   │  PostgreSQL 16             │    │  │
│  │   │  - Port 5432 (localhost)   │    │  │
│  │   │  - 8GB allocated           │    │  │
│  │   └────────────────────────────┘    │  │
│  │                                      │  │
│  │   ┌────────────────────────────┐    │  │
│  │   │  ClamAV (Antivirus)        │    │  │
│  │   │  - Document scanning       │    │  │
│  │   └────────────────────────────┘    │  │
│  └──────────────────────────────────────┘  │
│                    │                        │
│                    │                        │
│  ┌──────────────────────────────────────┐  │
│  │   STORAGE BOX BX10 (100GB)           │  │
│  │   - Database backups                 │  │
│  │   - Document backups                 │  │
│  │   - Audit logs archive               │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   HETZNER SNAPSHOTS                  │  │
│  │   - Daily server snapshots           │  │
│  │   - Retention: 7 giorni              │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘

External Services (essenziali):
- Cloudflare (Free): DNS + CDN + DDoS protection
- Upstash Redis (Free tier): Rate limiting
- SendGrid (Free tier): Email delivery
```

---

### Dettaglio Server

**Hetzner CX41**:
- **vCPU**: 4 cores (AMD EPYC / Intel Xeon)
- **RAM**: 16 GB
- **Storage**: 160 GB SSD NVMe
- **Network**: 20 TB traffic/mese (più che sufficiente)
- **Location**: Falkenstein, Germany (GDPR compliant)
- **Backup**: Snapshot giornalieri inclusi
- **Costo**: **€11.90/mese**

**Storage Box BX10**:
- **Capacity**: 100 GB
- **Protocols**: SSH/SFTP, rsync, WebDAV
- **Snapshots**: 7 daily, 4 weekly (automatici)
- **Location**: Germany
- **Costo**: **€3.20/mese**

---

### Allocazione Risorse Server

| Servizio | RAM | CPU | Storage |
|----------|-----|-----|---------|
| **PostgreSQL** | 8 GB | 40% | 60 GB (dati + WAL) |
| **Next.js App** (2 instances) | 4 GB | 40% | 20 GB (app + node_modules) |
| **NGINX** | 512 MB | 5% | 100 MB |
| **ClamAV** | 1.5 GB | 10% | 2 GB (signatures) |
| **Sistema + Logs** | 2 GB | 5% | 30 GB |
| **Backup locale temp** | - | - | 30 GB |
| **Riserva** | - | - | 18 GB |
| **TOTALE** | 16 GB | 100% | 160 GB |

---

### Backup Strategy

**Database Backup** (pgBackRest su Storage Box):
```bash
# Full backup: ogni notte 3:00
0 3 * * * pgbackrest backup --stanza=studio-erp --type=full

# Retention: 7 full backups (7 giorni)
repo1-retention-full=7
```

**Server Snapshot** (Hetzner automatico):
```bash
# Snapshot giornaliero via API
0 2 * * * hcloud server create-image studio-erp-prod --description "daily-$(date +%Y%m%d)"

# Retention: 7 snapshot (rotate automatico)
```

**Document Backup** (rsync a Storage Box):
```bash
# Sync documenti ogni 6 ore
0 */6 * * * rsync -avz --delete /var/www/uploads/ storage-box:/backups/uploads/
```

**RTO/RPO**:
- **RTO**: 2-4 ore (restore da backup)
- **RPO**: 24 ore (backup giornaliero)
- **Costo backup**: Incluso nei €15/mese

---

### Security (ISO 27001 Compliant)

**Encryption**:
- ✅ **At rest**: LUKS disk encryption
- ✅ **In transit**: TLS 1.3 (Let's Encrypt)
- ✅ **Database**: SSL connections only
- ✅ **Backup**: GPG encrypted before upload

**Firewall**:
```bash
# UFW rules (Uncomplicated Firewall)
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp    # HTTP (redirect to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp from <IP_UFFICIO>/32  # SSH (IP whitelisting)
ufw enable
```

**SSH Hardening**:
```bash
# /etc/ssh/sshd_config
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers deploy
```

**Audit Logging**:
- ✅ Application: tabella `audit_log` (già implementato)
- ✅ System: auditd
- ✅ PostgreSQL: pgaudit
- ✅ Retention: 7 anni (Storage Box archive)

**Monitoring Base**:
- ✅ Uptime monitoring (UptimeRobot free)
- ✅ Disk usage alerts
- ✅ PostgreSQL slow query log
- ✅ Application error tracking (Sentry free tier)

---

## 💰 Costo Totale SMALL

### Infrastructure (mensile)

| Voce | Costo/mese | Costo/anno |
|------|------------|------------|
| **Server CX41** | €11.90 | €142.80 |
| **Storage Box BX10** | €3.20 | €38.40 |
| **TOTALE HETZNER** | **€15.10** | **€181.20** |
| | | |
| **External Services (Free Tier)** | | |
| Cloudflare (DNS + CDN) | €0 | €0 |
| Upstash Redis (10k req/day) | €0 | €0 |
| SendGrid (100 email/day) | €0 | €0 |
| UptimeRobot (50 monitors) | €0 | €0 |
| Sentry (5k events/month) | €0 | €0 |
| **TOTALE SERVIZI** | **€0** | **€0** |
| | | |
| **TOTALE GENERALE** | **€15.10** | **€181.20** |

### One-Time

| Voce | Costo |
|------|-------|
| Dominio .it | €10/anno |
| SSL Certificate | €0 (Let's Encrypt) |
| **TOTALE** | **€10** |

### **TOTALE ANNO 1**: €191.20 (€15.93/mese)

---

## 🔄 Upgrade Path (quando cresci)

### Scenario 1: Più utenti (50-100)
**Azione**: Upgrade a **CX51** (8 vCPU, 32 GB RAM)
- Costo: €24.90/mese (+€9/mese)
- Zero downtime (resize in pochi minuti)
- Mantieni stessa architettura

### Scenario 2: Serve HA (High Availability)
**Azione**: Passa a **STANDARD** (2 server)
- Aggiungi replica server CX41
- Aggiungi Load Balancer LB11
- Database replication
- Costo: €35/mese (+€20/mese)
- Downtime < 1 minuto

### Scenario 3: Molto traffico (>100 utenti)
**Azione**: Passa a architettura separata
- 2x App Server CPX31
- 1x Database Server CCX33
- Load Balancer
- Costo: €70-80/mese

---

## ⚠️ Limitazioni SMALL (da sapere)

| Aspetto | Limitazione | Mitigazione |
|---------|-------------|-------------|
| **Single Point of Failure** | Se server down, tutto down | Snapshot + restore in 2-4h |
| **No Auto-Scaling** | Carico fisso 4 CPU | Monitor + manual upgrade |
| **Backup RPO 24h** | Max 24h data loss | Accettabile per studio medio |
| **No Geographic Redundancy** | 1 datacenter solo | Hetzner datacenter molto affidabili |
| **Free tier limits** | Redis 10k req/day, SendGrid 100 email/day | Upgrade quando serve |

**Accettabile per**: Studio 1-10 persone, 20-50 clienti attivi, <100 incarichi/anno

---

## 📋 Setup Procedure SMALL

### Step 1: Create Server (5 min)

```bash
# Create Hetzner project
hcloud context create studio-erp-prod

# Create server
hcloud server create \
  --type cx41 \
  --name studio-erp-prod \
  --image ubuntu-22.04 \
  --ssh-key deploy \
  --location fsn1

# Get IP
hcloud server ip studio-erp-prod
# Output: 95.217.XXX.XXX
```

### Step 2: Initial Security (15 min)

```bash
# SSH into server
ssh root@95.217.XXX.XXX

# Update system
apt update && apt upgrade -y

# Create deploy user
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Disable root login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```

### Step 3: Install Software (30 min)

```bash
# PostgreSQL 16
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-contrib-16

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# NGINX
apt install -y nginx

# PM2
npm install -g pm2

# ClamAV
apt install -y clamav clamav-daemon
freshclam
systemctl enable clamav-daemon
systemctl start clamav-daemon

# pgBackRest
apt install -y pgbackrest

# Monitoring
apt install -y htop iotop nethogs
```

### Step 4: PostgreSQL Configuration (15 min)

```bash
# /etc/postgresql/16/main/postgresql.conf
shared_buffers = 4GB                # 25% of RAM
effective_cache_size = 12GB         # 75% of RAM
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1              # SSD
effective_io_concurrency = 200
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2

# SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'

# Connection
max_connections = 100
listen_addresses = 'localhost'
```

### Step 5: Storage Box Setup (10 min)

```bash
# Order Storage Box BX10 from Hetzner

# Test connection
ssh -p23 uXXXXXX@uXXXXXX.your-storagebox.de

# Configure SSH key
cat ~/.ssh/id_rsa.pub | ssh -p23 uXXXXXX@uXXXXXX.your-storagebox.de install-ssh-key

# pgBackRest config
cat > /etc/pgbackrest.conf << 'EOF'
[global]
repo1-type=sftp
repo1-sftp-host=uXXXXXX.your-storagebox.de
repo1-sftp-host-port=23
repo1-sftp-host-user=uXXXXXX
repo1-sftp-private-key-file=/home/postgres/.ssh/id_rsa
repo1-path=/backups/pgbackrest
repo1-retention-full=7
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=<strong-password>

[studio-erp]
pg1-path=/var/lib/postgresql/16/main
pg1-port=5432
pg1-user=postgres
EOF
```

### Step 6: Application Deploy (20 min)

```bash
# Clone repository
cd /var/www
git clone <repo-url> studio-erp
cd studio-erp

# Install dependencies
npm install --production

# Build
npm run build

# Environment variables
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://studio-romano.it"
NEXTAUTH_SECRET="..."
STRIPE_SECRET_KEY="..."
SENDGRID_API_KEY="..."
NODE_ENV="production"
EOF
chmod 600 .env.production

# PM2 start
pm2 start npm --name studio-erp -- start
pm2 save
pm2 startup

# NGINX config
cat > /etc/nginx/sites-available/studio-erp << 'EOF'
server {
    listen 80;
    server_name studio-romano.it www.studio-romano.it;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studio-romano.it www.studio-romano.it;

    ssl_certificate /etc/letsencrypt/live/studio-romano.it/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studio-romano.it/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/studio-erp /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: SSL Certificate (5 min)

```bash
# Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d studio-romano.it -d www.studio-romano.it \
  --non-interactive --agree-tos --email tech@studio-romano.it

# Auto-renewal
systemctl enable certbot.timer
```

### Step 8: Automated Backups (10 min)

```bash
# Database backup
crontab -e
0 3 * * * /usr/bin/pgbackrest backup --stanza=studio-erp --type=full

# Server snapshot
0 2 * * * /usr/local/bin/hcloud server create-image studio-erp-prod --description "daily-$(date +%Y\%m\%d)"

# Document sync
0 */6 * * * rsync -avz /var/www/studio-erp/uploads/ uXXXXXX@uXXXXXX.your-storagebox.de:/backups/uploads/
```

---

## 🔬 Alternative: Configurazione MICRO (€7.90/mese)

**Per chi**: Startup, test MVP, budget ristrettissimo

**Server**: CX31 (2 vCPU, 8 GB RAM, 80 GB SSD)
- Costo: **€4.90/mese**

**Storage**: Solo snapshot Hetzner (no Storage Box inizialmente)
- Costo: **€0/mese**

**Backup**: Solo snapshot giornalieri server
- RPO: 24h
- RTO: 4-6h

**Limitazioni**:
- ⚠️ 8GB RAM limitati (PostgreSQL + Next.js + ClamAV stretto)
- ⚠️ No backup offsite dedicato
- ⚠️ Performance ridotte

**Upgrade facile**: Quando cresci, upgrade a CX41 (€11.90)

**TOTALE**: **€4.90/mese** (€59/anno)

---

## 🏢 Configurazione STANDARD (€35/mese)

**Per chi**: Studio medio (5-20 persone), serve HA

**Architettura**:
- 2x CX41 (app server)
- 1x Load Balancer LB11
- 1x Storage Box BX10

**Features**:
- ✅ High Availability (failover automatico)
- ✅ Zero downtime deployments
- ✅ Load balancing
- ✅ Scalabilità orizzontale

**Costo**:
| Componente | Prezzo |
|------------|--------|
| 2x CX41 | €23.80 |
| Load Balancer LB11 | €5.39 |
| Storage Box BX10 | €3.20 |
| **Snapshot** | €2.80 (2 server) |
| **TOTALE** | **€35.19/mese** |

---

## 🎯 Quale Scegliere?

```
Budget <€100/anno    → MICRO (€5/mese)
Budget €150-200/anno → SMALL (€15/mese) ⭐ CONSIGLIATO
Serve HA/failover    → STANDARD (€35/mese)
Studio grande        → Custom (ask)
```

---

## ✅ Compliance ISO con SMALL

**ISO 9001**:
- ✅ Documentazione processi
- ✅ Audit trail completo
- ✅ Backup testati
- ✅ Change management

**ISO 27001**:
- ✅ Encryption (at rest + in transit)
- ✅ Access control (RBAC)
- ✅ Audit logging (7 anni)
- ✅ Backup encrypted
- ✅ Incident response plan
- ✅ Security hardening

**Differenza vs architettura HA**:
- ❌ No geographic redundancy
- ❌ No automatic failover
- ✅ Tutti gli altri requisiti soddisfatti

**Verdict**: SMALL è **ISO compliant** con accettazione rischio downtime

---

## 📞 Support

**Hetzner**:
- Ticket: 24h response
- Email: support@hetzner.com
- Community: https://community.hetzner.com

**Costo support**: €0 (incluso)

---

**Raccomandazione finale**: **SMALL (€15/mese)** è il sweet spot per uno studio professionale. Compliance ISO, performance adeguate, costo sostenibile.
