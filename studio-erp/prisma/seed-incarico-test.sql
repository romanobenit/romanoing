-- Script per creare incarico di test per l'area committente

-- Crea un incarico di test per il cliente esistente (ID 1)
INSERT INTO incarichi (
  codice, cliente_id, bundle_id, responsabile_id,
  oggetto, descrizione, importo_totale, stato,
  data_inizio, priorita, "createdAt", "updatedAt"
) VALUES (
  'INC25001',
  1, -- Cliente di test
  1, -- Bundle BDL-RISTR-BONUS
  1, -- Responsabile (Ing. Romano)
  'Ristrutturazione Appartamento Via Roma 45',
  'Ristrutturazione completa appartamento con bonus edilizi. Include progettazione architettonica, strutturale e direzione lavori.',
  12500.00,
  'IN_CORSO',
  NOW() - INTERVAL '15 days',
  'alta',
  NOW() - INTERVAL '15 days',
  NOW()
) ON CONFLICT DO NOTHING;

-- Crea milestone per l'incarico
-- M0: Anticipo (30% = €3,750)
INSERT INTO milestone (
  incarico_id, codice, nome, descrizione,
  percentuale, importo, stato, data_pagamento, "createdAt", "updatedAt"
) VALUES (
  1, 'M0', 'Anticipo',
  'Accettazione incarico e avvio progettazione',
  30, 3750.00, 'PAGATO', NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days', NOW()
);

-- M1: Progetto approvato (35% = €4,375)
INSERT INTO milestone (
  incarico_id, codice, nome, descrizione,
  percentuale, importo, stato, data_scadenza, "createdAt", "updatedAt"
) VALUES (
  1, 'M1', 'Progetto approvato',
  'Pratica depositata in comune',
  35, 4375.00, 'NON_PAGATO', NOW() + INTERVAL '10 days',
  NOW(), NOW()
);

-- M2: Fine lavori (20% = €2,500)
INSERT INTO milestone (
  incarico_id, codice, nome, descrizione,
  percentuale, importo, stato, "createdAt", "updatedAt"
) VALUES (
  1, 'M2', 'Fine lavori',
  'Chiusura cantiere e collaudo',
  20, 2500.00, 'NON_PAGATO', NOW(), NOW()
);

-- M3: Collaudo finale (15% = €1,875)
INSERT INTO milestone (
  incarico_id, codice, nome, descrizione,
  percentuale, importo, stato, "createdAt", "updatedAt"
) VALUES (
  1, 'M3', 'Collaudo finale',
  'Documentazione completa e rilascio certificati',
  15, 1875.00, 'NON_PAGATO', NOW(), NOW()
);

-- Crea alcuni documenti di test
INSERT INTO documenti (
  incarico_id, nome_file, path_storage, mime_type,
  dimensione, categoria, versione, stato,
  visibile_cliente, data_consegna, antivirus_scanned,
  antivirus_status, uploaded_by, "createdAt", "updatedAt"
) VALUES
(
  1,
  'Progetto_Architettonico_v1.pdf',
  '/documenti/2025/01/INC25001/Progetto_Architettonico_v1.pdf',
  'application/pdf',
  2458624,
  'elaborato',
  1,
  'CONSEGNATO',
  true,
  NOW() - INTERVAL '7 days',
  true,
  'clean',
  1,
  NOW() - INTERVAL '7 days',
  NOW()
),
(
  1,
  'Relazione_Tecnica_v1.pdf',
  '/documenti/2025/01/INC25001/Relazione_Tecnica_v1.pdf',
  'application/pdf',
  1856432,
  'relazione',
  1,
  'CONSEGNATO',
  true,
  NOW() - INTERVAL '5 days',
  true,
  'clean',
  1,
  NOW() - INTERVAL '5 days',
  NOW()
),
(
  1,
  'Planimetrie_Stato_Attuale.pdf',
  '/documenti/2025/01/INC25001/Planimetrie_Stato_Attuale.pdf',
  'application/pdf',
  3245678,
  'elaborato',
  1,
  'CONSEGNATO',
  true,
  NOW() - INTERVAL '12 days',
  true,
  'clean',
  1,
  NOW() - INTERVAL '12 days',
  NOW()
);

-- Secondo incarico (completato)
INSERT INTO incarichi (
  codice, cliente_id, bundle_id, responsabile_id,
  oggetto, descrizione, importo_totale, stato,
  data_inizio, data_fine, priorita, "createdAt", "updatedAt"
) VALUES (
  'INC24089',
  1,
  3, -- Bundle BDL-ANTINCENDIO
  1,
  'Certificato Prevenzione Incendi Ristorante',
  'Progettazione antincendio e gestione pratiche VVF per ristorante.',
  4500.00,
  'COMPLETATO',
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '30 days',
  'normale',
  NOW() - INTERVAL '90 days',
  NOW()
) ON CONFLICT DO NOTHING;

-- Milestone per secondo incarico (tutte pagate)
INSERT INTO milestone (
  incarico_id, codice, nome, descrizione,
  percentuale, importo, stato, data_pagamento, "createdAt", "updatedAt"
) VALUES
(
  2, 'M0', 'Anticipo',
  'Avvio progettazione',
  40, 1800.00, 'PAGATO', NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '85 days', NOW()
),
(
  2, 'M1', 'Progetto e SCIA',
  'Deposito pratica VVF',
  40, 1800.00, 'PAGATO', NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '60 days', NOW()
),
(
  2, 'M2', 'Chiusura pratica',
  'Ottenimento CPI',
  20, 900.00, 'PAGATO', NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '35 days', NOW()
);
