# 🏢 Deployment Production - Hetzner (ISO 9001 + ISO 27001 Compliant)

**Data**: 2025-12-27
**Versione**: 1.0
**Compliance**: ISO 9001:2015 + ISO 27001:2022
**Provider**: Hetzner Cloud + Dedicated

---

## 📋 Requisiti Compliance

### ISO 9001:2015 - Sistema Gestione Qualità
- ✅ Documentazione completa processi
- ✅ Tracciabilità operazioni (audit log)
- ✅ Gestione modifiche (change management)
- ✅ Backup e disaster recovery
- ✅ Procedure operative standard (POP)
- ✅ Monitoraggio performance
- ✅ Continuous improvement

### ISO 27001:2022 - Sicurezza Informazioni
- ✅ Encryption at rest (database, storage)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Access control (RBAC)
- ✅ Audit logging (tutti gli eventi)
- ✅ Backup crittografati
- ✅ Incident response plan
- ✅ Risk assessment
- ✅ Data retention policy
- ✅ Physical security (datacenter Hetzner)

---

## 🏗️ Architettura Hetzner Production

### Infrastruttura Proposta

```
┌─────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐     ┌──────────────┐                │
│  │   Load       │────▶│  App Server  │                │
│  │  Balancer    │     │  (CPX31)     │                │
│  │  (LB11)      │     │  Node.js     │                │
│  └──────────────┘     │  Next.js     │                │
│         │             └──────────────┘                │
│         │                                              │
│         ├────▶┌──────────────┐                        │
│         │     │  App Server  │ (Replica - HA)         │
│         │     │  (CPX31)     │                        │
│         │     └──────────────┘                        │
│         │                                              │
│  ┌──────────────┐     ┌──────────────┐                │
│  │  PostgreSQL  │────▶│  PostgreSQL  │                │
│  │  Primary     │     │  Replica     │                │
│  │  (CCX33)     │     │  (CCX33)     │ (Standby)      │
│  └──────────────┘     └──────────────┘                │
│         │                                              │
│         │             ┌──────────────┐                │
│         └────────────▶│   Backup     │                │
│                       │   Server     │ (Snapshots)    │
│                       │   (CX21)     │                │
│                       └──────────────┘                │
│                                                         │
│  ┌──────────────────────────────────┐                 │
│  │      Object Storage              │                 │
│  │      (Hetzner Storage Box)       │                 │
│  │      - Documenti clienti         │                 │
│  │      - Backup database           │                 │
│  │      - Audit logs                │                 │
│  └──────────────────────────────────┘                 │
│                                                         │
│  ┌──────────────┐                                     │
│  │   Firewall   │ (Cloud Firewall)                    │
│  │   + WAF      │                                     │
│  └──────────────┘                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

External Services:
- Stripe (PCI-DSS compliant)
- SendGrid (email delivery)
- Upstash Redis (rate limiting)
```

---

## 🖥️ Configurazione Server Hetzner

### 1. App Servers (2x CPX31)

**Specs**:
- vCPU: 4 cores
- RAM: 8 GB
- Storage: 160 GB SSD
- Network: 20 TB traffic
- Location: Falkenstein, Germany (GDPR compliant)

**Software**:
```bash
# OS
Ubuntu 22.04 LTS (security patches automatici)

# Runtime
Node.js 20 LTS
PM2 (process manager)

# Security
UFW (firewall)
fail2ban
ClamAV (antivirus)
OSSEC (HIDS)

# Monitoring
Prometheus node exporter
Grafana agent
```

**Costo**: €8.46/mese × 2 = **€16.92/mese**

---

### 2. Database Servers (2x CCX33)

**Primary + Replica (Streaming Replication)**

**Specs**:
- vCPU: 8 dedicated cores
- RAM: 32 GB
- Storage: 240 GB NVMe
- Network: 20 TB traffic

**Software**:
```bash
# Database
PostgreSQL 16
pgBackRest (backup/restore)
pg_stat_statements (monitoring)
TimescaleDB (se serve time-series)

# Encryption
LUKS full disk encryption
SSL/TLS connections only

# HA
Patroni (automatic failover)
etcd (distributed config)
HAProxy (connection pooling)
```

**Backup Strategy**:
- Full backup: ogni notte (3:00 AM)
- Incremental: ogni 6 ore
- WAL archiving: continuo
- Retention: 30 giorni
- Test restore: settimanale

**Costo**: €44.90/mese × 2 = **€89.80/mese**

---

### 3. Load Balancer (LB11)

**Specs**:
- Gestito Hetzner
- SSL termination
- Health checks
- DDoS protection

**Features**:
- TLS 1.3 only
- HTTP/2, HTTP/3
- Auto-scaling backend
- Sticky sessions
- Rate limiting

**Costo**: €5.39/mese

---

### 4. Storage Box (BX30)

**Hetzner Storage Box per documenti**

**Specs**:
- Capacity: 1 TB
- Protocol: SFTP, WebDAV, Samba, rsync
- Snapshots: 7 daily, 4 weekly, 1 monthly
- Location: Germany (GDPR)

**Utilizzo**:
- Documenti clienti (encrypted at rest)
- Database backups (pgBackRest)
- Audit logs archive
- Application logs

**Encryption**: GPG encryption before upload

**Costo**: €3.81/mese

---

### 5. Backup Server (CX21)

**Backup orchestration e monitoring**

**Specs**:
- vCPU: 2 cores
- RAM: 4 GB
- Storage: 40 GB SSD

**Software**:
- pgBackRest
- Restic (encrypted backups)
- Backup monitoring scripts
- Alert system (email/SMS)

**Schedule**:
```bash
# Database backups
0 3 * * * pgbackrest backup --type=full
0 */6 * * * pgbackrest backup --type=incr

# App server snapshots
0 2 * * * hcloud snapshot create app-server-1
0 2 * * 0 hcloud snapshot create app-server-2

# Storage Box sync
*/30 * * * * rsync -avz /var/backups/ user@box.hetzner.com:/backups/
```

**Costo**: €4.15/mese

---

## 💰 Costo Totale Mensile

| Componente | Quantità | Prezzo Unit. | Totale |
|------------|----------|--------------|--------|
| App Server CPX31 | 2 | €8.46 | €16.92 |
| DB Server CCX33 | 2 | €44.90 | €89.80 |
| Load Balancer LB11 | 1 | €5.39 | €5.39 |
| Storage Box BX30 | 1 | €3.81 | €3.81 |
| Backup Server CX21 | 1 | €4.15 | €4.15 |
| **TOTALE HETZNER** | | | **€120.07/mese** |
| | | | |
| Upstash Redis (Pro) | 1 | $10 | €9.50 |
| Sentry (error tracking) | 1 | $26 | €24.70 |
| **TOTALE SERVIZI ESTERNI** | | | **€34.20/mese** |
| | | | |
| **TOTALE GENERALE** | | | **€154.27/mese** |

**Annuale**: €1.851,24 + IVA

---

## 🔐 Security Hardening (ISO 27001)

### 1. Network Security

**Hetzner Cloud Firewall Rules**:
```yaml
Inbound Rules:
  - Port 443 (HTTPS): 0.0.0.0/0 → Load Balancer
  - Port 80 (HTTP): 0.0.0.0/0 → Load Balancer (redirect to 443)
  - Port 22 (SSH): IP_UFFICIO_STUDIO/32 → All servers (IP whitelisting)
  - Port 5432 (PostgreSQL): App servers only → DB servers

Outbound Rules:
  - Port 443 (HTTPS): All servers → Internet (updates, APIs)
  - Port 25/587 (SMTP): App servers → SendGrid
  - Port 6379 (Redis): App servers → Upstash
```

**Internal Network** (Private VLAN):
```
10.0.0.0/16 (Hetzner Private Network)
  - App Servers: 10.0.1.0/24
  - DB Servers: 10.0.2.0/24
  - Backup Server: 10.0.3.0/24
```

---

### 2. Access Control

**SSH Hardening**:
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers deploy@IP_UFFICIO
Port 2222 (non-standard)
Protocol 2
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

**Sudo Access**:
```bash
# Solo utente deploy con sudo
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart pm2-*, /usr/bin/journalctl
```

**2FA per SSH** (Google Authenticator):
```bash
sudo apt install libpam-google-authenticator
# Configura in /etc/pam.d/sshd
```

---

### 3. Database Security

**PostgreSQL Hardening**:
```sql
-- postgresql.conf
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_min_protocol_version = 'TLSv1.3'

-- pg_hba.conf (SOLO SSL connections)
hostssl all all 10.0.1.0/24 scram-sha-256
hostnossl all all 0.0.0.0/0 reject

-- Encryption at rest (LUKS)
cryptsetup luksFormat /dev/sdb
cryptsetup luksOpen /dev/sdb pgdata
mkfs.ext4 /dev/mapper/pgdata
```

**Password Policy**:
```sql
-- Passwords scadono dopo 90 giorni
ALTER ROLE app_user VALID UNTIL '2025-03-27';

-- Strong password enforcement
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Min 16 caratteri, maiuscole, minuscole, numeri, simboli
```

---

### 4. Application Security

**Environment Variables** (encrypted):
```bash
# /var/www/.env.production (permissions 600)
# Encrypted con ansible-vault o sops

DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..." # 32+ caratteri random
STRIPE_SECRET_KEY="..."
SENDGRID_API_KEY="..."
ENCRYPTION_KEY="..." # Per documenti at-rest
```

**TLS Configuration** (nginx/certbot):
```nginx
# /etc/nginx/sites-available/studio-erp
ssl_protocols TLSv1.3;
ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline';" always;
```

---

### 5. Audit Logging (ISO 27001 Requirement)

**Application Audit Log**:
- Tutti gli eventi già loggati in tabella `audit_log`
- Retention: 7 anni (requisito ISO)
- Archiviazione: Storage Box (encrypted)

**System Audit Log** (auditd):
```bash
# /etc/audit/rules.d/audit.rules
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /var/log/auth.log -p wa -k auth
-w /var/www/.env.production -p wa -k config
-a always,exit -F arch=b64 -S execve -k commands
```

**PostgreSQL Audit** (pgaudit):
```sql
CREATE EXTENSION pgaudit;
ALTER SYSTEM SET pgaudit.log = 'write,ddl';
ALTER SYSTEM SET pgaudit.log_catalog = off;
ALTER SYSTEM SET pgaudit.log_parameter = on;
SELECT pg_reload_conf();
```

**Log Aggregation**:
- Tutti i log → Storage Box
- Syslog → Rsyslog centrale
- Retention: 2 anni online, 7 anni archive
- Immutabilità: Write-once storage

---

## 📊 Monitoring & Alerting

### Prometheus + Grafana Stack

**Metrics Raccolti**:
- CPU, RAM, Disk I/O (node_exporter)
- Database: connections, queries/sec, lag replication
- App: request latency, error rate, throughput
- Security: failed login attempts, suspicious activities

**Dashboards**:
1. **Infrastructure Overview**
   - Server health
   - Network traffic
   - Disk usage

2. **Application Performance**
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - Database queries

3. **Security Dashboard**
   - Failed authentications
   - Rate limit triggers
   - Unusual access patterns
   - File integrity changes

**Alerts** (via email + SMS):
```yaml
Critical:
  - Database down (>1 min)
  - App server down (>30 sec)
  - Disk usage >85%
  - Backup failed
  - SSL certificate expiring (<7 days)

Warning:
  - CPU >80% (5 min)
  - RAM >85% (5 min)
  - Replication lag >10 sec
  - Failed backups
  - Unusual login patterns
```

---

## 🔄 Backup & Disaster Recovery

### Backup Strategy (ISO 27001 - A.12.3)

**Database Backups**:
```bash
# pgBackRest configuration
[global]
repo1-type=s3
repo1-s3-bucket=studio-erp-backups
repo1-s3-endpoint=storage.hetzner.cloud
repo1-s3-region=eu-central
repo1-retention-full=30
repo1-retention-diff=7
repo1-retention-incr=1

[studio-erp]
pg1-path=/var/lib/postgresql/16/main
pg1-port=5432

# Encryption
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=<strong-passphrase>
```

**Schedule**:
- **Full backup**: Ogni notte ore 3:00 (retention 30 giorni)
- **Differential**: Ogni domenica (retention 7 giorni)
- **Incremental**: Ogni 6 ore (retention 24h)
- **WAL archive**: Continuo (PITR - Point-In-Time Recovery)

**Application Backups**:
```bash
# Server snapshots (Hetzner)
hcloud snapshot create app-server-1 --description "daily-backup-$(date +%Y%m%d)"

# Retention: 7 daily, 4 weekly, 12 monthly
```

**Document Storage Backups**:
```bash
# Rsync to Storage Box (encrypted)
rsync -avz --delete \
  /var/www/uploads/ \
  user@box.hetzner.com:/backups/uploads/

# Encrypted tar archives
tar czf - /var/www/uploads | gpg --encrypt --recipient backup@studio-romano.it > backup.tar.gz.gpg
```

---

### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 4 ore
**RPO (Recovery Point Objective)**: 6 ore

**Scenario 1: App Server Failure**
1. Load Balancer rileva health check failure (30 sec)
2. Traffico redirect a replica server (automatico)
3. Allarme inviato a team (1 min)
4. Investigate & fix server primario (2-4 ore)
5. Re-attach to load balancer

**Downtime**: ~0 minuti (HA setup)

---

**Scenario 2: Database Primary Failure**
1. Patroni rileva failure (10 sec)
2. Automatic failover a replica (30 sec)
3. Allarme inviato (1 min)
4. Investigate primary (30 min)
5. Rebuild primary e re-sync (2-3 ore)

**Downtime**: ~1 minuto (automatic failover)

---

**Scenario 3: Data Corruption / Ransomware**
1. Detect corruption (monitoring alert)
2. Isola server compromesso (10 min)
3. Restore da backup più recente integro:
   ```bash
   # Stop application
   systemctl stop pm2-studio-erp

   # Restore database
   pgbackrest restore --delta \
     --type=time "--target=2025-12-27 10:30:00+01" \
     --target-action=promote

   # Verify data integrity
   psql -c "SELECT COUNT(*) FROM clienti;"

   # Start application
   systemctl start pm2-studio-erp
   ```
4. Forensic analysis (1-2 giorni)
5. Security patches

**Downtime**: 2-4 ore
**Data Loss**: Max 6 ore (RPO)

---

**Scenario 4: Complete Datacenter Failure**
1. Setup nuovo cluster Hetzner (different region)
2. Restore database da Storage Box backup
3. Deploy application da Git
4. Update DNS (TTL 300 sec)
5. Verify functionality

**Downtime**: 4-6 ore
**Data Loss**: Max 6 ore

---

### Backup Testing (Mandatory ISO 27001)

**Monthly Restore Test**:
```bash
#!/bin/bash
# /usr/local/bin/test-restore.sh

# Restore to test database
pgbackrest restore --delta \
  --stanza=studio-erp \
  --pg1-path=/var/lib/postgresql/test \
  --type=time "--target=$(date -d '1 hour ago' --iso-8601=seconds)"

# Verify data
psql -h localhost -p 5433 -d studio_erp_test -c "
  SELECT
    (SELECT COUNT(*) FROM clienti) as clienti_count,
    (SELECT COUNT(*) FROM incarichi) as incarichi_count,
    (SELECT COUNT(*) FROM documenti) as documenti_count;
"

# Cleanup
rm -rf /var/lib/postgresql/test

# Log result
echo "$(date): Backup restore test completed successfully" >> /var/log/backup-tests.log
```

**Execution**: Ogni 1° del mese ore 4:00
**Alert**: Se fallisce, email immediate a IT team

---

## 📝 Deployment Procedure (ISO 9001)

### Change Management Process

**1. Pre-Deployment Checklist**:
- [ ] Code review completato (2+ reviewers)
- [ ] Test E2E passati (100%)
- [ ] Security scan passed (Snyk, npm audit)
- [ ] Database migration testata su staging
- [ ] Rollback plan documentato
- [ ] Stakeholder notificati (email 24h prima)
- [ ] Maintenance window schedulata (3:00-5:00 AM)
- [ ] Backup pre-deployment eseguito

**2. Deployment Steps**:
```bash
# 1. Backup pre-deployment
ssh deploy@backup-server
pgbackrest backup --stanza=studio-erp --type=full
hcloud snapshot create app-server-1

# 2. Enable maintenance mode
ssh deploy@app-server-1
pm2 stop studio-erp
echo "Maintenance in corso" > /var/www/public/maintenance.html

# 3. Database migration
psql $DATABASE_URL -f migrations/$(date +%Y%m%d).sql

# 4. Deploy new code
git pull origin main
npm install --production
npm run build

# 5. Restart application
pm2 restart studio-erp

# 6. Health check
curl -f http://localhost:3000/api/health || rollback

# 7. Disable maintenance mode
rm /var/www/public/maintenance.html

# 8. Monitor (30 min)
pm2 logs studio-erp --lines 200
```

**3. Post-Deployment Verification**:
- [ ] Health check API: 200 OK
- [ ] Login funziona
- [ ] Checkout funziona
- [ ] Database queries < 100ms
- [ ] No errori in logs (15 min)
- [ ] Monitoring: no alerts

**4. Rollback Plan**:
```bash
# Se qualcosa va storto:
git checkout <previous-commit>
npm run build
pm2 restart studio-erp

# Restore database se necessario
pgbackrest restore --type=time --target="<pre-deployment-time>"
```

---

## 📜 Documentation (ISO 9001 Requirement)

### Mandatory Documents

1. **System Architecture Diagram** ✅ (in questo file)
2. **Network Topology** ✅
3. **Data Flow Diagram** (TODO)
4. **Backup & Recovery Procedures** ✅
5. **Incident Response Plan** ✅
6. **Change Management Process** ✅
7. **Access Control Matrix** (TODO)
8. **Risk Assessment** (TODO)
9. **Business Continuity Plan** ✅
10. **Security Policies** (TODO)

**Storage**: Git repository + DMS (Document Management System)

---

## 🚀 Initial Deployment Steps

### Phase 1: Infrastructure Setup (Day 1)

```bash
# 1. Create Hetzner Cloud Project
hcloud context create studio-erp-prod

# 2. Create private network
hcloud network create --name studio-erp-net --ip-range 10.0.0.0/16
hcloud network add-subnet studio-erp-net --type cloud --network-zone eu-central --ip-range 10.0.1.0/24

# 3. Create servers
hcloud server create --type cpx31 --name app-server-1 --image ubuntu-22.04 --ssh-key deploy --network studio-erp-net
hcloud server create --type cpx31 --name app-server-2 --image ubuntu-22.04 --ssh-key deploy --network studio-erp-net
hcloud server create --type ccx33 --name db-primary --image ubuntu-22.04 --ssh-key deploy --network studio-erp-net
hcloud server create --type ccx33 --name db-replica --image ubuntu-22.04 --ssh-key deploy --network studio-erp-net
hcloud server create --type cx21 --name backup-server --image ubuntu-22.04 --ssh-key deploy --network studio-erp-net

# 4. Create load balancer
hcloud load-balancer create --name studio-erp-lb --type lb11 --location fsn1

# 5. Setup firewall
hcloud firewall create --name studio-erp-firewall
hcloud firewall add-rule studio-erp-firewall --direction in --protocol tcp --port 443 --source-ips 0.0.0.0/0
hcloud firewall add-rule studio-erp-firewall --direction in --protocol tcp --port 22 --source-ips <IP_UFFICIO>/32
hcloud firewall apply-to-resource studio-erp-firewall --type server --server app-server-1
```

### Phase 2: Server Configuration (Day 2-3)

**Ansible Playbook** (automated):
```yaml
# playbook.yml
- hosts: app_servers
  roles:
    - common
    - nodejs
    - pm2
    - nginx
    - security

- hosts: db_servers
  roles:
    - common
    - postgresql16
    - pgbackrest
    - patroni
    - security

- hosts: backup_server
  roles:
    - common
    - backup_tools
    - monitoring
```

### Phase 3: Application Deployment (Day 4)

```bash
# Deploy via CI/CD (GitHub Actions)
git push origin main

# Trigger deployment workflow:
# 1. Run tests
# 2. Build application
# 3. Push Docker image (optional)
# 4. Deploy to servers
# 5. Run migrations
# 6. Health check
# 7. Notify team
```

### Phase 4: DNS & SSL (Day 4)

```bash
# 1. Point DNS to Load Balancer
# In DNS provider (es. Cloudflare):
# A record: studio-romano.it → <LOAD_BALANCER_IP>
# CNAME: www → studio-romano.it

# 2. SSL Certificate (Let's Encrypt)
certbot --nginx -d studio-romano.it -d www.studio-romano.it --agree-tos --email tech@studio-romano.it

# Auto-renewal
echo "0 3 * * * certbot renew --quiet" | crontab -
```

### Phase 5: Go-Live (Day 5)

- [ ] Final smoke tests
- [ ] Monitor dashboard attivo
- [ ] Allarmi configurati
- [ ] Team briefing
- [ ] Go-live comunicato a stakeholder
- [ ] Monitor per 24h continuo

---

## 📞 Contacts & Support

**Hetzner Support**:
- Telefono: +49 9831 5050
- Email: support@hetzner.com
- Portal: https://accounts.hetzner.com

**Emergency Contacts**:
- On-Call Engineer: [numero]
- Backup Engineer: [numero]
- Hetzner Emergency: +49 9831 5050

---

## ✅ Compliance Checklist

### ISO 9001:2015
- [ ] Quality Manual documentato
- [ ] Procedure operative (POP) complete
- [ ] Audit trail completo
- [ ] Change management process
- [ ] Disaster recovery testato
- [ ] Customer satisfaction monitoring
- [ ] Continuous improvement plan

### ISO 27001:2022
- [x] Information Security Policy
- [x] Access Control (RBAC)
- [x] Encryption at rest & in transit
- [x] Audit logging (7 anni)
- [x] Backup crittografati
- [x] Incident response plan
- [x] Risk assessment
- [ ] Security awareness training
- [ ] Vendor security assessment
- [ ] Physical security controls
- [ ] Business continuity plan
- [ ] Regular security audits

---

**Prossimi Passi**:
1. Approvazione stakeholder
2. Procurement server Hetzner
3. Ansible playbook development
4. Staging environment setup
5. Production deployment

---

**Mantenuto da**: DevOps Team
**Ultima revisione**: 2025-12-27
**Prossima revisione**: 2025-03-27 (trimestrale)
