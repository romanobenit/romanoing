# Changelog
## Studio Ing. Romano - Piattaforma ERP

Tutte le modifiche rilevanti al progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

---

## [1.0.0] - 2025-12-27

### 🎉 PRIMO RELEASE PRODUCTION-READY

Completamento MVP con infrastruttura production, compliance ISO 27001/9001, e automation completa.

---

### Added

#### Frontend & UX
- **Landing page completa** con 8 bundle professionali
  - Bundle Consulenza Tecnica (€180-600) - nuovo
  - Bundle Ristrutturazione Bonus (€8k-18k)
  - Bundle Due Diligence Immobiliare (€1.5k-4k)
  - Bundle Vulnerabilità Sismica (€5k-25k)
  - Bundle Ampliamento Volumetrico (€12k-35k)
  - Bundle Collaudo Statico (€2.5k-12k)
  - Bundle Antincendio (€2k-8k)
  - Bundle Efficientamento Energetico (€2.5k-8k) - nuovo
- **Badge certificazioni ISO** 9001:2015 e 27001:2022 in evidenza above-the-fold
- **Sezione demand-driven** con spiegazione modello e-commerce vs tradizionale
- **Trust section** con 6 badge compliance (ISO 9001, ISO 27001, PCI-DSS, GDPR, Codice Consumo, Stripe Verified)
- **Footer aggiornato** con 4 colonne: bundle, risorse, legal, azienda
- **CTA ottimizzati** "Richiedi Preventivo" invece di "Quiz" per conversione

#### Documentation - ISO 27001 Compliance

**Incident Response (93 pagine)**:
- Classificazione incidenti severity P1-P4 (critico → basso)
- Incident Response Team (IRT) con ruoli e responsabilità
- Procedura NIST 6 fasi: Detection, Analysis, Containment, Eradication, Recovery, Post-Mortem
- Escalation matrix con SLA response time (P1: 15min, P2: 1h, P3: 4h, P4: 24h)
- Comunicazione GDPR: notifica Garante entro 72h, template email clienti
- 10 scenari specifici dettagliati:
  - Ransomware attack
  - Credential stuffing
  - Data breach / exfiltration
  - DDoS attack
  - Insider threat
  - SQL injection
  - Malware infection
  - Lost/stolen device
  - Configuration error
  - Supply chain compromise
- Chain of custody per evidenze forensi
- Tabletop exercise procedure
- Registro incidenti template
- Metriche KPI (MTTD, MTTR, MTTC, MTTR)

**Data Flow Diagram (87 pagine)**:
- DFD Livello 0 (Context Diagram) - entità esterne e sistema
- DFD Livello 1 (Sistema Completo) - componenti interni
- DFD Livello 2 (Dettaglio Processi) - flussi specifici:
  - Registrazione utente (bcrypt password hashing)
  - Creazione preventivo con AI
  - Upload documento con antivirus scan
  - Pagamento Stripe PCI-DSS compliant
- Classificazione dati L1-L5:
  - L1 Pubblico (prezzi bundle)
  - L2 Interno (note tecniche)
  - L3 Riservato (email, P.IVA)
  - L4 Sensibile (documenti, contratti)
  - L5 Critico (dati pagamento)
- Threat modeling STRIDE per ogni flusso
- Registro trattamenti GDPR Art. 30 (3 trattamenti documentati)
- Security boundaries e trust zones
- Encryption matrix (at rest + in transit)
- Access control matrix completa

#### Infrastructure as Code - Ansible

**7 Playbook Production-Ready**:

1. **site.yml** - Master orchestrator
   - Esegue tutti i playbook in sequenza
   - Pre-check connettività
   - Post-deployment verification
   - Summary report finale

2. **common.yml** - Setup base sistema
   - Timezone Europe/Rome
   - Locale it_IT.UTF-8
   - Essential packages (20+)
   - Unattended security updates
   - Application user creation
   - Sysctl tuning (swappiness, file limits)
   - Chrony NTP sync

3. **security.yml** - Hardening ISO 27001
   - SSH hardening:
     - PasswordAuthentication no
     - PermitRootLogin prohibit-password
     - MaxAuthTries 3
     - Protocol 2 only
   - UFW firewall:
     - Allow: 22 (rate-limited), 80, 443
     - Deny: all other
   - Fail2Ban:
     - SSH jail (3 tentativi, ban 1h)
     - Nginx jails (http-auth, limit-req)
   - Kernel hardening (15 sysctl parameters):
     - SYN cookies
     - IP forwarding disabled
     - Reverse path filtering
     - Ignore ICMP redirects
   - Auditd logging:
     - Critical file changes (/etc/passwd, /etc/shadow, etc.)
     - Privilege escalation attempts
     - Kernel module loading
     - Application file changes

4. **database.yml** - PostgreSQL 16
   - Repository ufficiale PostgreSQL APT
   - Database `studio_erp` creazione
   - User `studio_user` con password vault-encrypted
   - Performance tuning CX22 (4GB RAM):
     - shared_buffers: 1GB
     - effective_cache_size: 3GB
     - maintenance_work_mem: 256MB
     - work_mem: 8MB
     - max_connections: 100
   - Logging configuration:
     - Slow queries > 1s
     - Connections/disconnections
     - CSV format for analysis
   - SSL/TLS enabled
   - pg_hba.conf: scram-sha-256 auth
   - Backup directory setup
   - .pgpass for automated backups

5. **application.yml** - Next.js deployment
   - Node.js 20 LTS (NodeSource repository)
   - pm2 global installation
   - Git repository clone
   - .env file generation da vault
   - npm ci (reproducible builds)
   - Prisma generate + migrate deploy
   - Next.js production build
   - pm2 ecosystem.config.js:
     - Cluster mode (2 instances)
     - Auto-restart on crash
     - Max memory restart: 500MB
     - Error/output logging
   - Nginx reverse proxy:
     - HTTP/2 enabled
     - TLS 1.2+ only
     - Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
     - Rate limiting zones (API, login)
     - Gzip compression
     - Static files caching
   - Let's Encrypt SSL:
     - Certbot nginx plugin
     - Auto-renewal cron (daily 3 AM)
     - HTTPS redirect

6. **monitoring.yml** - Observability stack
   - Prometheus 2.48.0:
     - Port 9090
     - Retention: 15 giorni
     - TSDB storage
     - 4 scrape targets (self, node, postgres, nextjs)
   - Node Exporter 1.7.0:
     - CPU, RAM, Disk, Network metrics
     - Filesystem monitoring
     - Port 9100
   - PostgreSQL Exporter 0.15.0:
     - Database connections
     - Query performance
     - Cache hit ratio
     - Database size
     - Port 9187
   - Grafana 10.2.2:
     - Port 3001
     - Prometheus datasource auto-provision
     - 2 dashboard pre-importate:
       - Node Exporter Full (ID: 1860)
       - PostgreSQL Database (ID: 9628)
   - Alert rules (6 configurate):
     - HighCPUUsage (> 80% per 5 min)
     - HighMemoryUsage (< 20% available)
     - DiskSpaceLow (< 20% free)
     - ServiceDown (up == 0)
     - PostgreSQLDown (pg_up == 0)
     - TooManyDatabaseConnections (> 80)

7. **backup.yml** - Disaster recovery
   - Directory structure (/backup/daily, weekly, monthly)
   - Script bash completi:
     - `backup-db.sh`: PostgreSQL pg_dump + GPG encryption AES-256 + SHA-256 checksum
     - `backup-files.sh`: Application tarball (exclude node_modules, .next, .git)
     - `verify-backup.sh`: Checksum + decryption test
     - `sync-to-storage-box.sh`: rsync to Hetzner Storage Box
   - Cron schedule:
     - 03:00 - Database backup daily
     - 03:30 - Files backup daily
     - 04:00 - Verification test weekly (Sunday)
     - 05:00 - Storage Box sync daily
   - Retention policy:
     - Daily: 30 giorni
     - Weekly: 12 settimane (~3 mesi)
     - Monthly: 12 mesi
   - Logrotate per /var/log/backup.log (90 giorni)

**Templates Jinja2**:
- `env.j2` - Environment variables da vault (22 secrets)
- `nginx-site.conf.j2` - Nginx vhost con security headers completi

**Configuration Files**:
- `ansible.cfg` - Ottimizzazioni (forks, caching, pipelining)
- `inventory/production.yml` - Server Hetzner CX22 configuration
- `group_vars/all/vars.yml` - Variabili comuni non-sensitive
- `group_vars/production/vault.yml.template` - Template per 22 secrets

**Documentation**:
- `ansible/README.md` (65 pagine) - Guida completa setup, usage, troubleshooting

#### CI/CD Pipeline - GitHub Actions

**Workflow 1: test-pr.yml** (Test Pull Request)
- **Trigger**: Ogni PR verso `main`, modifiche `studio-erp/**`
- **Jobs**:
  1. **Lint Code** (~2 min):
     - ESLint con config Next.js
     - TypeScript type checking (`tsc --noEmit`)
  2. **Test Build** (~3 min):
     - npm ci (reproducible build)
     - Prisma generate
     - Next.js production build
     - Build size check (warning se > 50MB)
  3. **Security Scan** (~2 min):
     - npm audit (soglia: moderate)
     - TruffleHog secrets detection
     - Continue-on-error (non-blocking)
  4. **Validate Prisma Schema** (~1 min):
     - `npx prisma validate`
     - Migration files check
  5. **Comment PR** (~30s):
     - Auto-comment risultati con tabella emoji
     - Link a workflow run
     - "Ready to merge" se tutti SUCCESS
- **Branch Protection**:
  - Tutti i check devono passare prima merge
  - 1 approval richiesta
  - Conversation resolution obbligatoria

**Workflow 2: deploy-production.yml** (Deploy Produzione)
- **Trigger**: Push a `main`, modifiche `studio-erp/**`, manual dispatch
- **Jobs**:
  1. **Test & Build** (~3 min):
     - npm ci + lint + Prisma + build
     - Upload artifacts (.next, node_modules)
  2. **Security Scan** (~2 min):
     - Snyk vulnerability scan (soglia: high)
     - npm audit (soglia: high)
  3. **Deploy to Hetzner** (~5 min):
     - **Environment protection**: manual approval richiesta
     - Setup Python 3.11 + Ansible 2.15
     - Install Galaxy collections (community.general, community.postgresql, ansible.posix)
     - Configure SSH key da secret
     - Create vault.yml da 22 GitHub Secrets
     - Update inventory con IP server
     - Run: `ansible-playbook application.yml --tags deploy`
     - Health check: `curl /api/health`
     - Sentry deployment notification
     - Cleanup sensitive files
  4. **Post-Deployment Verification** (~1 min):
     - Test endpoints (homepage, API, health)
     - SSL/TLS validation (cert validity, TLS 1.2+)
     - Security headers check (HSTS, CSP, X-Frame-Options)
     - Lighthouse CI performance audit
  5. **Rollback on Failure** (conditional):
     - Git checkout commit precedente (HEAD~1)
     - Rebuild application
     - Restart pm2
     - Health check post-rollback
     - Email notifica team con details
  6. **Notify Success/Failure**:
     - Email con commit info, app URL, monitoring URL

**GitHub Configuration Requirements**:
- **22 Repository Secrets** configurati
- **Environment `production`** con manual approval
- **Branch protection** su `main` con required checks

**Documentation**:
- `.github/workflows/README.md` (82 pagine) - Setup completo, troubleshooting, best practices

#### Legal & Compliance Documentation

**E-Commerce Compliance** (`docs/ECOMMERCE_COMPLIANCE.md` - 50 pagine):
- Business model demand-driven vs tradizionale
- PCI-DSS SAQ A compliance (Stripe delegato)
- GDPR Art. 13-14 compliance
- Codice del Consumo Italiano (D.Lgs. 206/2005):
  - Diritto recesso 14 giorni B2C
  - Garanzia conformità 2 anni
  - Obblighi informativi pre-contrattuali
- Direttiva E-Commerce UE 2000/31/CE
- Standard Contractual Clauses (SCC) per extra-EU transfers

**Privacy Policy** (`docs/legal/PRIVACY_POLICY.md` - 40 pagine):
- GDPR Art. 13-14 compliant
- Categorie dati trattati (anagrafici, fiscali, contrattuali)
- Base giuridica trattamenti (contratto, legittimo interesse, consenso)
- Destinatari dati (Stripe, SendGrid, Hetzner, OpenAI con SCC)
- Trasferimenti extra-UE documentati
- Diritti interessati (accesso, rettifica, cancellazione, portabilità)
- Tempo conservazione (10 anni obblighi fiscali/professionali)
- Cookie policy (solo tecnici, no banner richiesto)
- DPO/Titolare contatti

**Terms & Conditions** (`docs/legal/TERMS_CONDITIONS.md` - 45 pagine):
- Identificazione Titolare (P.IVA, sede, Ordine Ingegneri)
- Ambito servizi professionali
- Processo acquisto (preventivo → firma digitale → milestone)
- Diritto recesso 14 giorni B2C (con eccezioni servizi personalizzati)
- Prezzi e pagamenti (milestone-based: acconto 30% + SAL + saldo)
- Fatturazione elettronica SDI
- Garanzia conformità 2 anni
- Responsabilità professionale (polizza RC obbligatoria)
- Risoluzione controversie (foro competente)

#### Deployment Readiness

**Production Checklist** (`docs/DEPLOYMENT_READINESS_CHECKLIST.md` - 163 pagine):
- 12 fasi complete con checkbox
- Fase 1: Prerequisiti Infrastructure (Hetzner, SSH, DNS, Email)
- Fase 2: Servizi Terzi (Stripe, SendGrid, Upstash, OpenAI, Sentry) - setup step-by-step
- Fase 3: GitHub Configuration (Secrets 22, Environment, Branch Protection)
- Fase 4: Ansible Setup Locale (install, collections, vault)
- Fase 5: First Deployment (provisioning, DNS, deploy completo)
- Fase 6: Application Setup (bundle import, admin user, webhook test)
- Fase 7: CI/CD Pipeline Test (PR workflow, deploy workflow)
- Fase 8: Security Hardening Post-Deploy (firewall, SSH, SSL, headers)
- Fase 9: Monitoring Setup (Grafana dashboards, alerts)
- Fase 10: Backup Verification (manual test, restore test, schedule)
- Fase 11: Compliance Documentation (ISO docs, legal pages)
- Fase 12: Final Checks (performance, load test, uptime monitor)
- Post-Deployment Schedule (daily, weekly, monthly, quarterly tasks)

### Changed

#### Database Schema
- Aggiornati 8 bundle con milestone e pricing completi in `prisma/update-bundle-completo.sql`
- Fixed SQL verification query (GROUP BY error) con CTE

#### Scripts
- `scripts/run-sql.js` ora cross-platform (Windows CMD + Linux/macOS)
- Parse DATABASE_URL e rimozione query parameters per psql compatibility
- PGPASSWORD environment variable per non-interactive authentication

#### Landing Page
- Completamente riscritta `app/(public)/page.tsx` (624 linee)
- Grid layout 4 colonne responsive per bundle catalog
- Sezione hero con 3 badge (ISO 9001, ISO 27001, Demand-Driven)
- Nuova sezione trust con 6 compliance badges
- Sezione confronto demand-driven vs e-commerce tradizionale
- Footer 4 colonne con tutti i link bundle + legal + risorse
- CTA conversion-optimized

### Fixed

#### Windows Compatibility
- **Issue**: `npm run db:update-bundle` falliva su Windows con errore `psql: invalid URI query parameter: "schema"`
- **Root cause**: psql non supporta query parameters in DATABASE_URL (solo Prisma)
- **Fix**: Script Node.js `scripts/run-sql.js` che:
  - Parse URL PostgreSQL
  - Rimuove `?schema=public`
  - Su Windows: usa parametri separati `-h -U -d` + PGPASSWORD
  - Su Linux/macOS: usa URL pulita

#### SQL Verification Query
- **Issue**: Query verifica percentuali milestone causava errore `column must appear in GROUP BY`
- **Fix**: Riscritto con CTE (Common Table Expression) per calcolo aggregato corretto

### Security

#### Hardening Applicato
- SSH: Password authentication disabled, solo key-based
- Firewall: UFW con whitelist 22/80/443, deny all else
- Fail2Ban: SSH brute-force protection (3 tentativi, ban 1h)
- Kernel: 15 parametri sysctl hardened (SYN cookies, rp_filter, etc.)
- Audit: auditd logging per file critici e privilege escalation
- Auto-updates: Unattended-upgrades per security patches

#### Encryption
- **At rest**:
  - PostgreSQL: Native encryption (gestito Hetzner LUKS)
  - Password: bcrypt cost 12
  - Backup: GPG AES-256
  - Documenti: AES-256-CBC
- **In transit**:
  - HTTPS: TLS 1.2+ only (Let's Encrypt)
  - PostgreSQL: SSL required
  - Email: TLS 1.2 to SendGrid
  - Backup sync: SSH/rsync encrypted

#### Secrets Management
- Ansible Vault per 22 secrets (cifrato AES-256)
- GitHub Secrets per CI/CD (masked nei log)
- .env file permissions 0600 (solo app user)
- Secrets rotation policy ogni 90 giorni

#### Compliance Controls Implementati
- **ISO 27001:2022**:
  - A.5.14: Information Transfer Policies (HTTPS, TLS)
  - A.5.15: Access Control (RBAC, session management)
  - A.5.18: Access Rights Management (Prisma RLS)
  - A.5.19: Third-Party Services (Stripe, SendGrid SCC)
  - A.5.24: Incident Management Planning (INCIDENT_RESPONSE.md)
  - A.5.25: Security Event Logging (auditd, PostgreSQL logs)
  - A.5.26: Response to Security Incidents (procedure definite)
  - A.8.9: Configuration Management (Ansible IaC)
  - A.8.11: Data Classification (L1-L5 defined)
  - A.8.13: Backup (automated daily/weekly/monthly)
  - A.8.24: Cryptography (AES-256, TLS 1.2+, bcrypt)
  - A.8.31: Malware Protection (ClamAV antivirus)
  - A.8.32: Change Management (CI/CD pipeline, approvals)
  - A.12.1: Operational Procedures (runbooks, checklists)

- **GDPR**:
  - Art. 13-14: Privacy Policy completa
  - Art. 30: Registro trattamenti (3 trattamenti documentati)
  - Art. 32: Sicurezza trattamento (encryption, access control)
  - Art. 33-34: Data breach notification procedures (< 72h Garante)

- **PCI-DSS**:
  - SAQ A compliance (nessun dato carta su server)
  - Stripe Checkout hosted (Level 1 certified)
  - Webhook signature verification (HMAC-SHA256)

### Infrastructure

#### Hetzner Cloud Target
- **Server**: CX22 (2 vCPU, 4GB RAM, 40GB SSD NVMe)
- **Location**: Norimberga (nbg1) - Germania, EU
- **OS**: Ubuntu 24.04 LTS
- **Costo**: €5.83/mese + €0.50/mese backup (totale ~€6.33/mese)
- **Network**: 20 TB traffic incluso
- **IPv4**: 1 incluso
- **Firewall**: Cloud Firewall (gratuito)

#### Stack Tecnologico Completo
- **Frontend**: Next.js 14 + React 19 + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + NextAuth.js
- **Database**: PostgreSQL 16 (tuned per 4GB RAM)
- **ORM**: Prisma 5.x
- **Process Manager**: pm2 (cluster mode, 2 workers)
- **Web Server**: Nginx 1.24 (reverse proxy, HTTP/2, TLS 1.2+)
- **SSL**: Let's Encrypt (auto-renewal)
- **Monitoring**: Prometheus 2.48 + Grafana 10.2 + Node Exporter + PostgreSQL Exporter
- **Backup**: pg_dump + GPG encryption + Hetzner Storage Box
- **CI/CD**: GitHub Actions (test + deploy + rollback)
- **IaC**: Ansible 2.15 (7 playbook)

#### Performance Targets
- **Build time**: < 5 min (attuale: ~3 min)
- **Deploy time**: < 10 min (attuale: ~5 min con Ansible)
- **Response time**: < 500ms P95
- **Uptime**: > 99.5% (target)
- **MTTR**: < 15 min (con rollback automatico)

### Developer Experience

#### Automation Completa
- **Zero-touch deployment**: `ansible-playbook playbooks/site.yml` (< 30 min)
- **One-command update**: `ansible-playbook playbooks/application.yml --tags deploy` (< 3 min)
- **Automatic rollback**: GitHub Actions rollback su failure deploy
- **Continuous monitoring**: Grafana dashboards real-time
- **Automated backups**: Cron daily con encryption + verification

#### Documentation
- **Total pages**: 650+ pagine documentazione tecnica
- **Runbooks**: Step-by-step deployment checklist
- **Troubleshooting**: 20+ scenari comuni con soluzioni
- **Architecture**: DFD completi con diagrammi Mermaid
- **Compliance**: ISO 27001/9001 audit-ready documentation

---

## [0.9.0] - 2025-12-20 (Previous Session)

### Added
- MVP Sprint 1-12 completati (100%)
- Database schema completo (Prisma)
- Authentication NextAuth.js
- Dashboard clienti/collaboratori/titolare
- API Routes complete
- Stripe integration pagamenti
- SendGrid email automation
- File upload con antivirus ClamAV
- Rate limiting con Upstash Redis
- 3 bundle iniziali (Ristrutturazione, Due Diligence, Vulnerabilità Sismica)

---

## Upgrade Path

### Da 0.9.0 a 1.0.0

**Pre-requisiti**:
1. Backup completo database locale
2. Git stash modifiche locali
3. Verificare Node.js 20+ e npm 10+

**Steps**:
```bash
# 1. Pull latest code
git checkout main
git pull origin main

# 2. Install dependencies (potrebbe richiedere 5-10 min)
cd studio-erp
npm ci

# 3. Update database con 8 bundle
npm run db:update-bundle

# 4. Verify bundle import
npx prisma studio
# Check: 8 bundle presenti

# 5. Rebuild application
npm run build

# 6. Test local
npm run dev
# Verificare: http://localhost:3000
```

**Breaking Changes**:
- Nessuno (backward compatible)

**Data Migration**:
- `update-bundle-completo.sql` aggiunge 2 nuovi bundle (DELETE 3, INSERT 8)
- Dati esistenti (utenti, incarichi, pagamenti) non modificati

---

## Roadmap Future Releases

### [1.1.0] - Q1 2026 (Planned)
- [ ] Multi-language support (IT, EN)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting (PDF export)
- [ ] Integration con CAD software (AutoCAD, Revit)
- [ ] Marketplace terze parti (geometri, geologi, laboratori prove)

### [1.2.0] - Q2 2026 (Planned)
- [ ] AI-powered preventivi (GPT-4 integration avanzata)
- [ ] Blockchain per certificati immutabili
- [ ] AR/VR per sopralluoghi virtuali
- [ ] Integration con PA (SUAP, SUE)

### [2.0.0] - Q3 2026 (Planned)
- [ ] Multi-tenant (white-label per altri studi)
- [ ] Franchising model support
- [ ] Enterprise SSO (SAML, OAuth2)
- [ ] Advanced analytics & BI dashboards

---

## Support & Contact

**Bugs & Issues**: https://github.com/romanobenit/romanoing/issues
**Email**: benedetto.romano@studioromano.it
**Documentation**: `/docs` directory
**Deployment Help**: `docs/DEPLOYMENT_READINESS_CHECKLIST.md`

---

## License

Proprietario - © 2025 Studio Ing. Romano
Tutti i diritti riservati.

---

**Note**: Questo CHANGELOG sarà aggiornato ad ogni release seguendo semantic versioning.
