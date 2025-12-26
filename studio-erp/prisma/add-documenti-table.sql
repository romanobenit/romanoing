-- Migrazione: Aggiunge tabella documenti per Sprint 2.2
-- Esegui con: psql -U studio_user -d studio_erp -f prisma/add-documenti-table.sql

-- Crea tabella documenti se non esiste
CREATE TABLE IF NOT EXISTS documenti (
  id SERIAL PRIMARY KEY,
  incarico_id INT NOT NULL REFERENCES incarichi(id) ON DELETE CASCADE,
  nome_file VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descrizione TEXT,
  versione INT DEFAULT 1,
  stato VARCHAR(50) DEFAULT 'BOZZA',
  dimensione BIGINT NOT NULL,
  path_storage VARCHAR(500) NOT NULL,
  visibile_cliente BOOLEAN DEFAULT false,
  note TEXT,
  created_by INT NOT NULL REFERENCES utenti(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_documenti_incarico ON documenti(incarico_id);
CREATE INDEX IF NOT EXISTS idx_documenti_categoria ON documenti(categoria);
CREATE INDEX IF NOT EXISTS idx_documenti_stato ON documenti(stato);
CREATE INDEX IF NOT EXISTS idx_documenti_created_by ON documenti(created_by);
CREATE INDEX IF NOT EXISTS idx_documenti_visibile_cliente ON documenti(visibile_cliente);

-- Indice composito per ricerca versioni dello stesso documento
CREATE INDEX IF NOT EXISTS idx_documenti_nome_file_incarico
  ON documenti(nome_file, incarico_id, versione DESC);

-- Trigger per aggiornare updatedAt
CREATE OR REPLACE FUNCTION update_documenti_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documenti_updated_at ON documenti;
CREATE TRIGGER documenti_updated_at
BEFORE UPDATE ON documenti
FOR EACH ROW
EXECUTE FUNCTION update_documenti_updated_at();

-- Aggiungi constraint per categorie valide
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documenti_categoria_check'
  ) THEN
    ALTER TABLE documenti
    ADD CONSTRAINT documenti_categoria_check
    CHECK (categoria IN ('elaborato', 'relazione', 'planimetria', 'computo', 'pratica', 'certificato', 'fattura', 'altro'));
  END IF;
END $$;

-- Aggiungi constraint per stati validi
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documenti_stato_check'
  ) THEN
    ALTER TABLE documenti
    ADD CONSTRAINT documenti_stato_check
    CHECK (stato IN ('BOZZA', 'IN_REVISIONE', 'APPROVATO', 'RIFIUTATO', 'CONSEGNATO'));
  END IF;
END $$;

-- Verifica
SELECT 'Tabella documenti creata/aggiornata con successo!' as status;
SELECT COUNT(*) as documenti_count FROM documenti;
