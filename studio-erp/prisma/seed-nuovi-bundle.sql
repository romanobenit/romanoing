-- ========================================
-- NUOVI BUNDLE - Due Diligence, Ampliamento, Collaudo
-- ========================================

-- 1. DUE DILIGENCE IMMOBILIARE
INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-DUE-DILIGENCE',
 'Due Diligence Immobiliare',
 'Analisi tecnica completa pre-acquisizione di immobili. Verifica conformità urbanistica, catastale, strutturale e impiantistica per valutare rischi e criticità.',
 'azienda',
 3000,
 12000,
 2,
 '["Verifica conformità urbanistica ed edilizia", "Analisi documentazione catastale", "Ispezione tecnica in sito", "Verifica conformità strutturale", "Verifica impianti e certificazioni", "Relazione tecnica di due diligence", "Stima costi regolarizzazioni necessarie", "Report fotografico dettagliato"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-07"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Avvio attività di analisi"}, {"codice": "M1", "nome": "Sopralluogo e verifiche", "percentuale": 30, "descrizione": "Ispezione completata"}, {"codice": "M2", "nome": "Relazione finale", "percentuale": 30, "descrizione": "Consegna report completo"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- 2. AMPLIAMENTO PRODUTTIVO
INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-AMPL-PRODUTTIVO',
 'Ampliamento Produttivo',
 'Progettazione completa per ampliamento di capannoni industriali e stabilimenti produttivi. Include analisi funzionale, progetto architettonico e strutturale, pratiche autorizzative.',
 'azienda',
 10000,
 35000,
 6,
 '["Rilievo geometrico edificio esistente", "Analisi esigenze produttive", "Studio di fattibilità urbanistica", "Progetto architettonico ampliamento", "Progetto strutturale (fondazioni, carpenteria)", "Progetto impianti (elettrico, idrico, climatizzazione)", "Pratica edilizia (Permesso di Costruire)", "Direzione lavori strutturale", "Computo metrico estimativo"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-04", "POP-07", "POP-08"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 25, "descrizione": "Avvio progettazione"}, {"codice": "M1", "nome": "Studio di fattibilità", "percentuale": 15, "descrizione": "Consegna fattibilità"}, {"codice": "M2", "nome": "Progetto definitivo", "percentuale": 30, "descrizione": "Progetto completo"}, {"codice": "M3", "nome": "Pratica depositata", "percentuale": 15, "descrizione": "Permesso di Costruire depositato"}, {"codice": "M4", "nome": "Fine lavori", "percentuale": 15, "descrizione": "Conclusione DL e collaudo"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- 3. COLLAUDO STATICO
INSERT INTO "bundle" (codice, nome, descrizione, target, prezzo_min, prezzo_max, durata_mesi, servizi, procedure, milestone, attivo, fase_mvp, "updatedAt") VALUES
('BDL-COLLAUDO-STATICO',
 'Collaudo Statico',
 'Collaudo statico di opere strutturali in cemento armato, acciaio e legno ai sensi delle NTC 2018. Include prove di carico, relazione di collaudo e certificato di regolare esecuzione.',
 'condominio',
 2500,
 15000,
 2,
 '["Verifica documentazione progetto strutturale", "Esame elaborati strutturali as-built", "Sopralluogo in cantiere", "Controllo materiali (certificati, prove)", "Prove di carico (se richieste)", "Verifiche geometriche strutturali", "Relazione di collaudo statico", "Certificato di regolare esecuzione", "Deposito presso Genio Civile"]'::jsonb,
 '["POP-01", "POP-02", "POP-03", "POP-07", "POP-10"]'::jsonb,
 '[{"codice": "M0", "nome": "Anticipo", "percentuale": 40, "descrizione": "Accettazione incarico"}, {"codice": "M1", "nome": "Sopralluogo e verifiche", "percentuale": 30, "descrizione": "Completamento ispezioni"}, {"codice": "M2", "nome": "Relazione e deposito", "percentuale": 30, "descrizione": "Consegna certificato"}]'::jsonb,
 true,
 1,
 CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- ========================================
-- VERIFICA INSERIMENTO
-- ========================================
SELECT
  codice,
  nome,
  target,
  prezzo_min,
  prezzo_max,
  durata_mesi,
  attivo,
  "createdAt"
FROM bundle
WHERE codice IN ('BDL-DUE-DILIGENCE', 'BDL-AMPL-PRODUTTIVO', 'BDL-COLLAUDO-STATICO')
ORDER BY codice;

-- Conteggio totale bundle
SELECT 'Totale bundle attivi: ' || COUNT(*) as status FROM bundle WHERE attivo = true;
