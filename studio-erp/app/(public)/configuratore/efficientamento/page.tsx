'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Zap,
  FileText,
  Clock,
  AlertCircle,
  Calculator,
  Download,
  Send,
  Trash2,
  ArrowLeft,
  Euro,
  TrendingUp,
  Leaf,
  Check,
  ChevronRight,
  Lock
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-efficientamento-data';

// Regioni Italia per trasferta
const REGIONI_ITALIA = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

const REGIONI_CONFINANTI = ['Lazio', 'Puglia', 'Calabria', 'Basilicata', 'Molise'];

const calcolaCostoTrasferta = (regione: string): number => {
  if (regione === 'Campania') return 150;
  if (REGIONI_CONFINANTI.includes(regione)) return 300;
  return 500;
};

// Interfaccia dati configuratore
interface ConfiguratoreEfficientamentoData {
  // Sezione 1: Localizzazione e macro-categoria
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  macroCategoria: string; // 'residenziale' o 'industriale'

  // Sezione 2: Caratteristiche edificio (varia per categoria)
  // Residenziale
  tipologiaResidenziale: string;
  superficieRiscaldata: number;
  numeroUnita: number;
  annoCostruzione: string;
  zonaClimatica: string;
  classeEnergeticaAttuale: string;

  // Industriale
  tipologiaIndustriale: string;
  superficieTotale: number;
  volumeRiscaldato: number;
  tipoProduzione: string;
  potenzaTermica: number;
  oreFunzionamento: number;

  // Sezione 3: Interventi richiesti
  interventiResidenziali: string[];
  interventiIndustriali: string[];

  // Sezione 4: Incentivi
  accessoIncentivi: string[];
  soggettoRichiedente: string;

  // Sezione 5: Documentazione
  documentazioneDisponibile: string[];
  impiantiEsistenti: string[];
  criticita: string[];

  // Sezione 6: Urgenza e servizi aggiuntivi
  urgenza: string;
  serviziAggiuntivi: string[];
  includeDiagnosiEnergetica: boolean;

  // Dati cliente
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  noteCliente: string;
}

const initialData: ConfiguratoreEfficientamentoData = {
  indirizzo: '',
  cap: '',
  comune: '',
  provincia: '',
  regione: '',
  macroCategoria: '',
  tipologiaResidenziale: '',
  superficieRiscaldata: 0,
  numeroUnita: 1,
  annoCostruzione: '',
  zonaClimatica: '',
  classeEnergeticaAttuale: '',
  tipologiaIndustriale: '',
  superficieTotale: 0,
  volumeRiscaldato: 0,
  tipoProduzione: '',
  potenzaTermica: 0,
  oreFunzionamento: 0,
  interventiResidenziali: [],
  interventiIndustriali: [],
  accessoIncentivi: [],
  soggettoRichiedente: '',
  documentazioneDisponibile: [],
  impiantiEsistenti: [],
  criticita: [],
  urgenza: 'standard',
  serviziAggiuntivi: [],
  includeDiagnosiEnergetica: false,
  nomeCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  noteCliente: '',
};

interface Preventivo {
  prezzoBase: number;
  costoDiagnosiEnergetica: number;
  costoServiziAggiuntivi: number;
  costoTrasferta: number;
  subtotale: number;
  moltiplicatoreInterventi: number;
  moltiplicatoreUrgenza: number;
  totalePrestazioni: number;

  // Scheda tecnica
  classeEnergeticaAttuale: string;
  classeEnergeticaObiettivo: string;
  risparmioEnergeticoPerc: string;
  interventiSelezionati: string[];
  incentiviApplicabili: string[];
  tempiRealizzazione: string;
}

export default function ConfiguratoreEfficientamento() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [data, setData] = useState<ConfiguratoreEfficientamentoData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const updateData = (field: keyof ConfiguratoreEfficientamentoData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreEfficientamentoData, value: string) => {
    setData((prev) => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  // Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed);
      } catch (error) {
        console.error('Errore nel caricamento dati salvati:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Calcola preventivo quando cambiano i dati
  useEffect(() => {
    const prev = calcolaPreventivo(data);
    setPreventivo(prev);
  }, [data]);

  const calcolaPreventivo = (data: ConfiguratoreEfficientamentoData): Preventivo => {
    const isResidenziale = data.macroCategoria === 'residenziale';
    const isIndustriale = data.macroCategoria === 'industriale';

    // 1. PREZZO BASE PER TIPOLOGIA E SUPERFICIE
    let prezzoBase = 0;

    if (isResidenziale && data.superficieRiscaldata > 0) {
      const superficie = data.superficieRiscaldata;
      if (superficie <= 100) {
        prezzoBase = 1500;
      } else if (superficie <= 200) {
        prezzoBase = 2000;
      } else if (superficie <= 400) {
        prezzoBase = 2800;
      } else if (superficie <= 600) {
        prezzoBase = 3500;
      } else {
        prezzoBase = 4500;
      }
    } else if (isIndustriale && data.superficieTotale > 0) {
      const superficie = data.superficieTotale;
      if (superficie <= 500) {
        prezzoBase = 3000;
      } else if (superficie <= 1000) {
        prezzoBase = 4500;
      } else if (superficie <= 2000) {
        prezzoBase = 6500;
      } else {
        prezzoBase = 9000;
      }
    }

    // 2. DIAGNOSI ENERGETICA COMPLETA (VARIABILE PER SUPERFICIE)
    let costoDiagnosiEnergetica = 0;

    if (data.includeDiagnosiEnergetica) {
      if (isResidenziale && data.superficieRiscaldata > 0) {
        const superficie = data.superficieRiscaldata;
        if (superficie <= 100) {
          costoDiagnosiEnergetica = 800;
        } else if (superficie <= 200) {
          costoDiagnosiEnergetica = 1000;
        } else if (superficie <= 400) {
          costoDiagnosiEnergetica = 1500;
        } else if (superficie <= 600) {
          costoDiagnosiEnergetica = 2000;
        } else {
          costoDiagnosiEnergetica = 2500;
        }
      } else if (isIndustriale && data.superficieTotale > 0) {
        const superficie = data.superficieTotale;
        if (superficie <= 500) {
          costoDiagnosiEnergetica = 1500;
        } else if (superficie <= 1000) {
          costoDiagnosiEnergetica = 2500;
        } else if (superficie <= 2000) {
          costoDiagnosiEnergetica = 3500;
        } else if (superficie <= 5000) {
          costoDiagnosiEnergetica = 5000;
        } else {
          costoDiagnosiEnergetica = 9000;
        }
      }
    }

    // 3. SERVIZI AGGIUNTIVI
    const prezziServiziAggiuntivi: Record<string, number> = {
      pratica_conto_termico: 600,
      asseverazione_ecobonus: 900,
      direzione_lavori: isResidenziale ? 1200 : 2000,
      termografia: 400,
      blower_door_test: 350,
    };

    let costoServiziAggiuntivi = 0;
    data.serviziAggiuntivi.forEach((servizio) => {
      costoServiziAggiuntivi += prezziServiziAggiuntivi[servizio] || 0;
    });

    // 4. TRASFERTA
    const costoTrasferta = data.regione ? calcolaCostoTrasferta(data.regione) : 0;

    // 5. SUBTOTALE
    const subtotale = prezzoBase + costoDiagnosiEnergetica + costoServiziAggiuntivi + costoTrasferta;

    // 6. MOLTIPLICATORE NUMERO INTERVENTI
    const numeroInterventi = isResidenziale
      ? data.interventiResidenziali.length
      : data.interventiIndustriali.length;

    let moltiplicatoreInterventi = 1.0;
    if (numeroInterventi >= 5) {
      moltiplicatoreInterventi = 1.4;
    } else if (numeroInterventi >= 3) {
      moltiplicatoreInterventi = 1.2;
    }

    // 7. MOLTIPLICATORE URGENZA
    const moltiplicatoriUrgenza: Record<string, number> = {
      standard: 1.0,
      prioritaria: 1.3,
      urgente: 1.6,
    };
    const moltiplicatoreUrgenza = moltiplicatoriUrgenza[data.urgenza] || 1.0;

    // 8. TOTALE PRESTAZIONI PROFESSIONALI
    const totalePrestazioni = Math.round(subtotale * moltiplicatoreInterventi * moltiplicatoreUrgenza);

    // 9. SCHEDA TECNICA
    const classeEnergeticaAttuale = data.classeEnergeticaAttuale || 'Non specificata';

    // Stima classe obiettivo basata su interventi
    let classeEnergeticaObiettivo = classeEnergeticaAttuale;
    let risparmioEnergeticoPerc = '0';

    if (numeroInterventi > 0) {
      // Logica semplificata per stimare miglioramento
      if (numeroInterventi >= 4 && (data.interventiResidenziali.includes('cappotto_esterno') || data.interventiResidenziali.includes('pompa_calore_aw'))) {
        classeEnergeticaObiettivo = 'B';
        risparmioEnergeticoPerc = '40-45';
      } else if (numeroInterventi >= 3) {
        classeEnergeticaObiettivo = 'C';
        risparmioEnergeticoPerc = '30-35';
      } else if (numeroInterventi >= 2) {
        classeEnergeticaObiettivo = 'D';
        risparmioEnergeticoPerc = '20-25';
      } else {
        risparmioEnergeticoPerc = '10-15';
      }
    }

    // Interventi selezionati
    const interventiSelezionati = isResidenziale
      ? data.interventiResidenziali.map(getDescrizioneIntervento)
      : data.interventiIndustriali.map(getDescrizioneIntervento);

    // Incentivi applicabili
    const incentiviApplicabili: string[] = [];
    if (data.accessoIncentivi.includes('conto_termico')) {
      incentiviApplicabili.push('Conto Termico 3.0 (fino al 65%)');
    }
    if (data.accessoIncentivi.includes('ecobonus')) {
      incentiviApplicabili.push('Ecobonus (50-65%)');
    }

    // Tempi realizzazione
    let tempiRealizzazione = '';
    if (data.urgenza === 'standard') {
      tempiRealizzazione = '3-4 mesi';
    } else if (data.urgenza === 'prioritaria') {
      tempiRealizzazione = '2-3 mesi';
    } else {
      tempiRealizzazione = '1-2 mesi';
    }

    return {
      prezzoBase,
      costoDiagnosiEnergetica,
      costoServiziAggiuntivi,
      costoTrasferta,
      subtotale,
      moltiplicatoreInterventi,
      moltiplicatoreUrgenza,
      totalePrestazioni,
      classeEnergeticaAttuale,
      classeEnergeticaObiettivo,
      risparmioEnergeticoPerc,
      interventiSelezionati,
      incentiviApplicabili,
      tempiRealizzazione,
    };
  };

  const getDescrizioneIntervento = (key: string): string => {
    const residenziali: Record<string, string> = {
      caldaia_condensazione: 'Caldaia a condensazione',
      pompa_calore_aa: 'Pompa di calore aria/aria',
      pompa_calore_aw: 'Pompa di calore aria/acqua',
      caldaia_biomassa: 'Caldaia a biomassa',
      sistema_ibrido: 'Sistema ibrido caldaia+PdC',
      cappotto_esterno: 'Cappotto termico esterno',
      isolamento_copertura: 'Isolamento copertura',
      serramenti: 'Sostituzione serramenti',
      solare_termico: 'Solare termico',
      fotovoltaico: 'Fotovoltaico',
      vmc: 'VMC con recupero calore',
    };

    const industriali: Record<string, string> = {
      diagnosi_energetica: 'Diagnosi energetica',
      recupero_calore: 'Recupero calore processi',
      cogenerazione: 'Impianto cogenerazione',
      relamping_led: 'Relamping LED',
      inverter_motori: 'Inverter motori elettrici',
      isolamento_condotte: 'Isolamento condotte',
    };

    return residenziali[key] || industriali[key] || key;
  };

  const clearData = () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const sendEmail = async () => {
    if (!data.nomeCliente || !data.emailCliente) {
      alert('Inserisci nome e email per inviare il preventivo');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/configuratore/efficientamento/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, preventivo }),
      });

      if (response.ok) {
        alert('Preventivo inviato con successo!');
        setShowEmailModal(false);
      } else {
        alert('Errore nell\'invio del preventivo');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'invio del preventivo');
    } finally {
      setEmailSending(false);
    }
  };

  const isResidenziale = data.macroCategoria === 'residenziale';
  const isIndustriale = data.macroCategoria === 'industriale';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
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
            <div className="flex gap-2">
              <Button onClick={clearData} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Cancella
              </Button>
              <Link href="/bundle/BDL-EFF-ENERGETICO">
                <Button variant="outline">← Torna al Bundle</Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <section className="container mx-auto px-4 py-4 print:hidden">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/bundle/BDL-EFF-ENERGETICO" className="hover:text-blue-600">
            Bundle Efficientamento Energetico
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8 print:py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3 print:text-3xl">Configuratore Efficientamento Energetico</h1>
          <p className="text-xl text-blue-50 print:text-base">
            Preventivo prestazioni professionali con indicazioni tecniche e incentivi
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sezione 1: Localizzazione e Macro-Categoria */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Localizzazione e Tipologia</CardTitle>
                    <p className="text-sm text-blue-50">Dove si trova l'edificio</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="indirizzo">Indirizzo</Label>
                  <Input
                    id="indirizzo"
                    value={data.indirizzo}
                    onChange={(e) => updateData('indirizzo', e.target.value)}
                    placeholder="Via, Piazza..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cap">CAP</Label>
                    <Input
                      id="cap"
                      value={data.cap}
                      onChange={(e) => updateData('cap', e.target.value)}
                      placeholder="00000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="comune">Comune *</Label>
                    <Input
                      id="comune"
                      value={data.comune}
                      onChange={(e) => updateData('comune', e.target.value)}
                      placeholder="Comune"
                    />
                  </div>
                  <div>
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input
                      id="provincia"
                      value={data.provincia}
                      onChange={(e) => updateData('provincia', e.target.value)}
                      placeholder="XX"
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="regione">Regione *</Label>
                  <select
                    id="regione"
                    value={data.regione}
                    onChange={(e) => updateData('regione', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona regione</option>
                    {REGIONI_ITALIA.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                  {data.regione && (
                    <p className="text-sm text-gray-600 mt-1">
                      Costo trasferta: €{calcolaCostoTrasferta(data.regione)}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold">Macro-categoria edificio *</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <input
                        type="radio"
                        name="macroCategoria"
                        value="residenziale"
                        checked={data.macroCategoria === 'residenziale'}
                        onChange={(e) => updateData('macroCategoria', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium">🏠 Residenziale / Commerciale / Uffici</div>
                        <p className="text-sm text-gray-600">
                          Abitazioni, condomini, negozi, uffici
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                      <input
                        type="radio"
                        name="macroCategoria"
                        value="industriale"
                        checked={data.macroCategoria === 'industriale'}
                        onChange={(e) => updateData('macroCategoria', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium">🏭 Industriale / Produttivo</div>
                        <p className="text-sm text-gray-600">
                          Capannoni, stabilimenti, magazzini
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Caratteristiche edificio - RESIDENZIALE */}
            {isResidenziale && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">2. Caratteristiche Edificio</CardTitle>
                      <p className="text-sm text-blue-50">Dettagli tecnici</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="tipologiaResidenziale">Tipologia *</Label>
                    <select
                      id="tipologiaResidenziale"
                      value={data.tipologiaResidenziale}
                      onChange={(e) => updateData('tipologiaResidenziale', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona tipologia</option>
                      <option value="appartamento">Appartamento</option>
                      <option value="villa">Villa/Casa indipendente</option>
                      <option value="condominio">Condominio</option>
                      <option value="negozio">Negozio/Attività commerciale</option>
                      <option value="ufficio">Ufficio</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superficieRiscaldata">Superficie riscaldata (mq) *</Label>
                      <Input
                        id="superficieRiscaldata"
                        type="number"
                        value={data.superficieRiscaldata || ''}
                        onChange={(e) => updateData('superficieRiscaldata', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numeroUnita">Numero unità immobiliari</Label>
                      <Input
                        id="numeroUnita"
                        type="number"
                        value={data.numeroUnita || ''}
                        onChange={(e) => updateData('numeroUnita', Number(e.target.value))}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="annoCostruzione">Anno costruzione</Label>
                      <select
                        id="annoCostruzione"
                        value={data.annoCostruzione}
                        onChange={(e) => updateData('annoCostruzione', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona periodo</option>
                        <option value="pre_1976">Pre 1976 (Legge 373/76)</option>
                        <option value="1976_2005">1976-2005</option>
                        <option value="post_2005">Post 2005</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="zonaClimatica">Zona climatica</Label>
                      <select
                        id="zonaClimatica"
                        value={data.zonaClimatica}
                        onChange={(e) => updateData('zonaClimatica', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleziona zona</option>
                        <option value="A">Zona A (molto calda)</option>
                        <option value="B">Zona B (calda)</option>
                        <option value="C">Zona C (temperata)</option>
                        <option value="D">Zona D (fredda)</option>
                        <option value="E">Zona E (molto fredda)</option>
                        <option value="F">Zona F (alpina)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="classeEnergeticaAttuale">Classe energetica attuale</Label>
                    <select
                      id="classeEnergeticaAttuale"
                      value={data.classeEnergeticaAttuale}
                      onChange={(e) => updateData('classeEnergeticaAttuale', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona classe</option>
                      <option value="G">G (peggiore)</option>
                      <option value="F">F</option>
                      <option value="E">E</option>
                      <option value="D">D</option>
                      <option value="C">C</option>
                      <option value="B">B</option>
                      <option value="A">A</option>
                      <option value="A+">A+</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sezione 2: Caratteristiche edificio - INDUSTRIALE */}
            {isIndustriale && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">2. Caratteristiche Impianto</CardTitle>
                      <p className="text-sm text-blue-50">Dettagli tecnici industriali</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="tipologiaIndustriale">Tipologia *</Label>
                    <select
                      id="tipologiaIndustriale"
                      value={data.tipologiaIndustriale}
                      onChange={(e) => updateData('tipologiaIndustriale', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona tipologia</option>
                      <option value="capannone">Capannone</option>
                      <option value="stabilimento">Stabilimento produttivo</option>
                      <option value="magazzino">Magazzino/Logistica</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superficieTotale">Superficie totale (mq) *</Label>
                      <Input
                        id="superficieTotale"
                        type="number"
                        value={data.superficieTotale || ''}
                        onChange={(e) => updateData('superficieTotale', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="volumeRiscaldato">Volume riscaldato (mc)</Label>
                      <Input
                        id="volumeRiscaldato"
                        type="number"
                        value={data.volumeRiscaldato || ''}
                        onChange={(e) => updateData('volumeRiscaldato', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tipoProduzione">Tipo produzione</Label>
                    <select
                      id="tipoProduzione"
                      value={data.tipoProduzione}
                      onChange={(e) => updateData('tipoProduzione', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleziona tipo</option>
                      <option value="continua">Produzione continua (24/7)</option>
                      <option value="discontinua">Produzione discontinua</option>
                      <option value="stagionale">Produzione stagionale</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="potenzaTermica">Potenza termica installata (kW)</Label>
                      <Input
                        id="potenzaTermica"
                        type="number"
                        value={data.potenzaTermica || ''}
                        onChange={(e) => updateData('potenzaTermica', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="oreFunzionamento">Ore funzionamento/anno</Label>
                      <Input
                        id="oreFunzionamento"
                        type="number"
                        value={data.oreFunzionamento || ''}
                        onChange={(e) => updateData('oreFunzionamento', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        max="8760"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sezione 3: Interventi - RESIDENZIALE */}
            {isResidenziale && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">3. Interventi Richiesti</CardTitle>
                      <p className="text-sm text-blue-50">Seleziona gli interventi desiderati</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">🔥 Generazione Calore</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'caldaia_condensazione', label: 'Caldaia a condensazione' },
                        { value: 'pompa_calore_aa', label: 'Pompa di calore aria/aria' },
                        { value: 'pompa_calore_aw', label: 'Pompa di calore aria/acqua' },
                        { value: 'caldaia_biomassa', label: 'Caldaia a biomassa' },
                        { value: 'sistema_ibrido', label: 'Sistema ibrido caldaia+PdC' },
                      ].map((int) => (
                        <label
                          key={int.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="checkbox"
                            checked={data.interventiResidenziali.includes(int.value)}
                            onChange={() => toggleArrayValue('interventiResidenziali', int.value)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium">{int.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">🏠 Involucro Edilizio</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'cappotto_esterno', label: 'Cappotto termico esterno' },
                        { value: 'isolamento_copertura', label: 'Isolamento copertura' },
                        { value: 'serramenti', label: 'Sostituzione serramenti' },
                      ].map((int) => (
                        <label
                          key={int.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="checkbox"
                            checked={data.interventiResidenziali.includes(int.value)}
                            onChange={() => toggleArrayValue('interventiResidenziali', int.value)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium">{int.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">☀️ Energie Rinnovabili</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'solare_termico', label: 'Solare termico' },
                        { value: 'fotovoltaico', label: 'Fotovoltaico' },
                        { value: 'vmc', label: 'VMC con recupero calore' },
                      ].map((int) => (
                        <label
                          key={int.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="checkbox"
                            checked={data.interventiResidenziali.includes(int.value)}
                            onChange={() => toggleArrayValue('interventiResidenziali', int.value)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium">{int.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sezione 3: Interventi - INDUSTRIALE */}
            {isIndustriale && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">3. Interventi Richiesti</CardTitle>
                      <p className="text-sm text-blue-50">Seleziona gli interventi desiderati</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">Interventi disponibili</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'diagnosi_energetica', label: 'Diagnosi energetica' },
                        { value: 'recupero_calore', label: 'Recupero calore da processi' },
                        { value: 'cogenerazione', label: 'Impianto cogenerazione' },
                        { value: 'relamping_led', label: 'Relamping LED' },
                        { value: 'inverter_motori', label: 'Inverter motori elettrici' },
                        { value: 'isolamento_condotte', label: 'Isolamento condotte' },
                      ].map((int) => (
                        <label
                          key={int.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="checkbox"
                            checked={data.interventiIndustriali.includes(int.value)}
                            onChange={() => toggleArrayValue('interventiIndustriali', int.value)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium">{int.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sezione 4: Incentivi */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Euro className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">4. Incentivi e Soggetto</CardTitle>
                    <p className="text-sm text-blue-50">Accesso agli incentivi</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Accesso incentivi</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'conto_termico', label: 'Conto Termico 3.0 (fino 65%)' },
                      { value: 'ecobonus', label: 'Ecobonus 50-65%' },
                    ].map((inc) => (
                      <label key={inc.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.accessoIncentivi.includes(inc.value)}
                          onChange={() => toggleArrayValue('accessoIncentivi', inc.value)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{inc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="soggettoRichiedente">Soggetto richiedente *</Label>
                  <select
                    id="soggettoRichiedente"
                    value={data.soggettoRichiedente}
                    onChange={(e) => updateData('soggettoRichiedente', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleziona soggetto</option>
                    <option value="privato">Privato cittadino</option>
                    <option value="condominio">Condominio</option>
                    <option value="azienda">Azienda/Impresa</option>
                    <option value="pa">P.A./Ente pubblico (max 65%)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 5: Documentazione */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">5. Documentazione e Impianti</CardTitle>
                    <p className="text-sm text-blue-50">Stato attuale</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Documentazione disponibile</Label>
                  <div className="space-y-2">
                    {[
                      'APE valido',
                      'Relazione tecnica Legge 10',
                      'Planimetrie catastali',
                      'Libretto impianto',
                      'Diagnosi energetica',
                      'Documentazione incompleta/assente',
                    ].map((doc) => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.documentazioneDisponibile.includes(doc)}
                          onChange={() => toggleArrayValue('documentazioneDisponibile', doc)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold">Criticità particolari</Label>
                  <div className="space-y-2">
                    {[
                      'Edificio vincolato (Soprintendenza)',
                      'Condominio (serve delibera)',
                      'Attività in corso (no fermo)',
                      'Accesso difficoltoso',
                    ].map((crit) => (
                      <label key={crit} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.criticita.includes(crit)}
                          onChange={() => toggleArrayValue('criticita', crit)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{crit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 6: Urgenza, Servizi Aggiuntivi e Dati Cliente */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">6. Urgenza, Servizi e Dati Cliente</CardTitle>
                    <p className="text-sm text-blue-50">Tempistiche e servizi</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Tempistica richiesta *</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'standard', label: 'Standard (60-90 gg)', mult: '1.0x' },
                      { value: 'prioritaria', label: 'Prioritaria (30-60 gg)', mult: '1.3x' },
                      { value: 'urgente', label: 'Urgente (15-30 gg)', mult: '1.6x' },
                    ].map((urg) => (
                      <label
                        key={urg.value}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                      >
                        <input
                          type="radio"
                          name="urgenza"
                          value={urg.value}
                          checked={data.urgenza === urg.value}
                          onChange={(e) => updateData('urgenza', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{urg.label}</span>
                        </div>
                        <Badge variant={urg.value === 'standard' ? 'secondary' : 'default'} className="text-xs">
                          {urg.mult}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold">Diagnosi Energetica Completa</Label>
                  <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={data.includeDiagnosiEnergetica}
                      onChange={(e) => updateData('includeDiagnosiEnergetica', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">Includi diagnosi energetica completa</span>
                      <p className="text-xs text-gray-600 mt-1">
                        {isResidenziale && data.superficieRiscaldata > 0 && (
                          <>
                            {data.superficieRiscaldata <= 100 && '€800'}
                            {data.superficieRiscaldata > 100 && data.superficieRiscaldata <= 200 && '€1.000'}
                            {data.superficieRiscaldata > 200 && data.superficieRiscaldata <= 400 && '€1.500'}
                            {data.superficieRiscaldata > 400 && data.superficieRiscaldata <= 600 && '€2.000'}
                            {data.superficieRiscaldata > 600 && '€2.500'}
                          </>
                        )}
                        {isIndustriale && data.superficieTotale > 0 && (
                          <>
                            {data.superficieTotale <= 500 && '€1.500'}
                            {data.superficieTotale > 500 && data.superficieTotale <= 1000 && '€2.500'}
                            {data.superficieTotale > 1000 && data.superficieTotale <= 2000 && '€3.500'}
                            {data.superficieTotale > 2000 && data.superficieTotale <= 5000 && '€5.000'}
                            {data.superficieTotale > 5000 && '€9.000'}
                          </>
                        )}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold">Servizi Aggiuntivi</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('pratica_conto_termico')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'pratica_conto_termico')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="flex-1">Pratica Conto Termico 3.0</span>
                      <span className="text-xs text-gray-600">€600</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('asseverazione_ecobonus')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'asseverazione_ecobonus')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="flex-1">Asseverazione Ecobonus</span>
                      <span className="text-xs text-gray-600">€900</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('direzione_lavori')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'direzione_lavori')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="flex-1">Direzione Lavori Energetica</span>
                      <span className="text-xs text-gray-600">
                        {isResidenziale ? '€1.200' : '€2.000'}
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('termografia')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'termografia')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="flex-1">Termografia edificio</span>
                      <span className="text-xs text-gray-600">€400</span>
                    </label>

                    <label className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-blue-50 text-sm">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('blower_door_test')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'blower_door_test')}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="flex-1">Blower Door Test</span>
                      <span className="text-xs text-gray-600">€350</span>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-medium mb-4">Dati Cliente</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nomeCliente">Nome e Cognome *</Label>
                      <Input
                        id="nomeCliente"
                        value={data.nomeCliente}
                        onChange={(e) => updateData('nomeCliente', e.target.value)}
                        placeholder="Mario Rossi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailCliente">Email *</Label>
                      <Input
                        id="emailCliente"
                        type="email"
                        value={data.emailCliente}
                        onChange={(e) => updateData('emailCliente', e.target.value)}
                        placeholder="mario.rossi@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefonoCliente">Telefono</Label>
                      <Input
                        id="telefonoCliente"
                        type="tel"
                        value={data.telefonoCliente}
                        onChange={(e) => updateData('telefonoCliente', e.target.value)}
                        placeholder="+39 333 1234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="noteCliente">Note e richieste particolari</Label>
                      <textarea
                        id="noteCliente"
                        value={data.noteCliente}
                        onChange={(e) => updateData('noteCliente', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Eventuali note..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex gap-3">
                    <Button onClick={clearData} variant="outline" className="flex-1">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancella
                    </Button>
                    <Button onClick={downloadPDF} variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button onClick={sendEmail} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" />
                      Invia
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventivo column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-blue-500">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Preventivo Prestazioni
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Prezzi Riservati
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Effettua l&apos;accesso per visualizzare il preventivo personalizzato
                        </p>
                      </div>
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                        <Link href="/login">
                          <Lock className="w-4 h-4 mr-2" />
                          Accedi per Vedere i Prezzi
                        </Link>
                      </Button>
                      <p className="text-xs text-gray-500 mt-4">
                        Puoi compilare il configuratore e salvare i dati.<br />
                        Dopo l&apos;accesso, vedrai il preventivo dettagliato.
                      </p>
                    </div>
                  ) : (
                    <>
                      {preventivo && (
                        <>
                      {/* Prestazioni professionali base */}
                      <div className="pb-4 border-b">
                        <div className="text-sm font-medium text-gray-700 mb-3">PRESTAZIONI PROFESSIONALI</div>

                        {preventivo.prezzoBase > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Prezzo base</span>
                            <span className="font-medium">€{preventivo.prezzoBase.toLocaleString('it-IT')}</span>
                          </div>
                        )}

                        {preventivo.costoDiagnosiEnergetica > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Diagnosi energetica</span>
                            <span className="font-medium">€{preventivo.costoDiagnosiEnergetica.toLocaleString('it-IT')}</span>
                          </div>
                        )}

                        {preventivo.costoServiziAggiuntivi > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Servizi aggiuntivi</span>
                            <span className="font-medium">€{preventivo.costoServiziAggiuntivi.toLocaleString('it-IT')}</span>
                          </div>
                        )}

                        {preventivo.costoTrasferta > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Trasferta</span>
                            <span className="font-medium">€{preventivo.costoTrasferta.toLocaleString('it-IT')}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                          <span className="font-semibold">Subtotale</span>
                          <span className="font-semibold">€{preventivo.subtotale.toLocaleString('it-IT')}</span>
                        </div>
                      </div>

                      {/* Moltiplicatori */}
                      {(preventivo.moltiplicatoreInterventi > 1.0 || preventivo.moltiplicatoreUrgenza > 1.0) && (
                        <div className="pb-4 border-b bg-blue-50 -mx-6 px-6 py-3">
                          <div className="text-sm font-medium text-blue-800 mb-2">Moltiplicatori</div>

                          {preventivo.moltiplicatoreInterventi > 1.0 && (
                            <div className="flex justify-between text-sm text-blue-700">
                              <span>N° interventi</span>
                              <span className="font-medium">{preventivo.moltiplicatoreInterventi.toFixed(1)}x</span>
                            </div>
                          )}

                          {preventivo.moltiplicatoreUrgenza > 1.0 && (
                            <div className="flex justify-between text-sm text-blue-700">
                              <span>Urgenza</span>
                              <span className="font-medium">{preventivo.moltiplicatoreUrgenza.toFixed(1)}x</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Totale prestazioni */}
                      <div className="pt-4 border-t-2 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-gray-900">TOTALE</span>
                          <span className="text-2xl font-bold text-blue-600">
                            €{preventivo.totalePrestazioni.toLocaleString('it-IT')}
                          </span>
                        </div>
                      </div>

                      {/* Scheda Tecnica */}
                      <div className="pt-4 border-t bg-gradient-to-br from-cyan-50 to-blue-50 -mx-6 px-6 py-4">
                        <div className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          SCHEDA TECNICA
                        </div>

                        {preventivo.classeEnergeticaAttuale && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 mb-1">Classe energetica</div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold">{preventivo.classeEnergeticaAttuale}</span>
                              {preventivo.classeEnergeticaObiettivo !== preventivo.classeEnergeticaAttuale && (
                                <>
                                  <span className="text-gray-400">→</span>
                                  <span className="font-bold text-green-600">{preventivo.classeEnergeticaObiettivo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {preventivo.risparmioEnergeticoPerc !== '0' && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 mb-1">Risparmio energetico stimato</div>
                            <div className="font-bold text-green-600 text-sm flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {preventivo.risparmioEnergeticoPerc}%
                            </div>
                          </div>
                        )}

                        {preventivo.interventiSelezionati.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 mb-2">Interventi selezionati</div>
                            <div className="space-y-1">
                              {preventivo.interventiSelezionati.map((int, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700">{int}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {preventivo.incentiviApplicabili.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                              <Leaf className="w-3 h-3" />
                              Incentivi applicabili
                            </div>
                            <div className="space-y-1">
                              {preventivo.incentiviApplicabili.map((inc, i) => (
                                <div key={i} className="text-xs text-green-700 font-medium">
                                  ✓ {inc}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {preventivo.tempiRealizzazione && (
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Tempi realizzazione</div>
                            <div className="text-sm font-medium text-gray-700">
                              ⏱️ {preventivo.tempiRealizzazione}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Preventivo indicativo</p>
                            <p>
                              Questo preventivo copre solo le prestazioni professionali dello studio.
                              I costi degli interventi edilizi saranno forniti dalle imprese esecutrici.
                            </p>
                          </div>
                        </div>
                      </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
