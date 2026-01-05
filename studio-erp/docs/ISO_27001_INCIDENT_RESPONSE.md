# 🚨 Incident Response Procedures ISO 27001:2022
## Studio ERP - Piattaforma Gestione Incarichi Tecnici

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: CTO - Studio Romano
**Prossima Revisione**: 2026-06-27 (semestrale)
**Stato**: APPROVED

---

## 📋 Executive Summary

Questo documento definisce le procedure di risposta agli incidenti di sicurezza per Studio ERP, conforme a ISO/IEC 27001:2022 Annex A (A.5.24 - Information security incident management planning and preparation, A.5.25 - Assessment and decision on information security events, A.5.26 - Response to information security incidents).

**Obiettivi**:
1. **Detection**: Rilevare incident entro 15 minuti (P1) o 4 ore (P2-P4)
2. **Containment**: Isolare minaccia entro 1 ora (P1) o 24 ore (P2)
3. **Eradication**: Rimuovere causa root entro 24 ore (P1) o 7 giorni (P2)
4. **Recovery**: Ripristinare operatività normale entro RTO (2-4 ore)
5. **Lessons Learned**: Post-mortem entro 7 giorni da chiusura incident

---

## 📞 Emergency Contacts

### Incident Response Team

| Ruolo | Nome | Telefono | Email | Disponibilità |
|-------|------|----------|-------|---------------|
| **Incident Manager** | TITOLARE | +39 XXX XXX XXXX | security@studio-romano.it | 24/7 |
| **Technical Lead** | DevOps Engineer | +39 YYY YYY YYYY | devops@studio-romano.it | 08:00-20:00 |
| **Communication Lead** | TITOLARE | +39 XXX XXX XXXX | info@studio-romano.it | 24/7 |
| **Legal Advisor** | Avvocato Esterno | +39 ZZZ ZZZ ZZZZ | avvocato@studio-legale.it | On-call |
| **GDPR DPO** | TITOLARE (interim) | +39 XXX XXX XXXX | privacy@studio-romano.it | 24/7 |

### External Contacts

| Servizio | Contatto | Note |
|----------|----------|------|
| **Garante Privacy** | garante@gpdp.it, +39 06 696771 | GDPR breach notification (72h) |
| **Polizia Postale** | 848-782.065 | Cybercrime (hacking, data breach) |
| **Hetzner Support** | support@hetzner.com | Infrastructure emergencies |
| **Cloudflare Support** | support@cloudflare.com | DDoS mitigation |
| **CERT Nazionale** | cert@cert-nazionale.it | Critical infrastructure incidents |

---

## 🎯 Incident Classification

### Incident Categories

| Categoria | Descrizione | Esempi |
|-----------|-------------|--------|
| **INC-01** | Unauthorized Access | Accesso non autorizzato a database, SSH compromise, session hijacking |
| **INC-02** | Malware/Ransomware | Virus, cryptolocker, trojan, rootkit |
| **INC-03** | Data Breach | Esposizione dati clienti, leak database, GDPR violation |
| **INC-04** | Denial of Service | DDoS attack, resource exhaustion, application crash |
| **INC-05** | Insider Threat | Data exfiltration dipendente, sabotaggio, privilege abuse |
| **INC-06** | Physical Security | Furto laptop, accesso fisico server, disaster naturale |
| **INC-07** | Third-Party Compromise | Vendor breach (Stripe, Hetzner), supply chain attack |
| **INC-08** | Configuration Error | Misconfiguration firewall, accidental data deletion, wrong deployment |

### Severity Levels

| Livello | Criteri | Impatto | Response Time | Escalation |
|---------|---------|---------|---------------|------------|
| **P1 - CRITICO** | • Data breach > 100 clienti<br>• Root/database compromise<br>• Ransomware encryption<br>• Servizio offline > 4h | • Perdita dati massiva<br>• Danno reputazione<br>• Sanzioni GDPR<br>• Business interruption | **< 15 minuti** | Immediate (TITOLARE + DevOps) |
| **P2 - ALTO** | • Data breach < 100 clienti<br>• Unauthorized SSH access<br>• Malware rilevato (non eseguito)<br>• Servizio degradato > 2h | • Perdita dati limitata<br>• Accesso non autorizzato<br>• Downtime parziale | **< 1 ora** | Entro 1h (Incident Manager) |
| **P3 - MEDIO** | • Anomalous data export<br>• Failed login spikes<br>• Performance degradation<br>• Security scan detected | • Potenziale compromissione<br>• Nessun danno immediato<br>• Servizio funzionante | **< 4 ore** | Business hours |
| **P4 - BASSO** | • Policy violation<br>• Weak password detected<br>• Outdated software | • Nessun danno<br>• Rischio futuro | **< 24 ore** | Next business day |

---

## 🔄 Incident Response Lifecycle

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  1. DETECTION    →    2. TRIAGE    →    3. CONTAINMENT  │
│       ↓                                              │
│  6. LESSONS   ←   5. RECOVERY   ←   4. ERADICATION  │
│     LEARNED                                          │
└──────────────────────────────────────────────────────┘
```

---

## 1️⃣ DETECTION (Rilevazione)

### 1.1 Automated Detection Sources

| Fonte | Cosa Monitora | Alert Trigger | Tool |
|-------|---------------|---------------|------|
| **Application Logs** | Error rate, exceptions | > 10 errori/min | Sentry |
| **Audit Log** | Failed logins, privilege escalation | 3 failed attempts | Custom middleware |
| **System Logs** | SSH attempts, sudo commands | Failed SSH login | auditd + fail2ban |
| **Database** | Slow queries, connection spikes | > 50 connections | pgBadger |
| **Network** | Traffic anomalies, port scans | Unusual traffic patterns | UFW logs |
| **Backup** | Backup failures, age monitoring | Backup > 48h old | Healthcheck script |
| **Uptime** | Service availability | HTTP 5xx errors | UptimeRobot |
| **SSL/TLS** | Certificate expiration | < 7 days to expiry | SSL Labs |

### 1.2 Manual Detection

**Utenti devono segnalare**:
- Email sospette (phishing)
- Comportamento anomalo applicazione
- Accesso non autorizzato a dati
- Dispositivo smarrito/rubato
- Sospetta violazione password

**Canali di segnalazione**:
- **Email**: security@studio-romano.it
- **Telefono**: +39 XXX XXX XXXX (TITOLARE)
- **In persona**: Ufficio TITOLARE

**SLA**: Segnalazione entro **1 ora** dalla scoperta

### 1.3 Detection Metrics

**Target**:
- **MTTD** (Mean Time To Detect): < 15 minuti (P1), < 4 ore (P2-P4)
- **False Positive Rate**: < 5% (alert genuini)
- **Alert Fatigue**: < 20 alert/giorno

---

## 2️⃣ TRIAGE (Valutazione)

### 2.1 Initial Assessment (5 minuti)

**Incident Manager esegue valutazione rapida**:

1. **Verify Alert**: È un vero incident o false positive?
   - Check correlazione con altri alert
   - Verify logs applicativi + sistema
   - Confermare con utente coinvolto (se applicabile)

2. **Assess Severity**: P1, P2, P3, o P4?
   - Numero utenti impattati
   - Tipo di dati coinvolti (CRITICO, ALTO, MEDIO)
   - Downtime corrente/previsto
   - Potenziale escalation

3. **Determine Category**: INC-01 a INC-08

4. **Assign Incident ID**: `INC-YYYYMMDD-NNN` (es. `INC-20251227-001`)

### 2.2 Triage Decision Matrix

| Domanda | Se SÌ → | Se NO → |
|---------|---------|---------|
| Dati personali esposti? | **P1-P2** (GDPR breach) | Continua valutazione |
| Servizio offline > 4h? | **P1** | Continua valutazione |
| Root/database compromesso? | **P1** | Continua valutazione |
| Accesso non autorizzato confermato? | **P2** | Continua valutazione |
| Solo potenziale minaccia? | **P3** | Continua valutazione |
| Solo policy violation? | **P4** | Continua valutazione |

### 2.3 Incident Documentation (Immediate)

**Creare Incident Report** (template `/docs/templates/INCIDENT_REPORT.md`):

```markdown
# Incident Report INC-YYYYMMDD-NNN

## Initial Detection
- **Data/Ora**: 2025-12-27 14:32:15 UTC
- **Rilevato da**: UptimeRobot (service down alert)
- **Categoria**: INC-04 (Denial of Service)
- **Severity**: P1 - CRITICO

## Initial Assessment
- **Impatto**: Servizio completamente offline
- **Utenti impattati**: Tutti (100%)
- **Dati compromessi**: Nessuno (al momento)
- **Downtime**: 15 minuti (ongoing)

## Timeline
- 14:32 - Alert UptimeRobot (HTTP 503)
- 14:33 - Incident Manager notificato
- 14:35 - DevOps inizia investigazione
- ...

## Actions Taken
- [ ] Containment
- [ ] Eradication
- [ ] Recovery
- [ ] Post-mortem
```

---

## 3️⃣ CONTAINMENT (Contenimento)

### 3.1 Immediate Containment (Short-term)

**Obiettivo**: **Fermare propagazione danno entro 1 ora (P1) o 24 ore (P2)**

#### INC-01: Unauthorized Access

**Se SSH compromesso**:
1. Identificare IP attaccante: `grep "Failed password" /var/log/auth.log`
2. Ban IP immediato: `ufw deny from <IP>`
3. Rimuovere SSH key compromessa: `rm /home/user/.ssh/authorized_keys`
4. Cambio password tutti gli account
5. Kill sessioni attive: `pkill -9 -u <username>`
6. Audit comandi eseguiti: `ausearch -ui <uid> -ts recent`

**Se account applicazione compromesso**:
1. Disabilitare account: `UPDATE users SET enabled = false WHERE id = X`
2. Invalidare sessioni: `DELETE FROM sessions WHERE user_id = X`
3. Reset password utente
4. Audit azioni recenti: `SELECT * FROM audit_log WHERE user_id = X ORDER BY timestamp DESC`
5. Verificare data export: `SELECT * FROM documenti WHERE downloaded_at > NOW() - INTERVAL '1 hour'`

#### INC-02: Malware/Ransomware

1. **ISOLA SERVER IMMEDIATAMENTE**: `ufw default deny incoming && ufw default deny outgoing`
2. Identifica processo malevolo: `ps aux | grep <suspicious>`
3. Kill processo: `kill -9 <PID>`
4. Snapshot server corrente (evidence preservation)
5. Scan completo: `clamscan -r /var/www /var/lib/postgresql`
6. Non pagare ransomware (policy aziendale)
7. Restore da backup (se encryption in corso)

#### INC-03: Data Breach

1. **BLOCCA ACCESSO DATI** immediatamente
2. Identifica vettore breach: SQL injection? Accesso non autorizzato? Misconfiguration?
3. Patch vulnerabilità se nota
4. Snapshot database (evidence)
5. Identifica dati esposti: `SELECT * FROM <table> WHERE <condition>`
6. Conta utenti impattati
7. Notifica Incident Manager per valutazione GDPR (72h deadline)

#### INC-04: Denial of Service

**Se DDoS**:
1. Abilita Cloudflare "I'm Under Attack" mode (se configurato)
2. Ban IP top offenders: `tail -10000 /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10`
3. Rate limiting aggressivo: Reduce limits temporaneamente
4. Contact Hetzner support (DDoS mitigation service)

**Se resource exhaustion**:
1. Identifica processo: `top`, `htop`
2. Kill processo se malevolo: `kill -9 <PID>`
3. Restart servizi: `systemctl restart postgresql`, `pm2 restart all`
4. Scale verticalmente (se CPU/RAM saturo): Upgrade server temporaneo

#### INC-05: Insider Threat

1. Disabilita account dipendente immediatamente
2. Revoca SSH keys
3. Audit azioni ultime 48h: `SELECT * FROM audit_log WHERE user_id = X`
4. Identifica dati esportati: `SELECT * FROM documenti WHERE downloaded_by = X`
5. Notifica legal advisor (possibile azione legale)
6. Preserva evidence (no delete logs)

#### INC-06: Physical Security (Laptop rubato)

1. Remote wipe se possibile (Find My Mac, Windows Remote Wipe)
2. Cambio password tutti gli account usati da laptop
3. Revoca SSH keys del laptop
4. Invalidare sessioni browser: `DELETE FROM sessions WHERE user_id = X`
5. Monitor audit log per accessi anomali
6. Denuncia furto (Polizia)

#### INC-07: Third-Party Compromise

**Se Stripe compromesso**:
1. Rotate API keys immediatamente (Stripe Dashboard)
2. Verify transazioni recenti (ultimi 7 giorni)
3. Monitor chargeback anomali
4. Notifica clienti se dati pagamento esposti

**Se Hetzner compromesso**:
1. Cambio password Hetzner console
2. Review firewall rules (verificare modifiche non autorizzate)
3. Audit snapshots (eliminare snapshot sospetti)
4. Verify server integrity: `debsums -c` (Debian package checksum)

#### INC-08: Configuration Error

1. Identifica configurazione errata (diff con versione precedente)
2. Rollback configurazione: `git checkout <previous-commit>`
3. Restart servizi impattati
4. Verify servizio ripristinato

### 3.2 Evidence Preservation

**CRITICAL**: Preservare evidence per analisi forense e potenziali azioni legali

**Cosa preservare**:
- Snapshot server completo (Hetzner snapshot)
- Database dump: `pg_dump studio_erp > /tmp/evidence-$(date +%Y%m%d-%H%M%S).sql`
- Audit log completo: `cp /var/log/studio-erp/audit.log /evidence/`
- System logs: `cp /var/log/auth.log /var/log/syslog /evidence/`
- Network traffic (se packet capture abilitato)
- Screenshots errori/anomalie

**Chain of custody**:
- Hash SHA-256 di tutti i file evidence
- Timestamp e firma digitale
- Storage: Encrypted USB key in safe (no online storage)
- Accesso: Solo Incident Manager + Legal Advisor

---

## 4️⃣ ERADICATION (Eliminazione Causa Root)

### 4.1 Root Cause Analysis

**Metodo 5 Whys**:

Esempio (SQL Injection):
1. **Why** dati esposti? → SQL injection exploit
2. **Why** SQL injection possibile? → Input non sanitizzato
3. **Why** input non sanitizzato? → Mancava Zod validation su endpoint
4. **Why** mancava validation? → Developer oversight
5. **Why** oversight non rilevato? → Code review non completo

**Root Cause**: Processo code review insufficiente

### 4.2 Eradication Actions

#### INC-01: Unauthorized Access
- [ ] Patch vulnerabilità (se applicabile)
- [ ] Harden SSH config (cambio porta, 2FA)
- [ ] Implementa fail2ban se non presente
- [ ] Rotate tutti i secrets (SSH keys, passwords, API keys)
- [ ] Update firewall rules (whitelist IP se possibile)

#### INC-02: Malware/Ransomware
- [ ] Remove malware completamente (verified ClamAV scan)
- [ ] Patch vulnerabilità exploit (kernel update, application patch)
- [ ] Rebuild server da clean snapshot (se compromissione profonda)
- [ ] Restore dati da backup (verify backup integrity)
- [ ] Implement antivirus real-time scanning

#### INC-03: Data Breach
- [ ] Patch vulnerabilità SQL injection / XSS / IDOR
- [ ] Add input validation (Zod schemas)
- [ ] Penetration testing endpoint impattato
- [ ] Deploy fix a produzione
- [ ] Verify fix con security test

#### INC-04: Denial of Service
- [ ] Implement Cloudflare WAF (se non presente)
- [ ] Tune rate limiting (lower thresholds)
- [ ] Optimize slow queries database
- [ ] Scale infrastructure se resource exhaustion legittimo

#### INC-05: Insider Threat
- [ ] Termina dipendente (HR process)
- [ ] Implement export rate limiting (max 10/giorno)
- [ ] Add alerting su export anomali
- [ ] DLP (Data Loss Prevention) su email

#### INC-06: Physical Security
- [ ] Replace laptop
- [ ] Enforce full disk encryption policy
- [ ] Implement MDM (Mobile Device Management)

#### INC-07: Third-Party Compromise
- [ ] Rotate API keys
- [ ] Review vendor security posture
- [ ] Consider alternative vendor (se breach grave)

#### INC-08: Configuration Error
- [ ] Fix configurazione
- [ ] Add validation pre-deployment (CI/CD)
- [ ] Implement Infrastructure as Code (Ansible)
- [ ] Peer review configurazioni critiche

---

## 5️⃣ RECOVERY (Ripristino)

### 5.1 Service Restoration

**Obiettivo**: RTO (Recovery Time Objective)
- Database: **2 ore**
- Applicazione: **30 minuti**
- Server completo: **4 ore**

#### Database Recovery

```bash
# 1. Stop applicazione (prevent writes during restore)
pm2 stop all

# 2. Backup database corrente (just in case)
pg_dump studio_erp > /tmp/pre-restore-backup.sql

# 3. Drop database
dropdb studio_erp

# 4. Restore da backup
createdb studio_erp
pg_restore -d studio_erp /var/backups/pgbackrest/latest.dump

# 5. Verify integrity
psql studio_erp -c "SELECT COUNT(*) FROM incarichi;"
psql studio_erp -c "SELECT COUNT(*) FROM users;"

# 6. Restart applicazione
pm2 start all

# 7. Healthcheck
curl https://studio-erp.it/api/health
```

#### Application Recovery

```bash
# 1. Checkout working version
cd /var/www/studio-erp
git fetch origin
git checkout <working-commit-hash>

# 2. Install dependencies (if needed)
npm ci --production

# 3. Build application
npm run build

# 4. Restart PM2
pm2 restart all

# 5. Verify
pm2 status
curl https://studio-erp.it/api/health
```

#### Full Server Recovery (Disaster)

```bash
# 1. Create new server (Hetzner console)
# - Same specs (CX41)
# - Ubuntu 22.04 LTS

# 2. Restore da snapshot (preferred)
# - Hetzner console: Restore snapshot
# - Boot server
# - Verify SSH access

# 3. OR Manual rebuild con Ansible (if no snapshot)
ansible-playbook -i production deploy-full.yml

# 4. Restore database da Storage Box
scp backup@storage-box:/backups/latest.dump /tmp/
pg_restore -d studio_erp /tmp/latest.dump

# 5. Restore documenti
rsync -avz backup@storage-box:/backups/documents/ /var/uploads/

# 6. Verify tutti i servizi
systemctl status postgresql nginx
pm2 status
```

### 5.2 Verification Checklist

**Prima di dichiarare "recovery completo"**:

- [ ] Healthcheck endpoint ritorna 200 OK
- [ ] Login funziona (test 3 utenti: TITOLARE, COLLABORATORE, CLIENTE)
- [ ] CRUD incarichi funziona
- [ ] Upload documenti funziona (test ClamAV)
- [ ] Download documenti funziona
- [ ] Invio messaggi funziona
- [ ] Stripe checkout funziona (test mode)
- [ ] Email notifications funzionano (SendGrid)
- [ ] Audit log scrive correttamente
- [ ] Backup automatici ripristinati (cron running)
- [ ] Monitoring alerts attivi (UptimeRobot, Sentry)
- [ ] SSL certificate valido (SSL Labs A+)
- [ ] Performance normale (response time < 500ms p95)
- [ ] Error rate < 1% (Sentry)

### 5.3 Communication Plan

#### Internal Communication

**Durante incident (P1)**:
- Status update ogni 30 minuti a Incident Manager
- Slack/email: "#incident-response" channel
- Evitare distrazioni team (focus on resolution)

**Post-recovery**:
- Email a tutti i dipendenti: "All clear" notification
- Breve summary (cosa è successo, risolto, nessun dato perso)

#### External Communication (Clienti)

**Se downtime > 2 ore O data breach**:

**Email Template**:
```
Oggetto: [RISOLTO] Interruzione temporanea servizio Studio ERP

Gentile Cliente,

Le comunichiamo che tra le ore 14:30 e le 16:45 di oggi, 27 dicembre 2025,
la piattaforma Studio ERP ha subito un'interruzione temporanea del servizio.

Il problema è stato RISOLTO e il servizio è completamente ripristinato.

COSA È SUCCESSO:
- Attacco DDoS al server ha causato temporanea indisponibilità
- Nessun dato è stato compromesso o perso
- Tutti i backup sono integri

AZIONI INTRAPRESE:
- Implementato Cloudflare DDoS protection
- Rafforzato rate limiting
- Monitoraggio 24/7 attivato

I Suoi dati sono al sicuro e può continuare a utilizzare la piattaforma normalmente.

Per qualsiasi domanda: supporto@studio-romano.it

Cordiali saluti,
Studio Romano - Team Tecnico
```

#### GDPR Breach Notification

**Se data breach confermato**:

**Entro 72 ore** da discovery:

1. **Notifica Garante Privacy** (garante@gpdp.it):
   - Natura del breach
   - Categorie dati interessati
   - Numero approssimativo interessati
   - Conseguenze probabili
   - Misure adottate/proposte

2. **Notifica interessati** (email):
   - Se "alto rischio" per diritti e libertà
   - Linguaggio chiaro e semplice
   - Raccomandazioni azioni protettive

**Template notification**: `/docs/templates/GDPR_BREACH_NOTIFICATION.md`

---

## 6️⃣ LESSONS LEARNED (Post-Mortem)

### 6.1 Post-Mortem Meeting

**Timing**: Entro **7 giorni** da chiusura incident

**Partecipanti**:
- Incident Manager (facilitator)
- Technical Lead
- Tutti i responders coinvolti
- Business Owner (se P1-P2)

**Durata**: 1-2 ore

**Agenda**:
1. Incident timeline review (30 min)
2. What went well (15 min)
3. What went wrong (30 min)
4. Action items (30 min)
5. Documentation update (15 min)

### 6.2 Post-Mortem Template

```markdown
# Post-Mortem: INC-20251227-001

## Incident Summary
- **Severity**: P1 - CRITICO
- **Category**: INC-04 (DDoS)
- **Duration**: 2h 15min (14:30 - 16:45)
- **Impatto**: 100% utenti, servizio offline
- **Dati compromessi**: Nessuno

## Timeline
| Ora | Evento |
|-----|--------|
| 14:30 | DDoS attack inizia (50K req/min) |
| 14:32 | UptimeRobot alert |
| 14:33 | Incident Manager notificato |
| 14:35 | DevOps inizia investigazione |
| 14:40 | Root cause identificato (DDoS) |
| 14:45 | Containment: UFW ban top 10 IP |
| 15:00 | Cloudflare abilitato |
| 15:30 | Traffico normalizzato |
| 16:00 | Servizio stabile |
| 16:45 | Incident chiuso |

## Root Cause
Assenza di Web Application Firewall (WAF) ha permesso DDoS attack di saturare server.

## What Went Well ✅
- Detection rapida (2 minuti)
- Incident Manager disponibile immediatamente
- Backup integri (no data loss)
- Recovery entro RTO (4h)

## What Went Wrong ❌
- Nessun WAF configurato (vulnerability nota)
- Cloudflare non pre-configurato (perso 30min setup)
- Rate limiting insufficiente (100 req/min troppo alto)
- Nessun DDoS mitigation plan

## Action Items
- [ ] **P0** (entro 24h): Configurare Cloudflare WAF - Owner: DevOps
- [ ] **P1** (entro 7 giorni): Implementare rate limiting aggressivo (10 req/min) - Owner: DevOps
- [ ] **P2** (entro 30 giorni): DDoS runbook documentato - Owner: CTO
- [ ] **P3** (Q1 2026): Penetration testing DDoS resilience - Owner: CTO

## Metrics
- **MTTD** (Mean Time To Detect): 2 minuti ✅ (target < 15min)
- **MTTR** (Mean Time To Resolve): 2h 15min ✅ (target < 4h)
- **Downtime**: 2h 15min (135 minuti)
- **Data Loss**: 0 bytes ✅

## Documentation Updates
- Aggiornare runbook DDoS response
- Aggiungere Cloudflare a deployment checklist
- Update monitoring thresholds (req/min)
```

### 6.3 Continuous Improvement

**Quarterly Review** (trimestrale):
- Review tutti gli incident (P1-P4)
- Identify patterns (tipo più frequente?)
- Update playbooks basato su lessons learned
- Security training per team (based on real incidents)

**Annual Report**:
- Total incidents: N
- MTTR medio: X ore
- Top 3 incident categories
- Investimenti security (budget vs. ROI)

---

## 📊 Incident Metrics & KPIs

### 7.1 Response Metrics

| Metrica | Target | Measurement |
|---------|--------|-------------|
| **MTTD** (Mean Time To Detect) | < 15 min (P1) | Alert timestamp - Incident timestamp |
| **MTTR** (Mean Time To Respond) | < 1 hour (P1) | First action - Alert timestamp |
| **MTTR** (Mean Time To Resolve) | < 4 hours (P1) | Incident closed - Incident opened |
| **MTTRC** (Mean Time To Recovery) | < 2 hours | Service restored - Incident started |
| **False Positive Rate** | < 5% | False alerts / Total alerts |

### 7.2 Incident Dashboard (Monthly)

```
┌─────────────────────────────────────────────┐
│  INCIDENT SUMMARY - Dicembre 2025           │
├─────────────────────────────────────────────┤
│  Total Incidents:        4                  │
│  - P1 (Critico):         0                  │
│  - P2 (Alto):            1                  │
│  - P3 (Medio):           2                  │
│  - P4 (Basso):           1                  │
│                                             │
│  MTTR:                   2.5 ore            │
│  Total Downtime:         45 minuti          │
│  Data Breaches:          0                  │
│  GDPR Notifications:     0                  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Incident Playbooks (Quick Reference)

### Playbook 1: Data Breach Response (INC-03)

**Time: T+0** (Discovery)
- [ ] Stop data exfiltration (block IP, disable account)
- [ ] Preserve evidence (snapshot, logs)
- [ ] Notify Incident Manager

**Time: T+15min**
- [ ] Assess scope (how many users impacted?)
- [ ] Identify data type (PII? Financial? Technical?)
- [ ] Determine severity (P1 if > 100 users OR financial data)

**Time: T+1h**
- [ ] Patch vulnerability
- [ ] Verify no ongoing exfiltration
- [ ] Start incident report

**Time: T+24h**
- [ ] Assess GDPR notification requirement
- [ ] Prepare breach notification (Garante + interessati)
- [ ] Legal advisor consulted

**Time: T+72h**
- [ ] Submit GDPR notification (if required)
- [ ] Email impacted users
- [ ] Post-mortem scheduled

### Playbook 2: Ransomware Response (INC-02)

**Time: T+0** (Detection)
- [ ] **ISOLATE SERVER** (disconnect network)
- [ ] Do NOT pay ransom (policy)
- [ ] Notify Incident Manager

**Time: T+5min**
- [ ] Identify encryption extent (which files?)
- [ ] Kill malicious process
- [ ] Snapshot server (evidence)

**Time: T+30min**
- [ ] Verify backup integrity
- [ ] Prepare clean server for restore
- [ ] Notify law enforcement (Polizia Postale)

**Time: T+2h**
- [ ] Restore da backup last clean backup
- [ ] Scan for malware (ClamAV)
- [ ] Harden server (patch vulnerability)

**Time: T+4h**
- [ ] Service restored
- [ ] Post-incident malware scan
- [ ] Monitor for re-infection

### Playbook 3: DDoS Response (INC-04)

**Time: T+0** (Detection)
- [ ] Verify DDoS (check traffic patterns)
- [ ] Notify Incident Manager

**Time: T+5min**
- [ ] Enable Cloudflare "Under Attack" mode
- [ ] Ban top offender IPs (temporary)

**Time: T+15min**
- [ ] Contact Hetzner DDoS support
- [ ] Reduce rate limiting thresholds

**Time: T+30min**
- [ ] Monitor traffic normalization
- [ ] Scale resources if needed

**Time: T+1h**
- [ ] Fine-tune WAF rules
- [ ] Document attack pattern
- [ ] Post-mortem planning

---

## 🧪 Incident Response Drills

### 8.1 Tabletop Exercises

**Frequency**: Semestrale (Giugno, Dicembre)

**Scenario Examples**:
1. **Data Breach**: SQL injection espone 500 clienti
2. **Ransomware**: CryptoLocker cripta database
3. **Insider Threat**: Collaboratore scarica 1000 documenti
4. **DDoS**: Attacco 100K req/min per 4 ore
5. **Third-Party**: Stripe breach espone payment methods

**Format**:
- 2 ore sessione
- Scenario presentato
- Team esegue response (simulato)
- Facilitator pone domande
- Debrief (30 min)

**Metrics**:
- Response time decisions
- Completezza azioni
- Communication effectiveness
- Gaps identificati

### 8.2 Technical Drills

**Quarterly** (trimestrale):
- Backup restore test (complete database restore)
- Failover test (simulate server crash)
- Incident tools test (verify access a Hetzner console, Storage Box, etc.)

---

## ✅ Compliance Checklist

### ISO 27001:2022 Annex A

- [x] **A.5.24**: Incident management planning - Documentato
- [x] **A.5.25**: Assessment of information security events - Severity matrix definita
- [x] **A.5.26**: Response to incidents - Playbooks documentati
- [x] **A.5.27**: Learning from incidents - Post-mortem process
- [x] **A.5.28**: Collection of evidence - Evidence preservation procedure

### GDPR (EU 2016/679)

- [x] **Art. 33**: Notification to supervisory authority (72h) - Procedura definita
- [x] **Art. 34**: Communication to data subjects - Template preparato
- [x] **Art. 32**: Security of processing - Incident response parte di security measures

---

## 📋 Action Items Q1 2026

1. **Backup Monitoring** (PRIORITÀ MASSIMA): Implementare alert backup failure
2. **DDoS Protection**: Configurare Cloudflare WAF
3. **Incident Tools**: Setup secure communication (Signal/Telegram per emergencies)
4. **Tabletop Exercise**: Prima simulazione incident (scenario data breach)
5. **GDPR Templates**: Finalizzare templates breach notification

---

## 📅 Document Control

**Approvals**:
- [ ] CTO - Chief Technology Officer: _________________ Data: _______
- [ ] Incident Manager - TITOLARE: _________________ Data: _______

**Versioning**:
| Versione | Data | Modifiche | Autore |
|----------|------|-----------|--------|
| 1.0 | 2025-12-27 | Initial release | CTO |

---

**Document Classification**: CONFIDENTIAL - Internal Use Only
**Storage**: `/docs/ISO_27001_INCIDENT_RESPONSE.md`
**Access**: Incident Response Team only

**End of Document**
