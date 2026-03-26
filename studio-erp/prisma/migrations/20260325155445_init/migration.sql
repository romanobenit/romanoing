-- CreateEnum
CREATE TYPE "StatoIncarico" AS ENUM ('BOZZA', 'ATTIVO', 'IN_CORSO', 'SOSPESO', 'COMPLETATO', 'ANNULLATO');

-- CreateEnum
CREATE TYPE "StatoMilestone" AS ENUM ('NON_PAGATO', 'PAGATO', 'RIMBORSATO');

-- CreateEnum
CREATE TYPE "StatoDocumento" AS ENUM ('BOZZA', 'IN_LAVORAZIONE', 'IN_VERIFICA', 'APPROVATO', 'CONSEGNATO', 'ARCHIVIATO');

-- CreateEnum
CREATE TYPE "StatoDocumentoRichiesto" AS ENUM ('RICHIESTO', 'CARICATO', 'APPROVATO', 'RIFIUTATO');

-- CreateTable
CREATE TABLE "ruoli" (
    "id" SERIAL NOT NULL,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "livello" INTEGER NOT NULL,
    "ambito" TEXT NOT NULL,
    "permessi" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruoli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utenti" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "ruolo_id" INTEGER NOT NULL,
    "cliente_id" INTEGER,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utenti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "clienti" (
    "id" SERIAL NOT NULL,
    "codice" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ragione_sociale" TEXT,
    "nome" TEXT,
    "cognome" TEXT,
    "codice_fiscale" TEXT,
    "partita_iva" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "indirizzo" TEXT,
    "citta" TEXT,
    "provincia" TEXT,
    "cap" TEXT,
    "stato_accesso_portale" TEXT NOT NULL DEFAULT 'disabilitato',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clienti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle" (
    "id" SERIAL NOT NULL,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "target" TEXT NOT NULL,
    "prezzo_min" DECIMAL(10,2) NOT NULL,
    "prezzo_max" DECIMAL(10,2) NOT NULL,
    "durata_mesi" INTEGER NOT NULL,
    "servizi" JSONB NOT NULL,
    "procedure" JSONB NOT NULL,
    "milestone" JSONB NOT NULL,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "fase_mvp" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incarichi" (
    "id" SERIAL NOT NULL,
    "codice" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "bundle_id" INTEGER,
    "responsabile_id" INTEGER NOT NULL,
    "oggetto" TEXT NOT NULL,
    "descrizione" TEXT,
    "importo_totale" DECIMAL(10,2) NOT NULL,
    "stato" "StatoIncarico" NOT NULL DEFAULT 'BOZZA',
    "data_inizio" TIMESTAMP(3),
    "data_fine" TIMESTAMP(3),
    "data_scadenza" TIMESTAMP(3),
    "priorita" TEXT NOT NULL DEFAULT 'normale',
    "note" TEXT,
    "metadati" JSONB,
    "tipo" TEXT NOT NULL DEFAULT 'progetto',
    "offerta_id" INTEGER,
    "sla_scadenza" TIMESTAMP(3),
    "sessione_quiz_id" INTEGER,
    "sla_alert_inviato" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incarichi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestone" (
    "id" SERIAL NOT NULL,
    "incarico_id" INTEGER NOT NULL,
    "codice" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descrizione" TEXT,
    "percentuale" DECIMAL(5,2) NOT NULL,
    "importo" DECIMAL(10,2) NOT NULL,
    "stato" "StatoMilestone" NOT NULL DEFAULT 'NON_PAGATO',
    "data_scadenza" TIMESTAMP(3),
    "data_pagamento" TIMESTAMP(3),
    "stripe_payment_id" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documenti" (
    "id" SERIAL NOT NULL,
    "incarico_id" INTEGER NOT NULL,
    "nome_file" TEXT NOT NULL,
    "path_storage" TEXT NOT NULL,
    "mime_type" TEXT,
    "dimensione" BIGINT,
    "categoria" TEXT,
    "versione" INTEGER NOT NULL DEFAULT 1,
    "stato" "StatoDocumento" NOT NULL DEFAULT 'BOZZA',
    "visibile_cliente" BOOLEAN NOT NULL DEFAULT false,
    "data_consegna" TIMESTAMP(3),
    "antivirus_scanned" BOOLEAN NOT NULL DEFAULT false,
    "antivirus_status" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documenti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documenti_richiesti" (
    "id" SERIAL NOT NULL,
    "incarico_id" INTEGER NOT NULL,
    "nome_documento" TEXT NOT NULL,
    "descrizione" TEXT,
    "obbligatorio" BOOLEAN NOT NULL DEFAULT true,
    "stato" "StatoDocumentoRichiesto" NOT NULL DEFAULT 'RICHIESTO',
    "documento_id" INTEGER,
    "data_richiesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_caricamento" TIMESTAMP(3),
    "richiesto_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documenti_richiesti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messaggi" (
    "id" SERIAL NOT NULL,
    "incarico_id" INTEGER NOT NULL,
    "mittente_id" INTEGER NOT NULL,
    "destinatario_id" INTEGER,
    "testo" TEXT NOT NULL,
    "allegati" JSONB,
    "letto" BOOLEAN NOT NULL DEFAULT false,
    "data_lettura" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messaggi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_ai" (
    "id" SERIAL NOT NULL,
    "incarico_id" INTEGER,
    "strumento" TEXT NOT NULL,
    "modello" TEXT,
    "modello_versione" TEXT,
    "ai_system_id" INTEGER,
    "prompt" TEXT NOT NULL,
    "risposta" TEXT NOT NULL,
    "utilizzato_da" INTEGER NOT NULL,
    "verificato" BOOLEAN NOT NULL DEFAULT false,
    "verificato_da" INTEGER,
    "data_verifica" TIMESTAMP(3),
    "contesto" TEXT,
    "uso_previsto" TEXT,
    "rischio_livello" TEXT NOT NULL DEFAULT 'BASSO',
    "pii_rilevata" BOOLEAN NOT NULL DEFAULT false,
    "revisione_urgente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_ai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "utente_id" INTEGER NOT NULL,
    "azione" TEXT NOT NULL,
    "entita" TEXT NOT NULL,
    "entita_id" INTEGER NOT NULL,
    "dettagli" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferenze_notifiche" (
    "id" SERIAL NOT NULL,
    "utente_id" INTEGER NOT NULL,
    "email_attivo" BOOLEAN NOT NULL DEFAULT true,
    "notifica_nuovo_documento" BOOLEAN NOT NULL DEFAULT true,
    "notifica_messaggio" BOOLEAN NOT NULL DEFAULT true,
    "notifica_richiesta_pagamento" BOOLEAN NOT NULL DEFAULT true,
    "notifica_stato_incarico" BOOLEAN NOT NULL DEFAULT true,
    "notifica_richiesta_documento" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "preferenze_notifiche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessioni_quiz" (
    "id" SERIAL NOT NULL,
    "session_token" TEXT NOT NULL,
    "soggetto_tipo" TEXT,
    "nome" TEXT,
    "email" TEXT,
    "brief" JSONB,
    "quadro_normativo" JSONB,
    "routing" TEXT,
    "routing_motivo" TEXT,
    "stato" TEXT NOT NULL DEFAULT 'in_corso',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessioni_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerte_calcolate" (
    "id" SERIAL NOT NULL,
    "sessione_id" INTEGER NOT NULL,
    "tipo_erogazione" TEXT NOT NULL,
    "titolo_servizio" TEXT,
    "descrizione_deliverable" TEXT,
    "prezzo_base_centesimi" INTEGER,
    "adeguamenti" JSONB,
    "prezzo_finale_centesimi" INTEGER NOT NULL,
    "rationale_pricing" JSONB,
    "sla_ore" INTEGER,
    "avviso" TEXT,
    "accettata" BOOLEAN NOT NULL DEFAULT false,
    "stripe_payment_intent_id" TEXT,
    "stripe_session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offerte_calcolate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_preventivi" (
    "id" SERIAL NOT NULL,
    "sessione_id" INTEGER,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "brief" JSONB,
    "quadro_normativo" JSONB,
    "note_aggiuntive" TEXT,
    "documenti_allegati" JSONB,
    "stato" TEXT NOT NULL DEFAULT 'nuovo',
    "assegnato_a" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_preventivi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_systems" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "fornitore" TEXT,
    "modello_versione" TEXT,
    "tipo" TEXT,
    "uso_previsto" TEXT,
    "classificazione_rischio" TEXT NOT NULL DEFAULT 'BASSO',
    "trattamento_dati_extra_ue" BOOLEAN NOT NULL DEFAULT false,
    "valutazione_fornitore" JSONB,
    "data_ultima_revisione" TIMESTAMP(3),
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nonconformita_ai" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT,
    "descrizione" TEXT NOT NULL,
    "log_ai_id" INTEGER,
    "rilevato_da" INTEGER,
    "data_rilevamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azione_correttiva" TEXT,
    "stato" TEXT NOT NULL DEFAULT 'aperta',
    "data_chiusura" TIMESTAMP(3),
    "chiuso_da" INTEGER,

    CONSTRAINT "nonconformita_ai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ruoli_codice_key" ON "ruoli"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "utenti_email_key" ON "utenti"("email");

-- CreateIndex
CREATE INDEX "utenti_email_idx" ON "utenti"("email");

-- CreateIndex
CREATE INDEX "utenti_ruolo_id_idx" ON "utenti"("ruolo_id");

-- CreateIndex
CREATE INDEX "utenti_cliente_id_idx" ON "utenti"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "clienti_codice_key" ON "clienti"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "clienti_codice_fiscale_key" ON "clienti"("codice_fiscale");

-- CreateIndex
CREATE UNIQUE INDEX "clienti_partita_iva_key" ON "clienti"("partita_iva");

-- CreateIndex
CREATE INDEX "clienti_email_idx" ON "clienti"("email");

-- CreateIndex
CREATE INDEX "clienti_codice_fiscale_idx" ON "clienti"("codice_fiscale");

-- CreateIndex
CREATE INDEX "clienti_partita_iva_idx" ON "clienti"("partita_iva");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_codice_key" ON "bundle"("codice");

-- CreateIndex
CREATE UNIQUE INDEX "incarichi_codice_key" ON "incarichi"("codice");

-- CreateIndex
CREATE INDEX "incarichi_cliente_id_idx" ON "incarichi"("cliente_id");

-- CreateIndex
CREATE INDEX "incarichi_responsabile_id_idx" ON "incarichi"("responsabile_id");

-- CreateIndex
CREATE INDEX "incarichi_stato_idx" ON "incarichi"("stato");

-- CreateIndex
CREATE INDEX "incarichi_data_inizio_idx" ON "incarichi"("data_inizio");

-- CreateIndex
CREATE INDEX "milestone_incarico_id_idx" ON "milestone"("incarico_id");

-- CreateIndex
CREATE INDEX "milestone_stato_idx" ON "milestone"("stato");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_incarico_id_codice_key" ON "milestone"("incarico_id", "codice");

-- CreateIndex
CREATE INDEX "documenti_incarico_id_idx" ON "documenti"("incarico_id");

-- CreateIndex
CREATE INDEX "documenti_visibile_cliente_idx" ON "documenti"("visibile_cliente");

-- CreateIndex
CREATE INDEX "documenti_stato_idx" ON "documenti"("stato");

-- CreateIndex
CREATE INDEX "documenti_richiesti_incarico_id_idx" ON "documenti_richiesti"("incarico_id");

-- CreateIndex
CREATE INDEX "documenti_richiesti_stato_idx" ON "documenti_richiesti"("stato");

-- CreateIndex
CREATE INDEX "messaggi_incarico_id_idx" ON "messaggi"("incarico_id");

-- CreateIndex
CREATE INDEX "messaggi_mittente_id_idx" ON "messaggi"("mittente_id");

-- CreateIndex
CREATE INDEX "messaggi_destinatario_id_idx" ON "messaggi"("destinatario_id");

-- CreateIndex
CREATE INDEX "messaggi_letto_idx" ON "messaggi"("letto");

-- CreateIndex
CREATE INDEX "log_ai_incarico_id_idx" ON "log_ai"("incarico_id");

-- CreateIndex
CREATE INDEX "log_ai_utilizzato_da_idx" ON "log_ai"("utilizzato_da");

-- CreateIndex
CREATE INDEX "log_ai_verificato_idx" ON "log_ai"("verificato");

-- CreateIndex
CREATE INDEX "audit_log_utente_id_idx" ON "audit_log"("utente_id");

-- CreateIndex
CREATE INDEX "audit_log_entita_entita_id_idx" ON "audit_log"("entita", "entita_id");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "preferenze_notifiche_utente_id_key" ON "preferenze_notifiche"("utente_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessioni_quiz_session_token_key" ON "sessioni_quiz"("session_token");

-- CreateIndex
CREATE INDEX "sessioni_quiz_session_token_idx" ON "sessioni_quiz"("session_token");

-- CreateIndex
CREATE INDEX "sessioni_quiz_email_idx" ON "sessioni_quiz"("email");

-- CreateIndex
CREATE INDEX "sessioni_quiz_stato_idx" ON "sessioni_quiz"("stato");

-- CreateIndex
CREATE INDEX "offerte_calcolate_sessione_id_idx" ON "offerte_calcolate"("sessione_id");

-- CreateIndex
CREATE INDEX "lead_preventivi_email_idx" ON "lead_preventivi"("email");

-- CreateIndex
CREATE INDEX "lead_preventivi_stato_idx" ON "lead_preventivi"("stato");

-- CreateIndex
CREATE INDEX "nonconformita_ai_stato_idx" ON "nonconformita_ai"("stato");

-- AddForeignKey
ALTER TABLE "utenti" ADD CONSTRAINT "utenti_ruolo_id_fkey" FOREIGN KEY ("ruolo_id") REFERENCES "ruoli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utenti" ADD CONSTRAINT "utenti_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clienti"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incarichi" ADD CONSTRAINT "incarichi_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clienti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incarichi" ADD CONSTRAINT "incarichi_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incarichi" ADD CONSTRAINT "incarichi_responsabile_id_fkey" FOREIGN KEY ("responsabile_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incarichi" ADD CONSTRAINT "incarichi_offerta_id_fkey" FOREIGN KEY ("offerta_id") REFERENCES "offerte_calcolate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incarichi" ADD CONSTRAINT "incarichi_sessione_quiz_id_fkey" FOREIGN KEY ("sessione_quiz_id") REFERENCES "sessioni_quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_incarico_id_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documenti" ADD CONSTRAINT "documenti_incarico_id_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documenti" ADD CONSTRAINT "documenti_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documenti_richiesti" ADD CONSTRAINT "documenti_richiesti_incarico_id_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documenti_richiesti" ADD CONSTRAINT "documenti_richiesti_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documenti"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documenti_richiesti" ADD CONSTRAINT "documenti_richiesti_richiesto_by_fkey" FOREIGN KEY ("richiesto_by") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaggi" ADD CONSTRAINT "messaggi_incarico_id_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaggi" ADD CONSTRAINT "messaggi_mittente_id_fkey" FOREIGN KEY ("mittente_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messaggi" ADD CONSTRAINT "messaggi_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "utenti"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_ai" ADD CONSTRAINT "log_ai_incarico_id_fkey" FOREIGN KEY ("incarico_id") REFERENCES "incarichi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_ai" ADD CONSTRAINT "log_ai_utilizzato_da_fkey" FOREIGN KEY ("utilizzato_da") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_ai" ADD CONSTRAINT "log_ai_ai_system_id_fkey" FOREIGN KEY ("ai_system_id") REFERENCES "ai_systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_utente_id_fkey" FOREIGN KEY ("utente_id") REFERENCES "utenti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preferenze_notifiche" ADD CONSTRAINT "preferenze_notifiche_utente_id_fkey" FOREIGN KEY ("utente_id") REFERENCES "utenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerte_calcolate" ADD CONSTRAINT "offerte_calcolate_sessione_id_fkey" FOREIGN KEY ("sessione_id") REFERENCES "sessioni_quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_preventivi" ADD CONSTRAINT "lead_preventivi_sessione_id_fkey" FOREIGN KEY ("sessione_id") REFERENCES "sessioni_quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nonconformita_ai" ADD CONSTRAINT "nonconformita_ai_log_ai_id_fkey" FOREIGN KEY ("log_ai_id") REFERENCES "log_ai"("id") ON DELETE SET NULL ON UPDATE CASCADE;
