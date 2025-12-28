'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  Building2,
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  Calculator,
  Download,
  Send,
  Trash2,
  AlertTriangle,
  Search,
  Home,
  Briefcase,
  MapPin,
  Settings,
  ClipboardCheck,
  Euro,
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-due-diligence-data';

// Interfaccia dati configuratore
interface ConfiguratoreDueDiligenceData {
  // Step 1: Tipologia operazione
  tipoOperazione: string;
  urgenza: string;

  // Step 2: Caratteristiche asset
  tipologiaImmobile: string;
  superficieCommerciale: number;
  numeroUnita: number;
  numeroEdifici: number;
  etaImmobile: string;
  statoConservazione: string;

  // Step 3: Livello approfondimento
  livelloApprofondimento: string;

  // Step 4: Aree di verifica
  verificaAmministrativa: boolean;
  verificaUrbanistica: boolean;
  verificaStrutturale: boolean;
  verificaImpiantistica: boolean;
  verificaAmbientale: boolean;
  verificaEnergetica: boolean;
  verificaContrattuale: boolean;

  // Step 5: Complessità
  portafoglioMultiAsset: boolean;
  numeroAssetAggiuntivi: number;
  edificioStorico: boolean;
  presenzaAmianto: boolean;
  contenziosi: boolean;
  documentazioneIncompleta: boolean;
  difformitaEdilizie: boolean;
  accessoDifficile: boolean;
  traduzioni: boolean;
  pareriLegale: boolean;

  // Riduzioni
  portafoglioStandardizzato: boolean;
  documentazioneCompleta: boolean;
  edificioRecente: boolean;

  // Step 6: Servizi aggiuntivi
  serviziAggiuntivi: string[];

  // Step 7: Ubicazione
  indirizzo: string;
  comune: string;
  provincia: string;
  regione: string;
  regioneTrasferta: string;
  numerosopralluoghi: number;

  // Step 8: Note e richieste speciali
  noteCliente: string;
  emailCliente: string;
  nomeCliente: string;
  telefonoCliente: string;
}

const initialData: ConfiguratoreDueDiligenceData = {
  tipoOperazione: '',
  urgenza: 'standard',
  tipologiaImmobile: '',
  superficieCommerciale: 0,
  numeroUnita: 1,
  numeroEdifici: 1,
  etaImmobile: '',
  statoConservazione: '',
  livelloApprofondimento: 'livello2',
  verificaAmministrativa: true,
  verificaUrbanistica: false,
  verificaStrutturale: false,
  verificaImpiantistica: false,
  verificaAmbientale: false,
  verificaEnergetica: false,
  verificaContrattuale: false,
  portafoglioMultiAsset: false,
  numeroAssetAggiuntivi: 0,
  edificioStorico: false,
  presenzaAmianto: false,
  contenziosi: false,
  documentazioneIncompleta: false,
  difformitaEdilizie: false,
  accessoDifficile: false,
  traduzioni: false,
  pareriLegale: false,
  portafoglioStandardizzato: false,
  documentazioneCompleta: false,
  edificioRecente: false,
  serviziAggiuntivi: [],
  indirizzo: '',
  comune: '',
  provincia: '',
  regione: '',
  regioneTrasferta: 'campania',
  numerosopralluoghi: 1,
  noteCliente: '',
  emailCliente: '',
  nomeCliente: '',
  telefonoCliente: '',
};

interface Preventivo {
  prezzoBase: number;
  livelloMultiplicatore: number;
  prezzoLivello: number;
  maggiorazioni: { descrizione: string; importo: number }[];
  totaleMaggiorazioni: number;
  riduzioni: { descrizione: string; importo: number }[];
  totaleRiduzioni: number;
  serviziAggiuntivi: { descrizione: string; importo: number }[];
  totaleServiziAggiuntivi: number;
  costoTrasferta: number;
  costoSopralluoghi: number;
  totale: number;
}

export default function ConfiguratoreDueDiligence() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ConfiguratoreDueDiligenceData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const updateData = (field: keyof ConfiguratoreDueDiligenceData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreDueDiligenceData, value: string) => {
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

  const calcolaPreventivo = (data: ConfiguratoreDueDiligenceData): Preventivo => {
    // Prezzi base per superficie e tipologia
    const prezziBase: Record<string, { min: number; max: number }[]> = {
      residenziale: [
        { min: 0, max: 500, importo: 8000 },
        { min: 500, max: 1500, importo: 12000 },
        { min: 1500, max: 5000, importo: 18000 },
        { min: 5000, max: 999999, importo: 25000 },
      ],
      uffici: [
        { min: 0, max: 500, importo: 10000 },
        { min: 500, max: 1500, importo: 15000 },
        { min: 1500, max: 5000, importo: 25000 },
        { min: 5000, max: 999999, importo: 35000 },
      ],
      commerciale: [
        { min: 0, max: 500, importo: 10000 },
        { min: 500, max: 1500, importo: 15000 },
        { min: 1500, max: 5000, importo: 25000 },
        { min: 5000, max: 999999, importo: 35000 },
      ],
      industriale: [
        { min: 0, max: 500, importo: 12000 },
        { min: 500, max: 1500, importo: 18000 },
        { min: 1500, max: 5000, importo: 30000 },
        { min: 5000, max: 999999, importo: 45000 },
      ],
      alberghiero: [
        { min: 0, max: 500, importo: 12000 },
        { min: 500, max: 1500, importo: 18000 },
        { min: 1500, max: 5000, importo: 30000 },
        { min: 5000, max: 999999, importo: 45000 },
      ],
      sanitario: [
        { min: 0, max: 500, importo: 12000 },
        { min: 500, max: 1500, importo: 18000 },
        { min: 1500, max: 5000, importo: 30000 },
        { min: 5000, max: 999999, importo: 45000 },
      ],
      mixeduse: [
        { min: 0, max: 500, importo: 11000 },
        { min: 500, max: 1500, importo: 16500 },
        { min: 1500, max: 5000, importo: 27500 },
        { min: 5000, max: 999999, importo: 40000 },
      ],
    };

    let prezzoBase = 8000;

    if (data.tipologiaImmobile && data.superficieCommerciale > 0) {
      const scaglioni = prezziBase[data.tipologiaImmobile] || prezziBase.residenziale;
      const scaglione = scaglioni.find(
        (s: any) => data.superficieCommerciale > s.min && data.superficieCommerciale <= s.max
      );
      if (scaglione) {
        prezzoBase = (scaglione as any).importo;
      }
    }

    // Moltiplicatori livello
    const moltiplicatoriLivello: Record<string, number> = {
      livello1: 0.6,
      livello2: 1.0,
      livello3: 1.8,
    };

    const livelloMultiplicatore = moltiplicatoriLivello[data.livelloApprofondimento] || 1.0;
    const prezzoLivello = Math.round(prezzoBase * livelloMultiplicatore);

    // Maggiorazioni
    const maggiorazioni: { descrizione: string; importo: number }[] = [];

    // Urgenza
    if (data.urgenza === 'prioritaria') {
      const magg = Math.round(prezzoLivello * 0.2);
      maggiorazioni.push({ descrizione: 'Urgenza prioritaria (15-20 gg) +20%', importo: magg });
    } else if (data.urgenza === 'fasttrack') {
      const magg = Math.round(prezzoLivello * 0.4);
      maggiorazioni.push({ descrizione: 'Urgenza fast-track (7-10 gg) +40%', importo: magg });
    } else if (data.urgenza === 'emergency') {
      const magg = Math.round(prezzoLivello * 0.6);
      maggiorazioni.push({ descrizione: 'Urgenza emergency (<7 gg) +60%', importo: magg });
    }

    // Portafoglio multi-asset
    if (data.portafoglioMultiAsset && data.numeroAssetAggiuntivi > 0) {
      const gruppi = Math.floor(data.numeroAssetAggiuntivi / 3);
      const magg = Math.round(prezzoLivello * 0.15 * gruppi);
      maggiorazioni.push({
        descrizione: `Portafoglio multi-asset (${data.numeroAssetAggiuntivi} unità aggiuntive) +15% ogni 3`,
        importo: magg,
      });
    }

    if (data.edificioStorico) {
      maggiorazioni.push({ descrizione: 'Edificio storico/vincolato', importo: 3000 });
    }

    if (data.presenzaAmianto) {
      maggiorazioni.push({ descrizione: 'Presenza amianto/bonifiche necessarie', importo: 2500 });
    }

    if (data.contenziosi) {
      maggiorazioni.push({ descrizione: 'Contenziosi in corso', importo: 2000 });
    }

    if (data.documentazioneIncompleta) {
      maggiorazioni.push({ descrizione: 'Documentazione incompleta/assente', importo: 3500 });
    }

    if (data.difformitaEdilizie) {
      maggiorazioni.push({ descrizione: 'Difformità edilizie evidenti', importo: 2000 });
    }

    if (data.accessoDifficile) {
      maggiorazioni.push({ descrizione: 'Accesso difficoltoso', importo: 1500 });
    }

    if (data.traduzioni) {
      maggiorazioni.push({ descrizione: 'Necessità traduzioni', importo: 1200 });
    }

    if (data.pareriLegale) {
      maggiorazioni.push({ descrizione: 'Richiesta parere legale associato', importo: 4000 });
    }

    const totaleMaggiorazioni = maggiorazioni.reduce((sum, m) => sum + m.importo, 0);

    // Riduzioni
    const riduzioni: { descrizione: string; importo: number }[] = [];

    if (data.portafoglioStandardizzato && data.numeroUnita >= 6) {
      const unitaRidotte = data.numeroUnita - 5;
      const rid = Math.round(prezzoLivello * 0.2 * unitaRidotte);
      riduzioni.push({
        descrizione: `Portafoglio standardizzato (${unitaRidotte} unità oltre la 5ª) -20%`,
        importo: rid,
      });
    }

    if (data.documentazioneCompleta) {
      riduzioni.push({ descrizione: 'Documentazione completa e organizzata', importo: 800 });
    }

    if (data.edificioRecente) {
      riduzioni.push({ descrizione: 'Edificio <5 anni con collaudi regolari', importo: 1000 });
    }

    const totaleRiduzioni = riduzioni.reduce((sum, r) => sum + r.importo, 0);

    // Servizi aggiuntivi
    const prezziServiziAggiuntivi: Record<string, { label: string; prezzo: number }> = {
      valutazione: { label: 'Valutazione immobile (OMI/comparativa)', prezzo: 3500 },
      computo: { label: 'Computo metrico interventi necessari', prezzo: 2500 },
      cronoprogramma: { label: 'Cronoprogramma interventi 5 anni', prezzo: 1800 },
      businessplan: { label: 'Business plan ristrutturazione', prezzo: 5000 },
      esg: { label: 'Rating ESG / certificazione LEED', prezzo: 4500 },
      parereLegale: { label: 'Parere legale conformità', prezzo: 4000 },
      visura: { label: 'Visura camerale + PEC società', prezzo: 300 },
      dataroom: { label: 'Data room digitale organizzata', prezzo: 1200 },
      affiancamento: { label: 'Affiancamento trattativa (2 incontri)', prezzo: 2000 },
      assistenza: { label: 'Assistenza post-vendita (3 mesi)', prezzo: 1500 },
    };

    const serviziAggiuntivi = data.serviziAggiuntivi.map((key) => ({
      descrizione: prezziServiziAggiuntivi[key].label,
      importo: prezziServiziAggiuntivi[key].prezzo,
    }));

    const totaleServiziAggiuntivi = serviziAggiuntivi.reduce((sum, s) => sum + s.importo, 0);

    // Costo trasferta
    const costiTrasferta: Record<string, number> = {
      campania: 150,
      confinanti: 350,
      altre: 700,
    };

    const costoTrasferta = costiTrasferta[data.regioneTrasferta] || 0;

    // Costo sopralluoghi aggiuntivi
    const sopralluogiAggiuntivi = Math.max(0, data.numerosopralluoghi - 1);
    const costoSopralluoghi = sopralluogiAggiuntivi * (800 + costoTrasferta);

    // Totale finale
    const totale =
      prezzoLivello +
      totaleMaggiorazioni -
      totaleRiduzioni +
      totaleServiziAggiuntivi +
      costoTrasferta +
      costoSopralluoghi;

    return {
      prezzoBase,
      livelloMultiplicatore,
      prezzoLivello,
      maggiorazioni,
      totaleMaggiorazioni,
      riduzioni,
      totaleRiduzioni,
      serviziAggiuntivi,
      totaleServiziAggiuntivi,
      costoTrasferta,
      costoSopralluoghi,
      totale: Math.max(0, totale),
    };
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
    if (!data.emailCliente || !data.nomeCliente) {
      alert('Inserisci nome e email per inviare il preventivo');
      return;
    }

    setEmailSending(true);

    try {
      const response = await fetch('/api/preventivo-due-diligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, preventivo }),
      });

      if (response.ok) {
        alert('Preventivo inviato con successo! Riceverai una copia via email.');
        setShowEmailModal(false);
      } else {
        alert('Errore nell\'invio del preventivo. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      alert('Errore nell\'invio del preventivo. Riprova più tardi.');
    } finally {
      setEmailSending(false);
    }
  };

  const steps = [
    { num: 1, title: 'Operazione', icon: Briefcase },
    { num: 2, title: 'Asset', icon: Building2 },
    { num: 3, title: 'Livello DD', icon: Search },
    { num: 4, title: 'Verifiche', icon: CheckSquare },
    { num: 5, title: 'Complessità', icon: Settings },
    { num: 6, title: 'Servizi Extra', icon: TrendingUp },
    { num: 7, title: 'Ubicazione', icon: MapPin },
    { num: 8, title: 'Riepilogo', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuratore Due Diligence</h1>
                <p className="text-sm text-gray-600">Preventivo tecnico immobiliare personalizzato</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearData}>
                <Trash2 className="w-4 h-4 mr-2" />
                Cancella
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button size="sm" onClick={() => setShowEmailModal(true)}>
                <Send className="w-4 h-4 mr-2" />
                Invia
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    step === s.num
                      ? 'bg-blue-600 text-white shadow-md'
                      : step > s.num
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Tipologia Operazione */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Tipologia Operazione</CardTitle>
                      <p className="text-sm text-gray-600">Qual è il contesto della due diligence?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo di operazione *
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'compravendita', label: 'Compravendita immobiliare singola' },
                        { value: 'acquisizione', label: 'Acquisizione societaria (M&A)' },
                        { value: 'cartolarizzazione', label: 'Cartolarizzazione portafoglio' },
                        { value: 'finanziamento', label: 'Finanziamento bancario' },
                        { value: 'investimento', label: 'Valutazione investimento (fondi immobiliari)' },
                        { value: 'ristrutturazione', label: 'Ristrutturazione aziendale' },
                      ].map((tipo) => (
                        <label
                          key={tipo.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="tipoOperazione"
                            value={tipo.value}
                            checked={data.tipoOperazione === tipo.value}
                            onChange={(e) => updateData('tipoOperazione', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{tipo.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Urgenza della due diligence
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'standard', label: 'Standard (30-45 gg)', extra: 'Prezzo base' },
                        { value: 'prioritaria', label: 'Prioritaria (15-20 gg)', extra: '+20%' },
                        { value: 'fasttrack', label: 'Fast-track (7-10 gg)', extra: '+40%' },
                        { value: 'emergency', label: 'Emergency (<7 gg)', extra: '+60%' },
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
                            <div className="font-medium text-sm">{urg.label}</div>
                          </div>
                          <Badge variant={urg.value === 'standard' ? 'secondary' : 'default'}>
                            {urg.extra}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Caratteristiche Asset */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Caratteristiche Asset</CardTitle>
                      <p className="text-sm text-gray-600">Descrivi l'immobile oggetto di verifica</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipologia immobile *
                    </label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        { value: 'residenziale', label: '🏠 Residenziale' },
                        { value: 'uffici', label: '🏢 Uffici/Direzionale' },
                        { value: 'commerciale', label: '🏬 Commerciale/Retail' },
                        { value: 'industriale', label: '🏭 Industriale/Logistica' },
                        { value: 'alberghiero', label: '🏨 Alberghiero/Turistico' },
                        { value: 'sanitario', label: '🏥 Sanitario/RSA' },
                        { value: 'mixeduse', label: '🏛️ Mixed-use' },
                      ].map((tipo) => (
                        <label
                          key={tipo.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="tipologiaImmobile"
                            value={tipo.value}
                            checked={data.tipologiaImmobile === tipo.value}
                            onChange={(e) => updateData('tipologiaImmobile', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{tipo.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Superficie commerciale totale (mq) *
                      </label>
                      <input
                        type="number"
                        value={data.superficieCommerciale || ''}
                        onChange={(e) => updateData('superficieCommerciale', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numero unità immobiliari
                      </label>
                      <input
                        type="number"
                        value={data.numeroUnita || ''}
                        onChange={(e) => updateData('numeroUnita', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero edifici nel portafoglio
                    </label>
                    <input
                      type="number"
                      value={data.numeroEdifici || ''}
                      onChange={(e) => updateData('numeroEdifici', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Età dell'immobile
                    </label>
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        { value: 'recente', label: '< 10 anni' },
                        { value: 'medio', label: '10-30 anni' },
                        { value: 'datato', label: '30-50 anni' },
                        { value: 'vecchio', label: '> 50 anni' },
                        { value: 'storico', label: 'Storico/Vincolato' },
                      ].map((eta) => (
                        <label
                          key={eta.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="etaImmobile"
                            value={eta.value}
                            checked={data.etaImmobile === eta.value}
                            onChange={(e) => updateData('etaImmobile', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{eta.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Stato di conservazione apparente
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'ottimo', label: 'Ottimo (recente ristrutturazione)' },
                        { value: 'buono', label: 'Buono (manutenzione regolare)' },
                        { value: 'discreto', label: 'Discreto (necessita piccoli interventi)' },
                        { value: 'mediocre', label: 'Mediocre (necessita interventi importanti)' },
                        { value: 'scarso', label: 'Scarso (degrado evidente)' },
                      ].map((stato) => (
                        <label
                          key={stato.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="statoConservazione"
                            value={stato.value}
                            checked={data.statoConservazione === stato.value}
                            onChange={(e) => updateData('statoConservazione', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">{stato.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Livello Approfondimento */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Livello di Approfondimento</CardTitle>
                      <p className="text-sm text-gray-600">Scegli il livello di due diligence</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      value: 'livello1',
                      label: 'Livello 1 - Desktop Due Diligence',
                      desc: 'Analisi documentale (no sopralluogo fisico). Verifica titolarità, conformità catastale, analisi urbanistica. Report sintetico 20-30 pagine.',
                      tempistica: '5-7 giorni',
                      moltiplicatore: '0.6x',
                      quando: 'Pre-screening, portafogli numerosi',
                    },
                    {
                      value: 'livello2',
                      label: 'Livello 2 - Standard Due Diligence',
                      desc: 'Desktop + Sopralluogo tecnico approfondito, verifica strutturale/impiantistica visiva, conformità edilizia, stima costi manutenzione. Report 50-80 pagine.',
                      tempistica: '15-20 giorni',
                      moltiplicatore: '1.0x',
                      quando: 'Compravendite standard, finanziamenti',
                    },
                    {
                      value: 'livello3',
                      label: 'Livello 3 - Enhanced Due Diligence',
                      desc: 'Standard + Indagini strumentali, verifica sismica approfondita, diagnosi energetica, compliance completa, business plan manutenzione 10 anni, analisi ESG. Report 100+ pagine.',
                      tempistica: '30-45 giorni',
                      moltiplicatore: '1.8x',
                      quando: 'Acquisizioni importanti, fondi, cartolarizzazioni',
                    },
                  ].map((liv) => (
                    <label
                      key={liv.value}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        data.livelloApprofondimento === liv.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="livelloApprofondimento"
                          value={liv.value}
                          checked={data.livelloApprofondimento === liv.value}
                          onChange={(e) => updateData('livelloApprofondimento', e.target.value)}
                          className="w-5 h-5 text-blue-600 mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{liv.label}</span>
                            <Badge variant="outline">{liv.moltiplicatore}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{liv.desc}</p>
                          <div className="flex flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Clock className="w-3 h-3" />
                              <span>{liv.tempistica}</span>
                            </div>
                            <div className="text-gray-500">
                              <strong>Quando:</strong> {liv.quando}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <strong>Nota:</strong> I livelli seguono gli standard RICS Red Book e ASTM per le
                        due diligence immobiliari. Il moltiplicatore si applica al prezzo base determinato
                        da superficie e tipologia immobile.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Aree di Verifica */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Aree di Verifica</CardTitle>
                      <p className="text-sm text-gray-600">
                        Seleziona le aree specifiche da verificare
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ <strong>Verifica Amministrativa</strong> è sempre inclusa (titolarità, conformità
                      catastale, carichi e gravami)
                    </p>
                  </div>

                  {[
                    {
                      field: 'verificaUrbanistica',
                      label: 'Verifica Urbanistica/Edilizia',
                      desc: 'Conformità titoli edilizi, PRG/PUC, vincoli, destinazione d\'uso, abusi',
                    },
                    {
                      field: 'verificaStrutturale',
                      label: 'Verifica Strutturale',
                      desc: 'Verifica sismica, stato strutture, lesioni, fondazioni, degrado',
                    },
                    {
                      field: 'verificaImpiantistica',
                      label: 'Verifica Impiantistica',
                      desc: 'Elettrico, termico, idrico, antincendio, elevatori, sicurezza',
                    },
                    {
                      field: 'verificaAmbientale',
                      label: 'Verifica Ambientale',
                      desc: 'Amianto, radon, inquinamento indoor, siti contaminati, PCB',
                    },
                    {
                      field: 'verificaEnergetica',
                      label: 'Verifica Energetica',
                      desc: 'Audit energetico, classe energetica, gap vs NZEB, piano miglioramento',
                    },
                    {
                      field: 'verificaContrattuale',
                      label: 'Verifica Contrattuale',
                      desc: 'Contratti locazione, garanzie costruttore, polizze, manutenzioni',
                    },
                  ].map((verifica) => (
                    <label
                      key={verifica.field}
                      className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={data[verifica.field as keyof ConfiguratoreDueDiligenceData] as boolean}
                        onChange={(e) => updateData(verifica.field as any, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{verifica.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{verifica.desc}</div>
                      </div>
                    </label>
                  ))}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Nota:</strong> Le aree selezionate influenzano l'approfondimento delle
                      verifiche ma non modificano il prezzo base, già calibrato sul livello di DD scelto.
                      Eventuali indagini strumentali specifiche saranno quotate separatamente se necessarie.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Complessità */}
            {step === 5 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Fattori di Complessità</CardTitle>
                      <p className="text-sm text-gray-600">Elementi che influenzano il preventivo</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Maggiorazioni</h3>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50">
                        <input
                          type="checkbox"
                          checked={data.portafoglioMultiAsset}
                          onChange={(e) => updateData('portafoglioMultiAsset', e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Portafoglio multi-asset</div>
                          <div className="text-xs text-gray-600 mt-1">
                            +15% ogni 3 unità aggiuntive oltre la prima
                          </div>
                          {data.portafoglioMultiAsset && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Numero asset aggiuntivi (oltre il primo)
                              </label>
                              <input
                                type="number"
                                value={data.numeroAssetAggiuntivi || ''}
                                onChange={(e) =>
                                  updateData('numeroAssetAggiuntivi', Number(e.target.value))
                                }
                                className="w-32 px-3 py-2 border rounded-lg text-sm"
                                placeholder="3"
                                min="0"
                              />
                            </div>
                          )}
                        </div>
                      </label>

                      {[
                        {
                          field: 'edificioStorico',
                          label: 'Edificio storico/vincolato',
                          importo: '+€3.000',
                        },
                        {
                          field: 'presenzaAmianto',
                          label: 'Presenza amianto/bonifiche necessarie',
                          importo: '+€2.500',
                        },
                        {
                          field: 'contenziosi',
                          label: 'Contenziosi in corso (urbanistici, condominiali)',
                          importo: '+€2.000',
                        },
                        {
                          field: 'documentazioneIncompleta',
                          label: 'Documentazione incompleta/assente',
                          importo: '+€3.500',
                        },
                        {
                          field: 'difformitaEdilizie',
                          label: 'Difformità edilizie evidenti',
                          importo: '+€2.000',
                        },
                        {
                          field: 'accessoDifficile',
                          label: 'Accesso difficoltoso (edificio occupato, zone pericolose)',
                          importo: '+€1.500',
                        },
                        {
                          field: 'traduzioni',
                          label: 'Necessità traduzioni (acquirente estero)',
                          importo: '+€1.200',
                        },
                        {
                          field: 'pareriLegale',
                          label: 'Richiesta parere legale associato',
                          importo: '+€4.000',
                        },
                      ].map((item) => (
                        <label
                          key={item.field}
                          className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="checkbox"
                            checked={
                              data[item.field as keyof ConfiguratoreDueDiligenceData] as boolean
                            }
                            onChange={(e) => updateData(item.field as any, e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.label}</div>
                          </div>
                          <Badge variant="destructive">{item.importo}</Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Riduzioni</h3>
                    <div className="space-y-3">
                      {[
                        {
                          field: 'portafoglioStandardizzato',
                          label: 'Portafoglio standardizzato (es. 50 appartamenti identici)',
                          importo: '-20% dal 6° in poi',
                          note: 'Applicabile se numero unità ≥ 6',
                        },
                        {
                          field: 'documentazioneCompleta',
                          label: 'Documentazione completa e organizzata',
                          importo: '-€800',
                        },
                        {
                          field: 'edificioRecente',
                          label: 'Edificio <5 anni con collaudi regolari',
                          importo: '-€1.000',
                        },
                      ].map((item) => (
                        <label
                          key={item.field}
                          className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-green-50"
                        >
                          <input
                            type="checkbox"
                            checked={
                              data[item.field as keyof ConfiguratoreDueDiligenceData] as boolean
                            }
                            onChange={(e) => updateData(item.field as any, e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.label}</div>
                            {item.note && (
                              <div className="text-xs text-gray-600 mt-1">{item.note}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {item.importo}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Servizi Aggiuntivi */}
            {step === 6 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Servizi Aggiuntivi</CardTitle>
                      <p className="text-sm text-gray-600">Personalizza il tuo pacchetto</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      value: 'valutazione',
                      label: 'Valutazione immobile (OMI/comparativa)',
                      prezzo: 3500,
                    },
                    { value: 'computo', label: 'Computo metrico interventi necessari', prezzo: 2500 },
                    {
                      value: 'cronoprogramma',
                      label: 'Cronoprogramma interventi 5 anni',
                      prezzo: 1800,
                    },
                    { value: 'businessplan', label: 'Business plan ristrutturazione', prezzo: 5000 },
                    { value: 'esg', label: 'Rating ESG / certificazione LEED', prezzo: 4500 },
                    { value: 'parereLegale', label: 'Parere legale conformità', prezzo: 4000 },
                    { value: 'visura', label: 'Visura camerale + PEC società', prezzo: 300 },
                    { value: 'dataroom', label: 'Data room digitale organizzata', prezzo: 1200 },
                    {
                      value: 'affiancamento',
                      label: 'Affiancamento trattativa (2 incontri)',
                      prezzo: 2000,
                    },
                    { value: 'assistenza', label: 'Assistenza post-vendita (3 mesi)', prezzo: 1500 },
                  ].map((servizio) => (
                    <label
                      key={servizio.value}
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes(servizio.value)}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', servizio.value)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{servizio.label}</div>
                      </div>
                      <Badge>+€{servizio.prezzo.toLocaleString('it-IT')}</Badge>
                    </label>
                  ))}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Deliverable base sempre inclusi:</strong> Report Due Diligence, Executive
                      Summary (2-3 pagine), Red Flag List, Stima costi interventi straordinari,
                      Presentazione PowerPoint (su richiesta).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Ubicazione */}
            {step === 7 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Ubicazione e Trasferte</CardTitle>
                      <p className="text-sm text-gray-600">Dove si trova l'immobile?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Indirizzo completo
                    </label>
                    <input
                      type="text"
                      value={data.indirizzo}
                      onChange={(e) => updateData('indirizzo', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Via/Piazza, Numero civico"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comune</label>
                      <input
                        type="text"
                        value={data.comune}
                        onChange={(e) => updateData('comune', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Napoli"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia
                      </label>
                      <input
                        type="text"
                        value={data.provincia}
                        onChange={(e) => updateData('provincia', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="NA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Regione</label>
                      <input
                        type="text"
                        value={data.regione}
                        onChange={(e) => updateData('regione', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Campania"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Regione per calcolo trasferta
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'campania', label: 'Campania', costo: '€150' },
                        {
                          value: 'confinanti',
                          label: 'Regioni confinanti (Lazio, Puglia, Calabria, Basilicata, Molise)',
                          costo: '€350',
                        },
                        { value: 'altre', label: 'Altre regioni', costo: '€700' },
                      ].map((reg) => (
                        <label
                          key={reg.value}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                        >
                          <input
                            type="radio"
                            name="regioneTrasferta"
                            value={reg.value}
                            checked={data.regioneTrasferta === reg.value}
                            onChange={(e) => updateData('regioneTrasferta', e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm">{reg.label}</span>
                          </div>
                          <Badge>{reg.costo}</Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero sopralluoghi previsti
                    </label>
                    <input
                      type="number"
                      value={data.numerosopralluoghi || ''}
                      onChange={(e) => updateData('numerosopralluoghi', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="1"
                      min="1"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      1 sopralluogo incluso nel prezzo base. Ogni sopralluogo aggiuntivo: +€800 + costo
                      trasferta
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 8: Riepilogo */}
            {step === 8 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Riepilogo e Dati Cliente</CardTitle>
                      <p className="text-sm text-gray-600">Completa i tuoi dati per ricevere il preventivo</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome e Cognome *
                      </label>
                      <input
                        type="text"
                        value={data.nomeCliente}
                        onChange={(e) => updateData('nomeCliente', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Mario Rossi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={data.emailCliente}
                        onChange={(e) => updateData('emailCliente', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="mario.rossi@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                    <input
                      type="tel"
                      value={data.telefonoCliente}
                      onChange={(e) => updateData('telefonoCliente', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="+39 333 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note e richieste speciali
                    </label>
                    <textarea
                      value={data.noteCliente}
                      onChange={(e) => updateData('noteCliente', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={4}
                      placeholder="Eventuali note, esigenze particolari, tempistiche specifiche..."
                    />
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm text-amber-800 space-y-2">
                        <p>
                          <strong>Disclaimer:</strong> Il presente preventivo è indicativo e soggetto a
                          verifica documentale preliminare.
                        </p>
                        <p>
                          Eventuali criticità emerse potrebbero richiedere approfondimenti aggiuntivi
                          quotati separatamente.
                        </p>
                        <p>
                          Le tempistiche sono subordinate alla disponibilità documentale e all'accesso
                          all'immobile.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="print:hidden flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Indietro
                </Button>
              )}
              {step < 8 && (
                <Button onClick={() => setStep(step + 1)} className="flex-1">
                  Avanti
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Preventivo column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Preventivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preventivo && (
                    <>
                      {/* Prezzo Base */}
                      <div className="pb-4 border-b">
                        <div className="text-sm text-gray-600 mb-1">Prezzo base</div>
                        <div className="text-sm text-gray-500">
                          {data.tipologiaImmobile || 'N/A'} • {data.superficieCommerciale || 0} mq
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          €{preventivo.prezzoBase.toLocaleString('it-IT')}
                        </div>
                      </div>

                      {/* Livello */}
                      <div className="pb-4 border-b">
                        <div className="text-sm text-gray-600 mb-1">
                          Livello approfondimento ({preventivo.livelloMultiplicatore}x)
                        </div>
                        <div className="text-lg font-semibold text-blue-600">
                          €{preventivo.prezzoLivello.toLocaleString('it-IT')}
                        </div>
                      </div>

                      {/* Maggiorazioni */}
                      {preventivo.maggiorazioni.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Maggiorazioni</div>
                          <div className="space-y-2">
                            {preventivo.maggiorazioni.map((magg, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 text-xs">{magg.descrizione}</span>
                                <span className="text-red-600 font-medium">
                                  +€{magg.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                              <span>Totale maggiorazioni</span>
                              <span className="text-red-600">
                                +€{preventivo.totaleMaggiorazioni.toLocaleString('it-IT')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Riduzioni */}
                      {preventivo.riduzioni.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Riduzioni</div>
                          <div className="space-y-2">
                            {preventivo.riduzioni.map((rid, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 text-xs">{rid.descrizione}</span>
                                <span className="text-green-600 font-medium">
                                  -€{rid.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                              <span>Totale riduzioni</span>
                              <span className="text-green-600">
                                -€{preventivo.totaleRiduzioni.toLocaleString('it-IT')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Servizi aggiuntivi */}
                      {preventivo.serviziAggiuntivi.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Servizi aggiuntivi
                          </div>
                          <div className="space-y-2">
                            {preventivo.serviziAggiuntivi.map((serv, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-600 text-xs">{serv.descrizione}</span>
                                <span className="font-medium">
                                  +€{serv.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-semibold text-sm pt-2 border-t">
                              <span>Totale servizi aggiuntivi</span>
                              <span>+€{preventivo.totaleServiziAggiuntivi.toLocaleString('it-IT')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trasferta */}
                      {preventivo.costoTrasferta > 0 && (
                        <div className="pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Costo trasferta</span>
                            <span className="font-medium">
                              +€{preventivo.costoTrasferta.toLocaleString('it-IT')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Sopralluoghi aggiuntivi */}
                      {preventivo.costoSopralluoghi > 0 && (
                        <div className="pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Sopralluoghi aggiuntivi</span>
                            <span className="font-medium">
                              +€{preventivo.costoSopralluoghi.toLocaleString('it-IT')}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Totale */}
                      <div className="pt-4 bg-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Totale</span>
                          <span className="text-2xl font-bold text-blue-600">
                            €{preventivo.totale.toLocaleString('it-IT')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">IVA esclusa (22%)</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="print:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invia Preventivo via Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Il preventivo sarà inviato a te e allo studio per una valutazione dettagliata.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Il tuo nome *
                </label>
                <input
                  type="text"
                  value={data.nomeCliente}
                  onChange={(e) => updateData('nomeCliente', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  La tua email *
                </label>
                <input
                  type="email"
                  value={data.emailCliente}
                  onChange={(e) => updateData('emailCliente', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="mario.rossi@example.com"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEmailModal(false)}
                  disabled={emailSending}
                >
                  Annulla
                </Button>
                <Button className="flex-1" onClick={sendEmail} disabled={emailSending}>
                  {emailSending ? 'Invio...' : 'Invia'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .container {
            max-width: 100% !important;
          }

          .grid {
            display: block !important;
          }

          .sticky {
            position: relative !important;
          }
        }
      `}</style>
    </div>
  );
}
