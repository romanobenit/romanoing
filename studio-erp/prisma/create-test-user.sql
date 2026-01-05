-- Crea utente di test per area committente
-- Password: test123
-- Password hash generato con bcrypt: $2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa

-- 1. Aggiorna il cliente di test con l'email corretta
UPDATE "clienti"
SET email = 'cliente.test@romano.it',
    stato_accesso_portale = 'attivo',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE codice = 'CLI25001';

-- 2. Ottieni l'ID del ruolo COMMITTENTE
DO $$
DECLARE
    ruolo_committente_id INT;
    cliente_test_id INT;
BEGIN
    -- Trova il ruolo COMMITTENTE
    SELECT id INTO ruolo_committente_id FROM "ruoli" WHERE codice = 'COMMITTENTE';

    -- Trova il cliente di test
    SELECT id INTO cliente_test_id FROM "clienti" WHERE codice = 'CLI25001';

    -- Inserisci l'utente di test (o aggiorna se esiste)
    INSERT INTO "utenti" (
        email,
        password_hash,
        nome,
        cognome,
        ruolo_id,
        cliente_id,
        attivo,
        email_verified,
        "createdAt",
        "updatedAt"
    ) VALUES (
        'cliente.test@romano.it',
        '$2b$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', -- test123
        'Mario',
        'Rossi',
        ruolo_committente_id,
        cliente_test_id,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        ruolo_id = EXCLUDED.ruolo_id,
        cliente_id = EXCLUDED.cliente_id,
        attivo = true,
        "updatedAt" = CURRENT_TIMESTAMP;

    RAISE NOTICE 'Utente di test creato/aggiornato con successo!';
END $$;

-- 3. Verifica
SELECT
    u.id,
    u.email,
    u.nome,
    u.cognome,
    r.codice as ruolo,
    c.codice as cliente_codice,
    u.attivo
FROM "utenti" u
JOIN "ruoli" r ON u.ruolo_id = r.id
LEFT JOIN "clienti" c ON u.cliente_id = c.id
WHERE u.email = 'cliente.test@romano.it';
