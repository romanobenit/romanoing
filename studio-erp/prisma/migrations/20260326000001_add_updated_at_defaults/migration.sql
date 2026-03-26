-- Aggiunge DEFAULT CURRENT_TIMESTAMP a tutti i campi updatedAt/@updatedAt
-- necessario per INSERT raw senza fornire il valore (es. sessioni_quiz)

ALTER TABLE "bundle"               ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "clienti"              ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "documenti"            ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "documenti_richiesti"  ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "incarichi"            ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "lead_preventivi"      ALTER COLUMN "updated_at"  SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "milestone"            ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ruoli"                ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "sessioni_quiz"        ALTER COLUMN "updated_at"  SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "utenti"               ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP;
