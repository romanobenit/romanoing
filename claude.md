# CLAUDE.md - Studio Ing. Romano ERP + eCommerce Platform

## 📋 Panoramica Progetto

Piattaforma integrata ERP + eCommerce per uno studio di ingegneria che combina:
- **eCommerce demand-driven**: i clienti descrivono le loro esigenze e il sistema propone bundle di servizi
- **Gestione incarichi**: workflow conforme a ISO 9001:2015 (SGQ) e ISO 27001:2022 (ISMS)
- **Tracciabilità AI**: logging obbligatorio di ogni utilizzo di AI (POP-AI-01)
- **Multi-utente**: Titolare + Collaboratori + Committenti con ruoli e permessi differenziati
- **Area Committente**: dashboard dedicata per i clienti con tracking incarichi, documenti e pagamenti

---

## 🏗️ Architettura Tecnica

### Stack Tecnologico

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | Next.js 14 (App Router) |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Autenticazione** | NextAuth.js |
| **Pagamenti** | Stripe |
| **Storage Documenti** | QNAP NAS via MinIO (S3-compatible) |
| **Hosting** | Hetzner VPS (Ubuntu 24.04) |
| **Backup** | Hetzner Object Storage |
| **Email** | SendGrid |

### Infrastruttura

```
┌─────────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  VPS CX22 (€4.51/mese)                              │   │
│  │  - Next.js App                                       │   │
│  │  - PostgreSQL                                        │   │
│  │  - Redis (Rate limiting + WebSocket session)        │   │
│  │  - ClamAV (Antivirus documenti)                     │   │
│  │  - Nginx + SSL (Let's Encrypt)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Object Storage (€5/mese)                           │   │
│  │  - Backup database                                   │   │
│  │  - Replica documenti                                 │   │
│  │  - 📌 MIGRAZIONE: Gradualmente storage primario     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WireGuard VPN
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    QNAP TS-472XT                            │
│  - MinIO Container (API S3)                                 │
│  - Storage documenti (RAID 5)                               │
│  - Hybrid Backup Sync → Hetzner                            │
│  📌 ROADMAP: Transizione a storage secondario/backup       │
└─────────────────────────────────────────────────────────────┘
```

### 📌 Strategia Migrazione Storage (QNAP → Cloud-First)

**Fase 1 (MVP)**: QNAP primario + Hetzner Object Storage backup
**Fase 2**: Documenti nuovi → Hetzner Object Storage (primario), QNAP replica
**Fase 3**: Migrazione documenti esistenti → Hetzner Object Storage
**Fase 4**: QNAP solo backup locale + disaster recovery

**Vantaggi**:
- Riduzione dipendenza hardware locale
- Maggiore resilienza
- Accesso più veloce da VPS
- Costi contenuti (~€10-15/mese per 250GB)

---

## 👥 Sistema Ruoli e Permessi

### Gerarchia Utenti Completa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TITOLARE (Admin)                                │
│                         Ing. Romano                                     │
│  Permessi COMPLETI su tutto il sistema                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  COLLABORATORE  │      │  COLLABORATORE  │      │  COLLABORATORE  │
│     SENIOR      │      │     JUNIOR      │      │     ESTERNO     │
│                 │      │                 │      │                 │
│ Ampi permessi   │      │ Permessi        │      │ Accesso minimo  │
│ su incarichi    │      │ limitati        │      │ solo incarichi  │
│ assegnati       │      │                 │      │ specifici       │
└─────────────────┘      └─────────────────┘      └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          COMMITTENTE                                    │
│                     (Cliente esterno)                                   │
│                                                                         │
│  Accesso alla propria area riservata:                                  │
│  - Visualizza i propri incarichi                                       │
│  - Scarica documenti consegnati                                        │
│  - Paga milestone                                                       │
│  - Comunica con il tecnico                                             │
│  - Carica documenti richiesti                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Ruoli Disponibili

| Ruolo | Codice | Livello | Ambito | Descrizione |
|-------|--------|---------|--------|-------------|
| **Titolare** | `TITOLARE` | 1 | Interno | Amministratore completo, responsabile tecnico |
| **Senior** | `SENIOR` | 2 | Interno | Collaboratore con ampi permessi sugli incarichi assegnati |
| **Junior** | `JUNIOR` | 3 | Interno | Collaboratore con permessi limitati |
| **Esterno** | `ESTERNO` | 4 | Interno | Collaboratore esterno, accesso minimo |
| **Committente** | `COMMITTENTE` | 5 | Esterno | Cliente con accesso alla propria area riservata |

### Matrice Permessi Completa

| Funzionalità | Titolare | Senior | Junior | Esterno | Committente |
|--------------|:--------:|:------:|:------:|:-------:|:-----------:|
| **INCARICHI** |
| Vedere tutti gli incarichi | ✓ | ○ | ○ | ○ | ○ |
| Vedere incarichi assegnati | ✓ | ✓ | ✓ | ✓ | - |
| Vedere propri incarichi (cliente) | - | - | - | - | ✓ |
| Creare nuovo incarico | ✓ | ○ | ○ | ○ | ○ |
| Modificare incarico | ✓ | ✓* | ○ | ○ | ○ |
| Eliminare incarico | ✓ | ○ | ○ | ○ | ○ |
| Assegnare collaboratori | ✓ | ○ | ○ | ○ | ○ |
| **DOCUMENTI** |
| Vedere tutti i documenti | ✓ | ✓* | ✓* | ✓* | ○ |
| Vedere documenti consegnati | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload documenti | ✓ | ✓ | ✓ | ✓ | ○ |
| Upload documenti richiesti | - | - | - | - | ✓ |
| Modificare documenti | ✓ | ✓ | ✓** | ○ | ○ |
| Eliminare documenti | ✓ | ✓* | ○ | ○ | ○ |
| Approvare documenti | ✓ | ○ | ○ | ○ | ○ |
| Firmare documenti | ✓ | ○ | ○ | ○ | ○ |
| Consegnare al cliente | ✓ | ✓ | ○ | ○ | - |
| **PAGAMENTI** |
| Vedere fatturato globale | ✓ | ○ | ○ | ○ | ○ |
| Vedere importi incarichi | ✓ | ○ | ○ | ○ | ○ |
| Vedere propri pagamenti | - | - | - | - | ✓ |
| Gestire pagamenti | ✓ | ○ | ○ | ○ | ○ |
| Pagare milestone | - | - | - | - | ✓ |
| **MESSAGGI** |
| Inviare messaggi | ✓ | ✓ | ✓ | ○ | ✓ |
| Ricevere messaggi | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vedere tutti i messaggi | ✓ | ○ | ○ | ○ | ○ |
| **CHECK-LIST** |
| Compilare check-list | ✓ | ✓ | ✓ | ○ | ○ |
| Approvare check-list | ✓ | ○ | ○ | ○ | ○ |
| **LOG AI** |
| Registrare uso AI | ✓ | ✓ | ✓ | ✓ | ○ |
| Verificare log AI | ✓ | ○ | ○ | ○ | ○ |
| **CLIENTI** |
| Vedere anagrafica completa | ✓ | ✓ | ○ | ○ | ○ |
| Vedere/modificare propri dati | - | - | - | - | ✓ |
| Gestire clienti | ✓ | ○ | ○ | ○ | ○ |
| **SISTEMA** |
| Gestire collaboratori | ✓ | ○ | ○ | ○ | ○ |
| Configurazioni | ✓ | ○ | ○ | ○ | ○ |
| Statistiche complete | ✓ | ○ | ○ | ○ | ○ |

*Solo per incarichi assegnati
**Solo propri documenti

---

## 🏠 Area Committente (Cliente)

### Funzionalità Disponibili

1. **Dashboard personale**
   - Riepilogo incarichi attivi
   - Stato avanzamento con progress bar
   - Prossime scadenze
   - Notifiche non lette

2. **Gestione Incarichi**
   - Lista tutti gli incarichi (attivi e conclusi)
   - Dettaglio singolo incarico con timeline
   - Milestone con stato pagamento
   - Storico modifiche

3. **Documenti**
   - Download documenti consegnati
   - Upload documenti richiesti dal tecnico
   - Anteprima documenti (PDF)
   - Storico versioni

4. **Pagamenti**
   - Visualizzazione milestone da pagare
   - Pagamento diretto con Stripe
   - Storico pagamenti effettuati
   - Download ricevute

5. **Messaggistica**
   - Chat con il tecnico responsabile
   - Notifiche email per nuovi messaggi
   - Allegati nei messaggi
   - Storico conversazioni

6. **Profilo**
   - Modifica dati personali
   - Cambio password
   - Preferenze notifiche
   - Download dati (GDPR)

### Dashboard Committente

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STUDIO ING. ROMANO                                   👤 Mario Rossi ▼  │
│  Area Cliente                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Bentornato, Mario!                                                     │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ INCARICHI  │ │ DOCUMENTI   │ │  DA PAGARE  │ │  MESSAGGI   │       │
│  │   ATTIVI   │ │ DISPONIBILI │ │             │ │   NON LETTI │       │
│  │            │ │             │ │             │ │             │       │
│  │     2      │ │      8      │ │   €2.400    │ │      1      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ I TUOI INCARICHI                                                  │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 📋 INC25012 - Ristrutturazione Villa Rossi                  │  │  │
│  │  │                                                              │  │  │
│  │  │ Stato: In corso          Avanzamento: ████████░░ 80%        │  │  │
│  │  │                                                              │  │  │
│  │  │ Prossima milestone: Fine Direzione Lavori - €2.400          │  │  │
│  │  │                                                              │  │  │
│  │  │ [VEDI DETTAGLI]  [PAGA ORA]  [💬 1 nuovo messaggio]         │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

SIDEBAR COMMITTENTE:
┌──────────────────┐
│ 🏠 Dashboard     │
│ 📁 I miei incari.│
│ 📄 Documenti     │
│ 💳 Pagamenti     │
│ 💬 Messaggi (1)  │
│ 👤 Profilo       │
│ ❓ Assistenza    │
└──────────────────┘
```

### Autenticazione Committente

Il committente riceve le credenziali in due modi:

1. **Acquisto online**: Al completamento del checkout, viene creato automaticamente l'account e inviata email con link per impostare la password

2. **Incarico manuale**: Il Titolare crea il cliente e il sistema invia email di invito con link per attivare l'account

---

## 📦 I 6 Bundle Pilota

> **Nota MVP**: I bundle contrassegnati con 🚀 sono inclusi nella **Fase 1 MVP**

### 1. Ristrutturazione con Bonus (`BDL-RISTR-BONUS`) 🚀
- **Target**: Privato
- **Prezzo**: €8.000 - €18.000
- **Durata**: 6-12 mesi
- **Procedure**: POP-01, POP-02, POP-03, POP-04, POP-07
- **Milestone**: M0 (30%), M1 (35%), M2 (20%), M3 (15%)
- **Priorità MVP**: ✅ FASE 1

### 2. Due Diligence Immobiliare (`BDL-DUE-DILIGENCE`)
- **Target**: Privato/Investitore
- **Prezzo**: €1.500 - €4.000
- **Durata**: 2-4 settimane
- **Procedure**: POP-01, POP-02, POP-03, POP-07
- **Milestone**: M0 (50%), M1 (50%)
- **Priorità MVP**: ⏸️ FASE 2

### 3. Vulnerabilità Sismica (`BDL-VULN-SISMICA`) 🚀
- **Target**: Condominio/Ente/Azienda
- **Prezzo**: €5.000 - €25.000
- **Durata**: 2-4 mesi
- **Procedure**: POP-01, POP-02, POP-03, POP-07, POP-10
- **Milestone**: M0 (30%), M1 (30%), M2 (40%)
- **Priorità MVP**: ✅ FASE 1

### 4. Ampliamento Produttivo (`BDL-AMPLIAMENTO`)
- **Target**: PMI/Artigiano/Azienda Agricola
- **Prezzo**: €12.000 - €35.000
- **Durata**: 8-18 mesi
- **Procedure**: POP-01, POP-02, POP-03, POP-04, POP-05, POP-06, POP-07, POP-10
- **Milestone**: M0 (25%), M1 (30%), M2 (25%), M3 (20%)
- **Priorità MVP**: ⏸️ FASE 2

### 5. Collaudo Statico (`BDL-COLLAUDO`)
- **Target**: Impresa/Committente
- **Prezzo**: €2.500 - €12.000
- **Durata**: 1-3 mesi
- **Procedure**: POP-05, POP-07
- **Milestone**: M0 (40%), M1 (30%), M2 (30%)
- **Priorità MVP**: ⏸️ FASE 2

### 6. Antincendio (`BDL-ANTINCENDIO`) 🚀
- **Target**: Attività commerciale/Industriale
- **Prezzo**: €2.000 - €8.000
- **Durata**: 2-4 mesi
- **Procedure**: POP-01, POP-02, POP-03, POP-07
- **Milestone**: M0 (40%), M1 (40%), M2 (20%)
- **Priorità MVP**: ✅ FASE 1

---

## 📂 Procedure Operative (POP)

| Codice | Nome | Descrizione |
|--------|------|-------------|
| **POP-01** | Gestione Incarichi | Acquisizione, registrazione, archiviazione contratti |
| **POP-02** | Progettazione | Progettazione architettonica, strutturale, impiantistica |
| **POP-03** | Verifica Progetto | Check-list di controllo interno |
| **POP-04** | Direzione Lavori | Supervisione cantiere, verbali |
| **POP-05** | Collaudo | Collaudo statico, certificazioni |
| **POP-06** | Sicurezza Cantiere | CSP/CSE, PSC, fascicolo opera |
| **POP-07** | Documentazione | Pratiche edilizie, DOCFA, trasmissioni |
| **POP-08** | Non Conformità | Gestione NC e azioni correttive |
| **POP-09** | Formazione | Formazione continua personale |
| **POP-10** | Fornitori | Qualifica e valutazione fornitori |
| **POP-AI-01** | Utilizzo AI | Tracciabilità uso strumenti AI |

---

## 🗄️ Schema Database

### Diagramma Entità-Relazioni

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     utenti      │     │     ruoli       │     │    sessioni     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │────▶│ id              │     │ id              │
│ email           │     │ codice          │     │ utente_id       │
│ password_hash   │     │ nome            │     │ token_hash      │
│ nome            │     │ permessi (JSON) │     │ expires_at      │
│ cognome         │     │ livello         │     └─────────────────┘
│ ruolo_id        │◀────│ ambito          │
│ cliente_id      │     └─────────────────┘
│ attivo          │
└────────┬────────┘
         │
         │ Se ruolo=COMMITTENTE, cliente_id punta a clienti.id
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    clienti      │     │     bundle      │     │   incarichi     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │◀────│ id              │     │ id              │
│ codice          │     │ codice          │     │ codice          │
│ tipo            │     │ nome            │     │ cliente_id      │
│ ragione_sociale │     │ prezzo_min      │     │ bundle_id       │
│ email           │     │ prezzo_max      │     │ responsabile_id │
│ telefono        │     │ servizi (JSON)  │     │ oggetto         │
│ ha_accesso_port.│     │ milestone (JSON)│     │ importo_totale  │
└─────────────────┘     └─────────────────┘     │ stato           │
                                                 └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   milestone     │     │   documenti     │     │    messaggi     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ incarico_id     │     │ incarico_id     │     │ incarico_id     │
│ codice          │     │ nome_file       │     │ mittente_id     │
│ nome            │     │ path_qnap       │     │ destinatario_id │
│ percentuale     │     │ stato           │     │ testo           │
│ importo         │     │ visibile_cliente│     │ letto           │
│ stato           │     │ uploaded_by     │     │ created_at      │
│ pagato          │     └─────────────────┘     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ doc_richiesti   │     │     log_ai      │     │   audit_log     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ incarico_id     │     │ incarico_id     │     │ utente_id       │
│ nome_documento  │     │ strumento       │     │ azione          │
│ stato           │     │ utilizzato_da   │     │ entita          │
│ documento_id    │     │ verificato      │     │ entita_id       │
│ data_richiesta  │     │ verificato_da   │     │ created_at      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Nuove Tabelle per Committente

```sql
-- TABELLA: Messaggi (comunicazione cliente-tecnico)
CREATE TABLE messaggi (
    id SERIAL PRIMARY KEY,
    incarico_id INTEGER REFERENCES incarichi(id) ON DELETE CASCADE,
    mittente_id INTEGER REFERENCES utenti(id),
    destinatario_id INTEGER REFERENCES utenti(id),
    testo TEXT NOT NULL,
    allegati JSONB,
    letto BOOLEAN DEFAULT false,
    data_lettura TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABELLA: Documenti richiesti al cliente
CREATE TABLE documenti_richiesti (
    id SERIAL PRIMARY KEY,
    incarico_id INTEGER REFERENCES incarichi(id) ON DELETE CASCADE,
    nome_documento VARCHAR(255) NOT NULL,
    descrizione TEXT,
    obbligatorio BOOLEAN DEFAULT true,
    stato VARCHAR(20) DEFAULT 'richiesto',
    documento_id INTEGER REFERENCES documenti(id),
    data_richiesta TIMESTAMP DEFAULT NOW(),
    data_caricamento TIMESTAMP,
    richiesto_da INTEGER REFERENCES utenti(id)
);

-- TABELLA: Preferenze notifiche utente
CREATE TABLE preferenze_notifiche (
    id SERIAL PRIMARY KEY,
    utente_id INTEGER REFERENCES utenti(id) ON DELETE CASCADE,
    email_attivo BOOLEAN DEFAULT true,
    notifica_nuovo_documento BOOLEAN DEFAULT true,
    notifica_messaggio BOOLEAN DEFAULT true,
    notifica_richiesta_pagamento BOOLEAN DEFAULT true,
    notifica_stato_incarico BOOLEAN DEFAULT true,
    notifica_richiesta_documento BOOLEAN DEFAULT true,
    UNIQUE(utente_id)
);

-- Aggiunte a tabelle esistenti
ALTER TABLE clienti ADD COLUMN stato_accesso_portale VARCHAR(20) DEFAULT 'disabilitato' CHECK (stato_accesso_portale IN ('disabilitato', 'attivo', 'sospeso', 'in_attivazione'));
ALTER TABLE documenti ADD COLUMN visibile_cliente BOOLEAN DEFAULT false;
ALTER TABLE documenti ADD COLUMN data_consegna TIMESTAMP;
ALTER TABLE documenti ADD COLUMN mime_type VARCHAR(100);
ALTER TABLE documenti ADD COLUMN antivirus_scanned BOOLEAN DEFAULT false;
ALTER TABLE documenti ADD COLUMN antivirus_status VARCHAR(20) CHECK (antivirus_status IN ('pending', 'clean', 'infected', 'error'));
```

### Ruolo COMMITTENTE

```sql
INSERT INTO ruoli (codice, nome, descrizione, livello, ambito, permessi) VALUES
('COMMITTENTE', 'Committente', 'Cliente con accesso alla propria area riservata', 5, 'esterno', '{
    "incarichi": {"view_own": true},
    "documenti": {"view_delivered": true, "upload_requested": true},
    "economico": {"view_own_payments": true, "pay_milestone": true},
    "messaggi": {"send": true, "receive": true},
    "clienti": {"view_own": true, "update_own": true}
}'::jsonb);
```

---

## 📁 Struttura Cartelle QNAP

```
/incarichi/
└── INC25001_Rossi_Ristrutturazione_2025/
    ├── 00_Contratto_Preventivo/
    ├── 01_Dati_Base_Rilievi_Indagini/
    │   └── Documenti_Cliente/          ← Documenti caricati dal committente
    ├── 02_Progettazione/
    │   ├── 01_Modello_Calcolo/
    │   ├── 02_Elaborati_Grafici/
    │   ├── 03_Relazioni_Computi/
    │   └── 04_Log_AI/                  ← Log utilizzo AI (POP-AI-01)
    ├── 03_Direzione_Lavori/
    ├── 04_Collaudo/
    ├── 05_Corrispondenza_Email/
    ├── 06_Archivio_Definitivo/
    └── 99_Consegnati_Cliente/          ← Copia documenti consegnati
```

---

## 🔐 Autenticazione e Sicurezza

### NextAuth.js Configuration

```typescript
// JWT Payload
interface JWTPayload {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  ruolo: 'TITOLARE' | 'SENIOR' | 'JUNIOR' | 'ESTERNO' | 'COMMITTENTE';
  cliente_id?: number;  // Solo per COMMITTENTE
  permessi: Permessi;
}
```

### Protezione Route (Middleware)

```typescript
// Route pubbliche (no auth)
- /, /quiz, /bundle/*, /checkout/*, /login, /api/auth/*

// Route committente (auth: COMMITTENTE)
- /cliente/*

// Route collaboratori (auth: TITOLARE | SENIOR | JUNIOR | ESTERNO)
- /collaboratore/*

// Route admin (auth: TITOLARE only)
- /admin/*
```

### Rate Limiting

```typescript
// Implementazione con Upstash Redis + @upstash/ratelimit

// API Committente: 100 req/15min per IP/utente
app/api/cliente/* → 100 requests / 15 minutes

// API Upload documenti: 10 req/ora
app/api/cliente/documenti/upload → 10 requests / hour

// API Pagamenti: 5 req/ora
app/api/cliente/pagamenti/* → 5 requests / hour

// Libreria consigliata: next-rate-limit o Upstash Rate Limit
```

### Validazione File Upload Committente

```typescript
// Validazione MIME type + estensione
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Antivirus scan con ClamAV
// 1. Upload temporaneo
// 2. Scan con ClamAV
// 3. Se clean → QNAP, se infected → reject + log
// 4. Quarantena file sospetti

// Libreria: clamscan (npm)
```

### Flusso Autenticazione Committente

```
1. ACQUISTO ONLINE
   └── Checkout completato → Webhook Stripe
       └── Crea cliente + utente COMMITTENTE
       └── Invia email attivazione password

2. INCARICO MANUALE
   └── Titolare crea cliente con "Abilita accesso portale"
       └── Crea utente COMMITTENTE
       └── Invia email invito

3. LOGIN
   └── /login → Verifica credenziali → JWT con ruolo + cliente_id
       └── Redirect a /cliente/dashboard
```

---

## 💳 Integrazione Stripe

### Flusso Pagamento Iniziale (Checkout)
1. Cliente completa checkout
2. Redirect a Stripe
3. Webhook crea: cliente, incarico, utente COMMITTENTE, milestone M0
4. Email conferma con link attivazione account

### Flusso Pagamento Milestone Successive
1. Committente clicca "Paga" in dashboard
2. API crea Stripe Checkout Session per milestone
3. Webhook aggiorna milestone.pagato = true
4. Email conferma + notifica a Titolare

---

## 💬 Sistema Messaggistica

### Caratteristiche
- **WebSocket real-time** per aggiornamenti istantanei (Next.js + Socket.io)
- Chat tra committente e team (Titolare + collaboratori)
- Notifiche email per nuovi messaggi
- Allegati (max 10MB) con validazione MIME + antivirus scan
- Indicatore letto/non letto in tempo reale
- Typing indicators

### Implementazione Tecnica
```typescript
// WebSocket connection per messaggi real-time
// Fallback a polling ogni 30s se WebSocket non disponibile
// Server: Next.js Custom Server o Pusher/Ably per semplicità MVP
```

### Regole
- Committente scrive solo al team del proprio incarico
- Junior/Esterno possono leggere ma non rispondere (configurabile)
- Titolare vede tutti i messaggi

---

## 🤖 Tracciabilità AI (POP-AI-01)

### Requisiti
1. Ogni utilizzo AI loggato con: data, strumento, prompt, risposta, utente
2. Verifica obbligatoria da Titolare
3. Conservazione: 10 anni

### Strumenti Autorizzati
| Strumento | Tipo | Uso |
|-----------|------|-----|
| Claude, ChatGPT, Grok | Cloud | Testi non confidenziali |
| Ollama + Llama/Mistral | Locale | Dati confidenziali |

---

## 📧 Sistema Notifiche

| Tipo | Titolare | Senior | Junior | Esterno | Committente |
|------|:--------:|:------:|:------:|:-------:|:-----------:|
| Nuovo incarico acquisito | ✓ | ○ | ○ | ○ | ✓ |
| Documento consegnato | - | - | - | - | ✓ |
| Nuovo messaggio | ✓ | ✓ | ✓ | ○ | ✓ |
| Richiesta pagamento | - | - | - | - | ✓ |
| Pagamento ricevuto | ✓ | ○ | ○ | ○ | ✓ |
| Richiesta documento | - | - | - | - | ✓ |
| Documento cliente caricato | ✓ | ✓ | ○ | ○ | - |
| Cambio stato incarico | ✓ | ✓ | ✓ | ○ | ✓ |

---

## 📱 Struttura Applicazione Next.js

```
studio-erp/
├── app/
│   ├── (public)/                    # Pagine pubbliche
│   │   ├── page.tsx                 # Landing
│   │   ├── quiz/page.tsx
│   │   ├── bundle/[slug]/page.tsx
│   │   ├── checkout/...
│   │   └── login/page.tsx
│   │
│   ├── (auth)/
│   │   ├── (cliente)/               # ═══ AREA COMMITTENTE ═══
│   │   │   ├── layout.tsx           # Sidebar cliente
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── incarichi/
│   │   │   │   ├── page.tsx         # Lista
│   │   │   │   └── [codice]/
│   │   │   │       ├── page.tsx     # Dettaglio
│   │   │   │       ├── documenti/page.tsx
│   │   │   │       ├── pagamenti/page.tsx
│   │   │   │       └── messaggi/page.tsx
│   │   │   ├── documenti/page.tsx
│   │   │   ├── pagamenti/
│   │   │   │   ├── page.tsx         # Storico
│   │   │   │   └── [milestone_id]/page.tsx
│   │   │   ├── messaggi/page.tsx
│   │   │   ├── profilo/...
│   │   │   └── assistenza/page.tsx
│   │   │
│   │   ├── (collaboratore)/...      # Area collaboratori
│   │   │
│   │   └── (admin)/                 # Area Titolare
│   │       ├── clienti/
│   │       │   └── [id]/accesso/page.tsx  # Gestione accesso portale
│   │       ├── messaggi/page.tsx    # Monitoring messaggi
│   │       └── ...
│   │
│   └── api/
│       ├── cliente/                 # ═══ API COMMITTENTE ═══
│       │   ├── incarichi/...
│       │   ├── documenti/...
│       │   ├── pagamenti/...
│       │   ├── messaggi/...
│       │   └── profilo/...
│       ├── stripe/
│       │   ├── create-session/route.ts
│       │   ├── create-milestone-session/route.ts
│       │   └── webhook/route.ts
│       └── ...
│
├── components/
│   ├── cliente/                     # Componenti Committente
│   │   ├── ClienteSidebar.tsx
│   │   ├── IncaricoCard.tsx
│   │   ├── IncaricoTimeline.tsx
│   │   ├── MilestoneList.tsx
│   │   ├── PayMilestoneButton.tsx
│   │   ├── DocumentiList.tsx
│   │   ├── UploadDocumentoRichiesto.tsx
│   │   ├── ChatMessaggi.tsx
│   │   └── ProfiloForm.tsx
│   └── ...
│
├── lib/
│   ├── auth.ts
│   ├── permissions.ts
│   ├── db.ts
│   ├── stripe.ts
│   ├── qnap.ts
│   └── email.ts
│
└── middleware.ts
```

---

## 🔧 Variabili Ambiente

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/studio_erp"

# NextAuth
NEXTAUTH_URL="https://tuodominio.it"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# QNAP MinIO
MINIO_ENDPOINT="192.168.1.100"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="studio_admin"
MINIO_SECRET_KEY="your-minio-secret"
MINIO_BUCKET="documenti"

# Hetzner Object Storage
HETZNER_S3_ENDPOINT="fsn1.your-objectstorage.com"
HETZNER_S3_ACCESS_KEY="..."
HETZNER_S3_SECRET_KEY="..."
HETZNER_S3_BUCKET="studio-backup-prod"

# Email
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@tuodominio.it"

# App
NEXT_PUBLIC_APP_URL="https://tuodominio.it"
NEXT_PUBLIC_APP_NAME="Studio Ing. Romano"
```

---

## ⚠️ Note Importanti per lo Sviluppo

1. **Separazione dati committenti**: Ogni committente vede SOLO i propri incarichi. Verificare SEMPRE `incarico.cliente_id == user.cliente_id` nelle API.

2. **Consegna documenti**: Un documento è visibile al committente SOLO se `visibile_cliente = true`.

3. **Pagamenti**: Solo il committente può pagare le proprie milestone. Verificare sempre la proprietà.

4. **Messaggistica**: I messaggi sono privati tra committente e team. Non esporre ad altri clienti.

5. **Responsabilità professionale**: Solo il Titolare può firmare documenti.

6. **Tracciabilità AI**: Ogni documento con AI deve avere log in `04_Log_AI/`.

---

## 📅 Roadmap Implementazione MVP (Rivista)

### 🚀 FASE 1 - MVP Core (8-10 settimane)

**Obiettivo**: Piattaforma funzionante con 3 bundle + Area Committente completa

| Sprint | Settimane | Contenuto | Deliverable |
|--------|-----------|-----------|-------------|
| **1.1 - Infrastruttura** | 1-2 | - Setup Hetzner VPS + PostgreSQL<br>- NextAuth.js + ruoli (TITOLARE, COMMITTENTE)<br>- Rate limiting (Upstash)<br>- Database schema completo<br>- ClamAV setup | ✅ Ambiente dev/prod pronto |
| **1.2 - Frontend Pubblico** | 3-4 | - Landing page<br>- Quiz esigenze → 3 bundle<br>- Pagine bundle (BDL-RISTR-BONUS, BDL-VULN-SISMICA, BDL-ANTINCENDIO)<br>- Checkout Stripe<br>- Webhook pagamento iniziale | ✅ eCommerce pubblico funzionante |
| **1.3 - Area Committente Base** | 5-6 | - Dashboard committente<br>- Lista/Dettaglio incarichi<br>- Visualizzazione milestone<br>- Download documenti consegnati<br>- Profilo utente | ✅ Cliente vede i propri incarichi |
| **1.4 - Area Committente Avanzata** | 6-7 | - Pagamento milestone con Stripe<br>- Messaggistica WebSocket real-time<br>- Upload documenti richiesti (validazione MIME + ClamAV)<br>- Notifiche email (SendGrid)<br>- Preferenze notifiche | ✅ Area Committente completa |
| **1.5 - Backend Gestionale** | 8-9 | - Area Titolare (gestione incarichi)<br>- Creazione incarico manuale<br>- Gestione documenti (upload, consegna cliente)<br>- Monitoraggio messaggi<br>- Log AI (POP-AI-01) | ✅ Titolare gestisce incarichi |
| **1.6 - Testing & Go-live** | 10 | - Test E2E (Playwright)<br>- Security audit<br>- Performance optimization<br>- Backup automatici<br>- Monitoring (Sentry/Uptime) | 🎯 **MVP IN PRODUZIONE** |

**Scope Fase 1**:
- ✅ 3 Bundle: Ristrutturazione, Vulnerabilità Sismica, Antincendio
- ✅ Ruoli: TITOLARE + COMMITTENTE
- ✅ Area Committente: tutte le funzionalità (dashboard, incarichi, documenti, pagamenti, messaggi, profilo)
- ✅ Checkout online funzionante
- ✅ Gestione incarichi manuali da Titolare
- ✅ Messaggistica real-time
- ✅ File upload sicuri (MIME + ClamAV)
- ✅ Rate limiting API committente
- ⏸️ NON inclusi: ruoli SENIOR/JUNIOR/ESTERNO, altri 3 bundle, check-list, fornitori

---

### 📦 FASE 2 - Espansione Bundle (4-6 settimane)

**Obiettivo**: Aggiungere i restanti 3 bundle + ottimizzazioni

| Sprint | Contenuto |
|--------|-----------|
| **2.1** | - Bundle: Due Diligence Immobiliare<br>- Bundle: Ampliamento Produttivo<br>- Bundle: Collaudo Statico |
| **2.2** | - Ottimizzazione quiz esigenze (ML suggestion bundle)<br>- Analytics dashboard Titolare (fatturato, conversion)<br>- Reportistica incarichi (export Excel/PDF) |
| **2.3** | - Migrazione storage: nuovi documenti → Hetzner Object Storage<br>- QNAP diventa storage secondario<br>- Testing carico bundle complessi |

**Scope Fase 2**:
- ✅ Tutti e 6 i bundle disponibili
- ✅ Analytics per Titolare
- ✅ Migrazione storage verso cloud-first
- ⏸️ NON inclusi: collaboratori, check-list avanzate

---

### 👥 FASE 3 - Area Collaboratori (6-8 settimane)

**Obiettivo**: Sistema multi-utente completo con tutti i ruoli

| Sprint | Contenuto |
|--------|-----------|
| **3.1** | - Ruoli: SENIOR, JUNIOR, ESTERNO<br>- Matrice permessi completa<br>- Assegnazione collaboratori a incarichi<br>- Area collaboratore (dashboard, incarichi assegnati) |
| **3.2** | - Check-list progetto (POP-03)<br>- Workflow approvazioni documenti<br>- Firma digitale documenti (Titolare)<br>- Gestione non conformità (POP-08) |
| **3.3** | - Gestione fornitori (POP-10)<br>- Formazione collaboratori (POP-09)<br>- Audit log esteso<br>- Reportistica compliance ISO 9001/27001 |
| **3.4** | - Testing multi-utente<br>- Performance optimization<br>- Security hardening<br>- Documentazione utente |

**Scope Fase 3**:
- ✅ Sistema completo con tutti i ruoli
- ✅ Workflow ISO 9001/27001 completo
- ✅ Check-list e approvazioni
- ✅ Gestione fornitori e formazione

---

## 📊 Milestone di Lancio

| Milestone | Data Target | Criterio Successo |
|-----------|-------------|-------------------|
| **M1 - MVP Live** | Fine Settimana 10 | 1° incarico reale pagato online |
| **M2 - 10 Clienti** | +4 settimane | 10 committenti attivi con accesso portale |
| **M3 - All Bundles** | +10 settimane | Tutti e 6 i bundle disponibili |
| **M4 - Multi-utente** | +18 settimane | 1° collaboratore operativo nel sistema |

---

## 🎯 Metriche di Successo MVP (Fase 1)

- ✅ Almeno 1 incarico venduto online al mese
- ✅ Tasso conversione quiz → checkout > 15%
- ✅ NPS committenti > 50
- ✅ Uptime > 99%
- ✅ Tempo risposta API < 500ms (p95)
- ✅ Zero vulnerabilità critiche (security scan)

---

## 🆘 Troubleshooting

### Committente non vede documenti
```typescript
// Verificare visibile_cliente = true E cliente_id corretto
const doc = await prisma.documenti.findFirst({
  where: {
    id: documentoId,
    visibile_cliente: true,
    incarico: { cliente_id: user.cliente_id }
  }
});
```

### Errore pagamento milestone
```typescript
// Verificare proprietà + non già pagata
const milestone = await prisma.milestone.findFirst({
  where: {
    id: milestoneId,
    incarico: { cliente_id: user.cliente_id },
    pagato: false
  }
});
```

---

---

## 📋 Checklist Decisioni Tecniche Implementate

- [x] **Database**: ENUM per stato_accesso_portale (disabilitato/attivo/sospeso/in_attivazione)
- [x] **Messaggistica**: WebSocket real-time con fallback polling
- [x] **File Upload**: Validazione MIME + ClamAV antivirus scan obbligatorio
- [x] **Security**: Rate limiting API committente (100 req/15min)
- [x] **Storage**: Migrazione graduale QNAP → Hetzner Object Storage (cloud-first)
- [x] **Roadmap**: 3 fasi (MVP ridotto → Bundle completi → Collaboratori)

---

*Ultimo aggiornamento: Dicembre 2025*
*Versione: MVP 1.0 - Roadmap Ottimizzata*
*Focus: Time-to-Market ridotto con scope essenziale*
