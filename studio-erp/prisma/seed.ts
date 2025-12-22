import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ========================================
  // 1. RUOLI
  // ========================================
  console.log('📝 Creazione ruoli...')

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
        incarichi: { view_all: true, create: true, update: true, delete: true, assign: true },
        documenti: { view_all: true, upload: true, approve: true, sign: true, deliver: true },
        economico: { view_all: true, manage: true },
        messaggi: { send: true, receive: true, view_all: true },
        clienti: { view_all: true, create: true, update: true, manage_access: true },
        collaboratori: { view_all: true, create: true, update: true, delete: true },
        sistema: { config: true, stats: true, audit: true },
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
        clienti: { view_own: true, update_own: true },
      },
    },
  })

  console.log('✅ Ruoli creati: TITOLARE, COMMITTENTE\n')

  // ========================================
  // 2. UTENTE TITOLARE
  // ========================================
  console.log('👤 Creazione utente Titolare...')

  // IMPORTANTE: Cambiare password in produzione!
  const passwordHash = await hash('admin123', 10)

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

  console.log('✅ Utente Titolare creato')
  console.log('   📧 Email: romano@studio-ingegneria.it')
  console.log('   🔑 Password: admin123')
  console.log('   ⚠️  IMPORTANTE: Cambiare password in produzione!\n')

  // ========================================
  // 3. BUNDLE (Fase 1 MVP)
  // ========================================
  console.log('📦 Creazione Bundle Fase 1 MVP...')

  const bundleRistrutt = await prisma.bundle.upsert({
    where: { codice: 'BDL-RISTR-BONUS' },
    update: {},
    create: {
      codice: 'BDL-RISTR-BONUS',
      nome: 'Ristrutturazione con Bonus',
      descrizione:
        'Progettazione architettonica e strutturale completa con pratiche bonus edilizi. Include rilievo, progetto, direzione lavori e asseverazioni.',
      target: 'privato',
      prezzoMin: 8000,
      prezzoMax: 18000,
      durataMesi: 9,
      servizi: [
        'Rilievo geometrico stato di fatto',
        'Progetto architettonico',
        'Progetto strutturale',
        'Pratica edilizia (CILA/SCIA)',
        'Direzione lavori',
        'Asseverazioni bonus edilizi',
        'Fine lavori e collaudo',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-04', 'POP-07'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 30, descrizione: 'Accettazione incarico' },
        { codice: 'M1', nome: 'Progetto approvato', percentuale: 35, descrizione: 'Pratica depositata' },
        { codice: 'M2', nome: 'Fine lavori', percentuale: 20, descrizione: 'Chiusura cantiere' },
        { codice: 'M3', nome: 'Collaudo finale', percentuale: 15, descrizione: 'Documentazione completa' },
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
      descrizione:
        'Valutazione della vulnerabilità sismica con indagini strutturali, modellazione FEM e progetto di miglioramento/adeguamento sismico.',
      target: 'condominio',
      prezzoMin: 5000,
      prezzoMax: 25000,
      durataMesi: 3,
      servizi: [
        'Rilievo geometrico strutturale',
        'Indagini sui materiali (prove distruttive/non distruttive)',
        'Modellazione strutturale FEM',
        'Relazione di vulnerabilità sismica',
        'Progetto di miglioramento/adeguamento',
        'Computo metrico estimativo interventi',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-07', 'POP-10'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 30, descrizione: 'Avvio attività' },
        {
          codice: 'M1',
          nome: 'Relazione vulnerabilità',
          percentuale: 30,
          descrizione: 'Consegna analisi sismica',
        },
        {
          codice: 'M2',
          nome: 'Progetto miglioramento',
          percentuale: 40,
          descrizione: 'Progetto definitivo',
        },
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
      descrizione:
        'Progettazione antincendio completa e gestione pratiche VVF (Vigili del Fuoco) per attività commerciali e industriali.',
      target: 'azienda',
      prezzoMin: 2000,
      prezzoMax: 8000,
      durataMesi: 3,
      servizi: [
        'Valutazione del rischio incendio (D.M. 03/09/2021)',
        'Progetto antincendio',
        'Elaborati grafici (planimetrie, sezioni)',
        'SCIA antincendio VVF',
        'Assistenza sopralluogo VVF',
        'Certificato Prevenzione Incendi (CPI)',
      ],
      procedure: ['POP-01', 'POP-02', 'POP-03', 'POP-07'],
      milestone: [
        { codice: 'M0', nome: 'Anticipo', percentuale: 40, descrizione: 'Avvio progettazione' },
        { codice: 'M1', nome: 'Progetto e SCIA', percentuale: 40, descrizione: 'Deposito pratica VVF' },
        { codice: 'M2', nome: 'Chiusura pratica', percentuale: 20, descrizione: 'Ottenimento CPI' },
      ],
      attivo: true,
      faseMvp: 1,
    },
  })

  console.log('✅ Bundle creati:')
  console.log('   🏗️  BDL-RISTR-BONUS (€8.000 - €18.000)')
  console.log('   🏛️  BDL-VULN-SISMICA (€5.000 - €25.000)')
  console.log('   🔥 BDL-ANTINCENDIO (€2.000 - €8.000)\n')

  // ========================================
  // 4. CLIENTE DEMO
  // ========================================
  console.log('👥 Creazione cliente demo...')

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
      note: 'Cliente demo creato dal seed',
    },
  })

  console.log('✅ Cliente demo creato: Mario Rossi (CLI25001)\n')

  // ========================================
  // RIEPILOGO FINALE
  // ========================================
  console.log('🎉 Seeding completato con successo!\n')
  console.log('═══════════════════════════════════════════════════════')
  console.log('📝 CREDENZIALI ACCESSO')
  console.log('═══════════════════════════════════════════════════════')
  console.log('Email:    romano@studio-ingegneria.it')
  console.log('Password: admin123')
  console.log('Ruolo:    TITOLARE (accesso completo)')
  console.log('═══════════════════════════════════════════════════════')
  console.log('\n⚠️  IMPORTANTE:')
  console.log('   Cambiare password in produzione!')
  console.log('   Eliminare cliente demo prima del go-live\n')
  console.log('🚀 Prossimi step:')
  console.log('   1. npm run dev')
  console.log('   2. Apri http://localhost:3000')
  console.log('   3. Login con le credenziali sopra')
  console.log('   4. Inizia a usare la piattaforma!\n')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
