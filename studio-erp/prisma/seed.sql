-- Studio ERP Database Seed
-- Dati iniziali per sviluppo

-- ========================================
-- 1. RUOLI
-- ========================================
INSERT INTO "ruoli" (codice, nome, descrizione, livello, ambito, permessi, "updatedAt") VALUES
('TITOLARE', 'Titolare', 'Amministratore completo, responsabile tecnico', 1, 'interno',
'{"incarichi": {"view_all": true, "create": true, "update": true, "delete": true, "assign": true}, "documenti": {"view_all": true, "upload": true, "approve": true, "sign": true, "deliver": true}, "economico": {"view_all": true, "manage": true}, "messaggi": {"send": true, "receive": true, "view_all": true}, "clienti": {"view_all": true, "create": true, "update": true, "manage_access": true}, "collaboratori": {"view_all": true, "create": true, "update": true, "delete": true}, "sistema": {"config": true, "stats": true, "audit": true}}'::jsonb,
CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

INSERT INTO "ruoli" (codice, nome, descrizione, livello, ambito, permessi, "updatedAt") VALUES
('COMMITTENTE', 'Committente', 'Cliente con accesso alla propria area riservata', 5, 'esterno',
'{"incarichi": {"view_own": true}, "documenti": {"view_delivered": true, "upload_requested": true}, "economico": {"view_own_payments": true, "pay_milestone": true}, "messaggi": {"send": true, "receive": true}, "clienti": {"view_own": true, "update_own": true}}'::jsonb,
CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- ========================================
-- 2. UTENTE TITOLARE
-- ========================================
-- Password hash per 'admin123' (bcrypt)
INSERT INTO "utenti" (email, password_hash, nome, cognome, ruolo_id, attivo, email_verified, "updatedAt")
SELECT
    'romano@studio-ingegneria.it',
    '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwzkbeHqG7tMi8Cvh3YI/rCPTe', -- admin123
    'Giovanni',
    'Romano',
    id,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ruoli" WHERE codice = 'TITOLARE'
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 3. BUNDLE FASE 1 MVP
-- ========================================
INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-RISTR-BONUS',
 'Ristrutturazione con Bonus',
 'Progettazione architettonica e strutturale completa con pratiche bonus edilizi. Include rilievo, progetto, direzione lavori e asseverazioni.',
 'privato',
 8000,
 18000,
 9,
 '["Rilievo geometrico stato di fatto", "Progetto architettonico", "Progetto strutturale", "Pratica edilizia (CILA/SCIA)", "Direzione lavori", "Asseverazioni bonus edilizi", "Fine lavori e collaudo"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-04", "POP-07"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 30, "descrizione": "Accettazione incarico"}, {"codice": "M1", "nome": "Progetto approvato", "percentuale": 35, "descrizione": "Pratica depositata"}, {"codice": "M2", "nome": "Fine lavori", "percentuale": 20, "descrizione": "Chiusura cantiere"}, {"codice": "M3", "nome": "Collaudo finale", "percentuale": 15, "descrizione": "Documentazione completa"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-VULN-SISMICA',
 'Vulnerabilità Sismica',
 'Valutazione della vulnerabilità sismica con indagini strutturali, modellazione FEM e progetto di miglioramento/adeguamento sismico.',
 'condominio',
 5000,
 25000,
 3,
 '["Rilievo geometrico strutturale", "Indagini sui materiali (prove distruttive/non distruttive)", "Modellazione strutturale FEM", "Relazione di vulnerabilità sismica", "Progetto di miglioramento/adeguamento", "Computo metrico estimativo interventi"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-07", "POP-10"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 30, "descrizione": "Avvio attività"}, {"codice": "M1", "nome": "Relazione vulnerabilità", "percentuale": 30, "descrizione": "Consegna analisi sismica"}, {"codice": "M2", "nome": "Progetto miglioramento", "percentuale": 40, "descrizione": "Progetto definitivo"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-ANTINCENDIO',
 'Antincendio',
 'Progettazione antincendio completa e gestione pratiche VVF (Vigili del Fuoco) per attività commerciali e industriali.',
 'azienda',
 2000,
 8000,
 3,
 '["Valutazione del rischio incendio (D.M. 03/09/2021)", "Progetto antincendio", "Elaborati grafici (planimetrie, sezioni)", "SCIA antincendio VVF", "Assistenza sopralluogo VVF", "Certificato Prevenzione Incendi (CPI)"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-07"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Avvio progettazione"}, {"codice": "M1", "nome": "Progetto e SCIA", "percentuale": 40, "descrizione": "Deposito pratica VVF"}, {"codice": "M2", "nome": "Chiusura pratica", "percentuale": 20, "descrizione": "Ottenimento CPI"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- ========================================
-- 4. CLIENTE DEMO
-- ========================================
INSERT INTO "clienti" (codice, tipo, nome, cognome, codice_fiscale, email, telefono, indirizzo, citta, provincia, cap, stato_accesso_portale, note, "updatedAt") VALUES
('CLI25001',
 'privato',
 'Mario',
 'Rossi',
 'RSSMRA80A01H501Z',
 'mario.rossi@example.com',
 '+39 333 1234567',
 'Via Roma 123',
 'Milano',
 'MI',
 '20100',
 'disabilitato',
 'Cliente demo creato dal seed',
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- ========================================
-- VERIFICA
-- ========================================
SELECT 'Seed completato!' as status;
SELECT 'Ruoli creati: ' || COUNT(*) FROM "ruoli";
SELECT 'Utenti creati: ' || COUNT(*) FROM "utenti";
SELECT 'Bundle creati: ' || COUNT(*) FROM "bundle";
SELECT 'Clienti creati: ' || COUNT(*) FROM "clienti";
