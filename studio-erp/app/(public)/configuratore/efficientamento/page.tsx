'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Leaf
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

  // Sezione 6: Urgenza
  urgenza: string;
  serviziInclusi: string[];

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
  serviziInclusi: [],
  nomeCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  noteCliente: '',
};

interface Preventivo {
  costoInterventi: number;
  costoServizi: number;
  moltiplicatoreComplessita: number;
  moltiplicatoreUrgenza: number;
  costoTrasferta: number;
  totaleLordo: number;
  incentivoContoTermico: number;
  detrazioneEcobonus: number;
  totaleIncentivi: number;
  esborsoCliente: number;
  risparmioAnnuo: number;
  paybackAnni: number;
  dettaglioInterventi: { descrizione: string; costo: number; incentivo: number }[];
}

export default function ConfiguratoreEfficientamento() {
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
    // Definizione interventi residenziali con costi e incentivi
    const interventiResidenziali: Record<string, { costo: number; incentivoCT: number; ecobonus: number; risparmio: number }> = {
      caldaia_condensazione: { costo: 3500, incentivoCT: 0.65, ecobonus: 0.50, risparmio: 450 },
      pompa_calore_aa: { costo: 12000, incentivoCT: 0.65, ecobonus: 0.65, risparmio: 800 },
      pompa_calore_aw: { costo: 10000, incentivoCT: 0.65, ecobonus: 0.65, risparmio: 700 },
      caldaia_biomassa: { costo: 8000, incentivoCT: 0.65, ecobonus: 0.50, risparmio: 600 },
      sistema_ibrido: { costo: 9000, incentivoCT: 0.65, ecobonus: 0.50, risparmio: 650 },
      cappotto_esterno: { costo: 0, incentivoCT: 0, ecobonus: 0.50, risparmio: 0 }, // calcolato su mq
      isolamento_copertura: { costo: 0, incentivoCT: 0, ecobonus: 0.50, risparmio: 0 },
      serramenti: { costo: 0, incentivoCT: 0, ecobonus: 0.50, risparmio: 0 },
      solare_termico: { costo: 0, incentivoCT: 0.65, ecobonus: 0.65, risparmio: 0 },
      fotovoltaico: { costo: 0, incentivoCT: 0, ecobonus: 0.50, risparmio: 0 },
      vmc: { costo: 0, incentivoCT: 0, ecobonus: 0.50, risparmio: 0 },
    };

    // Definizione interventi industriali
    const interventiIndustriali: Record<string, { costo: number; incentivoCT: number; risparmio: number }> = {
      diagnosi_energetica: { costo: 5000, incentivoCT: 0, risparmio: 0 },
      recupero_calore: { costo: 30000, incentivoCT: 0.50, risparmio: 5000 },
      cogenerazione: { costo: 0, incentivoCT: 0.40, risparmio: 0 }, // calcolato su kW
      relamping_led: { costo: 0, incentivoCT: 0, risparmio: 0 },
      inverter_motori: { costo: 8000, incentivoCT: 0.40, risparmio: 1200 },
      isolamento_condotte: { costo: 12000, incentivoCT: 0.40, risparmio: 800 },
    };

    let costoInterventi = 0;
    let risparmioAnnuo = 0;
    const dettaglioInterventi: { descrizione: string; costo: number; incentivo: number }[] = [];

    // Calcolo interventi residenziali
    if (data.macroCategoria === 'residenziale') {
      data.interventiResidenziali.forEach((intervento) => {
        const int = interventiResidenziali[intervento];
        if (!int) return;

        let costo = int.costo;
        let risparmio = int.risparmio;

        // Calcoli su misura per involucro
        if (intervento === 'cappotto_esterno' && data.superficieRiscaldata > 0) {
          costo = data.superficieRiscaldata * 70; // €70/mq
          risparmio = data.superficieRiscaldata * 2; // €2/mq/anno
        } else if (intervento === 'isolamento_copertura' && data.superficieRiscaldata > 0) {
          costo = data.superficieRiscaldata * 50;
          risparmio = data.superficieRiscaldata * 1.5;
        } else if (intervento === 'serramenti' && data.superficieRiscaldata > 0) {
          const mqSerramenti = data.superficieRiscaldata * 0.15; // stima 15% superficie
          costo = mqSerramenti * 500;
          risparmio = mqSerramenti * 8;
        } else if (intervento === 'solare_termico' && data.superficieRiscaldata > 0) {
          const mq = Math.min(10, data.superficieRiscaldata / 20); // stima
          costo = mq * 1000;
          risparmio = mq * 100;
        } else if (intervento === 'fotovoltaico' && data.superficieRiscaldata > 0) {
          const kWp = Math.min(6, data.superficieRiscaldata / 50); // stima
          costo = kWp * 2000;
          risparmio = kWp * 300;
        } else if (intervento === 'vmc' && data.superficieRiscaldata > 0) {
          costo = data.superficieRiscaldata * 100;
          risparmio = data.superficieRiscaldata * 1.2;
        }

        costoInterventi += costo;
        risparmioAnnuo += risparmio;

        // Calcolo incentivo (usa il migliore tra CT e Ecobonus)
        const incentivoCT = data.accessoIncentivi.includes('conto_termico') ? costo * int.incentivoCT : 0;
        const incentivoBon = data.accessoIncentivi.includes('ecobonus') ? costo * int.ecobonus : 0;
        const incentivo = Math.max(incentivoCT, incentivoBon);

        dettaglioInterventi.push({
          descrizione: getDescrizioneIntervento(intervento, true),
          costo,
          incentivo,
        });
      });
    }

    // Calcolo interventi industriali
    if (data.macroCategoria === 'industriale') {
      data.interventiIndustriali.forEach((intervento) => {
        const int = interventiIndustriali[intervento];
        if (!int) return;

        let costo = int.costo;
        let risparmio = int.risparmio;

        if (intervento === 'cogenerazione' && data.potenzaTermica > 0) {
          costo = data.potenzaTermica * 2000; // €2000/kW
          risparmio = data.potenzaTermica * 400;
        } else if (intervento === 'relamping_led' && data.superficieTotale > 0) {
          const puntiLuce = data.superficieTotale / 20; // stima
          costo = puntiLuce * 120;
          risparmio = puntiLuce * 30;
        }

        costoInterventi += costo;
        risparmioAnnuo += risparmio;

        const incentivo = data.accessoIncentivi.includes('conto_termico') ? costo * int.incentivoCT : 0;

        dettaglioInterventi.push({
          descrizione: getDescrizioneIntervento(intervento, false),
          costo,
          incentivo,
        });
      });
    }

    // Costo servizi
    const prezziServizi: Record<string, number> = {
      sopralluogo: 300,
      diagnosi_energetica: 2500,
      ape_ante_post: 400,
      relazione_legge10: 800,
      pratiche_conto_termico: 1500,
      pratiche_enea: 500,
      direzione_lavori: 2000,
      asseverazione: 1200,
    };

    let costoServizi = 0;
    data.serviziInclusi.forEach((servizio) => {
      costoServizi += prezziServizi[servizio] || 0;
    });

    // Moltiplicatore complessità
    let moltiplicatoreComplessita = 1.0;
    if (data.macroCategoria === 'residenziale') {
      if (data.tipologiaResidenziale === 'condominio' || data.numeroUnita > 4) {
        moltiplicatoreComplessita = 1.5;
      } else if (data.tipologiaResidenziale === 'villa') {
        moltiplicatoreComplessita = 1.2;
      }
    } else if (data.macroCategoria === 'industriale') {
      if (data.superficieTotale > 5000 || data.potenzaTermica > 500) {
        moltiplicatoreComplessita = 1.5;
      } else if (data.superficieTotale > 2000) {
        moltiplicatoreComplessita = 1.2;
      }
    }

    // Moltiplicatore urgenza
    const moltiplicatoriUrgenza: Record<string, number> = {
      standard: 1.0,
      prioritaria: 1.2,
      urgente: 1.5,
    };
    const moltiplicatoreUrgenza = moltiplicatoriUrgenza[data.urgenza] || 1.0;

    // Applica moltiplicatori ai servizi
    costoServizi = Math.round(costoServizi * moltiplicatoreComplessita * moltiplicatoreUrgenza);

    // Costo trasferta
    const costoTrasferta = data.regione ? calcolaCostoTrasferta(data.regione) : 0;

    // Totale lordo
    const totaleLordo = costoInterventi + costoServizi + costoTrasferta;

    // Calcolo incentivi totali
    const incentivoContoTermico = dettaglioInterventi.reduce((sum, int) => sum + int.incentivo, 0);
    const detrazioneEcobonus = 0; // già considerata nel calcolo incentivo
    const totaleIncentivi = incentivoContoTermico;

    // Esborso cliente
    const esborsoCliente = Math.max(0, totaleLordo - totaleIncentivi);

    // Payback
    const paybackAnni = risparmioAnnuo > 0 ? esborsoCliente / risparmioAnnuo : 0;

    return {
      costoInterventi,
      costoServizi,
      moltiplicatoreComplessita,
      moltiplicatoreUrgenza,
      costoTrasferta,
      totaleLordo,
      incentivoContoTermico,
      detrazioneEcobonus,
      totaleIncentivi,
      esborsoCliente: Math.round(esborsoCliente),
      risparmioAnnuo: Math.round(risparmioAnnuo),
      paybackAnni: parseFloat(paybackAnni.toFixed(1)),
      dettaglioInterventi,
    };
  };

  const getDescrizioneIntervento = (key: string, isResidenziale: boolean): string => {
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

    return isResidenziale ? residenziali[key] || key : industriali[key] || key;
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
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          <h1 className="text-4xl font-bold mb-3">Configuratore Efficientamento Energetico</h1>
          <p className="text-xl text-blue-50">
            Ottieni un preventivo personalizzato con calcolo incentivi Conto Termico 3.0
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
                      <option value="appartamento">Appartamento (1.0x)</option>
                      <option value="villa">Villa/Casa indipendente (1.2x)</option>
                      <option value="condominio">Condominio (1.5x)</option>
                      <option value="negozio">Negozio/Attività commerciale (1.2x)</option>
                      <option value="ufficio">Ufficio (1.2x)</option>
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
                      <p className="text-sm text-blue-50">Seleziona gli interventi</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">🔥 Generazione Calore</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'caldaia_condensazione', label: 'Caldaia a condensazione', costo: '€3.500' },
                        { value: 'pompa_calore_aa', label: 'Pompa di calore aria/aria', costo: '€12.000' },
                        { value: 'pompa_calore_aw', label: 'Pompa di calore aria/acqua', costo: '€10.000' },
                        { value: 'caldaia_biomassa', label: 'Caldaia a biomassa', costo: '€8.000' },
                        { value: 'sistema_ibrido', label: 'Sistema ibrido caldaia+PdC', costo: '€9.000' },
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
                          <div className="flex-1">
                            <span className="text-sm font-medium">{int.label}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {int.costo}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">🏠 Involucro Edilizio</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'cappotto_esterno', label: 'Cappotto termico esterno', costo: '€70/mq' },
                        { value: 'isolamento_copertura', label: 'Isolamento copertura', costo: '€50/mq' },
                        { value: 'serramenti', label: 'Sostituzione serramenti', costo: '€500/mq' },
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
                          <div className="flex-1">
                            <span className="text-sm font-medium">{int.label}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {int.costo}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">☀️ Energie Rinnovabili</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'solare_termico', label: 'Solare termico', costo: '€1.000/mq' },
                        { value: 'fotovoltaico', label: 'Fotovoltaico', costo: '€2.000/kWp' },
                        { value: 'vmc', label: 'VMC con recupero calore', costo: '€100/mq' },
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
                          <div className="flex-1">
                            <span className="text-sm font-medium">{int.label}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {int.costo}
                          </Badge>
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
                      <p className="text-sm text-blue-50">Seleziona gli interventi</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">Interventi disponibili</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'diagnosi_energetica', label: 'Diagnosi energetica', costo: '€5.000' },
                        { value: 'recupero_calore', label: 'Recupero calore da processi', costo: '€30.000' },
                        { value: 'cogenerazione', label: 'Impianto cogenerazione', costo: '€2.000/kW' },
                        { value: 'relamping_led', label: 'Relamping LED', costo: '€120/punto luce' },
                        { value: 'inverter_motori', label: 'Inverter motori elettrici', costo: '€8.000' },
                        { value: 'isolamento_condotte', label: 'Isolamento condotte', costo: '€12.000' },
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
                          <div className="flex-1">
                            <span className="text-sm font-medium">{int.label}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {int.costo}
                          </Badge>
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

            {/* Sezione 6: Urgenza e Servizi */}
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
                      { value: 'prioritaria', label: 'Prioritaria (30-60 gg)', mult: '1.2x' },
                      { value: 'urgente', label: 'Urgente (15-30 gg)', mult: '1.5x' },
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
                  <Label className="mb-3 block font-semibold">Servizi tecnici inclusi</Label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      { value: 'sopralluogo', label: 'Sopralluogo preliminare', prezzo: '€300' },
                      { value: 'diagnosi_energetica', label: 'Diagnosi energetica', prezzo: '€2.500' },
                      { value: 'ape_ante_post', label: 'APE ante/post', prezzo: '€400' },
                      { value: 'relazione_legge10', label: 'Relazione Legge 10', prezzo: '€800' },
                      { value: 'pratiche_conto_termico', label: 'Pratiche Conto Termico', prezzo: '€1.500' },
                      { value: 'pratiche_enea', label: 'Pratiche ENEA', prezzo: '€500' },
                      { value: 'direzione_lavori', label: 'Direzione lavori', prezzo: '€2.000' },
                      { value: 'asseverazione', label: 'Asseverazione finale', prezzo: '€1.200' },
                    ].map((serv) => (
                      <label
                        key={serv.value}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-blue-50 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={data.serviziInclusi.includes(serv.value)}
                          onChange={() => toggleArrayValue('serviziInclusi', serv.value)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="flex-1">{serv.label}</span>
                        <span className="text-xs text-gray-600">{serv.prezzo}</span>
                      </label>
                    ))}
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
                    Preventivo con Incentivi
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preventivo && (
                    <>
                      {/* Interventi selezionati */}
                      {preventivo.dettaglioInterventi.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Interventi selezionati</div>
                          <div className="space-y-1">
                            {preventivo.dettaglioInterventi.map((int, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{int.descrizione}</span>
                                <span className="font-medium">€{int.costo.toLocaleString('it-IT')}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t flex justify-between font-semibold text-sm">
                            <span>Subtotale interventi</span>
                            <span>€{preventivo.costoInterventi.toLocaleString('it-IT')}</span>
                          </div>
                        </div>
                      )}

                      {/* Servizi */}
                      {preventivo.costoServizi > 0 && (
                        <div className="pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Servizi tecnici</span>
                            <span className="font-medium">+€{preventivo.costoServizi.toLocaleString('it-IT')}</span>
                          </div>
                        </div>
                      )}

                      {/* Trasferta */}
                      {preventivo.costoTrasferta > 0 && (
                        <div className="pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Trasferta ({data.regione})</span>
                            <span className="font-medium">+€{preventivo.costoTrasferta.toLocaleString('it-IT')}</span>
                          </div>
                        </div>
                      )}

                      {/* Totale lordo */}
                      <div className="pb-4 border-b">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">TOTALE LORDO</span>
                          <span className="text-xl font-bold text-gray-900">
                            €{preventivo.totaleLordo.toLocaleString('it-IT')}
                          </span>
                        </div>
                      </div>

                      {/* Incentivi */}
                      {preventivo.totaleIncentivi > 0 && (
                        <div className="pb-4 border-b bg-green-50 -mx-6 px-6 py-3">
                          <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            Incentivi
                          </div>
                          {preventivo.incentivoContoTermico > 0 && (
                            <div className="flex justify-between text-sm text-green-700">
                              <span>Conto Termico 3.0</span>
                              <span className="font-bold">-€{preventivo.incentivoContoTermico.toLocaleString('it-IT')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Esborso cliente */}
                      <div className="pt-4 border-t-2 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-gray-900">ESBORSO CLIENTE</span>
                          <span className="text-2xl font-bold text-blue-600">
                            €{preventivo.esborsoCliente.toLocaleString('it-IT')}
                          </span>
                        </div>

                        {/* Risparmio e payback */}
                        {preventivo.risparmioAnnuo > 0 && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                Risparmio annuo
                              </span>
                              <span className="font-bold text-blue-600">
                                €{preventivo.risparmioAnnuo.toLocaleString('it-IT')}/anno
                              </span>
                            </div>
                            {preventivo.paybackAnni > 0 && (
                              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span>⏱️ Payback time</span>
                                <span className="font-bold text-blue-600">{preventivo.paybackAnni} anni</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Preventivo indicativo</p>
                            <p>
                              Il preventivo finale e gli incentivi effettivi saranno confermati dopo sopralluogo
                              tecnico e verifica documentazione.
                            </p>
                          </div>
                        </div>
                      </div>
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
