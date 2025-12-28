-- ========================================
-- AGGIORNAMENTO COMPLETO BUNDLE
-- Rimuove i vecchi e ricrea con nuove specifiche
-- ========================================

-- STEP 1: Rimuovi bundle vecchi (mantiene incarichi esistenti se vuoi)
-- ATTENZIONE: Se hai incarichi in corso, commentare questa sezione
DELETE FROM bundle WHERE codice IN (
  'BDL-RISTR-BONUS',
  'BDL-VULN-SISMICA',
  'BDL-ANTINCENDIO',
  'BDL-DUE-DILIGENCE',
  'BDL-AMPL-PRODUTTIVO',
  'BDL-COLLAUDO-STATICO'
);

-- STEP 2: Inserisci 8 bundle aggiornati
-- ========================================

-- 0. CONSULENZA TECNICA INIZIALE (NUOVO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-CONSULENZA',
  'Consulenza Tecnica Iniziale',
  'Inquadramento tecnico preliminare con analisi criticità, opzioni operative e suggerimento bundle successivo. Consigliata prima di ogni incarico strutturato.',
  'privato',
  180,
  600,
  0.033, -- 60-90 min ≈ 0.033 mesi (1 giorno)
  '["Inquadramento tecnico preliminare", "Analisi criticità esistenti", "Opzioni operative disponibili", "Suggerimento bundle successivo", "Report consulenza scritto (opzionale)", "Registrazione audio/video (opzionale)"]'::jsonb,
  '["POP-01", "POP-07", "POP-AI-01"]'::jsonb,
  '[{"codice": "M0", "nome": "Pagamento consulenza", "percentuale": 100, "descrizione": "Unica soluzione"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 1. RISTRUTTURAZIONE CON O SENZA BONUS (AGGIORNATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-RISTR-BONUS',
  'Ristrutturazione con o senza Bonus',
  'Progettazione architettonica e strutturale completa con opzione pratiche bonus edilizi. Include rilievo, progetto, direzione lavori e asseverazioni (se necessario).',
  'privato',
  8000,
  18000,
  9, -- 6-12 mesi (media 9)
  '["Rilievo geometrico stato di fatto", "Progetto architettonico", "Progetto strutturale", "Pratica edilizia (CILA/SCIA/PDC)", "Direzione lavori", "Asseverazioni bonus edilizi (opzionale)", "Fine lavori e collaudo"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-04", "POP-07"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 30, "descrizione": "Accettazione incarico"}, {"codice": "M1", "nome": "Progetto approvato", "percentuale": 35, "descrizione": "Pratica depositata"}, {"codice": "M2", "nome": "Fine lavori", "percentuale": 20, "descrizione": "Chiusura cantiere"}, {"codice": "M3", "nome": "Collaudo finale", "percentuale": 15, "descrizione": "Documentazione completa"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 2. DUE DILIGENCE IMMOBILIARE (AGGIORNATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-DUE-DILIGENCE',
  'Due Diligence Immobiliare',
  'Analisi tecnica completa pre-acquisizione immobili: conformità edilizia e urbanistica, verifica strutturale preliminare, criticità energetiche, valutazione rischio amministrativo.',
  'privato',
  1500,
  4000,
  1, -- 2-4 settimane (≈1 mese)
  '["Conformità edilizia e urbanistica", "Verifica strutturale preliminare", "Analisi criticità energetiche", "Valutazione rischio amministrativo", "Verifica documentazione catastale", "Ispezione tecnica in sito", "Relazione tecnica due diligence", "Report fotografico"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-07"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 50, "descrizione": "Avvio attività"}, {"codice": "M1", "nome": "Relazione finale", "percentuale": 50, "descrizione": "Consegna report completo"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 3. VULNERABILITÀ SISMICA (AGGIORNATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-VULN-SISMICA',
  'Vulnerabilità Sismica',
  'Valutazione sismica edifici con 3 livelli: L0 screening, L1 analisi semplificata, L2 valutazione completa. Include indagini strutturali, modellazione FEM e progetto miglioramento/adeguamento.',
  'condominio',
  5000,
  25000,
  3, -- 2-4 mesi (media 3)
  '["Screening preliminare (L0)", "Analisi semplificata (L1)", "Valutazione completa (L2)", "Rilievo geometrico strutturale", "Indagini sui materiali", "Modellazione strutturale FEM", "Relazione vulnerabilità sismica", "Progetto miglioramento/adeguamento", "Computo metrico estimativo"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-07", "POP-10"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 30, "descrizione": "Avvio attività"}, {"codice": "M1", "nome": "Relazione vulnerabilità", "percentuale": 30, "descrizione": "Consegna analisi sismica"}, {"codice": "M2", "nome": "Progetto miglioramento", "percentuale": 40, "descrizione": "Progetto definitivo"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 4. AMPLIAMENTO PRODUTTIVO (AGGIORNATO - CODICE CAMBIATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-AMPLIAMENTO',
  'Ampliamento Produttivo',
  'Progettazione completa per ampliamento capannoni industriali e stabilimenti produttivi. Include studio fattibilità, progetto architettonico/strutturale/impiantistico, pratiche autorizzative e direzione lavori.',
  'privato',
  12000,
  35000,
  13, -- 8-18 mesi (media 13)
  '["Rilievo edificio esistente", "Studio di fattibilità urbanistica", "Progetto architettonico", "Progetto strutturale", "Progetto impianti", "Pratica edilizia (Permesso Costruire)", "Direzione lavori", "Contabilità lavori", "Collaudo finale"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-04", "POP-05", "POP-06", "POP-07", "POP-10"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 25, "descrizione": "Avvio progettazione"}, {"codice": "M1", "nome": "Studio fattibilità", "percentuale": 30, "descrizione": "Consegna fattibilità"}, {"codice": "M2", "nome": "Progetto definitivo", "percentuale": 25, "descrizione": "Progetto completo"}, {"codice": "M3", "nome": "Fine lavori", "percentuale": 20, "descrizione": "Conclusione DL e collaudo"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 5. COLLAUDO STATICO (AGGIORNATO - CODICE CAMBIATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-COLLAUDO',
  'Collaudo Statico',
  'Collaudo statico opere strutturali in cemento armato, acciaio e legno secondo NTC 2018. Include verifica documentazione, sopralluogo, prove carico, relazione collaudo e deposito Genio Civile.',
  'privato',
  2500,
  12000,
  2, -- 1-3 mesi (media 2)
  '["Verifica documentazione strutturale", "Esame elaborati as-built", "Sopralluogo cantiere", "Controllo materiali e certificati", "Prove di carico (se necessarie)", "Verifiche geometriche", "Relazione collaudo statico", "Certificato regolare esecuzione", "Deposito Genio Civile"]'::jsonb,
  '["POP-05", "POP-07"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Accettazione incarico"}, {"codice": "M1", "nome": "Sopralluogo e verifiche", "percentuale": 30, "descrizione": "Completamento ispezioni"}, {"codice": "M2", "nome": "Relazione e deposito", "percentuale": 30, "descrizione": "Consegna certificato"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 6. ANTINCENDIO (AGGIORNATO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-ANTINCENDIO',
  'Antincendio',
  'Progettazione antincendio completa e gestione pratiche VVF per attività commerciali, industriali e pubbliche secondo D.M. 03/09/2021.',
  'privato',
  2000,
  8000,
  3, -- 2-4 mesi (media 3)
  '["Valutazione rischio incendio (D.M. 03/09/2021)", "Progetto antincendio", "Elaborati grafici (planimetrie, sezioni)", "SCIA antincendio VVF", "Assistenza sopralluogo VVF", "Certificato Prevenzione Incendi (CPI)"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-07"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Avvio progettazione"}, {"codice": "M1", "nome": "Progetto e SCIA", "percentuale": 40, "descrizione": "Deposito pratica VVF"}, {"codice": "M2", "nome": "Chiusura pratica", "percentuale": 20, "descrizione": "Ottenimento CPI"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 7. EFFICIENTAMENTO ENERGETICO (NUOVO)
INSERT INTO "bundle" (
  codice, nome, descrizione, target,
  prezzo_min, prezzo_max, durata_mesi,
  servizi, procedure, milestone,
  attivo, fase_mvp, "createdAt", "updatedAt"
) VALUES (
  'BDL-EFF-ENERGETICO',
  'Efficientamento Energetico',
  'Diagnosi energetica completa con APE, scenari di intervento per riduzione consumi e analisi costi/benefici. Include progetto preliminare e valutazione incentivi disponibili.',
  'privato',
  2500,
  8000,
  2, -- 1-3 mesi (media 2)
  '["Diagnosi energetica edificio", "APE (Attestato Prestazione Energetica)", "Scenari di intervento migliorativo", "Analisi costi/benefici", "Valutazione incentivi disponibili", "Progetto preliminare interventi", "Relazione tecnica completa"]'::jsonb,
  '["POP-01", "POP-02", "POP-03", "POP-07"]'::jsonb,
  '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Avvio diagnosi"}, {"codice": "M1", "nome": "Relazione finale", "percentuale": 60, "descrizione": "Consegna APE e scenari"}]'::jsonb,
  true,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ========================================
-- VERIFICA INSERIMENTO
-- ========================================
SELECT
  codice,
  nome,
  target,
  prezzo_min || ' - ' || prezzo_max as prezzo_range,
  durata_mesi,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(milestone)
  ) as num_milestone,
  (
    SELECT SUM((m->>'percentuale')::numeric)
    FROM jsonb_array_elements(milestone) AS m
  ) as totale_percentuale,
  attivo,
  "createdAt"
FROM bundle
ORDER BY
  CASE codice
    WHEN 'BDL-CONSULENZA' THEN 0
    WHEN 'BDL-RISTR-BONUS' THEN 1
    WHEN 'BDL-DUE-DILIGENCE' THEN 2
    WHEN 'BDL-VULN-SISMICA' THEN 3
    WHEN 'BDL-AMPLIAMENTO' THEN 4
    WHEN 'BDL-COLLAUDO' THEN 5
    WHEN 'BDL-ANTINCENDIO' THEN 6
    WHEN 'BDL-EFF-ENERGETICO' THEN 7
    ELSE 99
  END;

-- Conteggio totale
SELECT 'Totale bundle attivi: ' || COUNT(*) as status FROM bundle WHERE attivo = true;

-- Verifica somma percentuali = 100
WITH bundle_percentuali AS (
  SELECT
    codice,
    nome,
    (
      SELECT SUM((m->>'percentuale')::numeric)
      FROM jsonb_array_elements(milestone) AS m
    ) as somma_percentuali
  FROM bundle
)
SELECT
  codice,
  nome,
  somma_percentuali,
  'ERRORE: milestone non sommano a 100%' as errore
FROM bundle_percentuali
WHERE somma_percentuali != 100;
-- Se questa query ritorna righe, ci sono bundle con milestone che non sommano a 100%
