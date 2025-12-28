import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowLeft, Clock, Euro, FileText, Shield } from 'lucide-react';

// Dati bundle (in produzione questi verranno da API)
const bundleData = {
  'BDL-CONSULENZA': {
    nome: 'Consulenza Tecnica',
    descrizione: 'Inquadramento preliminare del tuo progetto con un professionista certificato',
    dettaglio: 'Sessione di consulenza tecnica della durata di 60-90 minuti per analizzare la tua situazione, definire gli obiettivi e pianificare gli step necessari. Include sopralluogo virtuale o in presenza (entro 30 km).',
    categoria: 'Privati',
    prezzoMin: 180,
    prezzoMax: 600,
    durata: '1-2 giorni',
    icon: '💡',
    caratteristiche: [
      'Analisi preliminare situazione',
      'Sopralluogo virtuale o in presenza',
      'Report scritto con indicazioni tecniche',
      'Piano d\'azione dettagliato',
      'Stima costi preliminare',
    ],
    milestone: [
      { nome: 'Pagamento unico', percentuale: 100, descrizione: 'Al momento della prenotazione' }
    ],
  },
  'BDL-RISTR-BONUS': {
    nome: 'Ristrutturazione con Bonus',
    descrizione: 'Pratiche edilizie complete per ristrutturazioni con bonus fiscali (110%, 90%, 75%, 65%)',
    dettaglio: 'Gestione completa della pratica edilizia per accesso ai bonus fiscali: Superbonus, Ecobonus, Sismabonus. Include progetto architettonico, direzione lavori, asseverazioni, APE, e interfaccia con Agenzia delle Entrate.',
    categoria: 'Privati',
    prezzoMin: 8000,
    prezzoMax: 18000,
    durata: '3-6 mesi',
    icon: '🏡',
    caratteristiche: [
      'Progetto architettonico completo',
      'Asseverazione tecnica bonus fiscali',
      'Direzione lavori completa',
      'APE pre/post intervento',
      'Pratiche ENEA e Agenzia Entrate',
      'Supporto scelta impresa',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 30, descrizione: 'Alla firma contratto' },
      { nome: 'Progetto approvato', percentuale: 40, descrizione: 'Consegna progetto definitivo' },
      { nome: 'Fine lavori', percentuale: 20, descrizione: 'Completamento cantiere' },
      { nome: 'Saldo', percentuale: 10, descrizione: 'Consegna documentazione finale' },
    ],
  },
  'BDL-DUE-DILIGENCE': {
    nome: 'Due Diligence Immobiliare',
    descrizione: 'Verifica tecnica completa per acquisto immobili: strutturale, urbanistica, impianti',
    dettaglio: 'Analisi approfondita pre-acquisto immobile: verifica conformità urbanistica-edilizia, stato conservativo strutture, impianti, APE, presenza abusi, rischi sismici/idrogeologici. Report completo con stima costi interventi necessari.',
    categoria: 'Privati',
    prezzoMin: 1500,
    prezzoMax: 4000,
    durata: '2-4 settimane',
    icon: '🔍',
    caratteristiche: [
      'Sopralluogo tecnico approfondito',
      'Verifica conformità urbanistica',
      'Analisi stato conservativo',
      'Verifica impianti (elettrico, idraulico, termico)',
      'Controllo APE e certificazioni',
      'Report fotografico dettagliato',
      'Stima costi interventi necessari',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 40, descrizione: 'Alla conferma incarico' },
      { nome: 'Sopralluogo completato', percentuale: 30, descrizione: 'Fine ispezione' },
      { nome: 'Saldo', percentuale: 30, descrizione: 'Consegna report finale' },
    ],
  },
  'BDL-VULN-SISMICA': {
    nome: 'Vulnerabilità Sismica',
    descrizione: 'Valutazione sicurezza sismica edifici esistenti con classificazione rischio',
    dettaglio: 'Analisi completa vulnerabilità sismica secondo NTC2018: rilievo geometrico e strutturale, prove materiali, modellazione FEM, verifica capacità sismica, classificazione rischio sismico (A-G), proposte interventi miglioramento/adeguamento.',
    categoria: 'Privati / Aziende / PA',
    prezzoMin: 5000,
    prezzoMax: 25000,
    durata: '2-4 mesi',
    icon: '🏗️',
    caratteristiche: [
      'Rilievo geometrico-strutturale completo',
      'Prove materiali (carotaggi, martinetti, pacometro)',
      'Modellazione FEM (SAP2000/Midas)',
      'Verifica NTC2018 con spettri sito-specifici',
      'Classificazione rischio sismico (Linee Guida 2017)',
      'Proposte interventi miglioramento/adeguamento',
      'Relazione tecnica asseverata',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 30, descrizione: 'Alla firma contratto' },
      { nome: 'Rilievo e prove', percentuale: 25, descrizione: 'Completamento indagini' },
      { nome: 'Modello FEM', percentuale: 25, descrizione: 'Consegna modello validato' },
      { nome: 'Saldo', percentuale: 20, descrizione: 'Relazione finale asseverata' },
    ],
  },
  'BDL-AMPLIAMENTO': {
    nome: 'Ampliamento Produttivo',
    descrizione: 'Progettazione ampliamento capannoni industriali e strutture produttive',
    dettaglio: 'Progetto completo ampliamento volumetrico per aziende: studio fattibilità, progetto architettonico-strutturale, pratiche autorizzative, direzione lavori, collaudo statico. Ottimizzazione layout produttivo e compliance normative (antincendio, sicurezza lavoro).',
    categoria: 'Aziende',
    prezzoMin: 12000,
    prezzoMax: 35000,
    durata: '4-8 mesi',
    icon: '🏭',
    caratteristiche: [
      'Studio fattibilità urbanistica',
      'Progetto architettonico e strutturale',
      'Pratiche autorizzative (SCIA, Permesso Costruire)',
      'Direzione lavori completa',
      'Coordinamento sicurezza (CSP/CSE)',
      'Collaudo statico finale',
      'Certificato agibilità',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 25, descrizione: 'Alla firma contratto' },
      { nome: 'Progetto preliminare', percentuale: 20, descrizione: 'Approvazione progetto' },
      { nome: 'Autorizzazioni', percentuale: 15, descrizione: 'Ottenimento permessi' },
      { nome: 'Avanzamento lavori', percentuale: 25, descrizione: 'A SAL 50%' },
      { nome: 'Saldo', percentuale: 15, descrizione: 'Collaudo e agibilità' },
    ],
  },
  'BDL-COLLAUDO': {
    nome: 'Collaudo Statico',
    descrizione: 'Collaudo statico obbligatorio per nuove costruzioni e ristrutturazioni strutturali',
    dettaglio: 'Collaudo statico secondo NTC2018 Art. 9: verifica conformità progetto esecutivo, controllo qualità materiali, verifiche in corso d\'opera, prove di carico (se necessarie), certificato collaudo statico per deposito Genio Civile e richiesta agibilità.',
    categoria: 'Privati / Aziende',
    prezzoMin: 2500,
    prezzoMax: 12000,
    durata: '1-3 mesi',
    icon: '✅',
    caratteristiche: [
      'Verifica conformità progetto esecutivo',
      'Controllo qualità materiali (CLS, acciaio)',
      'Verifiche in corso d\'opera',
      'Prove di carico (se richieste)',
      'Certificato collaudo statico',
      'Deposito Genio Civile',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 40, descrizione: 'Alla conferma incarico' },
      { nome: 'Verifiche in opera', percentuale: 30, descrizione: 'Completamento ispezioni' },
      { nome: 'Saldo', percentuale: 30, descrizione: 'Certificato depositato' },
    ],
  },
  'BDL-ANTINCENDIO': {
    nome: 'Prevenzione Incendi',
    descrizione: 'Progettazione antincendio e pratiche VVF per attività soggette a controllo',
    dettaglio: 'Progetto antincendio secondo Codice Prevenzione Incendi (D.M. 03/08/2015): classificazione attività, strategia antincendio, elaborati grafici, relazione tecnica, SCIA/valutazione progetto VVF, direzione lavori, collaudo finale.',
    categoria: 'Aziende / PA',
    prezzoMin: 2000,
    prezzoMax: 8000,
    durata: '1-3 mesi',
    icon: '🔥',
    caratteristiche: [
      'Classificazione attività (DPR 151/2011)',
      'Progetto secondo Codice Prevenzione Incendi',
      'Elaborati grafici (piante, sezioni)',
      'Relazione tecnica asseverata',
      'SCIA o Valutazione progetto VVF',
      'Direzione lavori impianti antincendio',
      'Assistenza collaudo VVF',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 35, descrizione: 'Alla firma contratto' },
      { nome: 'Progetto approvato', percentuale: 35, descrizione: 'Presentazione VVF' },
      { nome: 'Saldo', percentuale: 30, descrizione: 'Collaudo finale' },
    ],
  },
  'BDL-EFF-ENERGETICO': {
    nome: 'Efficientamento Energetico',
    descrizione: 'Diagnosi energetica e progettazione interventi miglioramento classe APE',
    dettaglio: 'Analisi completa prestazioni energetiche edificio: diagnosi energetica secondo UNI CEI/TR 11428, simulazione interventi (cappotto, serramenti, impianti), redazione APE convenzionale e post-intervento, pratiche detrazione fiscali (Ecobonus 65-75%).',
    categoria: 'Privati / Aziende',
    prezzoMin: 2500,
    prezzoMax: 8000,
    durata: '3-6 settimane',
    icon: '⚡',
    caratteristiche: [
      'Diagnosi energetica UNI CEI/TR 11428',
      'Simulazioni interventi miglioramento',
      'APE ante e post intervento',
      'Studio fattibilità economica',
      'Pratiche ENEA per detrazioni fiscali',
      'Capitolato interventi',
      'Supporto scelta fornitori',
    ],
    milestone: [
      { nome: 'Acconto', percentuale: 40, descrizione: 'Alla conferma incarico' },
      { nome: 'Diagnosi completata', percentuale: 30, descrizione: 'Consegna report diagnosi' },
      { nome: 'Saldo', percentuale: 30, descrizione: 'APE e pratiche ENEA' },
    ],
  },
};

// Type per il bundle
type BundleCode = keyof typeof bundleData;

interface BundlePageProps {
  params: {
    codice: string;
  };
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const bundle = bundleData[params.codice as BundleCode];

  if (!bundle) {
    return {
      title: 'Servizio non trovato',
    };
  }

  return {
    title: `${bundle.nome} - Studio Ing. Romano`,
    description: bundle.descrizione,
  };
}

export default function BundlePage({ params }: BundlePageProps) {
  const bundle = bundleData[params.codice as BundleCode];

  if (!bundle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header con breadcrumb */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">{bundle.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{bundle.nome}</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">{bundle.descrizione}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge className="bg-white text-blue-600 text-sm px-4 py-2">
                {bundle.categoria}
              </Badge>
              <Badge className="bg-green-100 text-green-900 text-sm px-4 py-2">
                ✓ Certificato ISO 9001:2015
              </Badge>
              <Badge className="bg-purple-100 text-purple-900 text-sm px-4 py-2">
                ✓ Certificato ISO 27001:2022
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Info Rapide */}
      <section className="py-8 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Euro className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Prezzo indicativo</div>
                <div className="text-lg font-bold text-gray-900">
                  €{bundle.prezzoMin.toLocaleString()} - €{bundle.prezzoMax.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tempi di consegna</div>
                <div className="text-lg font-bold text-gray-900">{bundle.durata}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Garanzia qualità</div>
                <div className="text-lg font-bold text-gray-900">Certificata ISO</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenuto Principale */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Colonna principale - Dettagli */}
            <div className="lg:col-span-2 space-y-8">
              {/* Descrizione dettagliata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Descrizione del servizio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{bundle.dettaglio}</p>
                </CardContent>
              </Card>

              {/* Caratteristiche incluse */}
              <Card>
                <CardHeader>
                  <CardTitle>Cosa include il servizio</CardTitle>
                  <CardDescription>
                    Tutte le attività e consegne previste
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {bundle.caratteristiche.map((caratteristica, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{caratteristica}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Piano pagamenti */}
              <Card>
                <CardHeader>
                  <CardTitle>Piano pagamenti milestone</CardTitle>
                  <CardDescription>
                    Pagamenti suddivisi in base all'avanzamento lavori (SAL)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bundle.milestone.map((m, index) => (
                      <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-blue-600">{m.percentuale}%</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{m.nome}</div>
                          <div className="text-sm text-gray-600">{m.descrizione}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Nota:</strong> Il prezzo finale sarà determinato in base alla complessità specifica del tuo progetto.
                      Il preventivo personalizzato è gratuito e viene fornito entro 24 ore dalla richiesta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Card richiesta preventivo */}
                <Card className="border-2 border-blue-500 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="text-center">Richiedi Preventivo Gratuito</CardTitle>
                    <CardDescription className="text-center">
                      Ricevi un preventivo personalizzato in 24 ore
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Preventivo gratuito e senza impegno</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Risposta entro 24 ore lavorative</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Consulenza telefonica inclusa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Pagamenti sicuri con Stripe</span>
                      </div>
                    </div>

                    <Button asChild size="lg" className="w-full text-lg py-6">
                      <Link href={`/quiz?bundle=${params.codice}`}>
                        Richiedi Preventivo →
                      </Link>
                    </Button>

                    <div className="text-center text-xs text-gray-500">
                      Compilando il form accetti i nostri{' '}
                      <Link href="/legal/terms" className="underline hover:text-blue-600">
                        Termini e Condizioni
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Garanzie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Garanzie di qualità</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Certificazione ISO 9001:2015</div>
                        <div className="text-gray-600">Sistema gestione qualità certificato</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Certificazione ISO 27001:2022</div>
                        <div className="text-gray-600">Sicurezza dati garantita</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Assicurazione RC Professionale</div>
                        <div className="text-gray-600">Copertura €1.000.000</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Supporto */}
                <Card className="bg-gray-50">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-sm font-semibold text-gray-900">Hai domande?</div>
                    <div className="text-sm text-gray-600">
                      Contattaci per una consulenza gratuita
                    </div>
                    <div className="pt-2">
                      <a
                        href="mailto:info@studio-romano.it"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        📧 info@studio-romano.it
                      </a>
                    </div>
                    <div>
                      <a
                        href="tel:+39XXXXXXXXX"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        📞 +39 XXX XXXXXXX
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Footer */}
      <section className="py-8 bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
            <p>
              Servizio erogato da <strong>Studio Ing. Romano</strong> | P.IVA IT12345678901 |
              Iscritto Ordine Ingegneri Provincia XXX n. XXXXX
            </p>
            <p className="mt-2">
              Certificato <strong>ISO 9001:2015</strong> (Qualità) | <strong>ISO 27001:2022</strong> (Sicurezza) |
              <strong> PCI-DSS Compliant</strong> | <strong>GDPR Compliant</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
