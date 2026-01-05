# 📦 Nuovi Bundle - Documentazione

Questa cartella contiene lo script SQL per aggiungere 3 nuovi bundle al database.

---

## 🆕 Bundle Aggiunti

### 1. **Due Diligence Immobiliare** (BDL-DUE-DILIGENCE)

**Descrizione**: Analisi tecnica completa pre-acquisizione di immobili

**Target**: Aziende
**Prezzo**: €3.000 - €12.000
**Durata**: 2 mesi

**Servizi inclusi**:
- Verifica conformità urbanistica ed edilizia
- Analisi documentazione catastale
- Ispezione tecnica in sito
- Verifica conformità strutturale
- Verifica impianti e certificazioni
- Relazione tecnica di due diligence
- Stima costi regolarizzazioni necessarie
- Report fotografico dettagliato

**Milestone**:
1. M0 - Anticipo (40%): Avvio attività di analisi
2. M1 - Sopralluogo e verifiche (30%): Ispezione completata
3. M2 - Relazione finale (30%): Consegna report completo

---

### 2. **Ampliamento Produttivo** (BDL-AMPL-PRODUTTIVO)

**Descrizione**: Progettazione completa per ampliamento di capannoni industriali e stabilimenti produttivi

**Target**: Aziende
**Prezzo**: €10.000 - €35.000
**Durata**: 6 mesi

**Servizi inclusi**:
- Rilievo geometrico edificio esistente
- Analisi esigenze produttive
- Studio di fattibilità urbanistica
- Progetto architettonico ampliamento
- Progetto strutturale (fondazioni, carpenteria)
- Progetto impianti (elettrico, idrico, climatizzazione)
- Pratica edilizia (Permesso di Costruire)
- Direzione lavori strutturale
- Computo metrico estimativo

**Milestone**:
1. M0 - Anticipo (25%): Avvio progettazione
2. M1 - Studio di fattibilità (15%): Consegna fattibilità
3. M2 - Progetto definitivo (30%): Progetto completo
4. M3 - Pratica depositata (15%): Permesso di Costruire depositato
5. M4 - Fine lavori (15%): Conclusione DL e collaudo

---

### 3. **Collaudo Statico** (BDL-COLLAUDO-STATICO)

**Descrizione**: Collaudo statico di opere strutturali in cemento armato, acciaio e legno ai sensi delle NTC 2018

**Target**: Condomini
**Prezzo**: €2.500 - €15.000
**Durata**: 2 mesi

**Servizi inclusi**:
- Verifica documentazione progetto strutturale
- Esame elaborati strutturali as-built
- Sopralluogo in cantiere
- Controllo materiali (certificati, prove)
- Prove di carico (se richieste)
- Verifiche geometriche strutturali
- Relazione di collaudo statico
- Certificato di regolare esecuzione
- Deposito presso Genio Civile

**Milestone**:
1. M0 - Anticipo (40%): Accettazione incarico
2. M1 - Sopralluogo e verifiche (30%): Completamento ispezioni
3. M2 - Relazione e deposito (30%): Consegna certificato

---

## 🔧 Installazione

### Prerequisiti
- Database PostgreSQL attivo
- Utente con permessi INSERT su tabella `bundle`
- Schema database già creato (vedi `schema.sql`)

### Import nel Database

**Opzione 1 - Via psql (Consigliato)**:
```bash
# Imposta DATABASE_URL se non già fatto
export DATABASE_URL="postgresql://user:password@localhost:5432/studio_erp"

# Esegui lo script
psql $DATABASE_URL -f prisma/seed-nuovi-bundle.sql
```

**Opzione 2 - Via npm script**:
```bash
cd studio-erp

# Aggiungi i nuovi bundle
npm run db:seed-nuovi-bundle
```

**Opzione 3 - Manuale via pgAdmin/DataGrip**:
1. Apri `seed-nuovi-bundle.sql`
2. Copia il contenuto
3. Esegui nel query editor del tuo DB tool
4. Verifica output

### Verifica Installazione

```sql
-- Verifica che i 3 bundle siano stati creati
SELECT codice, nome, target, prezzo_min, prezzo_max, attivo
FROM bundle
WHERE codice IN ('BDL-DUE-DILIGENCE', 'BDL-AMPL-PRODUTTIVO', 'BDL-COLLAUDO-STATICO');

-- Risultato atteso: 3 righe
```

**Output atteso**:
```
           codice           |          nome             | target |prezzo_min|prezzo_max|attivo
---------------------------+---------------------------+--------+----------+----------+------
BDL-DUE-DILIGENCE         | Due Diligence Immobiliare | azienda|      3000|     12000| t
BDL-AMPL-PRODUTTIVO       | Ampliamento Produttivo    | azienda|     10000|     35000| t
BDL-COLLAUDO-STATICO      | Collaudo Statico          |condomin|      2500|     15000| t
```

---

## 📊 Confronto Bundle Esistenti vs Nuovi

| Codice | Nome | Target | Prezzo Min | Prezzo Max | Durata | Fase |
|--------|------|--------|------------|------------|--------|------|
| **ESISTENTI** (da seed.sql) |
| BDL-RISTR-BONUS | Ristrutturazione con Bonus | privato | €8.000 | €18.000 | 9 mesi | 1 |
| BDL-VULN-SISMICA | Vulnerabilità Sismica | condominio | €5.000 | €25.000 | 3 mesi | 1 |
| BDL-ANTINCENDIO | Antincendio | azienda | €2.000 | €8.000 | 3 mesi | 1 |
| **NUOVI** (da seed-nuovi-bundle.sql) |
| BDL-DUE-DILIGENCE | Due Diligence Immobiliare | azienda | €3.000 | €12.000 | 2 mesi | 1 |
| BDL-AMPL-PRODUTTIVO | Ampliamento Produttivo | azienda | €10.000 | €35.000 | 6 mesi | 1 |
| BDL-COLLAUDO-STATICO | Collaudo Statico | condominio | €2.500 | €15.000 | 2 mesi | 1 |

**Totale bundle dopo import**: 6 bundle attivi

---

## 🔄 Rollback (Se Necessario)

Se vuoi rimuovere i 3 nuovi bundle:

```sql
-- ATTENZIONE: Elimina i bundle e i relativi incarichi (CASCADE)
DELETE FROM bundle
WHERE codice IN ('BDL-DUE-DILIGENCE', 'BDL-AMPL-PRODUTTIVO', 'BDL-COLLAUDO-STATICO');
```

⚠️ **IMPORTANTE**: Il DELETE farà CASCADE su eventuali incarichi creati con questi bundle!

---

## 🌐 Integrazione Frontend

Dopo l'import, i nuovi bundle saranno automaticamente disponibili in:

1. **Pagina Checkout** (`/checkout`):
   - Seleziona bundle dropdown
   - I 3 nuovi bundle appariranno nella lista

2. **API Bundle** (`/api/bundle`):
   ```bash
   # Lista tutti i bundle
   curl http://localhost:3000/api/bundle

   # Singolo bundle
   curl http://localhost:3000/api/bundle/BDL-DUE-DILIGENCE
   ```

3. **Nuovo Incarico** (Collaboratore):
   - `/collaboratore/incarichi` → "Nuovo Incarico"
   - I 3 bundle saranno disponibili nel dropdown

---

## 🧪 Testing

### Test Manuale Checkout

1. **Avvia server**:
   ```bash
   npm run dev
   ```

2. **Apri checkout**:
   ```
   http://localhost:3000/checkout
   ```

3. **Seleziona uno dei nuovi bundle**:
   - Due Diligence Immobiliare
   - Ampliamento Produttivo
   - Collaudo Statico

4. **Verifica**:
   - ✅ Prezzo acconto calcolato correttamente (prima milestone %)
   - ✅ Descrizione bundle visibile
   - ✅ Redirect a Stripe funziona

### Test API

```bash
# Test API bundle singolo
curl http://localhost:3000/api/bundle/BDL-DUE-DILIGENCE

# Risposta attesa:
{
  "success": true,
  "data": {
    "id": 4,
    "codice": "BDL-DUE-DILIGENCE",
    "nome": "Due Diligence Immobiliare",
    "descrizione": "Analisi tecnica completa...",
    "target": "azienda",
    "prezzoMin": 3000,
    "prezzoMax": 12000,
    "durataMesi": 2,
    "servizi": [...],
    "milestone": [...],
    "attivo": true
  }
}
```

---

## 📝 Note Tecniche

### Struttura JSON Campi

**servizi** (jsonb array):
```json
["Servizio 1", "Servizio 2", "..."]
```

**procedure** (jsonb array):
```json
["POP-01", "POP-02", "..."]
```
Riferimenti a procedure operative standard

**milestone** (jsonb array of objects):
```json
[
  {
    "codice": "M0",
    "nome": "Anticipo",
    "percentuale": 40,
    "descrizione": "Avvio attività"
  },
  ...
]
```

⚠️ **IMPORTANTE**: La somma delle percentuali deve essere **100%**

### Calcolo Acconto Checkout

L'acconto viene calcolato come:
```javascript
const prezzoMedio = (prezzoMin + prezzoMax) / 2
const primaMilestone = milestone[0]
const acconto = prezzoMedio * (primaMilestone.percentuale / 100)
```

**Esempi**:
- **Due Diligence**: (3000 + 12000) / 2 * 40% = €3.000
- **Ampliamento**: (10000 + 35000) / 2 * 25% = €5.625
- **Collaudo**: (2500 + 15000) / 2 * 40% = €3.500

---

## 🐛 Troubleshooting

### Errore: "duplicate key value violates unique constraint"

**Causa**: Bundle con stesso codice già esistente

**Soluzione**: Script usa `ON CONFLICT DO NOTHING`, quindi è sicuro rieseguirlo

### Bundle non appare in checkout

**Verifica**:
1. Bundle attivo?
   ```sql
   SELECT attivo FROM bundle WHERE codice = 'BDL-DUE-DILIGENCE';
   ```

2. Server riavviato dopo import?
   ```bash
   # Ferma (Ctrl+C) e riavvia
   npm run dev
   ```

3. Cache browser?
   - Hard refresh: Ctrl+Shift+R

### Milestone percentuali sbagliate

**Verifica somma = 100%**:
```sql
SELECT
  codice,
  nome,
  (
    SELECT SUM((m->>'percentuale')::numeric)
    FROM jsonb_array_elements(milestone) AS m
  ) as totale_percentuale
FROM bundle
WHERE codice IN ('BDL-DUE-DILIGENCE', 'BDL-AMPL-PRODUTTIVO', 'BDL-COLLAUDO-STATICO');
```

Tutte dovrebbero essere 100.00

---

## 📚 Riferimenti

- Schema database completo: `prisma/schema.sql`
- Seed iniziale (3 bundle originali): `prisma/seed.sql`
- API Bundle: `app/api/bundle/route.ts`
- Checkout integration: `app/api/checkout/create-session/route.ts`

---

**Creato**: 2025-12-27
**Autore**: Claude Code
**Versione**: 1.0
