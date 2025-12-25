-- Script per creare utenti collaboratori di test
-- Password per tutti: test123

-- Utente SENIOR
INSERT INTO utenti (email, password_hash, nome, cognome, ruolo_id, attivo, email_verified, "createdAt", "updatedAt")
SELECT
  'senior@studio-romano.it',
  '$2b$10$b5x0Qm9cjoudx5eImEQE/.UWbuLj4UX8lan4eUmzbcndBp822RWFm', -- test123
  'Marco',
  'Bianchi',
  id,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ruoli WHERE codice = 'SENIOR'
ON CONFLICT (email) DO NOTHING;

-- Utente JUNIOR
INSERT INTO utenti (email, password_hash, nome, cognome, ruolo_id, attivo, email_verified, "createdAt", "updatedAt")
SELECT
  'junior@studio-romano.it',
  '$2b$10$b5x0Qm9cjoudx5eImEQE/.UWbuLj4UX8lan4eUmzbcndBp822RWFm', -- test123
  'Luca',
  'Verdi',
  id,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ruoli WHERE codice = 'JUNIOR'
ON CONFLICT (email) DO NOTHING;

-- Utente ESTERNO
INSERT INTO utenti (email, password_hash, nome, cognome, ruolo_id, attivo, email_verified, "createdAt", "updatedAt")
SELECT
  'esterno@studio-romano.it',
  '$2b$10$b5x0Qm9cjoudx5eImEQE/.UWbuLj4UX8lan4eUmzbcndBp822RWFm', -- test123
  'Giovanni',
  'Neri',
  id,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ruoli WHERE codice = 'ESTERNO'
ON CONFLICT (email) DO NOTHING;

-- Assegna alcuni incarichi al SENIOR come responsabile
UPDATE incarichi
SET responsabile_id = (SELECT id FROM utenti WHERE email = 'senior@studio-romano.it')
WHERE codice IN ('INC25001', 'INC24089');

-- Verifica utenti creati
SELECT
  u.email,
  u.nome,
  u.cognome,
  r.codice as ruolo,
  u.attivo
FROM utenti u
JOIN ruoli r ON u.ruolo_id = r.id
WHERE u.email LIKE '%@studio-romano.it'
ORDER BY r.livello;
