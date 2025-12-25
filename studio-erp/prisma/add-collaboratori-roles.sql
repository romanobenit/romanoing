-- Aggiungi i ruoli mancanti per i collaboratori

INSERT INTO "ruoli" (codice, nome, descrizione, livello, ambito, permessi, "updatedAt") VALUES
('SENIOR', 'Collaboratore Senior', 'Ingegnere senior con esperienza, gestisce progetti complessi', 2, 'interno',
'{"incarichi": {"view_assigned": true, "view_all": false, "create": false, "update": true, "delete": false}, "documenti": {"view_all": false, "view_assigned": true, "upload": true, "approve": false, "sign": true, "deliver": false}, "economico": {"view_own": true, "view_all": false}, "messaggi": {"send": true, "receive": true}, "clienti": {"view_assigned": true}, "timesheet": {"manage_own": true}}'::jsonb,
CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

INSERT INTO "ruoli" (codice, nome, descrizione, livello, ambito, permessi, "updatedAt") VALUES
('JUNIOR', 'Collaboratore Junior', 'Ingegnere junior in formazione, supporta progetti sotto supervisione', 3, 'interno',
'{"incarichi": {"view_assigned": true, "view_all": false, "create": false, "update": false, "delete": false}, "documenti": {"view_all": false, "view_assigned": true, "upload": true, "approve": false, "sign": false, "deliver": false}, "economico": {"view_own": true}, "messaggi": {"send": true, "receive": true}, "clienti": {"view_assigned": true}, "timesheet": {"manage_own": true}}'::jsonb,
CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

INSERT INTO "ruoli" (codice, nome, descrizione, livello, ambito, permessi, "updatedAt") VALUES
('ESTERNO', 'Collaboratore Esterno', 'Consulente esterno o libero professionista', 4, 'esterno',
'{"incarichi": {"view_assigned": true, "view_all": false, "create": false, "update": false, "delete": false}, "documenti": {"view_all": false, "view_assigned": true, "upload": true, "approve": false, "sign": false, "deliver": false}, "economico": {"view_own": true}, "messaggi": {"send": true, "receive": true}, "clienti": {"view_assigned": false}, "timesheet": {"manage_own": true}}'::jsonb,
CURRENT_TIMESTAMP)
ON CONFLICT (codice) DO NOTHING;

-- Verifica ruoli creati
SELECT id, codice, nome, livello, ambito FROM ruoli ORDER BY livello;
