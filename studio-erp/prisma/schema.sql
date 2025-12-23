-- Studio ERP Database Schema
-- Generato da Prisma Schema

-- ========================================
-- RUOLI
-- ========================================
CREATE TABLE IF NOT EXISTS "ruoli" (
    "id" SERIAL PRIMARY KEY,
    "codice" VARCHAR(50) UNIQUE NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descrizione" TEXT,
    "livello" INTEGER NOT NULL,
    "ambito" VARCHAR(50) NOT NULL,
    "permessi" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ========================================
-- UTENTI
-- ========================================
CREATE TABLE IF NOT EXISTS "utenti" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cognome" VARCHAR(255) NOT NULL,
    "ruolo_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "attivo" BOOLEAN DEFAULT true NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "utenti_ruolo_fkey" FOREIGN KEY ("ruolo_id") REFERENCES "ruoli"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "utenti_email_idx" ON "utenti"("email");
CREATE INDEX "utenti_ruolo_id_idx" ON "utenti"("ruolo_id");
CREATE INDEX "utenti_cliente_id_idx" ON "utenti"("cliente_id");

-- ========================================
-- NEXTAUTH TABLES
-- ========================================
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "provider_account_id" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(255),
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" VARCHAR(255),
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "accounts_provider_provider_account_id_key" UNIQUE ("provider", "provider_account_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" SERIAL PRIMARY KEY,
    "session_token" VARCHAR(255) UNIQUE NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE ("identifier", "token")
);

-- ========================================
-- CLIENTI
-- ========================================
CREATE TABLE IF NOT EXISTS "clienti" (
    "id" SERIAL PRIMARY KEY,
    "codice" VARCHAR(50) UNIQUE NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "ragione_sociale" VARCHAR(255),
    "nome" VARCHAR(255),
    "cognome" VARCHAR(255),
    "codice_fiscale" VARCHAR(16) UNIQUE,
    "partita_iva" VARCHAR(11) UNIQUE,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(50),
    "indirizzo" TEXT,
    "citta" VARCHAR(255),
    "provincia" VARCHAR(2),
    "cap" VARCHAR(10),
    "stato_accesso_portale" VARCHAR(20) DEFAULT 'disabilitato' NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "clienti_email_idx" ON "clienti"("email");
CREATE INDEX "clienti_codice_fiscale_idx" ON "clienti"("codice_fiscale");
CREATE INDEX "clienti_partita_iva_idx" ON "clienti"("partita_iva");

-- Aggiungi foreign key mancante da utenti a clienti
ALTER TABLE "utenti" ADD CONSTRAINT "utenti_cliente_fkey"
    FOREIGN KEY ("cliente_id") REFERENCES "clienti"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================
-- BUNDLE
-- ========================================
CREATE TABLE IF NOT EXISTS "bundle" (
    "id" SERIAL PRIMARY KEY,
    "codice" VARCHAR(50) UNIQUE NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descrizione" TEXT,
    "target" VARCHAR(100) NOT NULL,
    "prezzo_min" DECIMAL(10,2) NOT NULL,
    "prezzo_max" DECIMAL(10,2) NOT NULL,
    "durata_mesi" INTEGER NOT NULL,
    "servizi" JSONB NOT NULL,
    "procedure" JSONB NOT NULL,
    "milestone" JSONB NOT NULL,
    "attivo" BOOLEAN DEFAULT true NOT NULL,
    "fase_mvp" INTEGER DEFAULT 2 NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ========================================
-- INCARICHI
-- ========================================
CREATE TYPE "StatoIncarico" AS ENUM ('BOZZA', 'ATTIVO', 'IN_CORSO', 'SOSPESO', 'COMPLETATO', 'ANNULLATO');

CREATE TABLE IF NOT EXISTS "incarichi" (
    "id" SERIAL PRIMARY KEY,
    "codice" VARCHAR(50) UNIQUE NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "bundle_id" INTEGER,
    "responsabile_id" INTEGER NOT NULL,
    "oggetto" VARCHAR(500) NOT NULL,
    "descrizione" TEXT,
    "importo_totale" DECIMAL(10,2) NOT NULL,
    "stato" "StatoIncarico" DEFAULT 'BOZZA' NOT NULL,
    "data_inizio" TIMESTAMP(3),
    "data_fine" TIMESTAMP(3),
    "data_scadenza" TIMESTAMP(3),
    "priorita" VARCHAR(20) DEFAULT 'normale' NOT NULL,
    "note" TEXT,
    "metadati" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "incarichi_cliente_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clienti"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "incarichi_bundle_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "incarichi_responsabile_fkey" FOREIGN KEY ("responsabile_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "incarichi_cliente_id_idx" ON "incarichi"("cliente_id");
CREATE INDEX "incarichi_responsabile_id_idx" ON "incarichi"("responsabile_id");
CREATE INDEX "incarichi_stato_idx" ON "incarichi"("stato");
CREATE INDEX "incarichi_data_inizio_idx" ON "incarichi"("data_inizio");

-- ========================================
-- MILESTONE
-- ========================================
CREATE TYPE "StatoMilestone" AS ENUM ('NON_PAGATO', 'PAGATO', 'RIMBORSATO');

CREATE TABLE IF NOT EXISTS "milestone" (
    "id" SERIAL PRIMARY KEY,
    "incarico_id" INTEGER NOT NULL,
    "codice" VARCHAR(10) NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "descrizione" TEXT,
    "percentuale" DECIMAL(5,2) NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "stato" "StatoMilestone" DEFAULT 'NON_PAGATO' NOT NULL,
    "data_scadenza" TIMESTAMP(3),
    "data_pagamento" TIMESTAMP(3),
    "stripe_payment_id" VARCHAR(255),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "milestone_incarico_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "milestone_incarico_id_codice_key" UNIQUE ("incarico_id", "codice")
);

CREATE INDEX "milestone_incarico_id_idx" ON "milestone"("incarico_id");
CREATE INDEX "milestone_stato_idx" ON "milestone"("stato");

-- ========================================
-- DOCUMENTI
-- ========================================
CREATE TYPE "StatoDocumento" AS ENUM ('BOZZA', 'IN_LAVORAZIONE', 'IN_VERIFICA', 'APPROVATO', 'CONSEGNATO', 'ARCHIVIATO');

CREATE TABLE IF NOT EXISTS "documenti" (
    "id" SERIAL PRIMARY KEY,
    "incarico_id" INTEGER NOT NULL,
    "nome_file" VARCHAR(500) NOT NULL,
    "path_storage" TEXT NOT NULL,
    "mime_type" VARCHAR(100),
    "dimensione" BIGINT,
    "categoria" VARCHAR(100),
    "versione" INTEGER DEFAULT 1 NOT NULL,
    "stato" "StatoDocumento" DEFAULT 'BOZZA' NOT NULL,
    "visibile_cliente" BOOLEAN DEFAULT false NOT NULL,
    "data_consegna" TIMESTAMP(3),
    "antivirus_scanned" BOOLEAN DEFAULT false NOT NULL,
    "antivirus_status" VARCHAR(20),
    "uploaded_by" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "documenti_incarico_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documenti_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "documenti_incarico_id_idx" ON "documenti"("incarico_id");
CREATE INDEX "documenti_visibile_cliente_idx" ON "documenti"("visibile_cliente");
CREATE INDEX "documenti_stato_idx" ON "documenti"("stato");

-- ========================================
-- DOCUMENTI RICHIESTI
-- ========================================
CREATE TYPE "StatoDocumentoRichiesto" AS ENUM ('RICHIESTO', 'CARICATO', 'APPROVATO', 'RIFIUTATO');

CREATE TABLE IF NOT EXISTS "documenti_richiesti" (
    "id" SERIAL PRIMARY KEY,
    "incarico_id" INTEGER NOT NULL,
    "nome_documento" VARCHAR(255) NOT NULL,
    "descrizione" TEXT,
    "obbligatorio" BOOLEAN DEFAULT true NOT NULL,
    "stato" "StatoDocumentoRichiesto" DEFAULT 'RICHIESTO' NOT NULL,
    "documento_id" INTEGER,
    "data_richiesta" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "data_caricamento" TIMESTAMP(3),
    "richiesto_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "documenti_richiesti_incarico_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documenti_richiesti_documento_fkey" FOREIGN KEY ("documento_id") REFERENCES "documenti"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "documenti_richiesti_richiesto_by_fkey" FOREIGN KEY ("richiesto_by") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "documenti_richiesti_incarico_id_idx" ON "documenti_richiesti"("incarico_id");
CREATE INDEX "documenti_richiesti_stato_idx" ON "documenti_richiesti"("stato");

-- ========================================
-- MESSAGGI
-- ========================================
CREATE TABLE IF NOT EXISTS "messaggi" (
    "id" SERIAL PRIMARY KEY,
    "incarico_id" INTEGER NOT NULL,
    "mittente_id" INTEGER NOT NULL,
    "destinatario_id" INTEGER,
    "testo" TEXT NOT NULL,
    "allegati" JSONB,
    "letto" BOOLEAN DEFAULT false NOT NULL,
    "data_lettura" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "messaggi_incarico_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messaggi_mittente_fkey" FOREIGN KEY ("mittente_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "messaggi_destinatario_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "utenti"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "messaggi_incarico_id_idx" ON "messaggi"("incarico_id");
CREATE INDEX "messaggi_mittente_id_idx" ON "messaggi"("mittente_id");
CREATE INDEX "messaggi_destinatario_id_idx" ON "messaggi"("destinatario_id");
CREATE INDEX "messaggi_letto_idx" ON "messaggi"("letto");

-- ========================================
-- LOG AI
-- ========================================
CREATE TABLE IF NOT EXISTS "log_ai" (
    "id" SERIAL PRIMARY KEY,
    "incarico_id" INTEGER,
    "strumento" VARCHAR(100) NOT NULL,
    "modello" VARCHAR(100),
    "prompt" TEXT NOT NULL,
    "risposta" TEXT NOT NULL,
    "utilizzato_da" INTEGER NOT NULL,
    "verificato" BOOLEAN DEFAULT false NOT NULL,
    "verificato_da" INTEGER,
    "data_verifica" TIMESTAMP(3),
    "contesto" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "log_ai_incarico_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "log_ai_utilizzato_da_fkey" FOREIGN KEY ("utilizzato_da") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "log_ai_incarico_id_idx" ON "log_ai"("incarico_id");
CREATE INDEX "log_ai_utilizzato_da_idx" ON "log_ai"("utilizzato_da");
CREATE INDEX "log_ai_verificato_idx" ON "log_ai"("verificato");

-- ========================================
-- AUDIT LOG
-- ========================================
CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" SERIAL PRIMARY KEY,
    "utente_id" INTEGER NOT NULL,
    "azione" VARCHAR(50) NOT NULL,
    "entita" VARCHAR(100) NOT NULL,
    "entita_id" INTEGER NOT NULL,
    "dettagli" JSONB,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "audit_log_utente_fkey" FOREIGN KEY ("utente_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "audit_log_utente_id_idx" ON "audit_log"("utente_id");
CREATE INDEX "audit_log_entita_entita_id_idx" ON "audit_log"("entita", "entita_id");
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- ========================================
-- PREFERENZE NOTIFICHE
-- ========================================
CREATE TABLE IF NOT EXISTS "preferenze_notifiche" (
    "id" SERIAL PRIMARY KEY,
    "utente_id" INTEGER UNIQUE NOT NULL,
    "email_attivo" BOOLEAN DEFAULT true NOT NULL,
    "notifica_nuovo_documento" BOOLEAN DEFAULT true NOT NULL,
    "notifica_messaggio" BOOLEAN DEFAULT true NOT NULL,
    "notifica_richiesta_pagamento" BOOLEAN DEFAULT true NOT NULL,
    "notifica_stato_incarico" BOOLEAN DEFAULT true NOT NULL,
    "notifica_richiesta_documento" BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT "preferenze_notifiche_utente_fkey" FOREIGN KEY ("utente_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- TRIGGERS per updatedAt
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ruoli_updated_at BEFORE UPDATE ON "ruoli" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_utenti_updated_at BEFORE UPDATE ON "utenti" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clienti_updated_at BEFORE UPDATE ON "clienti" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bundle_updated_at BEFORE UPDATE ON "bundle" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incarichi_updated_at BEFORE UPDATE ON "incarichi" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestone_updated_at BEFORE UPDATE ON "milestone" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documenti_updated_at BEFORE UPDATE ON "documenti" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documenti_richiesti_updated_at BEFORE UPDATE ON "documenti_richiesti" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
