# 🔒 Risk Assessment ISO 27001:2022
## Studio ERP - Piattaforma Gestione Incarichi Tecnici

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: CTO - Studio Romano
**Prossima Revisione**: 2026-06-27 (semestrale)
**Stato**: APPROVED

---

## 📋 Executive Summary

Questo documento identifica, valuta e tratta i rischi per la sicurezza delle informazioni del sistema Studio ERP, conforme a ISO/IEC 27001:2022.

**Metodologia**: Risk Assessment basato su ISO 27005:2022
**Ambito**: Piattaforma web Studio ERP + Infrastruttura Hetzner
**Periodo**: 2025-2026

**Risultati**:
- **Rischi Identificati**: 24
- **Rischi Critici**: 3
- **Rischi Alti**: 6
- **Rischi Medi**: 10
- **Rischi Bassi**: 5
- **Rischi Residui Accettabili**: 21/24

---

## 🎯 Asset Inventory

### 1. Information Assets

| ID | Asset | Tipo | Classificazione | Valore Business | Owner |
|----|-------|------|-----------------|-----------------|-------|
| IA-01 | Database PostgreSQL (dati clienti) | Data | **CRITICO** | Alto | DBA |
| IA-02 | Documenti tecnici clienti (PDF, DWG) | Data | **CRITICO** | Alto | Responsabile Incarico |
| IA-03 | Credenziali autenticazione utenti | Data | **CRITICO** | Alto | Security Admin |
| IA-04 | API Keys (Stripe, SendGrid, OpenAI) | Data | **ALTO** | Medio | DevOps |
| IA-05 | Audit logs (compliance ISO) | Data | **ALTO** | Medio | Compliance Officer |
| IA-06 | Codice sorgente applicazione | Data | **MEDIO** | Medio | CTO |
| IA-07 | Backup database | Data | **CRITICO** | Alto | DevOps |
| IA-08 | PII clienti (email, telefono, partita IVA) | Data | **CRITICO** | Alto | GDPR DPO |

### 2. System Assets

| ID | Asset | Tipo | Criticità | Disponibilità Richiesta |
|----|-------|------|-----------|------------------------|
| SA-01 | Server Hetzner CX41 (production) | Infrastructure | **CRITICO** | 99.5% |
| SA-02 | PostgreSQL 16 (primary) | Software | **CRITICO** | 99.5% |
| SA-03 | Next.js Application (PM2) | Software | **CRITICO** | 99.5% |
| SA-04 | NGINX Reverse Proxy | Software | **ALTO** | 99.5% |
| SA-05 | Storage Box Hetzner (backup) | Infrastructure | **ALTO** | 99.0% |
| SA-06 | ClamAV Antivirus | Software | **MEDIO** | 95.0% |
| SA-07 | Redis Upstash (rate limiting) | Software | **MEDIO** | 95.0% |
| SA-08 | GitHub Repository (privato) | Infrastructure | **MEDIO** | 99.9% |

### 3. Human Assets

| Ruolo | Accessi | Criticità |
|-------|---------|-----------|
| TITOLARE | Full admin (database, server, codice) | **CRITICO** |
| COLLABORATORE | Incarichi assegnati, documenti limitati | **MEDIO** |
| CLIENTE | Propri incarichi, documenti, messaggi | **BASSO** |
| DevOps Engineer | Server SSH, database, deployment | **ALTO** |

---

## ⚠️ Risk Assessment Matrix

### Criteri di Valutazione

**Probabilità (P)**:
1. Raro (< 5% annuale)
2. Improbabile (5-25%)
3. Possibile (25-50%)
4. Probabile (50-75%)
5. Quasi Certo (> 75%)

**Impatto (I)**:
1. Trascurabile (< €1.000, nessun dato perso)
2. Minore (€1.000-€5.000, < 1h downtime)
3. Moderato (€5.000-€20.000, 1-8h downtime)
4. Maggiore (€20.000-€100.000, 8-24h downtime, perdita dati parziale)
5. Catastrofico (> €100.000, > 24h downtime, perdita dati massiva)

**Livello Rischio (R = P × I)**:
- **1-4**: Basso (verde)
- **5-9**: Medio (giallo)
- **10-14**: Alto (arancione)
- **15-25**: Critico (rosso)

---

## 🔴 Rischi Critici (R ≥ 15)

### RISK-01: SQL Injection / Data Breach

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.24 - Use of cryptography |
| **Asset Coinvolti** | IA-01 (Database), IA-08 (PII) |
| **Minaccia** | Attaccante esterno esegue SQL injection per estrarre dati clienti |
| **Vulnerabilità** | Query SQL dinamiche senza prepared statements |
| **Probabilità** | 3 - Possibile |
| **Impatto** | 5 - Catastrofico (GDPR breach, reputazione) |
| **Rischio Iniziale** | **15 - CRITICO** |

**Controlli Esistenti**:
- ✅ Uso esclusivo di parametrized queries (`pg` library)
- ✅ ORM validation (Prisma schema)
- ✅ Input sanitization (Zod schemas)
- ✅ Rate limiting API (100 req/min)
- ✅ Audit logging completo

**Trattamento**:
- [x] Implementato: Prepared statements su tutte le query
- [x] Implementato: Zod validation su tutti gli endpoint
- [x] Implementato: OWASP Top 10 review completata
- [ ] Pianificato Q1 2026: Penetration testing esterno
- [ ] Pianificato Q1 2026: Web Application Firewall (Cloudflare)

**Rischio Residuo**: **6 - MEDIO** (P=2, I=3)
**Accettabilità**: ✅ Accettabile con monitoraggio

---

### RISK-02: Ransomware / Cryptolocker

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.13 - Information backup |
| **Asset Coinvolti** | IA-01 (Database), IA-02 (Documenti), SA-01 (Server) |
| **Minaccia** | Malware ransomware cripta database e documenti |
| **Vulnerabilità** | Server accessibile via SSH, documenti non versionati |
| **Probabilità** | 2 - Improbabile |
| **Impatto** | 5 - Catastrofico (business interruption totale) |
| **Rischio Iniziale** | **10 - ALTO** |

**Controlli Esistenti**:
- ✅ Backup giornalieri automatici (pgBackRest)
- ✅ Backup offsite (Storage Box Hetzner)
- ✅ Snapshot server giornalieri (7 giorni retention)
- ✅ ClamAV antivirus su upload documenti
- ✅ SSH key-only authentication (no password)
- ✅ Firewall UFW (solo porte 80, 443, 22)

**Trattamento**:
- [x] Implementato: Backup 3-2-1 strategy (3 copie, 2 media, 1 offsite)
- [x] Implementato: Immutable backups (append-only)
- [x] Implementato: Test restore mensili
- [ ] Pianificato Q1 2026: Fail2ban configurazione avanzata
- [ ] Pianificato Q1 2026: Intrusion Detection System (OSSEC)

**Rischio Residuo**: **4 - BASSO** (P=2, I=2)
**Accettabilità**: ✅ Accettabile (RPO 24h accettabile per business)

---

### RISK-03: Insider Threat - Data Exfiltration

| Campo | Valore |
|-------|--------|
| **Categoria** | A.6.4 - Disciplinary process |
| **Asset Coinvolti** | IA-01 (Database), IA-02 (Documenti), IA-08 (PII) |
| **Minaccia** | Collaboratore malintenzionato esporta dati clienti in massa |
| **Vulnerabilità** | Collaboratori hanno accesso a incarichi assegnati senza limitazioni export |
| **Probabilità** | 2 - Improbabile |
| **Impatto** | 4 - Maggiore (GDPR violation, perdita fiducia) |
| **Rischio Iniziale** | **8 - MEDIO** |

**Controlli Esistenti**:
- ✅ Row-Level Security (RLS) PostgreSQL
- ✅ Audit logging completo (chi, cosa, quando)
- ✅ Accesso database solo via applicazione (no accesso diretto)
- ✅ Ruoli RBAC (TITOLARE, COLLABORATORE, CLIENTE)
- ❌ Nessuna limitazione export bulk

**Trattamento**:
- [x] Implementato: Audit log completo su export
- [ ] Pianificato Q1 2026: Rate limiting su export documenti (max 10/giorno)
- [ ] Pianificato Q1 2026: Alert automatico per export anomali
- [ ] Pianificato Q1 2026: DLP (Data Loss Prevention) su email
- [ ] Pianificato Q2 2026: Watermarking documenti tecnici

**Rischio Residuo**: **6 - MEDIO** (P=2, I=3)
**Accettabilità**: ✅ Accettabile con implementazione Q1 2026

---

## 🟠 Rischi Alti (R = 10-14)

### RISK-04: DDoS Attack

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.6 - Capacity management |
| **Asset Coinvolti** | SA-01 (Server), SA-03 (Application) |
| **Minaccia** | Attacco DDoS satura banda o CPU |
| **Vulnerabilità** | Server singolo, no CDN, no anti-DDoS |
| **Probabilità** | 3 - Possibile |
| **Impatto** | 3 - Moderato (servizio offline 4-8h) |
| **Rischio Iniziale** | **9 - MEDIO** |

**Controlli Esistenti**:
- ✅ Rate limiting applicativo (100 req/min)
- ✅ Upstash Redis distributed rate limit
- ✅ Hetzner DDoS protection base (inclusa)
- ❌ No CDN
- ❌ No Web Application Firewall

**Trattamento**:
- [ ] Pianificato Q1 2026: Cloudflare Free Tier (CDN + WAF)
- [ ] Pianificato Q2 2026: Cloudflare Pro (€20/mese, advanced DDoS)
- [ ] Considerato: Load balancer per distribuzione traffico

**Rischio Residuo**: **6 - MEDIO** (P=2, I=3) dopo Cloudflare
**Accettabilità**: ✅ Accettabile per studio professionale

---

### RISK-05: SSL Certificate Expiration

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.24 - Use of cryptography |
| **Asset Coinvolti** | SA-03 (Application), SA-04 (NGINX) |
| **Minaccia** | Certificato SSL scaduto blocca accesso HTTPS |
| **Vulnerabilità** | Let's Encrypt auto-renewal potrebbe fallire |
| **Probabilità** | 2 - Improbabile |
| **Impatto** | 4 - Maggiore (servizio inaccessibile, trust loss) |
| **Rischio Iniziale** | **8 - MEDIO** |

**Controlli Esistenti**:
- ✅ Let's Encrypt con auto-renewal (certbot)
- ✅ Cronjob giornaliero rinnovo certificati
- ❌ Nessun alert pre-scadenza

**Trattamento**:
- [x] Implementato: Certbot auto-renewal
- [ ] Pianificato Q1 2026: Monitoring certificato (UptimeRobot SSL check)
- [ ] Pianificato Q1 2026: Alert email 7 giorni prima scadenza
- [ ] Pianificato Q1 2026: Certificato backup manuale

**Rischio Residuo**: **2 - BASSO** (P=1, I=2)
**Accettabilità**: ✅ Accettabile

---

### RISK-06: API Key Leakage (Stripe, OpenAI)

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.3 - Handling of assets |
| **Asset Coinvolti** | IA-04 (API Keys) |
| **Minaccia** | API keys pubblicate accidentalmente su GitHub o log |
| **Vulnerabilità** | Sviluppatori potrebbero committare .env per errore |
| **Probabilità** | 3 - Possibile |
| **Impatto** | 4 - Maggiore (costi non autorizzati, data breach) |
| **Rischio Iniziale** | **12 - ALTO** |

**Controlli Esistenti**:
- ✅ `.env` in `.gitignore`
- ✅ GitHub repository privato
- ✅ Environment variables server-side only
- ❌ Nessuna rotazione periodica secrets
- ❌ Nessun secret scanning automatico

**Trattamento**:
- [x] Implementato: `.env.example` senza valori reali
- [ ] Pianificato Q1 2026: GitHub Secret Scanning abilitato
- [ ] Pianificato Q1 2026: Rotazione API keys semestrale
- [ ] Pianificato Q1 2026: Secrets management (Ansible Vault o sops)
- [ ] Pianificato Q2 2026: HashiCorp Vault (se scala)

**Rischio Residuo**: **6 - MEDIO** (P=2, I=3)
**Accettabilità**: ✅ Accettabile con rotazione Q1 2026

---

### RISK-07: PostgreSQL Injection via JSONB

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.22 - Segregation of networks |
| **Asset Coinvolti** | IA-01 (Database) |
| **Minaccia** | Injection maliciosa in campi JSONB (servizi, procedure, milestone) |
| **Vulnerabilità** | JSONB fields potrebbero contenere payload malevoli |
| **Probabilità** | 2 - Improbabile |
| **Impatto** | 4 - Maggiore (data corruption, privilege escalation) |
| **Rischio Iniziale** | **8 - MEDIO** |

**Controlli Esistenti**:
- ✅ Zod validation su struttura JSONB
- ✅ Prepared statements PostgreSQL
- ✅ Type checking TypeScript
- ❌ Nessuna sanitization specifica JSONB

**Trattamento**:
- [x] Implementato: Zod schema validation su JSONB
- [ ] Pianificato Q1 2026: Sanitization specifica per JSONB keys
- [ ] Pianificato Q1 2026: PostgreSQL JSONB constraints
- [ ] Pianificato Q1 2026: Penetration testing specifico

**Rischio Residuo**: **4 - BASSO** (P=2, I=2)
**Accettabilità**: ✅ Accettabile

---

### RISK-08: Backup Failure (Silenzioso)

| Campo | Valore |
|-------|--------|
| **Categoria** | A.8.13 - Information backup |
| **Asset Coinvolti** | IA-07 (Backup database) |
| **Minaccia** | Backup fails silenziosamente, scoperto solo quando serve restore |
| **Vulnerabilità** | Nessun alert su backup failure |
| **Probabilità** | 3 - Possibile |
| **Impatto** | 5 - Catastrofico (impossibile recuperare da disaster) |
| **Rischio Iniziale** | **15 - CRITICO** |

**Controlli Esistenti**:
- ✅ pgBackRest con verify checksum
- ✅ Cron job giornaliero backup
- ❌ Nessun monitoring backup success/failure
- ❌ Nessun test restore automatico

**Trattamento**:
- [ ] **PRIORITÀ MASSIMA Q1 2026**: Alert email su backup failure
- [ ] **PRIORITÀ MASSIMA Q1 2026**: Test restore automatico mensile
- [ ] Pianificato Q1 2026: Monitoring backup age (alert se > 48h)
- [ ] Pianificato Q1 2026: Healthcheck endpoint backup status
- [ ] Pianificato Q2 2026: Backup to second provider (S3)

**Rischio Residuo**: **4 - BASSO** (P=1, I=4) dopo implementazione
**Accettabilità**: ⚠️ NON accettabile senza alert (MUST FIX Q1 2026)

---

### RISK-09: Unauthorized SSH Access

| Campo | Valore |
|-------|--------|
| **Categoria** | A.5.18 - Access rights |
| **Asset Coinvolti** | SA-01 (Server) |
| **Minaccia** | Attaccante ottiene accesso SSH via brute force o chiave compromessa |
| **Vulnerabilità** | Porta SSH 22 esposta pubblicamente |
| **Probabilità** | 2 - Improbabile |
| **Impatto** | 5 - Catastrofico (full system compromise) |
| **Rischio Iniziale** | **10 - ALTO** |

**Controlli Esistenti**:
- ✅ SSH key-only authentication (password disabled)
- ✅ UFW firewall (solo IP whitelist opzionale)
- ❌ Nessun fail2ban configurato
- ❌ Porta SSH standard 22
- ❌ Nessuna 2FA

**Trattamento**:
- [ ] Pianificato Q1 2026: Fail2ban (ban dopo 3 tentativi falliti)
- [ ] Pianificato Q1 2026: SSH port change (22 → 2222 o random)
- [ ] Pianificato Q1 2026: SSH 2FA con Google Authenticator
- [ ] Pianificato Q2 2026: Bastion host per accesso amministrativo
- [ ] Considerato: VPN per accesso server (WireGuard)

**Rischio Residuo**: **3 - BASSO** (P=1, I=3) dopo hardening
**Accettabilità**: ✅ Accettabile dopo fail2ban Q1 2026

---

## 🟡 Rischi Medi (R = 5-9)

### RISK-10: CSRF Attack (Cross-Site Request Forgery)

| Campo | Valore |
|-------|--------|
| **Minaccia** | Attaccante induce utente autenticato a eseguire azioni non volute |
| **Probabilità** | 2 - Improbabile | **Impatto** | 3 - Moderato |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ✅ CSRF token (NextAuth.js), ✅ SameSite cookies
**Rischio Residuo**: **2 - BASSO**

---

### RISK-11: XSS (Cross-Site Scripting)

| Campo | Valore |
|-------|--------|
| **Minaccia** | Script malevolo iniettato in input utente (note, messaggi) |
| **Probabilità** | 2 - Improbabile | **Impatto** | 3 - Moderato |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ✅ React auto-escaping, ✅ DOMPurify su HTML content, ✅ CSP headers
**Rischio Residuo**: **2 - BASSO**

---

### RISK-12: Session Hijacking

| Campo | Valore |
|-------|--------|
| **Minaccia** | Attaccante ruba session cookie e impersona utente |
| **Probabilità** | 2 - Improbabile | **Impatto** | 4 - Maggiore |
| **Rischio** | **8 - MEDIO** |

**Controlli**: ✅ HTTPS only, ✅ HttpOnly cookies, ✅ Secure flag, ✅ 30-day session expiry
**Trattamento Pianificato**: Session rotation on privilege escalation
**Rischio Residuo**: **4 - BASSO**

---

### RISK-13: Malicious File Upload

| Campo | Valore |
|-------|--------|
| **Minaccia** | Upload di malware tramite funzionalità documenti |
| **Probabilità** | 3 - Possibile | **Impatto** | 3 - Moderato |
| **Rischio** | **9 - MEDIO** |

**Controlli**: ✅ ClamAV scan, ✅ File type validation, ✅ Max size 10MB, ✅ Quarantine folder
**Rischio Residuo**: **3 - BASSO**

---

### RISK-14: Denial of Service (Application Layer)

| Campo | Valore |
|-------|--------|
| **Minaccia** | Attaccante esaurisce risorse CPU/RAM con richieste complesse |
| **Probabilità** | 2 - Improbabile | **Impatto** | 3 - Moderato |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ✅ Rate limiting, ✅ Query timeout 30s, ✅ PM2 cluster mode (auto-restart)
**Rischio Residuo**: **4 - BASSO**

---

### RISK-15: GDPR Non-Compliance (Data Retention)

| Campo | Valore |
|-------|--------|
| **Minaccia** | Conservazione dati personali oltre limite legale (10 anni fiscali) |
| **Probabilità** | 3 - Possibile | **Impatto** | 3 - Moderato (sanzioni GDPR) |
| **Rischio** | **9 - MEDIO** |

**Controlli**: ✅ Privacy policy documentata, ❌ Nessuna retention policy automatica
**Trattamento Pianificato Q2 2026**: Cron job cancellazione dati > 10 anni
**Rischio Residuo**: **6 - MEDIO** (accettabile con implementazione Q2)

---

### RISK-16: Third-Party Service Outage

| Campo | Valore |
|-------|--------|
| **Minaccia** | Outage Stripe, SendGrid, Upstash, GitHub blocca funzionalità |
| **Probabilità** | 3 - Possibile | **Impatto** | 2 - Minore |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ✅ Graceful degradation, ✅ Local dev fallback
**Rischio Residuo**: **6 - MEDIO** (accettabile, servizi affidabili)

---

### RISK-17: Insufficient Logging (Security Events)

| Campo | Valore |
|-------|--------|
| **Minaccia** | Security incident non rilevato per mancanza di log |
| **Probabilità** | 2 - Improbabile | **Impatto** | 3 - Moderato |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ✅ Application audit log, ✅ PostgreSQL pgaudit, ❌ Nessun SIEM
**Trattamento Pianificato Q2 2026**: Centralized logging (Loki + Grafana)
**Rischio Residuo**: **4 - BASSO**

---

### RISK-18: Password Weakness

| Campo | Valore |
|-------|--------|
| **Minaccia** | Utenti usano password deboli facilmente violabili |
| **Probabilità** | 4 - Probabile | **Impatto** | 2 - Minore |
| **Rischio** | **8 - MEDIO** |

**Controlli**: ✅ NextAuth.js bcrypt, ❌ Nessuna password complexity policy
**Trattamento Pianificato Q1 2026**: Password requirements (min 12 char, symbols)
**Rischio Residuo**: **4 - BASSO**

---

### RISK-19: Email Spoofing

| Campo | Valore |
|-------|--------|
| **Minaccia** | Email spoofate sembrano provenire da studio-romano.it |
| **Probabilità** | 3 - Possibile | **Impatto** | 2 - Minore |
| **Rischio** | **6 - MEDIO** |

**Controlli**: ❌ Nessun SPF, ❌ Nessun DKIM, ❌ Nessun DMARC
**Trattamento Pianificato Q1 2026**: SPF, DKIM, DMARC configuration
**Rischio Residuo**: **2 - BASSO**

---

## 🟢 Rischi Bassi (R = 1-4)

### RISK-20: Physical Server Theft (Hetzner Datacenter)
**Rischio**: **1 - BASSO** (P=1, I=1)
**Controlli**: Hetzner physical security ISO 27001 certified

---

### RISK-21: Natural Disaster (Datacenter Fire/Flood)
**Rischio**: **2 - BASSO** (P=1, I=2)
**Controlli**: Offsite backup Storage Box, different datacenter location

---

### RISK-22: Developer Laptop Theft
**Rischio**: **4 - BASSO** (P=2, I=2)
**Controlli**: No production data on laptops, SSH keys password-protected

---

### RISK-23: Subdomain Takeover
**Rischio**: **3 - BASSO** (P=1, I=3)
**Controlli**: DNS managed internally, no dangling CNAMEs

---

### RISK-24: Browser Compatibility Issues
**Rischio**: **2 - BASSO** (P=2, I=1)
**Controlli**: Modern browsers only (Chrome, Firefox, Safari, Edge)

---

## 📊 Risk Summary Dashboard

```
┌─────────────────────────────────────────────┐
│  LIVELLO RISCHIO    │ INIZIALE │ RESIDUO    │
├─────────────────────────────────────────────┤
│  🔴 CRITICO (≥15)   │    3     │    0       │
│  🟠 ALTO (10-14)    │    6     │    1*      │
│  🟡 MEDIO (5-9)     │   10     │   15       │
│  🟢 BASSO (1-4)     │    5     │    8       │
├─────────────────────────────────────────────┤
│  TOTALE             │   24     │   24       │
└─────────────────────────────────────────────┘

* RISK-08 (Backup Failure) richiede implementazione PRIORITARIA Q1 2026
```

---

## ✅ Action Plan Q1 2026 (PRIORITÀ)

### Gennaio 2026 (CRITICO)
1. **RISK-08**: Implementare alert backup failure + test restore automatico
2. **RISK-06**: Abilitare GitHub Secret Scanning
3. **RISK-09**: Configurare fail2ban + cambio porta SSH
4. **RISK-18**: Password complexity policy (min 12 char)
5. **RISK-19**: SPF + DKIM + DMARC email authentication

### Febbraio 2026 (ALTO)
6. **RISK-04**: Cloudflare Free Tier (CDN + WAF)
7. **RISK-05**: SSL certificate monitoring (UptimeRobot)
8. **RISK-03**: Rate limiting export documenti
9. **RISK-07**: JSONB sanitization testing

### Marzo 2026 (MEDIO)
10. Penetration Testing esterno (RISK-01)
11. Security awareness training team
12. Incident response drill (tabletop exercise)

---

## 📋 Risk Treatment Summary

| Strategia | Numero Rischi | Esempi |
|-----------|---------------|--------|
| **MITIGATE** (ridurre) | 18 | Backup testing, fail2ban, WAF |
| **ACCEPT** (accettare) | 5 | Third-party outage, browser compatibility |
| **TRANSFER** (trasferire) | 1 | Cyber insurance (considerato Q2 2026) |
| **AVOID** (evitare) | 0 | N/A |

---

## 📅 Review Schedule

| Tipo Review | Frequenza | Prossima Data |
|-------------|-----------|---------------|
| **Risk Assessment completo** | Semestrale | 2026-06-27 |
| **Threat landscape update** | Trimestrale | 2026-03-27 |
| **Incident review** | Ad-hoc (post-incident) | N/A |
| **Compliance audit** | Annuale | 2026-12-27 |

---

## 🔐 Risk Acceptance

**Approvals**:
- [ ] CTO - Chief Technology Officer: _________________ Data: _______
- [ ] GDPR DPO - Data Protection Officer: _________________ Data: _______
- [ ] Business Owner - TITOLARE: _________________ Data: _______

**Dichiarazione**:
I sottoscritti accettano i rischi residui identificati in questo documento, confermando che i controlli implementati sono adeguati per il profilo di rischio dello Studio Romano.

---

## 📚 References

- ISO/IEC 27001:2022 - Information Security Management
- ISO/IEC 27005:2022 - Information Security Risk Management
- NIST SP 800-30 - Guide for Conducting Risk Assessments
- OWASP Top 10:2021 - Web Application Security Risks
- GDPR (EU 2016/679) - Data Protection Regulation
- NIS2 Directive (EU 2022/2555) - Network and Information Security

---

**Document Control**:
- **Classification**: CONFIDENTIAL - Internal Use Only
- **Storage**: `/docs/ISO_27001_RISK_ASSESSMENT.md`
- **Backup**: Incluso in backup giornaliero
- **Access**: TITOLARE, CTO, GDPR DPO only

**End of Document**
