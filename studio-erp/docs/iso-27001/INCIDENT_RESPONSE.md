# 🚨 Incident Response Procedures
## Studio Ing. Romano - Piano di Gestione Incidenti di Sicurezza

**Versione**: 1.0
**Data**: 2025-12-27
**Riferimento**: ISO/IEC 27001:2022 - Controllo A.5.24, A.5.25, A.5.26
**Responsabile**: Ing. Romano Domenico (Titolare + CISO)
**Stato**: PRODUCTION

---

## 📋 Indice

1. [Scopo e Ambito](#1-scopo-e-ambito)
2. [Definizioni](#2-definizioni)
3. [Classificazione Incidenti](#3-classificazione-incidenti)
4. [Organizzazione e Responsabilità](#4-organizzazione-e-responsabilità)
5. [Procedura di Incident Response](#5-procedura-di-incident-response)
6. [Escalation Matrix](#6-escalation-matrix)
7. [Comunicazione e Notifica](#7-comunicazione-e-notifica)
8. [Analisi Post-Incidente](#8-analisi-post-incidente)
9. [Conservazione Evidenze](#9-conservazione-evidenze)
10. [Scenari di Incidente Specifici](#10-scenari-di-incidente-specifici)

---

## 1. Scopo e Ambito

### 1.1 Obiettivo

Definire processi, ruoli e responsabilità per:
- **Rilevamento** tempestivo incidenti di sicurezza
- **Contenimento** rapido per limitare impatto
- **Eradicazione** della causa root
- **Recupero** operatività normale
- **Apprendimento** per prevenire ricorrenza

### 1.2 Ambito Applicazione

Tutti gli asset IT dello Studio Ing. Romano:
- **Infrastruttura**: Server Hetzner (app + db + backup)
- **Applicazioni**: Studio ERP (Next.js + PostgreSQL)
- **Dati**: Database clienti, incarichi, documenti tecnici
- **Personale**: Titolare, collaboratori, fornitori terzi

### 1.3 Conformità Normativa

- **ISO/IEC 27001:2022**: Controllo A.5.24 (Incident Management), A.5.25 (Evidence Collection), A.5.26 (Response to Security Incidents)
- **GDPR Art. 33-34**: Notifica data breach al Garante entro 72 ore
- **NIS2 Directive**: Notifica incidenti critici (se applicabile)
- **Codice Privacy Italiano**: D.Lgs. 196/2003 come modificato

---

## 2. Definizioni

### 2.1 Incidente di Sicurezza

**Evento** che compromette:
- **Confidenzialità**: Accesso non autorizzato a dati riservati
- **Integrità**: Modifica non autorizzata di dati o sistemi
- **Disponibilità**: Interruzione servizio (DoS, ransomware)

### 2.2 Data Breach (Violazione Dati Personali)

Sottocategoria di incidente che comporta:
- Distruzione, perdita, modifica, divulgazione non autorizzata
- Accesso non autorizzato a dati personali (GDPR Art. 4.12)

**Soglia di notifica**: Qualsiasi data breach potenzialmente ad alto rischio per diritti e libertà delle persone fisiche.

### 2.3 Gravità Incidente

| Livello | Descrizione | Esempio |
|---------|-------------|---------|
| **P1 - Critico** | Interruzione totale servizio, data breach massivo | Ransomware, database dump pubblico |
| **P2 - Alto** | Servizio parzialmente degradato, breach limitato | SQL injection sfruttata, XSS con furto sessioni |
| **P3 - Medio** | Vulnerabilità scoperta non ancora sfruttata | Dependency con CVE critica, configurazione errata |
| **P4 - Basso** | Tentativo di attacco fallito, anomalia sospetta | Brute force bloccato, scan port esterni |

---

## 3. Classificazione Incidenti

### 3.1 Tipologie di Incidente

#### A. Compromissione Account
- **Descrizione**: Accesso non autorizzato a credenziali utente/admin
- **Indicatori**: Login da IP sospetti, MFA bypass, privilege escalation
- **Gravità Base**: P2-P1

#### B. Malware / Ransomware
- **Descrizione**: Software malevolo infetta sistemi o cifra dati
- **Indicatori**: File modificati, processi sospetti, richiesta riscatto
- **Gravità Base**: P1

#### C. Data Breach / Exfiltration
- **Descrizione**: Esfiltrazione non autorizzata di dati sensibili
- **Indicatori**: Traffic outbound anomalo, query SQL massive, download file
- **Gravità Base**: P1 (GDPR applicabile)

#### D. Denial of Service (DoS/DDoS)
- **Descrizione**: Sovraccarico risorse per rendere servizio inaccessibile
- **Indicatori**: Spike traffico, CPU/RAM 100%, timeout connessioni
- **Gravità Base**: P2

#### E. Vulnerabilità Sfruttata
- **Descrizione**: Exploit di vulnerabilità nota (CVE) o zero-day
- **Indicatori**: WAF alert, errori applicazione, SQL injection logs
- **Gravità Base**: P2-P3

#### F. Insider Threat
- **Descrizione**: Abuso privilegi da parte di dipendente/collaboratore
- **Indicatori**: Accesso fuori orario, download massivo, modifica ACL
- **Gravità Base**: P2-P1

#### G. Perdita/Furto Dispositivo
- **Descrizione**: Laptop, smartphone, USB con dati aziendali smarrito
- **Indicatori**: Dispositivo non connesso da giorni, denuncia furto
- **Gravità Base**: P3-P2 (se dati non cifrati: P1)

#### H. Errore Configurazione
- **Descrizione**: Misconfiguration che espone dati o servizi
- **Indicatori**: Bucket S3 pubblico, DB esposto senza firewall, secrets in Git
- **Gravità Base**: P3-P2

---

## 4. Organizzazione e Responsabilità

### 4.1 Incident Response Team (IRT)

**Composizione Minima** (startup con 1-2 persone):

| Ruolo | Persona | Responsabilità | Contatto |
|-------|---------|----------------|----------|
| **CISO / Incident Manager** | Ing. Romano Domenico | Decisioni strategiche, comunicazione esterna, escalation | +39 XXX XXX XXXX |
| **Technical Lead** | Ing. Romano Domenico | Analisi tecnica, contenimento, remediation | domenico.romano@studioromano.it |
| **Legal Advisor** | Avvocato Esterno | GDPR compliance, notifiche Garante, PR crisis | studio.legale@example.it |
| **Hosting Provider Contact** | Hetzner Support | Isolamento VM, snapshot, supporto infrastruttura | +49 XXX XXX XXXX |

**Nota**: In fase MVP, il Titolare ricopre ruoli multipli. Con crescita team, separare i ruoli.

### 4.2 Stakeholder Esterni

| Stakeholder | Quando Coinvolgere | SLA Notifica |
|-------------|-------------------|--------------|
| **Garante Privacy** | Data breach ad alto rischio | 72 ore da discovery |
| **Clienti Interessati** | Data breach con dati personali | Senza indebito ritardo |
| **Hetzner** | Compromissione server, DDoS | Immediato (ticket urgente) |
| **Polizia Postale** | Reati informatici (estorsione ransomware) | 24 ore |
| **Stripe** | Compromissione pagamenti (impossibile con PCI-DSS SAQ A) | Immediato |
| **Assicurazione Cyber Risk** | Incidente coperto da polizza | 48 ore |

---

## 5. Procedura di Incident Response

### 5.1 Overview Processo (NIST Framework)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ DETECTION   │────▶│ ANALYSIS    │────▶│ CONTAINMENT │────▶│ ERADICATION │────▶│ RECOVERY    │
│ (Monitoring)│     │ (Triage)    │     │ (Isolamento)│     │ (Root Fix)  │     │ (Restore)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │                    │                    │
       │                    │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┴───────────────────▶
                                                                                    POST-MORTEM
                                                                                    (Lesson Learned)
```

---

### 5.2 FASE 1: Detection (Rilevamento)

#### Obiettivo
Identificare tempestivamente eventi anomali tramite monitoring automatico o segnalazione manuale.

#### Sorgenti di Alert

**A. Monitoring Automatico**
- **Prometheus + Grafana**: Alert CPU/RAM/Disk anomali
- **PostgreSQL Log Analyzer**: Query SQL sospette (UNION, DROP TABLE)
- **Next.js Error Tracking**: Spike errori 500, rate limit exceeded
- **Uptime Monitor** (UptimeRobot / Pingdom): Downtime > 2 minuti
- **Hetzner Cloud Console**: Alert firewall, traffico anomalo

**B. Segnalazione Utente**
- Cliente segnala dati errati o accesso non autorizzato
- Collaboratore nota comportamento anomalo applicazione

**C. External Intelligence**
- Vulnerability scanner (Snyk, Dependabot): CVE critica in dependency
- Email phishing rilevata da dipendente
- Alert da Stripe su transazione sospetta

#### Azioni Immediate (5 minuti)

1. **Log Alert**: Registrare in `audit_log` con tipo `SECURITY_INCIDENT`
   ```sql
   INSERT INTO audit_log (tipo, utente_id, descrizione, metadata, timestamp)
   VALUES (
     'SECURITY_INCIDENT',
     'system',
     'Possibile data breach - SQL injection rilevata',
     '{"ip": "203.0.113.45", "endpoint": "/api/incarichi", "payload": "1' OR '1'='1"}',
     NOW()
   );
   ```

2. **Notifica CISO**: Email + SMS automatico al Titolare

3. **Preservare Evidenze**: NO modifiche a log finché non analizzati

---

### 5.3 FASE 2: Analysis (Analisi e Triage)

#### Obiettivo
Determinare gravità, impatto e scope dell'incidente entro 30 minuti.

#### Checklist Analisi

**A. Domande da Rispondere**
- ✅ È un vero incidente o falso positivo?
- ✅ Quali sistemi sono compromessi? (app, db, backup, tutti?)
- ✅ Quali dati sono coinvolti? (pubblici, interni, sensibili GDPR?)
- ✅ Quanti utenti/clienti sono impattati?
- ✅ L'attaccante ha ancora accesso attivo?
- ✅ C'è rischio di propagazione ad altri sistemi?

**B. Fonti di Informazione**
- **PostgreSQL Log**: `/var/log/postgresql/postgresql-16-main.log`
- **Next.js Log**: `pm2 logs studio-erp --lines 500`
- **Nginx Access Log**: `/var/log/nginx/access.log` (IP attaccante, user-agent)
- **Firewall Log**: Hetzner Cloud Console → Firewall Rules → Log
- **Audit Trail Applicativo**: `SELECT * FROM audit_log WHERE timestamp > NOW() - INTERVAL '1 hour';`

**C. Classificazione Gravità**

| Criterio | P4 | P3 | P2 | P1 |
|----------|----|----|----|----|
| **Dati Compromessi** | Nessuno | Pubblici | Interni | GDPR/Sensibili |
| **Sistemi Impattati** | 0 (solo alert) | Dev/Staging | Produzione parziale | Produzione totale |
| **Downtime** | 0 | < 15 min | 15-60 min | > 1 ora |
| **Utenti Impattati** | 0 | < 10 | 10-100 | > 100 o TUTTI |
| **Data Breach GDPR** | No | No | Possibile | Confermato |

**D. Decisione Escalation**

```
P4 (Basso)      → Monitor, fix in orario lavorativo
P3 (Medio)      → Assegna a Technical Lead, fix entro 24h
P2 (Alto)       → Notifica CISO, avvia contenimento, fix entro 4h
P1 (Critico)    → EMERGENCY: Attiva IRT completo, notifica stakeholder esterni
```

---

### 5.4 FASE 3: Containment (Contenimento)

#### Obiettivo
Impedire propagazione e limitare danno **senza distruggere evidenze forensi**.

#### A. Contenimento a Breve Termine (15 minuti)

**Opzioni Tecniche**:

1. **Isola Account Compromesso**
   ```sql
   -- Disabilita utente sospetto
   UPDATE utente SET attivo = FALSE WHERE id = 'XXX';

   -- Revoca tutte le sessioni
   DELETE FROM session WHERE utente_id = 'XXX';
   ```

2. **Blocca IP Attaccante (Firewall)**
   ```bash
   # Hetzner Cloud Firewall
   # Dashboard → Firewall → Add Rule:
   # Type: Inbound, Protocol: All, Source: 203.0.113.45, Action: DROP

   # O via CLI (se configurato):
   hcloud firewall add-rule erp-firewall --direction in --source-ips 203.0.113.45 --protocol tcp --port any --action drop
   ```

3. **Rate Limit Aggressivo**
   ```typescript
   // lib/rate-limit.ts - Emergenza
   export const emergencyRateLimit = new Ratelimit({
     redis: redis,
     limiter: Ratelimit.slidingWindow(1, "10 m"), // 1 request / 10 minuti
   });
   ```

4. **Modalità Manutenzione (se P1)**
   ```bash
   # Next.js - Redirect a pagina manutenzione
   # middleware.ts
   export function middleware(request: NextRequest) {
     return NextResponse.redirect(new URL('/maintenance', request.url));
   }
   ```

5. **Snapshot Immediato VM**
   ```bash
   # Hetzner Cloud Console → Snapshots → Create Snapshot
   # Nome: "incident-2025-12-27-breach-snapshot"
   # Preserva stato per analisi forense
   ```

#### B. Contenimento a Lungo Termine (1-4 ore)

**Obiettivo**: Rendere ambiente sicuro per operare mentre si prepara fix definitivo.

1. **Patch Vulnerabilità Temporanea**
   - Disabilita endpoint compromesso (commenta route)
   - Aggiorna dependency vulnerabile (se hotfix disponibile)

2. **Aumenta Monitoring**
   - Abilita log debug completo
   - Aggiungi alert personalizzato per pattern specifico attacco

3. **Backup Incrementale Pre-Fix**
   ```bash
   # Prima di eradicazione, backup stato corrente
   pg_dump studio_erp > /backup/pre-fix-2025-12-27.sql
   ```

---

### 5.5 FASE 4: Eradication (Eradicazione)

#### Obiettivo
Rimuovere causa root dell'incidente.

#### Azioni per Tipologia

**A. Malware / Backdoor**
```bash
# Scansiona filesystem
clamscan -r /var/www/studio-erp --infected --remove

# Verifica integrità binari
debsums -c  # Debian/Ubuntu

# Reinstalla da fonte sicura se dubbi
npm ci  # Reinstalla node_modules da lock file
```

**B. Account Compromesso**
```sql
-- Forza reset password utente
UPDATE utente SET password = NULL, must_reset_password = TRUE WHERE id = 'XXX';

-- Revoca tutte le API keys
DELETE FROM api_key WHERE utente_id = 'XXX';

-- Notifica utente via email (SendGrid)
```

**C. Vulnerabilità Applicazione**
```bash
# Applica patch
npm update <vulnerable-package>

# O se fix non disponibile, rimuovi feature
git revert <commit-che-ha-introdotto-bug>

# Deploy immediato
npm run build
pm2 restart studio-erp
```

**D. Configurazione Errata**
```bash
# Esempio: Database esposto pubblicamente
# Hetzner Firewall → PostgreSQL port 5432 → Source: 0.0.0.0/0 → DELETE
# Aggiungi rule: Source: 10.0.1.0/24 (solo VPC privato)

# Verifica:
nmap -p 5432 <IP-pubblico-server>  # Deve essere filtered
```

---

### 5.6 FASE 5: Recovery (Recupero)

#### Obiettivo
Ripristinare operatività normale con garanzia che minaccia è eliminata.

#### Checklist Pre-Ripristino

- [ ] Causa root confermata eliminata
- [ ] Vulnerability scan pulito (no CVE critiche)
- [ ] Penetration test rapido su area compromessa (OK)
- [ ] Monitoring attivo su metriche chiave
- [ ] Backup verificato e disponibile per rollback
- [ ] Team IRT in standby per prime 24h

#### Azioni Ripristino

1. **Riattiva Servizio Gradualmente**
   ```bash
   # Rimuovi manutenzione mode
   # Riattiva endpoint uno alla volta
   # Monitor error rate ogni 15 minuti
   ```

2. **Ripristina Dati da Backup (se necessario)**
   ```bash
   # SOLO se dati corrotti/cifrati da ransomware
   pg_restore -d studio_erp /backup/daily-2025-12-26.dump

   # Verifica integrità
   SELECT COUNT(*) FROM incarico;  # Confronta con baseline
   ```

3. **Reset Credenziali Sensibili**
   ```bash
   # Rigenera secrets
   openssl rand -base64 32 > NEXTAUTH_SECRET

   # Ruota API keys
   # Stripe → API Keys → Roll secret key
   # SendGrid → API Keys → Create new key, delete old
   ```

4. **Notifica Utenti (se data breach)**
   ```
   Oggetto: Importante - Aggiornamento Sicurezza Account

   Gentile Cliente,

   Ti informiamo che il [DATA] abbiamo rilevato un accesso non autorizzato
   al nostro sistema che ha potenzialmente interessato [DESCRIZIONE DATI].

   Azioni intraprese:
   - Incidente contenuto entro [TEMPO]
   - Vulnerabilità corretta
   - Garante Privacy notificato

   Cosa fare:
   - Cambia password (link)
   - Abilita autenticazione a due fattori
   - Monitora estratti conto (se dati pagamento coinvolti)

   Per domande: supporto@studioromano.it
   ```

---

### 5.7 FASE 6: Post-Incident Analysis (Lessons Learned)

#### Obiettivo
Apprendere dall'incidente per prevenire ricorrenza.

#### Timeline
Entro **5 giorni lavorativi** dalla chiusura incidente.

#### Template Post-Mortem Report

```markdown
# Post-Mortem Report - [NOME INCIDENTE]

**Data Incidente**: 2025-12-27
**Durata**: 14:23 - 16:45 (2h 22min)
**Gravità**: P2 (Alto)
**Root Cause**: SQL Injection in endpoint /api/incarichi

---

## Timeline

| Ora | Evento |
|-----|--------|
| 14:23 | Alert Grafana: spike query DB |
| 14:25 | Analisi log: rilevata SQL injection |
| 14:30 | IP attaccante bloccato |
| 14:45 | Snapshot VM creato |
| 15:00 | Endpoint /api/incarichi disabilitato |
| 15:30 | Patch applicata (Prisma parameterized query) |
| 16:00 | Deploy fix |
| 16:15 | Test penetration |
| 16:45 | Servizio ripristinato |

---

## Impact Assessment

- **Dati Compromessi**: 47 record incarichi (NO dati GDPR sensibili)
- **Downtime**: 45 minuti (endpoint incarichi)
- **Utenti Impattati**: 12 collaboratori
- **Costo Stimato**: €500 (tempo risposta + fix)

---

## Root Cause

Query SQL costruita con string concatenation invece di prepared statement:

```typescript
// VULNERABILE (prima)
const query = `SELECT * FROM incarico WHERE cliente_id = '${req.body.clienteId}'`;

// SICURO (dopo)
const incarichi = await prisma.incarico.findMany({
  where: { clienteId: req.body.clienteId }
});
```

---

## Lessons Learned

### Cosa ha funzionato ✅
- Alert monitoring efficace (rilevato in 2 minuti)
- Snapshot rapido ha preservato evidenze
- Fix deployment entro 2 ore

### Cosa NON ha funzionato ❌
- Code review non ha rilevato SQL injection
- Nessun WAF attivo (avrebbe bloccato automaticamente)
- Nessun penetration test pre-produzione

---

## Action Items

| Azione | Owner | Deadline | Priorità |
|--------|-------|----------|----------|
| Implementare WAF (ModSecurity) | Ing. Romano | 2025-01-10 | P1 |
| Code review checklist OWASP Top 10 | Ing. Romano | 2025-01-05 | P1 |
| Penetration test mensile (OWASP ZAP) | Ing. Romano | 2025-01-15 | P2 |
| Training sviluppo sicuro (OWASP) | Team | 2025-01-20 | P2 |

---

## Approval

- **Incident Manager**: Ing. Romano Domenico
- **Data**: 2026-01-02
- **Firma**: _______________
```

---

## 6. Escalation Matrix

### 6.1 SLA Response Time

| Gravità | First Response (Acknowledgment) | Containment Start | Resolution Target |
|---------|--------------------------------|-------------------|-------------------|
| **P1 - Critico** | 15 minuti | 30 minuti | 4 ore |
| **P2 - Alto** | 1 ora | 2 ore | 24 ore |
| **P3 - Medio** | 4 ore | 8 ore | 5 giorni |
| **P4 - Basso** | 24 ore | 48 ore | 30 giorni |

### 6.2 Escalation Path

```
P4 (Basso)
  └─▶ Technical Lead → Fix in orario lavorativo

P3 (Medio)
  └─▶ Technical Lead → Monitor → CISO (se peggiora a P2)

P2 (Alto)
  └─▶ CISO notificato → Technical Lead fix → Legal Advisor (se GDPR)

P1 (Critico)
  └─▶ EMERGENCY CALL → Tutto IRT → Hetzner Support → Garante (se data breach)
```

### 6.3 Contatti Emergenza

**Emergency Hotline** (solo P1):
- **CISO Mobile**: +39 XXX XXX XXXX (H24)
- **Hetzner Emergency**: +49 XXX XXX XXXX
- **Legal Advisor**: +39 YYY YYY YYYY

**Email Group** (alert automatici):
- `security-incidents@studioromano.it` (alias → Titolare + collaboratori senior)

---

## 7. Comunicazione e Notifica

### 7.1 Comunicazione Interna

**Canali**:
- **P1-P2**: Chiamata telefono + Email + Slack/Teams (se esistente)
- **P3-P4**: Email

**Template Email Interna**:
```
Subject: [P1 - CRITICO] Incidente Sicurezza in Corso

Team,

SITUAZIONE:
- Incidente rilevato: 2025-12-27 14:23
- Tipo: Data Breach (SQL Injection)
- Impatto: Database incarichi compromesso

AZIONI IN CORSO:
- IP attaccante bloccato (14:30)
- Endpoint disabilitato (15:00)
- Fix in deployment (ETA 16:00)

ISTRUZIONI:
- NON accedere a /api/incarichi fino a nuovo avviso
- Segnalare immediatamente attività sospette
- Prossimo aggiornamento: 15:30

-- CISO
```

### 7.2 Comunicazione GDPR - Garante Privacy

**Quando Notificare**:
- Entro **72 ore** da discovery del data breach
- Se rischio per diritti e libertà persone fisiche

**Canale**:
- Portale Garante: https://servizi.gpdp.it/databreach/s/
- Form online + documentazione allegata

**Informazioni Richieste** (Art. 33 GDPR):
1. Natura violazione (confidenzialità, integrità, disponibilità)
2. Categorie e numero approssimativo interessati
3. Dati personali coinvolti (nome, email, P.IVA, etc.)
4. Probabili conseguenze
5. Misure adottate o proposte
6. Contatti DPO (o Titolare se non nominato)

**Template Notifica Garante**:
```markdown
OGGETTO: Notifica Violazione Dati Personali ai sensi Art. 33 GDPR

1. NATURA VIOLAZIONE
   - Data/Ora Discovery: 2025-12-27 14:23
   - Tipo: Accesso non autorizzato (SQL Injection)
   - Confidenzialità: COMPROMESSA
   - Integrità: NON compromessa
   - Disponibilità: NON compromessa

2. DATI COINVOLTI
   - Categorie: Nome, Cognome, Email, P.IVA, Indirizzo
   - Numero interessati: ~120 clienti
   - Dati sensibili: NO (nessun dato sanitario, biometrico, etc.)

3. PROBABILI CONSEGUENZE
   - Rischio BASSO: Dati già pubblici (P.IVA su registri camerali)
   - Possibile spam/phishing mirato
   - NO rischio finanziario (nessun dato pagamento compromesso)

4. MISURE ADOTTATE
   - Contenimento: IP bloccato entro 7 minuti
   - Eradicazione: Patch applicata entro 2 ore
   - Notifica interessati: Email inviata 2025-12-28
   - Prevenzione: WAF implementato, penetration test mensile

5. REFERENTE
   - Titolare: Ing. Romano Domenico
   - Email: dpo@studioromano.it
   - Tel: +39 XXX XXX XXXX
```

### 7.3 Comunicazione Clienti (Art. 34 GDPR)

**Quando Notificare**:
- Se rischio **elevato** per diritti e libertà
- "Senza indebito ritardo"

**Esenzioni**:
- Dati resi incomprensibili (es. cifrati con chiave non compromessa)
- Misure successive rendono rischio elevato improbabile
- Comunicazione richiederebbe sforzi sproporzionati (allora comunicazione pubblica)

**Canale**:
- Email personale (preferito)
- O comunicazione pubblica su homepage (se >10.000 interessati)

**Template Email Cliente**:
```
Oggetto: Importante Aggiornamento sulla Sicurezza del Tuo Account

Gentile [NOME CLIENTE],

Ti scriviamo per informarti di un incidente di sicurezza che ha interessato
la nostra piattaforma il giorno 27 dicembre 2025.

COSA È SUCCESSO:
Un accesso non autorizzato al nostro database ha potenzialmente esposto:
- Nome e cognome
- Indirizzo email
- Partita IVA
- Indirizzo sede legale

DATI NON COMPROMESSI:
- Password (cifrate con bcrypt, impossibili da decifrare)
- Dati di pagamento (gestiti esclusivamente da Stripe, mai sul nostro server)
- Documenti caricati (stored cifrati)

AZIONI GIÀ INTRAPRESE:
- Incidente contenuto entro 2 ore dalla rilevazione
- Vulnerabilità corretta
- Garante Privacy notificato
- Sistemi di monitoraggio potenziati

COSA PUOI FARE:
1. Cambia la tua password: [LINK]
2. Abilita autenticazione a due fattori: [LINK]
3. Fai attenzione a email sospette (phishing)

Per domande o esercitare i tuoi diritti (accesso, cancellazione):
- Email: privacy@studioromano.it
- Tel: +39 XXX XXX XXXX

Ci scusiamo per l'accaduto e ti assicuriamo il massimo impegno nella
protezione dei tuoi dati.

Cordiali saluti,
Ing. Romano Domenico
Studio Ing. Romano
```

---

## 8. Analisi Post-Incidente

### 8.1 Metriche da Tracciare

**KPI Incident Response**:
- **MTTD** (Mean Time To Detect): Tempo da incidente a discovery
- **MTTR** (Mean Time To Respond): Tempo da discovery a first response
- **MTTC** (Mean Time To Contain): Tempo da discovery a containment
- **MTTR** (Mean Time To Resolve): Tempo da discovery a complete resolution

**Esempio**:
```
Incidente SQL Injection 2025-12-27:
- MTTD: 2 minuti (alert automatico)
- MTTR: 5 minuti (analisi iniziata)
- MTTC: 30 minuti (IP bloccato + endpoint disabilitato)
- MTTR: 2 ore 22 minuti (fix deployed + test OK)
```

### 8.2 Registro Incidenti

Mantenere log storico in `docs/iso-27001/incident-log.md`:

| ID | Data | Tipo | Gravità | MTTD | MTTR | Root Cause | Status |
|----|------|------|---------|------|------|------------|--------|
| INC-001 | 2025-12-27 | Data Breach | P2 | 2m | 2h22m | SQL Injection | Closed |
| INC-002 | 2026-01-15 | DoS | P3 | 5m | 45m | Rate limit bug | Closed |

### 8.3 Audit Annuale

**Obiettivo**: Verifica efficacia Incident Response Plan.

**Frequenza**: 1 volta/anno (o dopo ogni incidente P1)

**Checklist Audit**:
- [ ] Tutti gli incidenti documentati con post-mortem
- [ ] SLA rispettati (95% target)
- [ ] Action items da post-mortem completati
- [ ] Contatti IRT aggiornati
- [ ] Simulazione tabletop exercise effettuata
- [ ] Piano aggiornato con nuove minacce (OWASP Top 10 update)

---

## 9. Conservazione Evidenze

### 9.1 Chain of Custody

**Obiettivo**: Preservare evidenze per analisi forense e potenziale azione legale.

**Principi**:
- **Integrità**: Hash SHA-256 di ogni file/log
- **Autenticità**: Timestamp firmato digitalmente
- **Continuità**: Traccia chi ha accesso a evidenze

**Procedura**:
```bash
# 1. Crea directory evidenze
mkdir -p /evidence/INC-001-2025-12-27

# 2. Copia log (NO modifiche originali)
cp /var/log/postgresql/*.log /evidence/INC-001-2025-12-27/
cp /var/log/nginx/access.log /evidence/INC-001-2025-12-27/

# 3. Hash per verificare integrità
cd /evidence/INC-001-2025-12-27
sha256sum * > checksums.txt

# 4. Timestamp (se disponibile timestamping authority)
openssl ts -query -data checksums.txt -sha256 -out checksums.tsq

# 5. Comprimi e cifra
tar czf INC-001-evidence.tar.gz .
gpg --encrypt --recipient ciso@studioromano.it INC-001-evidence.tar.gz

# 6. Archivia
mv INC-001-evidence.tar.gz.gpg /backup/evidence/
```

### 9.2 Conservazione Durata

| Tipo Evidenza | Durata Minima | Rationale |
|---------------|---------------|-----------|
| **Log Incidente** | 5 anni | Prescrizione reati informatici |
| **Post-Mortem Report** | 10 anni | ISO 27001 audit trail |
| **Snapshot VM** | 90 giorni | Analisi forense se escalation |
| **Email/Comunicazioni** | 5 anni | GDPR accountability |

### 9.3 Accesso Evidenze

**Controllo Accessi**:
- Solo CISO e Legal Advisor
- Audit log ogni accesso
- Cifratura at-rest (LUKS o GPG)

---

## 10. Scenari di Incidente Specifici

### 10.1 Scenario: Ransomware

**Indicatori**:
- File cifrati con estensione `.locked`, `.encrypted`
- Processo sospetto `crypto.exe`, `locker.bin`
- Richiesta riscatto in file `README_RANSOM.txt`

**Procedura Specifica**:

1. **IMMEDIATO (5 minuti)**
   ```bash
   # Isola VM da rete
   # Hetzner Console → Server → Networking → Detach from network

   # NO shutdown (preserva RAM per analisi forense)
   # NO pagare riscatto (finanzia crimine, no garanzia recupero)
   ```

2. **Contenimento (30 minuti)**
   ```bash
   # Identifica processo malevolo
   ps aux | grep -i crypt
   kill -9 <PID>

   # Blocca persistenza
   systemctl disable <malware-service>

   # Snapshot immediato (stato cifrato)
   # Hetzner → Snapshots → Create
   ```

3. **Recupero (2-4 ore)**
   ```bash
   # Ripristina da backup più recente (pre-infezione)
   # Backup giornalieri → trova ultimo pulito

   pg_restore -d studio_erp /backup/daily-2025-12-26.dump

   # Reinstalla applicazione da Git (fonte sicura)
   cd /var/www/studio-erp
   git reset --hard origin/main
   npm ci
   npm run build
   ```

4. **Notifica**
   - Polizia Postale (reato estorsione)
   - Garante Privacy (se dati compromessi)
   - Assicurazione cyber risk

---

### 10.2 Scenario: Credential Stuffing Attack

**Indicatori**:
- Spike login tentativi (100x normale)
- Pattern: IP diversi, usernames comuni (admin, test)
- Rate limit triggered ripetutamente

**Procedura Specifica**:

1. **Contenimento**
   ```typescript
   // Riduce rate limit temporaneamente
   export const emergencyLoginRateLimit = new Ratelimit({
     redis: redis,
     limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 tentativi/ora
   });
   ```

2. **Blocca IP Pattern**
   ```bash
   # Se da botnet (CIDR block)
   # Firewall → Block 45.XXX.0.0/16
   ```

3. **Notifica Utenti**
   ```
   Email a tutti: "Attacco credential stuffing rilevato.
   Se hai riutilizzato password da altri siti, cambiala immediatamente."
   ```

4. **Remediation**
   - Forza MFA per account admin
   - Implementa CAPTCHA su login (hCaptcha)
   - Password breach check (HaveIBeenPwned API)

---

### 10.3 Scenario: Insider Threat (Collaboratore Malevolo)

**Indicatori**:
- Download massivo file (100+ in 1 ora)
- Accesso fuori orario (3:00 AM)
- Privilege escalation tentativi
- Modifica ACL per dare accessi a sé stesso

**Procedura Specifica**:

1. **NO alert diretto al sospetto** (potrebbe cancellare evidenze)

2. **Monitoring Silenzioso**
   ```sql
   -- Traccia azioni utente sospetto
   SELECT * FROM audit_log
   WHERE utente_id = 'SOSPETTO_ID'
   ORDER BY timestamp DESC
   LIMIT 100;
   ```

3. **Consulta Legale PRIMA di azioni**
   - Diritti lavoratore (Statuto Lavoratori)
   - Procedura disciplinare corretta
   - Eventuale denuncia penale

4. **Contenimento**
   ```sql
   -- Disabilita account (NO delete, preserva evidenze)
   UPDATE utente SET attivo = FALSE WHERE id = 'SOSPETTO_ID';

   -- Audit completo permessi
   SELECT * FROM permesso WHERE utente_id = 'SOSPETTO_ID';
   ```

---

### 10.4 Scenario: DDoS Attack

**Indicatori**:
- Traffic spike 100x normale
- CPU/RAM server 100%
- Applicazione timeout
- Pattern: SYN flood, HTTP GET flood

**Procedura Specifica**:

1. **Verifica Legittimità**
   ```bash
   # Controlla se traffico legittimo (lancio prodotto, campagna marketing)
   tail -f /var/log/nginx/access.log | grep -v bot
   ```

2. **Contenimento Layer 7 (HTTP)**
   ```nginx
   # Nginx rate limit aggressivo
   limit_req_zone $binary_remote_addr zone=ddos:10m rate=10r/s;
   limit_req zone=ddos burst=20 nodelay;
   ```

3. **Contenimento Layer 4 (Network)**
   ```bash
   # Hetzner DDoS Protection (automatico > 1 Gbps)
   # Contatta Hetzner Support per attivazione manuale
   ```

4. **Cloudflare (se disponibile)**
   - Abilita "Under Attack Mode"
   - JavaScript challenge per bot
   - Rate limiting basato su fingerprint

5. **Comunicazione**
   ```
   Status page (status.studioromano.it):
   "Stiamo mitigando un attacco DDoS. Servizio potrebbe essere lento.
   Lavoriamo per ripristinare normale operatività entro 2 ore."
   ```

---

## 11. Testing e Simulazioni

### 11.1 Tabletop Exercise

**Obiettivo**: Testare IRT senza impatto produzione.

**Frequenza**: 2 volte/anno

**Scenario Esempio**:
```
SCENARIO: Ransomware Attack Simulation

10:00 - "Alert Grafana: tutti file in /var/www cifrati"
10:05 - CISO: "Quale prima azione?"
10:10 - Technical Lead: "Isolo server da rete"
10:15 - CISO: "Backup disponibile? Quanto vecchio?"
10:20 - Technical Lead: "Ultimo backup: 24 ore fa, test restore: OK"
10:30 - CISO: "Devo notificare Garante?"
10:35 - Legal Advisor: "Sì, potenziale data breach, preparo notifica"

DEBRIEF:
- Decisioni corrette?
- SLA rispettati?
- Lacune identificate?
```

### 11.2 Red Team Exercise (Annuale)

**Obiettivo**: Penetration test realistico.

**Provider**: Hacker etico certificato (OSCP, CEH)

**Scope**:
- SQL Injection, XSS, CSRF
- Privilege escalation
- Sensitive data exposure

**Deliverable**: Report con CVE trovate + remediation plan.

---

## 12. Riferimenti Normativi

- **ISO/IEC 27001:2022**: Annex A.5.24, A.5.25, A.5.26
- **ISO/IEC 27035:2023**: Information Security Incident Management
- **NIST SP 800-61**: Computer Security Incident Handling Guide
- **GDPR**: Art. 33 (Notifica Garante), Art. 34 (Comunicazione interessati)
- **NIS2 Directive**: EU 2022/2555 (se applicabile)
- **ENISA**: Guidelines on Incident Reporting

---

## 13. Aggiornamenti Documento

| Versione | Data | Autore | Modifiche |
|----------|------|--------|-----------|
| 1.0 | 2025-12-27 | Ing. Romano | Creazione iniziale |

**Prossima Revisione**: 2026-06-27 (6 mesi) o dopo incidente P1.

---

**Fine Documento**
