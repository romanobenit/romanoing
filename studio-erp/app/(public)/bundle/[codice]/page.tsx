import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Check, X, Clock } from 'lucide-react';
import { FAQAccordion } from './components/FAQAccordion';

// Types
type BundleCode =
  | 'BDL-CONSULENZA'
  | 'BDL-RISTR-BONUS'
  | 'BDL-DUE-DILIGENCE'
  | 'BDL-VULN-SISMICA'
  | 'BDL-AMPLIAMENTO'
  | 'BDL-COLLAUDO'
  | 'BDL-ANTINCENDIO'
  | 'BDL-EFF-ENERGETICO'
  | 'BDL-PROPTECH-BLOCKCHAIN';

interface Milestone {
  numero: number;
  titolo: string;
  descrizione: string;
  durata: string;
  pagamento?: string;
}

interface FAQ {
  domanda: string;
  risposta: string;
}

interface Bundle {
  codice: BundleCode;
  nome: string;
  descrizione: string;
  descrizioneLunga: string;
  icon: string;
  prezzoMin: number;
  prezzoMax: number;
  durata: string;
  target: string;
  caratteristiche: string[];
  cosaInclude: string[];
  cosaEsclude: string[];
  milestone: Milestone[];
  faq: FAQ[];
}

// Hardcoded Bundle Data
const BUNDLES_DATA: Record<BundleCode, Bundle> = {
  'BDL-CONSULENZA': {
    codice: 'BDL-CONSULENZA',
    nome: 'Consulenza Tecnica',
    descrizione: 'Inquadramento preliminare (60-90 min)',
    descrizioneLunga:
      'Sessione di consulenza tecnica specializzata per l\'analisi preliminare del vostro progetto. Valutiamo criticità, fattibilità tecnica e definiamo una roadmap operativa con stime dei costi di intervento.',
    icon: '💡',
    prezzoMin: 180,
    prezzoMax: 600,
    durata: '1-2 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Sessione di consulenza one-on-one (60-90 minuti)',
      'Analisi tecnica preliminare del progetto',
      'Identificazione criticità e opportunità',
      'Definizione roadmap operativa dettagliata',
    ],
    cosaInclude: [
      'Colloquio tecnico specializzato con l\'ingegnere',
      'Analisi preliminare della fattibilità',
      'Stima indicativa dei costi di intervento',
      'Documento di sintesi con raccomandazioni',
      'Supporto per eventuali chiarimenti',
    ],
    cosaEsclude: [
      'Rilievi geometrici in campo',
      'Progetti tecnici dettagliati',
      'Pratiche amministrative e autorizzative',
      'Collaudo o certificazioni finali',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Prenotazione e Briefing',
        descrizione: 'Fissazione della data della consulenza e raccolta informazioni preliminari',
        durata: '2-3 giorni',
        pagamento: '30%',
      },
      {
        numero: 2,
        titolo: 'Sessione di Consulenza',
        descrizione: 'Incontro one-on-one con analisi approfondita e discussione soluzioni',
        durata: '1-2 giorni',
        pagamento: '50%',
      },
      {
        numero: 3,
        titolo: 'Documento di Sintesi',
        descrizione: 'Redazione e consegna report finale con raccomandazioni e roadmap',
        durata: '3-5 giorni',
        pagamento: '20%',
      },
    ],
    faq: [
      {
        domanda: 'Quanto dura la sessione di consulenza?',
        risposta:
          'La sessione dura tra 60 e 90 minuti, a seconda della complessità del progetto. Può svolgersi in presenza presso il nostro studio o in videoconferenza.',
      },
      {
        domanda: 'Cosa ricevo al termine della consulenza?',
        risposta:
          'Riceverete un documento di sintesi con l\'analisi tecnica, l\'identificazione delle criticità, le soluzioni proposte, una stima dei costi e una roadmap operativa dettagliata.',
      },
      {
        domanda: 'Posso richiedere una consulenza per un progetto già avviato?',
        risposta:
          'Assolutamente sì. La consulenza tecnica è ideale sia per progetti in fase preliminare che per interventi già avviati sui quali desiderate una valutazione indipendente.',
      },
    ],
  },

  'BDL-RISTR-BONUS': {
    codice: 'BDL-RISTR-BONUS',
    nome: 'Ristrutturazione con Bonus Edilizi',
    descrizione: 'Progetto completo + Bonus Edilizi (Sismabonus, Ecobonus, etc.)',
    descrizioneLunga:
      'Pacchetto completo di progettazione e pratiche per ristrutturazione edilizia con accesso ai principali bonus fiscali. Includiamo rilievi geometrici, progetti architettonici e strutturali, pratiche edilizie e asseverazioni per bonus.',
    icon: '🏗️',
    prezzoMin: 8000,
    prezzoMax: 18000,
    durata: '8-12 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Rilievo geometrico con strumentazione laser 3D',
      'Progetto architettonico e strutturale completo',
      'Pratiche edilizie (SCIA/Permesso di Costruire)',
      'Asseverazioni tecniche per bonus fiscali',
      'Direzione lavori e assistenza in cantiere',
    ],
    cosaInclude: [
      'Rilievo geometrico laser 3D dell\'immobile',
      'Progetto architettonico con planimetrie e sezioni',
      'Progetto strutturale (se necessario)',
      'Progetto MEP (impianti)',
      'Relazioni tecniche specialistiche',
      'Pratiche autorizzative (SCIA, Permesso, etc.)',
      'Asseverazioni per Sismabonus e Ecobonus',
      'Certificazione energetica (APE)',
      'Coordinamento della sicurezza in fase progettuale',
      'Supporto durante i lavori (Direzione Lavori)',
    ],
    cosaEsclude: [
      'Realizzazione effettiva dei lavori',
      'Direzione lavori completa e coordinamento esecutivo',
      'Consulenze specialistiche aggiuntive (acustica, antincendio, etc.)',
      'Pratiche di finanziamento o accesso ai bonus',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Rilievo Geometrico e Progetto Preliminare',
        descrizione:
          'Esecuzione rilievo laser 3D, sopralluoghi e redazione progetto preliminare con approvazione clientevole',
        durata: '2-3 settimane',
        pagamento: '25%',
      },
      {
        numero: 2,
        titolo: 'Progetto Definitivo ed Esecutivo',
        descrizione: 'Sviluppo completo dei progetti (architettonico, strutturale, MEP) e relazioni tecniche',
        durata: '3-4 settimane',
        pagamento: '35%',
      },
      {
        numero: 3,
        titolo: 'Pratiche Autorizzative e Asseverazioni',
        descrizione: 'Redazione SCIA/Permesso, asseverazioni bonus fiscali, certificazione energetica',
        durata: '2-3 settimane',
        pagamento: '25%',
      },
      {
        numero: 4,
        titolo: 'Direzione Lavori',
        descrizione: 'Assistenza durante i lavori, verifiche di conformità e redazione SAL',
        durata: 'Durata cantiere',
        pagamento: '15%',
      },
    ],
    faq: [
      {
        domanda: 'Quali bonus fiscali posso richiedere?',
        risposta:
          'A seconda della natura dei lavori, potete accedere a Sismabonus (fino al 110%), Ecobonus, Bonus Ristrutturazione (al 50%), o loro combinazioni. Valuteremo il vostro caso specifico.',
      },
      {
        domanda: 'Quanto tempo ci vuole per ottenere il permesso?',
        risposta:
          'I tempi dipendono dalla complessità del progetto e dai tempi amministrativi del comune. In media, contate 4-8 settimane dalla presentazione della pratica.',
      },
      {
        domanda: 'Includete anche la direzione dei lavori?',
        risposta:
          'Sì, la Direzione Lavori è inclusa nel pacchetto. Saremo presenti durante i lavori per verificare la conformità al progetto e redigere i SAL (Stati di Avanzamento Lavori) per i pagamenti.',
      },
    ],
  },

  'BDL-DUE-DILIGENCE': {
    codice: 'BDL-DUE-DILIGENCE',
    nome: 'Due Diligence Tecnica',
    descrizione: 'Verifica tecnica completa pre-acquisto',
    descrizioneLunga:
      'Valutazione tecnica approfondita di un immobile prima dell\'acquisto. Comprende ispezione strutturale, analisi della conformità normativa, stima degli interventi necessari e report fotografico dettagliato.',
    icon: '📋',
    prezzoMin: 1500,
    prezzoMax: 4000,
    durata: '1-3 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Ispezione strutturale approfondita dell\'immobile',
      'Verifica conformità normativa e autorizzativa',
      'Indagini strumentali (termografia, umidità, etc.)',
      'Stima economica degli interventi necessari',
      'Report fotografico e documentazione completa',
    ],
    cosaInclude: [
      'Ispezione strutturale in situ dell\'immobile',
      'Verifica conformità con normativa vigente (edilizia, sicurezza, etc.)',
      'Analisi stato conservativo strutture e impianti',
      'Indagini termografiche per dispersioni termiche',
      'Misurazioni umidità e analisi muffe',
      'Documentazione storica (quando disponibile)',
      'Stima economica degli interventi urgenti',
      'Report fotografico dettagliato (100+ foto)',
      'Documento di sintesi con raccomandazioni',
    ],
    cosaEsclude: [
      'Progetti tecnici e pratiche autorizzative',
      'Direzione dei lavori di intervento',
      'Indagini approfondite (sondaggi, carotaggi)',
      'Consulenze specialistiche aggiuntive',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Sopralluogo Tecnico',
        descrizione: 'Ispezione completa dell\'immobile, rilievi e documentazione fotografica',
        durata: '3-7 giorni',
        pagamento: '40%',
      },
      {
        numero: 2,
        titolo: 'Indagini Strumentali',
        descrizione: 'Termografia, analisi umidità e altre indagini tecniche non invasive',
        durata: '5-10 giorni',
        pagamento: '30%',
      },
      {
        numero: 3,
        titolo: 'Redazione Report',
        descrizione: 'Elaborazione dati, stima interventi e redazione report finale dettagliato',
        durata: '5-7 giorni',
        pagamento: '30%',
      },
    ],
    faq: [
      {
        domanda: 'Quanto dura una ispezione di due diligence?',
        risposta:
          'Il sopralluogo varia da 4-8 ore a seconda della dimensione e complessità dell\'immobile. Un appartamento di 100 mq richiede mediamente 6 ore.',
      },
      {
        domanda: 'Ricevo uno studio dettagliato di tutti i costi di intervento?',
        risposta:
          'Sì, il report comprende una stima economica di tutti gli interventi necessari, suddivisi per urgenza e categoria. Potrete così valutare consapevolmente il vostro acquisto.',
      },
      {
        domanda: 'Mi servono indagini invasive come carotaggi?',
        risposta:
          'No, la due diligence standard utiliza solo indagini non invasive. Carotaggi e sondaggi sono consigliati solo in casi specifici e su richiesta.',
      },
    ],
  },

  'BDL-VULN-SISMICA': {
    codice: 'BDL-VULN-SISMICA',
    nome: 'Vulnerabilità Sismica',
    descrizione: 'Valutazione e miglioramento sismico',
    descrizioneLunga:
      'Valutazione completa della vulnerabilità sismica della struttura con indagini approfondite e progettazione degli interventi di miglioramento. Accesso a Sismabonus fino al 110%.',
    icon: '🏛️',
    prezzoMin: 5000,
    prezzoMax: 25000,
    durata: '12-16 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Rilievo geometrico e strutturale completo',
      'Indagini diagnostiche approfondite (carotaggi, prove meccaniche)',
      'Modellazione FEM 3D e analisi sismica',
      'Progetto strutturale di miglioramento',
      'Asseverazione Sismabonus 110%',
      'Coordinamento della sicurezza',
    ],
    cosaInclude: [
      'Rilievo geometrico e strutturale laser 3D',
      'Ispezione visiva accurata della struttura',
      'Carotaggi e prelievo campioni (dove necessario)',
      'Prove di laboratorio su materiali',
      'Ricerca storica e documentazione edificio',
      'Modellazione FEM 3D della struttura',
      'Analisi sismica (spettri di risposta)',
      'Valutazione vulnerabilità sismica',
      'Progetto strutturale interventi di miglioramento',
      'Relazioni specialistiche complete',
      'Asseverazione tecnica Sismabonus',
      'Certificazione energetica',
      'Pratiche autorizzative',
    ],
    cosaEsclude: [
      'Realizzazione dei lavori',
      'Direzione lavori (su richiesta aggiuntiva)',
      'Bonifica amianto o altre contaminazioni',
      'Indagini archeologiche',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Rilievi e Indagini Preliminari',
        descrizione: 'Rilievo geometrico, indagini diagnostiche, carotaggi e prove di laboratorio',
        durata: '3-4 settimane',
        pagamento: '25%',
      },
      {
        numero: 2,
        titolo: 'Modellazione FEM e Analisi Sismica',
        descrizione: 'Creazione modello 3D, analisi sismica, valutazione vulnerabilità',
        durata: '3-4 settimane',
        pagamento: '25%',
      },
      {
        numero: 3,
        titolo: 'Progetto Miglioramento Sismico',
        descrizione: 'Progettazione interventi strutturali, relazioni specialistiche, asseverazioni',
        durata: '3-4 settimane',
        pagamento: '30%',
      },
      {
        numero: 4,
        titolo: 'Pratiche e Documentazione Finale',
        descrizione: 'Pratiche autorizzative, certificazioni energetiche, documentazione completa',
        durata: '2-3 settimane',
        pagamento: '20%',
      },
    ],
    faq: [
      {
        domanda: 'Qual è il valore del Sismabonus?',
        risposta:
          'Il Sismabonus consente una detrazione fiscale del 110% dei costi di miglioramento sismico, per 5 anni. È cumulabile con Ecobonus se i lavori riguardano efficientamento energetico.',
      },
      {
        domanda: 'Quanto tempo richiede una valutazione completa?',
        risposta:
          'Una valutazione completa richiede 10-16 settimane, suddivise in rilievi (3-4 settimane), analisi (3-4 settimane), progetto (3-4 settimane) e pratiche (2-3 settimane).',
      },
      {
        domanda: 'Avrò garantito l\'accesso al Sismabonus 110%?',
        risposta:
          'Sì, con i nostri interventi avrete l\'asseverazione tecnica necessaria. Le aliquote possono variare in base alla zona sismica e alla natura dell\'intervento.',
      },
    ],
  },

  'BDL-AMPLIAMENTO': {
    codice: 'BDL-AMPLIAMENTO',
    nome: 'Ampliamento Produttivo',
    descrizione: 'Espansione capannoni industriali',
    descrizioneLunga:
      'Progettazione completa di ampliamenti per strutture produttive e industriali. Include calcoli strutturali avanzati, pratiche autorizzative e direzione lavori specializzata.',
    icon: '🏭',
    prezzoMin: 12000,
    prezzoMax: 35000,
    durata: '10-14 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Valutazione spazi e layout produttivo',
      'Progetto strutturale con calcoli carichi specifici',
      'Impianti (elettrico, HVAC, antincendio)',
      'Pratiche autorizzative (SCIA/Permesso)',
      'Direzione lavori specializzata',
      'Assistenza nella gestione cantiere',
    ],
    cosaInclude: [
      'Studio preliminare e feasibility analysis',
      'Rilievi geometrici e planimetrie attuali',
      'Progetto architettonico ampliamento',
      'Progetto strutturale con calcoli specifici',
      'Valutazione carichi operativi e macchinari',
      'Progetto MEP (impianti completi)',
      'Analisi geotecnica fondazioni',
      'Relazioni specialistiche (amianto, acustica, etc.)',
      'Pratiche autorizzative (SCIA/Permesso)',
      'Documentazione della sicurezza',
      'Certificazione energetica',
      'Direzione lavori e controllo conformità',
      'Redazione SAL per pagamenti',
    ],
    cosaEsclude: [
      'Realizzazione effettiva della costruzione',
      'Bonifica amianto',
      'Consulenze specialistiche aggiuntive',
      'Permessi ambientali specifici',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Feasibility e Progetto Preliminare',
        descrizione: 'Studio fattibilità, layout produttivo, rilievi e progetto preliminare',
        durata: '2-3 settimane',
        pagamento: '20%',
      },
      {
        numero: 2,
        titolo: 'Progetto Definitivo ed Esecutivo',
        descrizione: 'Progetti strutturale, MEP, calcoli specialistici, relazioni tecniche',
        durata: '3-4 settimane',
        pagamento: '30%',
      },
      {
        numero: 3,
        titolo: 'Pratiche Autorizzative',
        descrizione: 'Predisposizione SCIA/Permesso, certificazioni, coordinamento comuni',
        durata: '2-3 settimane',
        pagamento: '25%',
      },
      {
        numero: 4,
        titolo: 'Direzione Lavori',
        descrizione: 'Supervisione cantiere, verifiche conformità, SAL e certificazioni finali',
        durata: 'Durata cantiere',
        pagamento: '25%',
      },
    ],
    faq: [
      {
        domanda: 'Quanto tempo richiede un ampliamento industriale?',
        risposta:
          'Progettazione: 10-14 settimane. Realizzazione: dipende dalle dimensioni, mediamente 6-12 mesi per ampliamenti di 500-1000 mq.',
      },
      {
        domanda: 'Quali sono i principali vincoli per un ampliamento?',
        risposta:
          'Vincoli principali: strumenti urbanistici (PRG), vincoli ambientali, distanze da confini e strade, disponibilità spazi, caratteristiche geotecniche del terreno.',
      },
      {
        domanda: 'Posso accedere a incentivi per l\'ampliamento?',
        risposta:
          'Dipende da regionali e locali. Spesso sono disponibili incentivi per PMI in settori specifici (innovazione, export, etc.). Valuteremo insieme le opportunità.',
      },
    ],
  },

  'BDL-COLLAUDO': {
    codice: 'BDL-COLLAUDO',
    nome: 'Collaudo Statico',
    descrizione: 'Certificazione opere strutturali',
    descrizioneLunga:
      'Collaudo statico completo delle opere strutturali con ispezioni, verifiche di conformità ai progetti, prove di carico e certificazione finale.',
    icon: '✅',
    prezzoMin: 2500,
    prezzoMax: 12000,
    durata: '4-8 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Ispezione visiva completa delle opere strutturali',
      'Verifica conformità ai progetti esecutivi',
      'Prove di carico (se previste)',
      'Certificato di collaudo statico',
      'Relazione tecnica dettagliata',
      'Documentazione fotografica',
    ],
    cosaInclude: [
      'Ispezione visiva accurata di tutte le opere strutturali',
      'Verifica conformità ai progetti approvati',
      'Controllo tolleranze costruttive',
      'Prove di laboratorio su campioni (se necessarie)',
      'Prove di carico (statico, dinamico, funzionale)',
      'Analisi strumentali (stress test)',
      'Redazione relazione tecnica completa',
      'Certificato di collaudo statico',
      'Documentazione fotografica e video',
      'Rilievo stato di fatto post-realizzazione',
    ],
    cosaEsclude: [
      'Realizzazione degli interventi strutturali',
      'Riparazioni strutturali',
      'Collaudo di impianti (elettrico, idraulico, etc.)',
      'Certificazione energetica',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Ispezione Visiva e Rilievi',
        descrizione: 'Ispezione preliminare, rilievi geometrici, verifica conformità progetti',
        durata: '1-2 settimane',
        pagamento: '30%',
      },
      {
        numero: 2,
        titolo: 'Prove di Carico',
        descrizione: 'Esecuzione prove statiche, dinamiche e funzionali secondo normative',
        durata: '1-2 settimane',
        pagamento: '35%',
      },
      {
        numero: 3,
        titolo: 'Redazione Certificato',
        descrizione: 'Elaborazione dati prove, redazione relazione e certificato di collaudo',
        durata: '1-2 settimane',
        pagamento: '35%',
      },
    ],
    faq: [
      {
        domanda: 'Quando è obbligatorio il collaudo statico?',
        risposta:
          'Il collaudo è obbligatorio per edifici soggetti a permesso di costruire, opere in zona sismica, ampliamenti strutturali, e quando previsto nel contratto.',
      },
      {
        domanda: 'Quali sono le prove di carico più comuni?',
        risposta:
          'Prove statiche (carico concentrato e distribuito), prove dinamiche (vibrazioni), prove funzionali (aperture porte/finestre), test strumentali per edifici particolari.',
      },
      {
        domanda: 'Cosa succede se il collaudo evidenzia problemi?',
        risposta:
          'Se emergono non conformità, viene redatto un report dettagliato con le problematiche riscontrate e le soluzioni consigliate. Le riparazioni sono a carico del costruttore.',
      },
    ],
  },

  'BDL-ANTINCENDIO': {
    codice: 'BDL-ANTINCENDIO',
    nome: 'Antincendio',
    descrizione: 'Progettazione prevenzione incendi',
    descrizioneLunga:
      'Progettazione completa dei sistemi di prevenzione incendi con valutazione dei rischi, progetto antincendio dettagliato, pratiche VVF e assistenza alle ispezioni.',
    icon: '🔥',
    prezzoMin: 2000,
    prezzoMax: 8000,
    durata: '6-10 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Valutazione dei rischi incendio',
      'Progetto antincendio dettagliato',
      'Impianti di rilevamento e estinzione',
      'Vie di fuga e compartimentazioni',
      'SCIA al Comando VVF',
      'Assistenza ispettiva',
    ],
    cosaInclude: [
      'Sopralluogo e valutazione rischi incendio',
      'Analisi della destinazione d\'uso e carico incendio',
      'Progetto antincendio conforme codice di prevenzione',
      'Progettazione vie di fuga e uscite di sicurezza',
      'Progetto sistemi di rilevamento (rilevatori fumo/calore)',
      'Progetto impianti di estinzione (sprinkler, impianti FM200, etc.)',
      'Progetto illuminazione di emergenza e segnaletica',
      'Relazioni specialistiche',
      'SCIA (Segnalazione Certificata di Inizio Attività) al VVF',
      'Assistenza durante l\'ispezione VVF',
      'Documentazione per conformità assicurativa',
    ],
    cosaEsclude: [
      'Realizzazione impianti antincendio',
      'Manutenzione impianti',
      'Collaudo tecnico impianti (a carico ditta installatrice)',
      'Vigilanza ordinaria',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Sopralluogo e Valutazione Rischi',
        descrizione: 'Analisi approfondita, identificazione rischi, raccolta documentazione',
        durata: '1-2 settimane',
        pagamento: '25%',
      },
      {
        numero: 2,
        titolo: 'Progetto Antincendio',
        descrizione: 'Progettazione vie fuga, impianti rilevamento/estinzione, segnaletica',
        durata: '2-3 settimane',
        pagamento: '40%',
      },
      {
        numero: 3,
        titolo: 'SCIA VVF e Documentazione',
        descrizione: 'Redazione SCIA, documentazione di conformità, assistenza ispezione',
        durata: '2-3 settimane',
        pagamento: '35%',
      },
    ],
    faq: [
      {
        domanda: 'Quali attività richiedono il progetto antincendio?',
        risposta:
          'Attività soggette: impianti sportivi, parcheggi, depositi, strutture ricettive, uffici oltre 200 mq, laboratori, aree artigianali, strutture industriali.',
      },
      {
        domanda: 'Quanto tempo occorre per il primo intervento VVF?',
        risposta:
          'Dopo la presentazione della SCIA, i VVF hanno 30 giorni per la verifica preliminare. Generalmente i tempi sono più rapidi per attività a basso rischio.',
      },
      {
        domanda: 'Devo realizzare tutti gli impianti proposti?',
        risposta:
          'La realizzazione è obbligatoria per gli impianti previsti nel progetto e dalla legge. Potranno essere proposti soluzioni alternative equivalenti dal punto di vista della sicurezza.',
      },
    ],
  },

  'BDL-EFF-ENERGETICO': {
    codice: 'BDL-EFF-ENERGETICO',
    nome: 'Efficientamento Energetico',
    descrizione: 'Riqualificazione energetica edifici',
    descrizioneLunga:
      'Analisi energetica completa dell\'edificio con diagnosi approfondita e progettazione degli interventi di efficientamento. Accesso a Ecobonus, Superbonus e incentivi regionali.',
    icon: '⚡',
    prezzoMin: 2500,
    prezzoMax: 8000,
    durata: '6-10 settimane',
    target: 'Privati/Aziende/P.A.',
    caratteristiche: [
      'Diagnosi energetica approfondita',
      'Rilievo geometrico e termografia',
      'Modello energetico dinamico',
      'Progetto interventi di efficientamento',
      'Calcoli per accesso Ecobonus',
      'Asseverazione tecnica per incentivi',
    ],
    cosaInclude: [
      'Ispezione visiva dell\'edificio',
      'Rilievo geometrico con laser scanner',
      'Termografia a infrarossi (individuazione dispersioni)',
      'Prelievo e analisi campioni isolanti',
      'Indagini strumentali su impianti',
      'Ricerca storica consumi energetici',
      'Modello energetico dinamico dell\'edificio',
      'Calcolo fabbisogno energetico ante-intervento',
      'Progettazione interventi (isolamento, finestre, impianti)',
      'Calcolo risparmi energetici post-intervento',
      'APE (Attestato di Prestazione Energetica) ante e post',
      'Relazioni specialistiche complete',
      'Asseverazione per Ecobonus/Superbonus',
      'Documentazione per l\'accesso agli incentivi',
    ],
    cosaEsclude: [
      'Realizzazione degli interventi',
      'Direzione lavori',
      'Pratiche di finanziamento agevolato',
      'Certificazione seismica',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Sopralluogo e Diagnosi Energetica',
        descrizione: 'Ispezione, rilievi, termografia, analisi dati energetici storici',
        durata: '2-3 settimane',
        pagamento: '30%',
      },
      {
        numero: 2,
        titolo: 'Modellazione e Progettazione',
        descrizione: 'Modello energetico dinamico, progettazione interventi, calcoli risparmi',
        durata: '2-3 settimane',
        pagamento: '35%',
      },
      {
        numero: 3,
        titolo: 'APE e Asseverazioni',
        descrizione: 'Redazione APE ante/post, asseverazioni tecniche, documentazione incentivi',
        durata: '1-2 settimane',
        pagamento: '35%',
      },
    ],
    faq: [
      {
        domanda: 'Quale è lo scopo della diagnosi energetica?',
        risposta:
          'La diagnosi energetica identifica come l\'edificio consuma energia, quali sono gli sprechi principali e quali interventi garantirebbero il miglior rapporto costo/beneficio.',
      },
      {
        domanda: 'Posso accedere al Superbonus 110%?',
        risposta:
          'Il Superbonus è disponibile per edifici dove gli interventi raggiungono il miglioramento di almeno 2 classi energetiche. La nostra diagnosi valuta se il vostro edificio è idoneo.',
      },
      {
        domanda: 'Quali interventi sono consigliabili per un edificio datato?',
        risposta:
          'Per edifici datati: isolamento pareti, sostituzione infissi, nuovi sistemi di riscaldamento/raffrescamento, installazione solare termico/fotovoltaico. Priorità: involucro, poi impianti.',
      },
    ],
  },

  'BDL-PROPTECH-BLOCKCHAIN': {
    codice: 'BDL-PROPTECH-BLOCKCHAIN',
    nome: 'PropTech/Blockchain R&D',
    descrizione: 'Ricerca tokenizzazione immobiliare',
    descrizioneLunga:
      'Servizi di Ricerca e Sviluppo (ATECO 72.19) per l\'esplorazione della tokenizzazione immobiliare tramite blockchain. Include studio di fattibilità, sviluppo PoC smart contract su testnet, dashboard MVP e linee guida architetturali. Orientato a start-up, fondi immobiliari e aziende PropTech che vogliono esplorare le opportunità della tokenizzazione.',
    icon: '✨',
    prezzoMin: 3000,
    prezzoMax: 48000,
    durata: '4-12 settimane',
    target: 'Aziende/Fondi/Start-up',
    caratteristiche: [
      'Servizi di R&D (ATECO 72.19) - Non produzione',
      'Studio di fattibilità tokenizzazione immobiliare',
      'PoC Smart Contract su testnet (Sepolia/Goerli)',
      'Dashboard test MVP per visualizzazione token',
      'Linee guida architettura tecnica',
      'Analisi compliance (MiFID II, MICA Regulation)',
    ],
    cosaInclude: [
      'Studio di fattibilità: analisi giuridica, economica e tecnica della tokenizzazione',
      'Analisi struttura SPV (Special Purpose Vehicle) per emissione token',
      'Design token economics e governance mechanisms',
      'Market analysis e studio comparativo piattaforme esistenti',
      'Sviluppo PoC Smart Contract (ERC-20/ERC-1400) su testnet',
      'Transfer restrictions avanzate (whitelist, lockup, vesting)',
      'Dividend distribution automation e governance on-chain',
      'Security audit manuale preliminare del codice',
      'Dashboard test MVP: interfaccia web essenziale per visualizzazione token',
      'Analytics dashboard con metriche base (holders, supply, transactions)',
      'Governance UI module per voting e proposals',
      'Linee guida architettura: documentazione tecnica per produzione',
      'Deployment instructions per mainnet',
      'Best practices sicurezza e scalabilità',
      '✅ Consulenza obbligatoria pre-progetto (2 ore)',
    ],
    cosaEsclude: [
      'Deployment su rete mainnet (solo testnet)',
      'Smart contract production-ready (solo PoC di ricerca)',
      'Security audit formale certificato di terze parti',
      'Dashboard production-ready (solo MVP essenziale)',
      'Consulenza legale specialistica su securities',
      'Integrazione con exchange o piattaforme terze',
      'Marketing, tokenomics dettagliata o investor deck',
      'Conformità normativa completa (solo assessment preliminare)',
    ],
    milestone: [
      {
        numero: 1,
        titolo: 'Studio di Fattibilità',
        descrizione: 'Analisi giuridica, economica e tecnica. Verifica compliance preliminare MiFID II/MICA. Assessment SPV structure.',
        durata: '4-6 settimane',
        pagamento: '25%',
      },
      {
        numero: 2,
        titolo: 'Smart Contract PoC',
        descrizione: 'Sviluppo PoC smart contract su testnet (ERC-20/ERC-1400). Transfer restrictions, dividend automation, governance. Security audit manuale preliminare.',
        durata: '6-10 settimane',
        pagamento: '40%',
      },
      {
        numero: 3,
        titolo: 'Dashboard Test MVP',
        descrizione: 'Interfaccia web essenziale per visualizzazione token, analytics base, governance UI. Solo ambiente test.',
        durata: '4-6 settimane',
        pagamento: '25%',
      },
      {
        numero: 4,
        titolo: 'Linee Guida Architettura',
        descrizione: 'Documentazione tecnica completa per produzione. Deployment instructions, best practices sicurezza e scalabilità.',
        durata: '1-2 settimane',
        pagamento: '10%',
      },
    ],
    faq: [
      {
        domanda: 'Cos\'è un servizio di R&D (ATECO 72.19)?',
        risposta:
          'I servizi di Ricerca e Sviluppo sono attività sperimentali finalizzate all\'esplorazione di nuove tecnologie. Non producono software production-ready, ma PoC (Proof of Concept) per validare fattibilità tecnica ed economica.',
      },
      {
        domanda: 'Perché solo testnet e non mainnet?',
        risposta:
          'I servizi R&D includono smart contract su reti test (Sepolia/Goerli) per validare la fattibilità senza rischi economici. Il deployment su mainnet richiede audit certificati, coperture assicurative e conformità normativa completa, che sono fuori dallo scope di un progetto di ricerca.',
      },
      {
        domanda: 'La dashboard MVP è production-ready?',
        risposta:
          'No. La dashboard è un\'interfaccia prototipale essenziale per visualizzare i token su testnet. Per un ambiente di produzione serve: design UX/UI professionale, test di sicurezza approfonditi, integrazione con wallet provider, monitoraggio errori e molto altro.',
      },
      {
        domanda: 'Posso usare il PoC per lanciare un security token?',
        risposta:
          'No. Il PoC è uno strumento di ricerca per validare la fattibilità tecnica. Per lanciare un security token vero servono: audit certificati, parere legale su securities, piattaforma production con tutte le certificazioni, compliance KYC/AML, e molto altro che va oltre lo scope R&D.',
      },
      {
        domanda: 'Quali normative devo considerare?',
        risposta:
          'Le principali sono: MiFID II (se il token è un security), MICA Regulation (cripto-asset), GDPR (privacy dati), normative AML/KYC. Il nostro servizio include un assessment preliminare, ma per conformità completa serve consulenza legale specializzata.',
      },
      {
        domanda: 'Quanto costa passare dalla PoC alla produzione?',
        risposta:
          'Dipende dalla complessità. Generalmente: audit certificato €15K-50K, sviluppo piattaforma production €50K-200K, consulenza legale €20K-100K, setup operativo (KYC/AML) €30K-80K. Il nostro studio di fattibilità fornisce una stima preliminare.',
      },
    ],
  },
};

interface PageProps {
  params: Promise<{
    codice: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { codice } = await params;
  const bundle = BUNDLES_DATA[codice as BundleCode];

  if (!bundle) {
    return {
      title: 'Bundle Non Trovato - Studio Ing. Domenico Romano',
      description: 'Il servizio richiesto non è disponibile.',
    };
  }

  return {
    title: `${bundle.nome} - Studio Ing. Domenico Romano`,
    description: bundle.descrizioneLunga.substring(0, 160),
    openGraph: {
      title: `${bundle.nome} - Studio Ing. Domenico Romano`,
      description: bundle.descrizioneLunga,
      url: `/bundle/${bundle.codice}`,
      type: 'website',
    },
  };
}

export default async function BundlePage({ params }: PageProps) {
  const { codice } = await params;
  const bundle = BUNDLES_DATA[codice as BundleCode];

  if (!bundle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                SR
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Technical Advisory Ing. Domenico Romano
                </h1>
                <p className="text-xs text-gray-600">Consulenza tecnica avanzata</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/#servizi"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Esplora Servizi
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Accedi
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Breadcrumb & Back Link */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/#servizi" className="hover:text-blue-600">
            Servizi
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{bundle.nome}</span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-5xl mb-6">
              {bundle.icon}
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {bundle.nome}
          </h1>
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {bundle.descrizioneLunga}
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-base py-2 px-4">
              {bundle.target}
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              <Clock className="w-4 h-4 mr-2" />
              {bundle.durata}
            </Badge>
          </div>
        </div>
      </section>

      {/* Price Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Prezzo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                €{bundle.prezzoMin.toLocaleString('it-IT')} - €{bundle.prezzoMax.toLocaleString('it-IT')}
              </div>
              <p className="text-sm text-gray-600">
                Preventivo personalizzato su esigenze specifiche
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Durata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {bundle.durata}
              </div>
              <p className="text-sm text-gray-600">
                Tempi di progettazione e realizzazione
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-purple-600 mb-2">
                {bundle.target}
              </div>
              <p className="text-sm text-gray-600">
                Servizio disponibile per tutti i segmenti
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Caratteristiche Section */}
      <section className="container mx-auto px-4 py-12 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Caratteristiche Principali
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {bundle.caratteristiche.map((caratteristica, idx) => (
              <Card key={idx} className="border-l-4 border-l-blue-600">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <div className="text-blue-600 mt-1 flex-shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-gray-700">{caratteristica}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Include/Esclude Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Include */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-green-600">
                  <Check className="w-5 h-5" />
                </div>
                Cosa Includere
              </h2>
              <div className="space-y-3">
                {bundle.cosaInclude.map((item, idx) => (
                  <Card key={idx} className="border-l-4 border-l-green-500 bg-green-50/50">
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Esclude */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center text-orange-600">
                  <X className="w-5 h-5" />
                </div>
                Cosa Escludere
              </h2>
              <div className="space-y-3">
                {bundle.cosaEsclude.map((item, idx) => (
                  <Card key={idx} className="border-l-4 border-l-orange-500 bg-orange-50/50">
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        <X className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{item}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Milestones */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Fasi Operative
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-blue-300" />

            <div className="space-y-12">
              {bundle.milestone.map((milestone, idx) => (
                <div key={idx} className="md:flex md:gap-8">
                  <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:text-right' : 'md:order-2'}`}>
                    <Card className="md:mr-8 relative">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{milestone.titolo}</CardTitle>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {milestone.durata}
                              </span>
                              {milestone.pagamento && (
                                <span className="font-semibold text-blue-600">
                                  {milestone.pagamento}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{milestone.descrizione}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="hidden md:flex items-start justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg relative z-10">
                      {milestone.numero}
                    </div>
                  </div>

                  <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:order-2' : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Domande Frequenti
          </h2>
          <FAQAccordion faqs={bundle.faq} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Pronto a Configurare il Tuo Servizio?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Usa il nostro configuratore intelligente per ottenere un preventivo personalizzato in tempo reale.
            <br />
            <span className="font-semibold">Certificato ISO 9001 | Sicurezza dati ISO 27001</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href={
                bundle.codice === 'BDL-CONSULENZA' ? '/configuratore/consulenza' :
                bundle.codice === 'BDL-RISTR-BONUS' ? '/configuratore/ristrutturazione' :
                bundle.codice === 'BDL-DUE-DILIGENCE' ? '/configuratore/due-diligence' :
                bundle.codice === 'BDL-VULN-SISMICA' ? '/configuratore/sismica' :
                bundle.codice === 'BDL-AMPLIAMENTO' ? '/configuratore/ampliamento' :
                bundle.codice === 'BDL-COLLAUDO' ? '/configuratore/collaudo' :
                bundle.codice === 'BDL-ANTINCENDIO' ? '/configuratore/antincendio' :
                bundle.codice === 'BDL-EFF-ENERGETICO' ? '/configuratore/efficientamento' :
                bundle.codice === 'BDL-PROPTECH-BLOCKCHAIN' ? '/configuratore/proptech-blockchain' :
                '/#servizi'
              }>
                ⚙️ Configura {bundle.nome} →
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/">
                ← Torna alla Home
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Technical Advisory Ing. Domenico Romano</h3>
              <p className="text-gray-600 text-sm mb-4">
                Consulenza tecnica avanzata certificata ISO 9001 e ISO 27001
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  ISO 9001:2015
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ISO 27001:2022
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Servizi</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/bundle/BDL-CONSULENZA" className="hover:text-blue-600">
                    Consulenza Tecnica
                  </Link>
                </li>
                <li>
                  <Link href="/bundle/BDL-RISTR-BONUS" className="hover:text-blue-600">
                    Ristrutturazione
                  </Link>
                </li>
                <li>
                  <Link href="/bundle/BDL-DUE-DILIGENCE" className="hover:text-blue-600">
                    Due Diligence
                  </Link>
                </li>
                <li>
                  <Link href="/bundle/BDL-EFF-ENERGETICO" className="hover:text-blue-600">
                    Efficientamento Energetico
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legale & Contatti</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/legal/privacy" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-blue-600">
                    Termini e Condizioni
                  </Link>
                </li>
                <li className="pt-2 border-t">📧 info@studio-romano.it</li>
                <li>📞 +39 XXX XXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>© 2025 Studio Ing. Domenico Romano - P.IVA IT12345678901</p>
            <p className="mt-2">
              Certificato <strong>ISO 9001:2015</strong> (Qualità) | <strong>ISO 27001:2022</strong>{' '}
              (Sicurezza) | <strong>PCI-DSS Compliant</strong> (Pagamenti) |{' '}
              <strong>GDPR Compliant</strong> (Privacy)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
