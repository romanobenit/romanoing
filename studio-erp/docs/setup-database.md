# Setup Database PostgreSQL

## Installazione PostgreSQL

### Ubuntu/Debian
```bash
# Aggiorna repository
sudo apt update

# Installa PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verifica installazione
psql --version
# Output: psql (PostgreSQL) 14.x

# Avvia servizio
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS (con Homebrew)
```bash
# Installa PostgreSQL
brew install postgresql@14

# Avvia servizio
brew services start postgresql@14

# Verifica
psql --version
```

### Windows
1. Scarica installer da https://www.postgresql.org/download/windows/
2. Esegui installer (porta default: 5432)
3. Imposta password per utente `postgres`

### Docker (Alternativa rapida)
```bash
# Crea container PostgreSQL
docker run --name studio-erp-db \
  -e POSTGRES_USER=studio_user \
  -e POSTGRES_PASSWORD=studio_password \
  -e POSTGRES_DB=studio_erp \
  -p 5432:5432 \
  -v studio-erp-data:/var/lib/postgresql/data \
  -d postgres:14

# Verifica
docker ps | grep studio-erp-db
```

## Configurazione Database

### 1. Accedi a PostgreSQL
```bash
# Linux/macOS
sudo -u postgres psql

# Windows
psql -U postgres
```

### 2. Crea Database e Utente
```sql
-- Crea utente
CREATE USER studio_user WITH PASSWORD 'studio_password_strong_123';

-- Crea database
CREATE DATABASE studio_erp OWNER studio_user;

-- Concedi privilegi
GRANT ALL PRIVILEGES ON DATABASE studio_erp TO studio_user;

-- Esci
\q
```

### 3. Test Connessione
```bash
psql -U studio_user -d studio_erp -h localhost

# Se funziona, vedrai:
# studio_erp=>
```

## Configurazione .env

Copia `.env.example` in `.env`:
```bash
cd studio-erp
cp .env.example .env
```

Modifica `.env`:
```env
# PostgreSQL locale
DATABASE_URL="postgresql://studio_user:studio_password_strong_123@localhost:5432/studio_erp?schema=public"

# PostgreSQL Docker
DATABASE_URL="postgresql://studio_user:studio_password@localhost:5432/studio_erp?schema=public"

# PostgreSQL produzione (Hetzner)
DATABASE_URL="postgresql://studio_user:PASSWORD@127.0.0.1:5432/studio_erp?schema=public"
```

## Esegui Migrazioni Prisma

```bash
# Genera Prisma Client
npm run db:generate

# Applica schema al database (development)
npm run db:push

# Oppure crea migration (production-ready)
npm run db:migrate

# Verifica con Prisma Studio (GUI)
npm run db:studio
# Apri http://localhost:5555
```

## Seed Database (Dati Iniziali)

Creiamo uno script per popolare il database con dati iniziali.

File: `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Crea Ruoli
  const ruoloTitolare = await prisma.ruolo.upsert({
    where: { codice: 'TITOLARE' },
    update: {},
    create: {
      codice: 'TITOLARE',
      nome: 'Titolare',
      descrizione: 'Amministratore completo, responsabile tecnico',
      livello: 1,
      ambito: 'interno',
      permessi: {
        incarichi: { view_all: true, create: true, update: true, delete: true },
        documenti: { view_all: true, upload: true, approve: true },
        economico: { view_all: true, manage: true },
      },
    },
  })

  const ruoloCommittente = await prisma.ruolo.upsert({
    where: { codice: 'COMMITTENTE' },
    update: {},
    create: {
      codice: 'COMMITTENTE',
      nome: 'Committente',
      descrizione: 'Cliente con accesso alla propria area riservata',
      livello: 5,
      ambito: 'esterno',
      permessi: {
        incarichi: { view_own: true },
        documenti: { view_delivered: true, upload_requested: true },
        economico: { view_own_payments: true, pay_milestone: true },
        messaggi: { send: true, receive: true },
      },
    },
  })

  console.log('✅ Ruoli creati')

  // 2. Crea Utente Titolare (Ing. Romano)
  const passwordHash = await hash('admin123', 10) // CAMBIARE IN PRODUZIONE!

  const titolare = await prisma.utente.upsert({
    where: { email: 'romano@studio-ingegneria.it' },
    update: {},
    create: {
      email: 'romano@studio-ingegneria.it',
      passwordHash,
      nome: 'Giovanni',
      cognome: 'Romano',
      ruoloId: ruoloTitolare.id,
      attivo: true,
      emailVerified: new Date(),
    },
  })

  console.log('✅ Utente Titolare creato: romano@studio-ingegneria.it / admin123')

  // 3. Crea Bundle (Fase 1 MVP)
  const bundleRistrutt = await prisma.bundle.upsert({
    where: { codice: 'BDL-RISTR-BONUS' },
    update: {},
    create: {
      codice: 'BDL-RISTR-BONUS',
      nome: 'Ristrutturazione con Bonus',
      descrizione: 'Progettazione architettonica e strutturale completa con pratiche bonus edilizi',
      target: 'privato',
      prezzoMin: 8000,
      prezzoMax: 18000,
      durataMesi: 9,
      servizi: [
        'Rilievo geometrico',
        'Progetto architettonico',
        'Progetto strutturale',
        'Pratica edilizia',
        'Direzione lavori',
        'Asseverazioni bonus',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-04', 'POP-07'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 30 },
        { codice: 'M1', nome: 'Progetto approvato', percentuale: 35 },
        { codice: 'M2', nome: 'Fine lavori', percentuale: 20 },
        { codice: 'M3', nome: 'Collaudo finale', percentuale: 15 },
      ],
      attivo: true,
      faseMvp: 1,
    },
  })

  const bundleSismica = await prisma.bundle.upsert({
    where: { codice: 'BDL-VULN-SISMICA' },
    update: {},
    create: {
      codice: 'BDL-VULN-SISMICA',
      nome: 'Vulnerabilità Sismica',
      descrizione: 'Valutazione vulnerabilità sismica e progetto di miglioramento/adeguamento',
      target: 'condominio',
      prezzoMin: 5000,
      prezzoMax: 25000,
      durataMesi: 3,
      servizi: [
        'Rilievo strutturale',
        'Indagini materiali',
        'Modellazione FEM',
        'Relazione vulnerabilità',
        'Progetto miglioramento',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-07', 'POP-10'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 30 },
        { codice: 'M1', nome: 'Relazione vulnerabilità', percentuale: 30 },
        { codice: 'M2', nome: 'Progetto miglioramento', percentuale: 40 },
      ],
      attivo: true,
      faseMvp: 1,
    },
  })

  const bundleAntincendio = await prisma.bundle.upsert({
    where: { codice: 'BDL-ANTINCENDIO' },
    update: {},
    create: {
      codice: 'BDL-ANTINCENDIO',
      nome: 'Antincendio',
      descrizione: 'Progettazione antincendio e pratiche VVF',
      target: 'azienda',
      prezzoMin: 2000,
      prezzoMax: 8000,
      durataMesi: 3,
      servizi: [
        'Valutazione rischio incendio',
        'Progetto antincendio',
        'Elaborati grafici',
        'SCIA VVF',
        'Assistenza sopralluogo VVF',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-07'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 40 },
        { codice: 'M1', nome: 'Progetto e SCIA', percentuale: 40 },
        { codice: 'M2', nome: 'Chiusura pratica', percentuale: 20 },
      ],
      attivo: true,
      faseMvp: 1,
    },
  })

  console.log('✅ Bundle Fase 1 MVP creati')

  // 4. Crea Cliente Demo
  const clienteDemo = await prisma.cliente.create({
    data: {
      codice: 'CLI25001',
      tipo: 'privato',
      nome: 'Mario',
      cognome: 'Rossi',
      codiceFiscale: 'RSSMRA80A01H501Z',
      email: 'mario.rossi@example.com',
      telefono: '+39 333 1234567',
      indirizzo: 'Via Roma 123',
      citta: 'Milano',
      provincia: 'MI',
      cap: '20100',
      statoAccessoPortale: 'disabilitato',
    },
  })

  console.log('✅ Cliente demo creato')

  console.log('\n🎉 Seeding completato!')
  console.log('\n📝 Credenziali accesso:')
  console.log('   Email: romano@studio-ingegneria.it')
  console.log('   Password: admin123')
  console.log('   Ruolo: TITOLARE\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Aggiungi script in `package.json`:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

Installa `tsx`:
```bash
npm install -D tsx
```

Esegui seed:
```bash
npm run db:seed
```

## Verifica Finale

```bash
# Apri Prisma Studio
npm run db:studio

# Verifica tabelle create:
# - ruoli (2 record)
# - utenti (1 record: Ing. Romano)
# - bundle (3 record: Fase 1 MVP)
# - clienti (1 record demo)
```

## Troubleshooting

### Errore: "role does not exist"
```bash
sudo -u postgres createuser studio_user
sudo -u postgres createdb studio_erp -O studio_user
```

### Errore: "password authentication failed"
Modifica `/etc/postgresql/14/main/pg_hba.conf`:
```
# Cambia da "peer" a "md5"
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

Riavvia PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Errore: "connection refused"
Verifica servizio attivo:
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

## Backup Database

```bash
# Backup
pg_dump -U studio_user -d studio_erp > backup_$(date +%Y%m%d).sql

# Restore
psql -U studio_user -d studio_erp < backup_20250101.sql
```
