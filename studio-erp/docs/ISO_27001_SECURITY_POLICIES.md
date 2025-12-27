# 🔒 Information Security Policies ISO 27001:2022
## Studio ERP - Piattaforma Gestione Incarichi Tecnici

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: CTO - Studio Romano
**Prossima Revisione**: 2026-12-27 (annuale)
**Stato**: APPROVED

---

## 📋 Table of Contents

1. [Information Security Policy (Master)](#1-information-security-policy-master)
2. [Acceptable Use Policy](#2-acceptable-use-policy)
3. [Password & Authentication Policy](#3-password--authentication-policy)
4. [Encryption & Cryptography Policy](#4-encryption--cryptography-policy)
5. [Backup & Recovery Policy](#5-backup--recovery-policy)
6. [Access Control Policy](#6-access-control-policy)
7. [Incident Management Policy](#7-incident-management-policy)
8. [Data Classification & Handling Policy](#8-data-classification--handling-policy)
9. [Privacy & GDPR Compliance Policy](#9-privacy--gdpr-compliance-policy)
10. [Change Management Policy](#10-change-management-policy)
11. [Physical & Environmental Security Policy](#11-physical--environmental-security-policy)
12. [Third-Party Security Policy](#12-third-party-security-policy)

---

## 1. Information Security Policy (Master)

### 1.1 Purpose & Scope

**Purpose**: Stabilire le linee guida per proteggere la riservatezza, integrità e disponibilità delle informazioni di Studio Romano.

**Scope**: Tutti i sistemi, dati, utenti e terze parti che interagiscono con Studio ERP.

**Compliance**: ISO/IEC 27001:2022, GDPR (EU 2016/679), NTC 2018 (obblighi professionali ingegneri).

### 1.2 Information Security Objectives

1. **Confidentiality**: Proteggere dati clienti e documenti tecnici da accessi non autorizzati
2. **Integrity**: Garantire accuratezza e completezza di progetti, calcoli strutturali e documenti legali
3. **Availability**: Assicurare disponibilità piattaforma 99.5% annuale (43.8h downtime massimo)
4. **Compliance**: Conformità totale ISO 9001, ISO 27001, GDPR
5. **Trust**: Mantenere fiducia clienti tramite sicurezza dimostrabile

### 1.3 Roles & Responsibilities

| Ruolo | Responsabilità | Persona |
|-------|----------------|---------|
| **Business Owner** | Approvazione politiche, budget security | TITOLARE |
| **Chief Technology Officer (CTO)** | Implementazione tecnica, security architecture | TITOLARE (interim) |
| **Data Protection Officer (DPO)** | GDPR compliance, privacy impact assessments | TITOLARE (interim) |
| **System Administrator** | Hardening server, patch management, monitoring | DevOps Engineer |
| **All Users** | Seguire politiche, segnalare incident | Tutti i dipendenti |

### 1.4 Policy Review & Updates

- **Frequenza**: Annuale (ogni 27 dicembre)
- **Trigger eccezionali**: Security breach, nuove normative, audit findings
- **Approvazione**: CTO + Business Owner (firma)
- **Distribuzione**: Email + firma ricevuta da tutti gli utenti

### 1.5 Sanctions

Violazioni di queste politiche possono portare a:
- **Minori**: Richiamo scritto, formazione aggiuntiva
- **Maggiori**: Sospensione account, procedimento disciplinare
- **Gravi**: Licenziamento, denuncia penale (furto dati, sabotaggio)

---

## 2. Acceptable Use Policy

### 2.1 Authorized Use

La piattaforma Studio ERP può essere usata **SOLO** per:
- ✅ Gestione incarichi tecnici professionali
- ✅ Comunicazione con clienti su progetti
- ✅ Archiviazione documenti tecnici (PDF, DWG, CAD)
- ✅ Elaborazione preventivi e fatturazione (Stripe)

### 2.2 Prohibited Activities

È **VIETATO**:
- ❌ Uso personale non lavorativo
- ❌ Condivisione credenziali con terzi
- ❌ Download massivo di dati clienti non necessario
- ❌ Upload di contenuti illegali, offensivi o pornografici
- ❌ Tentativi di hacking, privilege escalation, SQL injection
- ❌ Installazione software non autorizzato su server
- ❌ Invio email spam a clienti
- ❌ Uso API keys per progetti personali esterni

### 2.3 Data Usage

**Collaboratori**:
- Possono accedere **SOLO** a incarichi assegnati
- Divieto di export dati per uso esterno allo studio
- Limite 10 documenti/giorno export (monitorato)

**Clienti**:
- Accesso read-only ai propri incarichi
- Divieto di web scraping o download automatico

### 2.4 Device Security

**Laptop/desktop** usati per accedere a Studio ERP devono avere:
- ✅ Antivirus aggiornato (Windows Defender o equivalente)
- ✅ Firewall attivo
- ✅ Sistema operativo aggiornato (patch mensili)
- ✅ Screen lock dopo 5 minuti inattività
- ✅ Full disk encryption (BitLocker/FileVault)

**Mobile devices**:
- ✅ PIN/biometric lock
- ✅ Auto-lock 2 minuti
- ❌ Accesso admin da dispositivi non autorizzati

### 2.5 Network Usage

**Consentito**:
- ✅ Accesso da rete ufficio
- ✅ Accesso da casa (VPN raccomandato)
- ✅ Accesso da reti mobili personali

**Vietato**:
- ❌ Accesso da WiFi pubblici non sicuri (hotel, caffè) senza VPN
- ❌ Accesso da internet café o computer condivisi

### 2.6 Monitoring & Audit

Studio Romano si riserva il diritto di:
- Monitorare traffico di rete
- Auditare azioni utenti (audit log completo)
- Leggere messaggi in piattaforma (TITOLARE only, per compliance)
- Bloccare account in caso di comportamenti sospetti

**Privacy**: Monitoraggio limitato a scopi security/compliance, non sorveglianza personale.

---

## 3. Password & Authentication Policy

### 3.1 Password Requirements

**Minimo**:
- Lunghezza: **12 caratteri**
- Composizione: Almeno 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo
- Divieto: Password comuni (123456, password, studio123)
- Divieto: Riuso password precedenti (ultime 3)

**Raccomandato**:
- Lunghezza: **16+ caratteri**
- Uso password manager (1Password, Bitwarden, LastPass)
- Passphrase: "Correct Horse Battery Staple" style

### 3.2 Password Rotation

| Account Type | Rotation Frequency | Note |
|--------------|-------------------|------|
| **Utenti applicazione** | 180 giorni | Alert email 7 giorni prima scadenza |
| **SSH keys** | 365 giorni | Rotazione annuale |
| **Database passwords** | 90 giorni | Automatico via script |
| **API keys** | 90 giorni | Rotazione semestrale (pianificato Q2 2026) |

### 3.3 Multi-Factor Authentication (2FA)

**Obbligatorio per**:
- ✅ TITOLARE (all'accesso)
- ✅ Hetzner Console (cloud infrastructure)
- ⚠️ SSH server access (pianificato Q1 2026)

**Opzionale per**:
- COLLABORATORE (raccomandato)
- CLIENTE (opzionale)

**Metodi accettati**:
- ✅ TOTP app (Google Authenticator, Authy)
- ✅ SMS (fallback, meno sicuro)
- ❌ Email (non consentito, troppo debole)

### 3.4 Account Lockout

**Fallback protection**:
- 3 tentativi falliti → Account locked 15 minuti
- 5 tentativi falliti → Account locked 1 ora
- 10 tentativi falliti → Account locked permanente (richiede unlock manuale TITOLARE)

**IP Ban** (Fail2ban):
- 3 tentativi SSH falliti → Ban IP 1 ora
- 5 tentativi SSH falliti → Ban IP 24 ore

### 3.5 Shared Accounts

**Regola generale**: **VIETATI** shared accounts.

**Eccezione**:
- Account `deploy` (application deployment) - Solo per CI/CD automation
- SSH keys: Una chiave per utente nominativo (tracciabilità)

### 3.6 Password Storage

**Applicazione**:
- Hashing: **bcrypt** (cost factor 10)
- Salt: Unico per utente (automatico bcrypt)
- Storage: PostgreSQL `users.password_hash` (mai plaintext)

**Server/Secrets**:
- Ansible Vault: AES-256 encrypted
- `.env` file: Permessi 400 (read-only owner)
- Backup secrets: Sealed envelope in safe fisico

---

## 4. Encryption & Cryptography Policy

### 4.1 Encryption at Rest

**Database** (PostgreSQL):
- Full disk encryption: **LUKS** (AES-256-XTS)
- Tablespace encryption: Pianificato Q2 2026 (pgcrypto)

**File System**:
- Server: **LUKS** full disk (AES-256-XTS)
- Backup: **GPG encryption** (AES-256) su tutti i file backup

**Documenti Clienti**:
- Storage: Filesystem LUKS encrypted
- Opzionale: Encryption file-level (pianificato Q2 2026)

### 4.2 Encryption in Transit

**HTTPS/TLS**:
- Protocollo: **TLS 1.3** (minimo TLS 1.2)
- Certificato: Let's Encrypt (RSA 2048-bit o ECDSA)
- Cipher suites: Solo strong ciphers (no RC4, no 3DES)
- HSTS: Strict-Transport-Security header (max-age 1 anno)

**Database Connections**:
- PostgreSQL: **SSL required** (verify-ca)
- Certificati: Self-signed interna (non esposta pubblicamente)

**SSH**:
- Protocollo: **SSH-2** (SSH-1 disabilitato)
- Key exchange: Curve25519, ECDH
- Encryption: AES-256-GCM, ChaCha20-Poly1305

### 4.3 Key Management

**SSH Keys**:
- Algoritmo: **ED25519** (raccomandato) o RSA 4096-bit
- Passphrase: Obbligatoria (min 20 caratteri)
- Storage: `~/.ssh/` con permessi 600
- Backup: Password manager (encrypted vault)

**LUKS Keys**:
- Passphrase: 24+ caratteri random
- Backup: Sealed envelope in safe fisico (ufficio TITOLARE)
- Accesso: Solo TITOLARE + DevOps Engineer

**API Keys**:
- Generazione: Random (min 32 caratteri)
- Storage: `.env` (server) + Ansible Vault (backup)
- Rotazione: Automatica ogni 90 giorni (pianificato)

### 4.4 Cryptographic Standards

**Approved Algorithms**:
- ✅ Symmetric: AES-256 (GCM mode), ChaCha20
- ✅ Asymmetric: RSA 2048+, ECDSA P-256+, ED25519
- ✅ Hashing: SHA-256, SHA-512, bcrypt
- ✅ Key Exchange: ECDH, Curve25519

**Forbidden Algorithms**:
- ❌ DES, 3DES (obsoleti)
- ❌ MD5, SHA-1 (collisioni note)
- ❌ RC4 (debole)
- ❌ RSA < 2048 bit

### 4.5 SSL/TLS Configuration

**NGINX SSL Config**:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

**Testing**:
- SSL Labs: Grade **A+** richiesto
- Test frequency: Ogni 6 mesi
- Remediation: Entro 7 giorni se grade < A

---

## 5. Backup & Recovery Policy

### 5.1 Backup Strategy (3-2-1 Rule)

**3 Copies**:
1. Primary data (production server `/var/lib/postgresql`)
2. Local backup (server `/var/backups/pgbackrest`)
3. Offsite backup (Hetzner Storage Box)

**2 Different Media**:
1. SSD NVMe (production + local backup)
2. HDD remote (Storage Box)

**1 Offsite**:
- Hetzner Storage Box (diverso datacenter)

### 5.2 Backup Schedule (SMALL Config)

| Tipo | Frequenza | Retention | Encryption | Tool |
|------|-----------|-----------|------------|------|
| **Database Full** | Giornaliero 02:00 | 7 giorni | GPG (AES-256) | pgBackRest |
| **Database Incremental** | Ogni 6 ore | 7 giorni | GPG | pgBackRest |
| **WAL Archive** | Continuo | 7 giorni | GPG | pgBackRest |
| **Documenti** | Ogni 6 ore | 30 giorni | rsync + GPG | rsync + gpg |
| **Server Snapshot** | Giornaliero 03:00 | 7 giorni | LUKS | Hetzner snapshots |
| **Config Files** | Settimanale | 30 giorni | Git repo privato | Git |

### 5.3 Recovery Objectives

**RTO (Recovery Time Objective)**:
- Database: **2 ore** (restore + verifica)
- Applicazione: **30 minuti** (deploy da backup)
- Server completo: **4 ore** (rebuild da snapshot)

**RPO (Recovery Point Objective)**:
- Database: **6 ore** (ultimo backup incrementale)
- Documenti: **6 ore** (ultimo rsync)
- Configurazione: **7 giorni** (ultimo commit Git)

### 5.4 Backup Testing

**Frequency**: **Mensile** (primo lunedì del mese)

**Procedura**:
1. Restore database backup su ambiente test
2. Verificare integrità dati (checksum, query campione)
3. Test applicazione su dati restored
4. Documentare risultati (success/failure)
5. Timing: Misurare tempo restore effettivo

**Alert**: Se restore test fallisce → Alert P1 (risoluzione entro 24h)

### 5.5 Backup Monitoring

**Healthchecks**:
- ✅ Backup completion notification (email giornaliera)
- ✅ Backup size monitoring (alert se < 50% size medio)
- ✅ Backup age alert (se ultimo backup > 48h)
- ⚠️ Alert setup pianificato Q1 2026 (RISK-08 CRITICO)

**Storage Monitoring**:
- Alert se Storage Box > 85% pieno
- Cleanup automatico backup > 30 giorni (incrementali)

### 5.6 Backup Security

**Encryption**:
- All backups encrypted con GPG (AES-256)
- Key: Stored in Ansible Vault + sealed envelope

**Access Control**:
- Storage Box: SSH key authentication only
- IP Whitelist: Solo production server IP
- Permissions: Backup user write-only (immutable backups)

**Audit**:
- Backup access log reviewed settimanalmente
- Alert su accesso da IP non autorizzato

---

## 6. Access Control Policy

**Riferimento**: Vedere documento `/docs/ISO_27001_ACCESS_CONTROL_MATRIX.md` per dettagli completi.

### 6.1 Principle of Least Privilege

Ogni utente ha **solo** i permessi necessari per le proprie mansioni:
- CLIENTE: Read-only propri incarichi
- COLLABORATORE: Read/write incarichi assegnati
- TITOLARE: Full admin

### 6.2 User Provisioning

**Nuovi utenti**:
1. Richiesta formale (email TITOLARE)
2. Approvazione TITOLARE
3. Creazione account con ruolo appropriato
4. Invio credenziali temporanee (cambio password obbligatorio al primo login)
5. Firma policy sicurezza

**Tempistiche**: Provisioning entro 24h lavorative

### 6.3 User De-provisioning

**Cessazione collaboratore**:
1. Disabilitazione account entro 24h
2. Rimozione SSH keys
3. Riassegnazione incarichi
4. Backup dati utente (GDPR compliance)
5. Audit azioni ultime 30 giorni

### 6.4 Access Review

**Frequenza**: Trimestrale (1 Gen, 1 Apr, 1 Lug, 1 Ott)

**Checklist**:
- Verificare utenti attivi vs. collaboratori effettivi
- Rimuovere account inattivi > 90 giorni
- Verificare SSH keys attive
- Audit anomalie (export massivi, login da IP strani)

---

## 7. Incident Management Policy

**Riferimento completo**: Vedere `/docs/ISO_27001_INCIDENT_RESPONSE.md`

### 7.1 Incident Definition

**Security Incident**: Evento che compromette confidentiality, integrity, o availability di dati/sistemi.

**Esempi**:
- Accesso non autorizzato a database
- Data breach (esposizione dati clienti)
- Malware/ransomware
- DDoS attack
- Furto laptop con dati clienti
- Perdita backup

### 7.2 Incident Severity

| Livello | Descrizione | Esempio | Response Time |
|---------|-------------|---------|---------------|
| **P1** | Critico | Data breach, root compromise | < 15 min |
| **P2** | Alto | Unauthorized SSH access | < 1 hour |
| **P3** | Medio | Anomalous export, failed logins | < 4 hours |
| **P4** | Basso | Policy violation | < 24 hours |

### 7.3 Reporting

**Tutti i dipendenti** devono segnalare security incident a:
- Email: **security@studio-romano.it**
- Telefono: **+39 XXX XXX XXXX** (TITOLARE)
- Entro: **1 ora** dalla scoperta

**No retaliation**: Nessuna punizione per segnalazioni in buona fede.

### 7.4 Incident Response Team

| Ruolo | Persona | Responsabilità |
|-------|---------|----------------|
| **Incident Manager** | TITOLARE | Coordinamento risposta |
| **Technical Lead** | DevOps | Analisi tecnica, remediation |
| **Communication Lead** | TITOLARE | Comunicazione clienti/autorità |
| **Legal Advisor** | Avvocato esterno | Aspetti legali, GDPR |

### 7.5 GDPR Breach Notification

**Se incident comporta data breach di dati personali**:
1. Valutazione rischio entro **24 ore**
2. Notifica Garante Privacy entro **72 ore** (se alto rischio)
3. Notifica interessati senza ritardo (se alto rischio diritti)
4. Documentazione completa incident (audit trail)

**Riferimento**: GDPR Art. 33-34

---

## 8. Data Classification & Handling Policy

### 8.1 Data Classification Levels

| Livello | Descrizione | Esempi | Handling |
|---------|-------------|--------|----------|
| **🔴 CRITICO** | Esposizione causa danno grave | Dati personali clienti, password, calcoli strutturali firmati | Encryption at rest + in transit, accesso RBAC, audit completo |
| **🟠 ALTO** | Esposizione causa danno moderato | Documenti tecnici in lavorazione, preventivi | Encryption in transit, accesso limitato |
| **🟡 MEDIO** | Esposizione causa danno minore | Comunicazioni interne, bozze documenti | Accesso autenticato |
| **🟢 PUBBLICO** | Nessun danno se esposto | Catalogo bundle pubblico | Nessuna restrizione |

### 8.2 Data Lifecycle

**Creation**:
- Classificazione al momento della creazione
- Metadata: Autore, data, classificazione

**Storage**:
- Critico: Database encrypted + backup encrypted
- Alto: Filesystem encrypted
- Medio: Filesystem standard
- Pubblico: CDN (se necessario)

**Transmission**:
- Critico/Alto: HTTPS + TLS 1.3
- Medio: HTTPS
- Pubblico: HTTP consentito

**Destruction**:
- Critico: Secure deletion (shred, LUKS rekey)
- Alto/Medio: Standard deletion
- Retention: 10 anni (obbligo fiscale) + 7 anni audit log

### 8.3 Data Minimization (GDPR)

**Raccogliere SOLO dati necessari**:
- ✅ Nome, Cognome, Email, Telefono, P.IVA (necessari per incarico)
- ❌ Data nascita, indirizzo residenza (non necessari)

**Anonimizzazione**:
- Analytics: IP address mascherato (192.168.1.XXX)
- Audit log pubblici: Username offuscato

### 8.4 Cross-Border Data Transfer

**Hetzner Germany** (EU):
- ✅ GDPR compliant (data residency EU)
- ✅ No transfer extra-EU

**Third-party services**:
- Stripe: EU servers (Irlanda) - ✅ OK
- SendGrid: US servers - ⚠️ Standard Contractual Clauses richieste
- OpenAI: US servers - ⚠️ Minimal data sharing (no PII)

---

## 9. Privacy & GDPR Compliance Policy

### 9.1 Legal Basis (GDPR Art. 6)

**Processing basis**:
- Contratto (Art. 6.1.b): Gestione incarichi tecnici
- Obbligo legale (Art. 6.1.c): Conservazione documenti fiscali 10 anni
- Legittimo interesse (Art. 6.1.f): Security monitoring, fraud prevention

### 9.2 Data Subject Rights

Clienti hanno diritto a:
- ✅ **Access** (Art. 15): Export dati personali (formato JSON)
- ✅ **Rectification** (Art. 16): Modifica dati anagrafici
- ✅ **Erasure** (Art. 17): Cancellazione account (dopo 10 anni fiscali)
- ✅ **Portability** (Art. 20): Export machine-readable
- ✅ **Object** (Art. 21): Opposizione a processing (limitato)

**Richieste**: Email privacy@studio-romano.it, risposta entro 30 giorni.

### 9.3 Privacy by Design

**Implementato**:
- Default settings: Privacy-friendly (opt-in newsletter, no tracking)
- Data minimization: Solo campi necessari
- Pseudonymization: Username invece di nome completo nei log
- Encryption: At rest + in transit

### 9.4 Data Protection Impact Assessment (DPIA)

**Quando richiesta**:
- Nuove tecnologie (AI, biometric)
- Monitoring sistematico
- Processing dati sensibili su larga scala

**Studio ERP**: DPIA non richiesta (processing limitato, no dati sensibili).

### 9.5 Third-Party Processors

**DPA (Data Processing Agreement)** firmato con:
- ✅ Hetzner (hosting)
- ✅ Stripe (payment)
- ⚠️ SendGrid (email) - Da firmare Q1 2026
- ⚠️ OpenAI (AI assistenza) - Da firmare Q1 2026

### 9.6 Cookie Policy

**Cookie usati**:
- `next-auth.session-token`: Autenticazione (strictly necessary)
- `next-auth.csrf-token`: CSRF protection (strictly necessary)

**Nessun cookie analytics/marketing** → **No cookie banner richiesto**.

---

## 10. Change Management Policy

### 10.1 Change Types

| Tipo | Descrizione | Approval | Testing | Downtime |
|------|-------------|----------|---------|----------|
| **Emergency** | Bugfix critici, security patch | CTO solo | Minimal | Consentito |
| **Standard** | Feature nuove, refactoring | CTO + review | Full test suite | Maintenance window |
| **Minor** | Typo, doc updates | Developer | Code review | Zero |

### 10.2 Change Request Process

**Standard Changes**:
1. Developer crea branch Git (`feature/nome`)
2. Sviluppo + test locali
3. Pull Request su GitHub
4. Code review (almeno 1 approval)
5. Merge su `main`
6. Deploy automatico staging (CI/CD)
7. Test staging
8. Deploy production (manual approval)

**Emergency Changes**:
1. Hotfix branch da `main`
2. Fix + minimal testing
3. Direct deploy production
4. Post-mortem entro 24h

### 10.3 Deployment Windows

**Production**:
- Preferred: **Venerdì 02:00-06:00** (weekend, low traffic)
- Emergency: Qualsiasi orario (notifica clienti)

**Rollback**:
- Automatico se healthcheck fallisce
- Manual: Restore backup database + re-deploy previous version

### 10.4 Change Documentation

**Ogni change richiede**:
- Git commit message descrittivo
- CHANGELOG.md update
- Schema migration (se DB change)
- Runbook per rollback

### 10.5 Post-Deployment Verification

**Checklist** (primi 30 minuti post-deploy):
- [ ] Healthcheck endpoint ritorna 200 OK
- [ ] Login funziona
- [ ] API create incarico funziona
- [ ] Upload documento funziona
- [ ] Error rate Sentry < 1%
- [ ] Response time < 500ms (p95)

---

## 11. Physical & Environmental Security Policy

### 11.1 Datacenter Security (Hetzner)

**Physical Access**:
- Hetzner datacenter: ISO 27001 certified
- Biometric access control
- 24/7 CCTV monitoring
- Security guards

**Environmental**:
- Fire suppression system
- UPS (Uninterruptible Power Supply)
- Redundant cooling
- Flood sensors

**Responsabilità**: Hetzner (Studio Romano non ha accesso fisico)

### 11.2 Office Security (Studio Romano)

**Server on-premise**: **NESSUNO** (tutto cloud)

**Workstations**:
- Screen lock dopo 5 minuti inattività
- Full disk encryption (BitLocker/FileVault)
- Antivirus aggiornato
- Firewall attivo

**Backup Fisici**:
- Sealed envelope con LUKS passphrase
- Storage: Safe in ufficio TITOLARE
- Accesso: Solo TITOLARE

**Clean Desk Policy**:
- No documenti confidenziali lasciati su scrivania overnight
- Shred documenti stampati (no cestino)
- Lock computer quando si esce

### 11.3 Laptop Security

**Theft Prevention**:
- Kensington lock (se lavoro in co-working)
- Never leave unattended in public

**Lost/Stolen Procedure**:
1. Notificare TITOLARE immediatamente
2. Remote wipe (se possibile)
3. Cambio password tutti gli account
4. Revoca SSH keys
5. Monitor audit log per accessi anomali

---

## 12. Third-Party Security Policy

### 12.1 Vendor Risk Assessment

**Before contracting**:
- [ ] Verificare certificazioni (ISO 27001, SOC 2)
- [ ] Leggere privacy policy (GDPR compliance)
- [ ] Verificare data residency (EU preferito)
- [ ] Verificare SLA uptime
- [ ] Leggere incident response policy

### 12.2 Approved Vendors

| Vendor | Service | Certification | DPA Signed | Risk Level |
|--------|---------|---------------|------------|------------|
| **Hetzner** | Cloud Hosting | ISO 27001 | ✅ | Basso |
| **Stripe** | Payment Processing | PCI DSS Level 1 | ✅ | Basso |
| **Upstash** | Redis (rate limiting) | SOC 2 | ✅ | Basso |
| **SendGrid** | Email Delivery | SOC 2 | ⚠️ Q1 2026 | Medio |
| **OpenAI** | AI Assistenza | SOC 2 | ⚠️ Q1 2026 | Medio |
| **Sentry** | Error Tracking | SOC 2 | ✅ | Basso |
| **GitHub** | Code Hosting | SOC 2 | ✅ | Basso |

### 12.3 Data Sharing with Third Parties

**Minimization**:
- Stripe: Solo dati necessari per pagamento (nome, email, importo)
- SendGrid: Solo email destinatario + corpo email
- OpenAI: **NESSUN dato cliente** (solo template messages, no PII)
- Sentry: Error stack traces (sanitizzati, no password/token)

**Encryption**:
- Tutti i trasferimenti su HTTPS/TLS 1.3

### 12.4 Vendor Monitoring

**Quarterly Review** (trimestrale):
- Verificare uptime SLA rispettato
- Leggere incident report pubblici
- Verificare certificazioni non scadute
- Review costi (cerca alternative se troppo costoso)

**Alert automatici**:
- Vendor status page (UptimeRobot monitoring)
- Email notifiche incident

---

## 📋 Compliance Mapping

### ISO 27001:2022 Annex A Controls

| Control | Policy | Stato |
|---------|--------|-------|
| **A.5.1** | Information Security Policies | ✅ Implementato |
| **A.5.15** | Access Control Policy | ✅ Implementato |
| **A.5.18** | Access Rights | ✅ Implementato |
| **A.8.2** | Privileged Access | ✅ Implementato |
| **A.8.3** | Information Access Restriction | ✅ Implementato |
| **A.8.13** | Backup Policy | ✅ Implementato |
| **A.8.24** | Cryptography Policy | ✅ Implementato |
| **A.8.28** | Secure Coding | ⚠️ Q2 2026 |

---

## ✅ Action Items Q1 2026

1. **Password Policy**: Implementare complessità minima 12 caratteri
2. **SSH 2FA**: Google Authenticator obbligatorio
3. **Backup Alerts**: Implementare alert backup failure (RISK-08)
4. **DPA Signatures**: Firmare DPA con SendGrid e OpenAI
5. **SSL Testing**: Test SSL Labs (target A+)
6. **Access Review**: Primo review trimestrale (2026-01-01)

---

## 📅 Policy Review History

| Versione | Data | Modifiche | Approvato da |
|----------|------|-----------|--------------|
| 1.0 | 2025-12-27 | Initial release | CTO |

---

## 🔐 Approval

**Approvals**:
- [ ] CTO - Chief Technology Officer: _________________ Data: _______
- [ ] GDPR DPO - Data Protection Officer: _________________ Data: _______
- [ ] Business Owner - TITOLARE: _________________ Data: _______

**Dichiarazione**: I sottoscritti approvano queste politiche di sicurezza e si impegnano a rispettarle.

---

## 📚 Related Documents

- `/docs/ISO_27001_RISK_ASSESSMENT.md`
- `/docs/ISO_27001_ACCESS_CONTROL_MATRIX.md`
- `/docs/ISO_27001_INCIDENT_RESPONSE.md` (da creare)
- `/docs/DEPLOYMENT_HETZNER_MINIMAL.md`

---

**Document Control**:
- **Classification**: CONFIDENTIAL - Internal Use Only
- **Storage**: `/docs/ISO_27001_SECURITY_POLICIES.md`
- **Distribution**: Tutti i dipendenti (firma ricevuta richiesta)
- **Access**: Tutti i dipendenti (read-only)

**End of Document**
