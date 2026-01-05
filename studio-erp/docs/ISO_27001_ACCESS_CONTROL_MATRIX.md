# 🔐 Access Control Matrix ISO 27001:2022
## Studio ERP - Piattaforma Gestione Incarichi Tecnici

**Versione**: 1.0
**Data**: 2025-12-27
**Responsabile**: CTO - Studio Romano
**Prossima Revisione**: 2026-06-27 (semestrale)
**Stato**: APPROVED
**Configurazione**: SMALL (CX41 single server)

---

## 📋 Executive Summary

Questo documento definisce la matrice di controllo degli accessi per Studio ERP, conforme a ISO/IEC 27001:2022 Annex A (A.5.15 - Access Control, A.5.18 - Access Rights, A.8.2 - Privileged Access Rights).

**Principi Fondamentali**:
- **Least Privilege**: Accesso minimo necessario per svolgere mansioni
- **Need-to-Know**: Accesso ai soli dati necessari
- **Separation of Duties**: Segregazione ruoli critici
- **Accountability**: Ogni azione tracciata e auditabile

**Ambito**:
- Application Layer (Next.js + RBAC)
- Database Layer (PostgreSQL RLS)
- System Layer (Linux server permissions)
- Infrastructure Layer (Hetzner console, SSH)

---

## 👥 User Roles Hierarchy

```
┌─────────────────────────────────────────────┐
│                                             │
│          🔴 TITOLARE (Owner)                │
│          Full System Control                │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│      🟠 COLLABORATORE (Collaborator)        │
│      Assigned Incarichi + Documents         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│          🟢 CLIENTE (Client)                │
│          Own Incarichi Read-Only            │
│                                             │
└─────────────────────────────────────────────┘
```

### Role Definitions

| Ruolo | Quantità | Descrizione | Provisioning | De-provisioning |
|-------|----------|-------------|--------------|-----------------|
| **TITOLARE** | 1 | Proprietario studio, full admin | Manual (seed database) | N/A (cannot be removed) |
| **COLLABORATORE** | 1-10 | Ingegnere/architetto dipendente | Creato da TITOLARE via UI | Soft delete (account disabilitato) |
| **CLIENTE** | 0-100 | Cliente finale committente | Self-registration + admin approval | Soft delete (GDPR compliant) |

---

## 🎯 Access Control Matrix - Application Layer

### TITOLARE (Owner - Full Admin)

| Risorsa | Lettura | Scrittura | Modifica | Cancellazione | Note |
|---------|---------|-----------|----------|---------------|------|
| **Incarichi** | ✅ Tutti | ✅ Crea | ✅ Tutti | ✅ Tutti | Accesso illimitato |
| **Documenti** | ✅ Tutti | ✅ Upload | ✅ Metadata | ✅ Tutti | Include documenti altri incarichi |
| **Messaggi** | ✅ Tutti | ✅ Invia | ✅ Propri | ✅ Propri | Può leggere tutti i messaggi (audit) |
| **Utenti** | ✅ Tutti | ✅ Crea collaboratori/clienti | ✅ Tutti | ✅ Soft delete | CRUD completo utenti |
| **Bundle** | ✅ Tutti | ✅ Crea | ✅ Tutti | ✅ Tutti | Gestione catalogo servizi |
| **Milestone** | ✅ Tutte | ✅ Crea | ✅ Tutte | ✅ Tutte | Gestione SAL |
| **Audit Log** | ✅ Tutti | ❌ | ❌ | ❌ | Sola lettura (compliance) |
| **Report Analytics** | ✅ Tutti | ❌ | ❌ | ❌ | Dashboard business intelligence |
| **Configurazione Sistema** | ✅ | ✅ | ✅ | ✅ | Settings applicazione |

**Limitazioni**:
- ❌ Non può modificare username dopo creazione (DB constraint)
- ❌ Non può eliminare bundle con incarichi attivi (CASCADE RESTRICT)
- ❌ Non può eliminare audit log (append-only table)

**Audit Log**: Tutte le azioni TITOLARE sono loggates con livello `ACTION`

---

### COLLABORATORE (Collaborator - Limited Access)

| Risorsa | Lettura | Scrittura | Modifica | Cancellazione | Note |
|---------|---------|-----------|----------|---------------|------|
| **Incarichi Assegnati** | ✅ | ✅ Documenti/Note | ✅ Stato/Note | ❌ | Solo incarichi dove `responsabile_id = user.id` |
| **Incarichi Non Assegnati** | ❌ | ❌ | ❌ | ❌ | **Row-Level Security** |
| **Documenti Incarichi Propri** | ✅ | ✅ Upload | ✅ Metadata | ❌ | Solo documenti incarichi assegnati |
| **Documenti Altri Incarichi** | ❌ | ❌ | ❌ | ❌ | **Privacy compliance** |
| **Messaggi Incarichi Propri** | ✅ | ✅ Invia | ✅ Propri | ✅ Propri (24h) | Comunicazione con cliente |
| **Messaggi Altri Incarichi** | ❌ | ❌ | ❌ | ❌ | **Row-Level Security** |
| **Clienti** | ✅ Lista | ❌ | ❌ | ❌ | Solo per associazione incarichi |
| **Bundle** | ✅ Catalogo | ❌ | ❌ | ❌ | Sola lettura catalogo |
| **Milestone Incarichi Propri** | ✅ | ❌ | ✅ Aggiorna stato | ❌ | Solo cambio stato (PENDING→IN_PROGRESS→COMPLETATA) |
| **Utenti** | ❌ | ❌ | ✅ Profilo proprio | ❌ | Solo self-service profilo |
| **Audit Log** | ✅ Propri | ❌ | ❌ | ❌ | Solo log azioni proprie |
| **Report Analytics** | ✅ Incarichi propri | ❌ | ❌ | ❌ | Dashboard limitata |

**Limitazioni**:
- ❌ Non può creare nuovi incarichi (solo TITOLARE)
- ❌ Non può modificare importo totale incarico
- ❌ Non può riassegnare incarichi ad altri collaboratori
- ❌ Non può vedere dati finanziari aggregati
- ❌ Non può accedere a configurazione sistema
- ⚠️ Rate limit export documenti: max 10/giorno (RISK-03 mitigation)

**Audit Log**: Azioni COLLABORATORE loggates con livello `INFO`

---

### CLIENTE (Client - Read-Only Access)

| Risorsa | Lettura | Scrittura | Modifica | Cancellazione | Note |
|---------|---------|-----------|----------|---------------|------|
| **Incarichi Propri** | ✅ | ❌ | ❌ | ❌ | Solo `cliente_id = user.id` |
| **Incarichi Altri Clienti** | ❌ | ❌ | ❌ | ❌ | **Row-Level Security** |
| **Documenti Incarichi Propri** | ✅ Download | ❌ | ❌ | ❌ | Solo visualizzazione/download |
| **Messaggi Incarichi Propri** | ✅ | ✅ Invia | ✅ Propri | ✅ Propri (24h) | Comunicazione con studio |
| **Messaggi Altri Incarichi** | ❌ | ❌ | ❌ | ❌ | **Privacy compliance** |
| **Milestone Incarichi Propri** | ✅ | ❌ | ❌ | ❌ | Sola lettura SAL |
| **Bundle** | ✅ Catalogo pubblico | ❌ | ❌ | ❌ | Per richieste preventivo |
| **Utenti** | ❌ | ❌ | ✅ Profilo proprio | ❌ | Solo self-service dati anagrafici |
| **Documenti Upload** | ❌ | ❌ | ❌ | ❌ | Upload disabilitato (solo TITOLARE/COLLABORATORE) |
| **Pagamenti Stripe** | ✅ Checkout | ✅ Sessione pagamento | ❌ | ❌ | Solo pagamento milestone proprie |

**Limitazioni**:
- ❌ Non può creare incarichi (solo richiesta preventivo)
- ❌ Non può uploadare documenti (solo via email a studio)
- ❌ Non può vedere documenti tecnici in lavorazione
- ❌ Non può modificare stato milestone
- ⚠️ Rate limit messaggi: max 20/giorno (anti-spam)

**Audit Log**: Azioni CLIENTE loggates con livello `INFO` (GDPR compliant)

---

## 💾 Database Access Control (PostgreSQL RLS)

### Row-Level Security Policies

```sql
-- Incarichi: accesso solo ai propri (CLIENTE) o assegnati (COLLABORATORE)
CREATE POLICY incarichi_cliente_policy ON incarichi
  FOR SELECT
  USING (
    cliente_id = current_user_id()
    OR responsabile_id = current_user_id()
    OR is_titolare()
  );

-- Documenti: accesso solo se hai accesso all'incarico
CREATE POLICY documenti_policy ON documenti
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incarichi i
      WHERE i.id = documenti.incarico_id
      AND (
        i.cliente_id = current_user_id()
        OR i.responsabile_id = current_user_id()
        OR is_titolare()
      )
    )
  );

-- Messaggi: accesso solo se hai accesso all'incarico
CREATE POLICY messaggi_policy ON messaggi
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incarichi i
      WHERE i.id = messaggi.incarico_id
      AND (
        i.cliente_id = current_user_id()
        OR i.responsabile_id = current_user_id()
        OR is_titolare()
      )
    )
  );

-- Audit Log: TITOLARE vede tutto, altri solo le proprie azioni
CREATE POLICY audit_log_policy ON audit_log
  FOR SELECT
  USING (
    user_id = current_user_id()
    OR is_titolare()
  );
```

### Database User Roles

| DB Role | Applicazione | Permissions | Connection |
|---------|--------------|-------------|------------|
| `studio_erp_app` | Next.js Application | SELECT, INSERT, UPDATE, DELETE su tabelle applicative | Connection pooling (max 20 conn) |
| `studio_erp_readonly` | Analytics/Reporting | SELECT ONLY | Max 5 conn |
| `postgres` (superuser) | DBA TITOLARE | ALL PRIVILEGES | Solo da localhost via SSH tunnel |
| `backup_user` | pgBackRest | SELECT, REPLICATION | Solo da backup script |

**Password Policy**:
- Lunghezza minima: 24 caratteri random (generati)
- Rotazione: Ogni 90 giorni
- Storage: Ansible Vault encrypted
- Accesso: Solo DevOps engineer via SSH

---

## 🖥️ System Layer Access (Linux Server)

### SSH Access (SMALL Configuration - Single Server)

| User | Ruolo | SSH Access | Sudo | Directories | Note |
|------|-------|------------|------|-------------|------|
| `root` | Superuser | ❌ Disabled | N/A | All | Disabled per security |
| `deploy` | Application Owner | ✅ SSH key only | ✅ Limited (`systemctl`, `pm2`) | `/var/www/studio-erp` | Deployment automation |
| `postgres` | Database Owner | ❌ No SSH | ❌ | `/var/lib/postgresql` | Local only |
| `backup` | Backup User | ❌ No SSH | ❌ | `/var/backups` | Cronjob only |
| `{titolare}` | DevOps Admin | ✅ SSH key + 2FA | ✅ Full sudo | All | Emergency access only |

**SSH Security**:
- Port: **2222** (non-standard, RISK-09 mitigation)
- Authentication: **SSH keys only** (password auth disabled)
- 2FA: **Google Authenticator** (pianificato Q1 2026)
- Fail2ban: **3 failed attempts = 1 hour ban**
- IP Whitelist: Studio IP + VPN (opzionale)

**SSH Key Management**:
- Algoritmo: **ED25519** (modern, secure)
- Lunghezza: 256-bit
- Passphrase: **Mandatory** (min 20 caratteri)
- Storage: Password manager (1Password/Bitwarden)
- Rotazione: Annuale

---

### File System Permissions

| Directory | Owner | Group | Permissions | Encryption | Note |
|-----------|-------|-------|-------------|------------|------|
| `/var/www/studio-erp` | deploy | deploy | 755 (dirs), 644 (files) | LUKS full disk | Application code |
| `/var/www/studio-erp/.env` | deploy | deploy | **400** (read-only owner) | LUKS + restricted | **CRITICAL** secrets |
| `/var/lib/postgresql` | postgres | postgres | 700 (dirs), 600 (files) | LUKS full disk | Database data |
| `/var/backups/pgbackrest` | backup | backup | 700 | LUKS + GPG | Encrypted backups |
| `/var/log` | root | adm | 755 (dirs), 640 (files) | LUKS | System logs |
| `/var/log/studio-erp` | deploy | deploy | 755 (dirs), 644 (files) | LUKS | Application logs |
| `/var/uploads` | deploy | www-data | 750 (dirs), 640 (files) | LUKS | Documenti clienti |

**LUKS Full Disk Encryption**:
- Algoritmo: **AES-256-XTS**
- Key: 512-bit random
- Unlock: Passphrase manual on boot (SMALL config)
- Backup key: Sealed envelope in safe (disaster recovery)

---

## ☁️ Infrastructure Layer Access

### Hetzner Cloud Console

| User | Ruolo | Permissions | 2FA | Note |
|------|-------|-------------|-----|------|
| `{titolare_email}` | Owner | Full Control | ✅ Mandatory | Billing, server management |
| `{devops_email}` | Admin | Server Console, Snapshots | ✅ Mandatory | Emergency access |

**Permissions**:
- ✅ Server console access (reboot, rescue mode)
- ✅ Snapshot creation/restore
- ✅ Firewall rule management
- ✅ Backup/Storage Box access
- ❌ Billing changes (solo Owner)
- ❌ Server deletion (solo Owner)

**Audit**:
- Hetzner audit log abilitato
- Alert email su: server delete, firewall change, billing change

---

### Storage Box (Backup Repository)

| User | Protocol | Access | Encryption | Note |
|------|----------|--------|------------|------|
| `backup_user` | SFTP | SSH key only | GPG encrypted files | pgBackRest automation |
| `{titolare}` | SFTP/SMB | Password + 2FA | GPG encrypted files | Manual restore only |

**Access Control**:
- IP Whitelist: Production server IP only
- SSH key: Dedicated key (non condivisa)
- Permissions: Write-only for backup_user (immutabile)
- Retention: 7 giorni full backup + 30 giorni incrementali

---

## 🔑 API Keys & Secrets Access

### Third-Party Service Credentials

| Service | API Key | Access | Rotation | Storage |
|---------|---------|--------|----------|---------|
| **Stripe** | `sk_live_*` | TITOLARE, DevOps | 90 giorni | `.env` + Ansible Vault |
| **SendGrid** | API key | Application only | 180 giorni | `.env` + Ansible Vault |
| **OpenAI** | API key | Application only | 180 giorni | `.env` + Ansible Vault |
| **Upstash Redis** | URL + token | Application only | 365 giorni | `.env` + Ansible Vault |
| **Sentry DSN** | Public DSN | Application only | Non scade | `.env` (public ok) |

**Secret Management**:
1. **Development**: `.env` file (gitignored, mai committato)
2. **Production**: Environment variables encrypted con Ansible Vault
3. **Backup**: Sealed envelope in safe (encrypted USB key)
4. **Rotation**: Automatica via script (pianificato Q2 2026)

**Access Logs**:
- Stripe Dashboard: Audit log API calls
- SendGrid: Email send logs (30 giorni)
- OpenAI: Usage logs (30 giorni)

---

## 📊 Privileged Access Management (PAM)

### Break-Glass Access (Emergency)

**Scenario**: Sistema non accessibile, TITOLARE non disponibile

**Procedura**:
1. DevOps engineer accede via Hetzner Console (rescue mode)
2. Notifica TITOLARE via SMS + email
3. Monta filesystem LUKS con passphrase emergenza (sealed envelope)
4. Esegue operazioni critiche (restore backup, fix config)
5. Log tutte le azioni su file separato
6. Audit post-incident entro 24h

**Audit Trail**:
- Hetzner console log (timestamp, IP, azioni)
- Linux auditd log (comandi eseguiti)
- Application audit log (modifiche database)
- Report scritto entro 48h

---

## 🔍 Access Review Process

### Quarterly Access Review (Trimestrale)

**Responsabile**: TITOLARE
**Frequenza**: Ogni 3 mesi (01 Gennaio, 01 Aprile, 01 Luglio, 01 Ottobre)

**Checklist**:
- [ ] Verificare utenti attivi (rimuovere collaboratori cessati)
- [ ] Verificare SSH keys attive (rimuovere chiavi vecchie)
- [ ] Verificare API keys rotation (forzare rotazione se > 90 giorni)
- [ ] Verificare Hetzner console users (rimuovere accessi non necessari)
- [ ] Audit log: verificare anomalie (login da IP sconosciuti, export massivi)
- [ ] Report review firmato e archiviato

**Template Report**: `/docs/templates/ACCESS_REVIEW_REPORT.md`

---

### Offboarding Procedure (Collaboratore Cessato)

**Entro 24h dalla cessazione**:
1. [ ] Disabilitare account applicazione (soft delete user)
2. [ ] Rimuovere SSH key da server
3. [ ] Riassegnare incarichi aperti ad altro collaboratore
4. [ ] Archiviare email e comunicazioni (7 anni fiscali)
5. [ ] Notificare clienti del cambio responsabile
6. [ ] Audit log: verificare azioni ultime 30 giorni pre-cessazione
7. [ ] Backup dedicato dati collaboratore (GDPR compliance)

---

## 📋 Compliance Mapping

### ISO 27001:2022 Annex A Controls

| Control | Descrizione | Implementazione | Stato |
|---------|-------------|-----------------|-------|
| **A.5.15** | Access Control | RBAC + RLS | ✅ Implementato |
| **A.5.16** | Identity Management | NextAuth.js + PostgreSQL users | ✅ Implementato |
| **A.5.17** | Authentication Information | bcrypt + SSH keys | ✅ Implementato |
| **A.5.18** | Access Rights | Matrice presente | ✅ Implementato |
| **A.8.2** | Privileged Access Rights | Sudo limited + audit | ✅ Implementato |
| **A.8.3** | Information Access Restriction | RLS policies | ✅ Implementato |
| **A.8.5** | Secure Authentication | 2FA pianificato | ⚠️ Q1 2026 |

---

## 🚨 Access Violations & Incident Response

### Monitored Events (Alert Automatici)

| Evento | Soglia | Alert | Azione |
|--------|--------|-------|--------|
| Login falliti | 3 in 5 minuti | Email + SMS | Fail2ban ban IP 1h |
| Export documenti massivo | > 10/giorno | Email TITOLARE | Freeze account + review |
| SSH login da IP sconosciuto | Primo tentativo | Email + SMS | Richiesta conferma |
| Sudo command execution | Ogni comando | Syslog + audit | Revisione settimanale |
| Database direct access | Qualsiasi connessione non-app | Email immediata | Investigazione |
| API key unauthorized use | Primo utilizzo | Email | Rotazione immediata |

### Incident Severity Levels

| Livello | Esempio | Risposta | SLA |
|---------|---------|----------|-----|
| **P1 - Critico** | Root compromise, data breach | Immediate response, shutdown system | < 15 min |
| **P2 - Alto** | Unauthorized SSH access, privilege escalation | Response team, isolate account | < 1 hour |
| **P3 - Medio** | Anomalous export, failed login spikes | Investigation, enhanced monitoring | < 4 hours |
| **P4 - Basso** | Policy violation (weak password) | User notification, policy reminder | < 24 hours |

---

## ✅ Action Items Q1 2026

1. **SSH 2FA**: Implementare Google Authenticator (RISK-09)
2. **Password Policy**: Complessità minima 12 caratteri (RISK-18)
3. **Export Rate Limiting**: Max 10 documenti/giorno per COLLABORATORE (RISK-03)
4. **API Key Rotation**: Script automatico ogni 90 giorni (RISK-06)
5. **Access Review**: Primo review trimestrale (2026-01-01)

---

## 📅 Change History

| Versione | Data | Modifiche | Autore |
|----------|------|-----------|--------|
| 1.0 | 2025-12-27 | Initial release | CTO |

---

## 🔐 Approval

**Approvals**:
- [ ] CTO - Chief Technology Officer: _________________ Data: _______
- [ ] GDPR DPO - Data Protection Officer: _________________ Data: _______
- [ ] Business Owner - TITOLARE: _________________ Data: _______

---

**Document Control**:
- **Classification**: CONFIDENTIAL - Internal Use Only
- **Storage**: `/docs/ISO_27001_ACCESS_CONTROL_MATRIX.md`
- **Backup**: Incluso in backup giornaliero
- **Access**: TITOLARE, CTO only

**End of Document**
