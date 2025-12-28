'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  FileText,
  Calculator,
  Download,
  Send,
  Trash2,
  AlertTriangle,
  Search,
  Euro,
  MapPin,
  Settings,
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-due-diligence-data';

// Interfaccia dati configuratore
interface ConfiguratoreDueDiligenceData {
  // Caratteristiche asset
  tipoOperazione: string;
  tipologiaImmobile: string;
  superficieCommerciale: number;
  numeroUnita: number;
  indirizzo: string;
  comune: string;
  provincia: string;

  // Livello e complessità
  livelloApprofondimento: string;
  urgenza: string;

  // Complessità
  portafoglioMultiAsset: boolean;
  numeroAssetAggiuntivi: number;
  edificioStorico: boolean;
  accessoDifficile: boolean;
  traduzioni: boolean;
  pareriLegale: boolean;
  documentazioneCompleta: boolean;
  edificioRecente: boolean;

  // Servizi aggiuntivi
  serviziAggiuntivi: string[];

  // Sopralluoghi
  numerosopralluoghi: number;
  costoTrasferta: number;

  // Dati cliente
  noteCliente: string;
  emailCliente: string;
  nomeCliente: string;
  telefonoCliente: string;
}

const initialData: ConfiguratoreDueDiligenceData = {
  tipoOperazione: 'compravendita',
  tipologiaImmobile: '',
  superficieCommerciale: 0,
  numeroUnita: 1,
  indirizzo: '',
  comune: '',
  provincia: '',
  livelloApprofondimento: 'livello2',
  urgenza: 'standard',
  portafoglioMultiAsset: false,
  numeroAssetAggiuntivi: 0,
  edificioStorico: false,
  accessoDifficile: false,
  traduzioni: false,
  pareriLegale: false,
  documentazioneCompleta: false,
  edificioRecente: false,
  serviziAggiuntivi: [],
  numerosopralluoghi: 1,
  costoTrasferta: 150,
  noteCliente: '',
  emailCliente: '',
  nomeCliente: '',
  telefonoCliente: '',
};

interface Preventivo {
  prezzoBase: number;
  moltiplicatoreLivello: number;
  moltiplicatoreOperazione: number;
  moltiplicatoreUrgenza: number;
  prezzoServizio: number;
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
    // Calcolo prezzo base considerando superficie totale e numero unità con incrementi decrescenti

    // Prezzi base minimi per tipologia
    const prezziBaseTipologia: Record<string, number> = {
      residenziale: 2000,
      uffici: 2500,
      commerciale: 2500,
      industriale: 3000,
      alberghiero: 3000,
      sanitario: 3000,
      mixeduse: 2800,
    };

    // Incrementi per superficie con scaglioni decrescenti (da €200/mq iniziale a €20/mq finale)
    const scaglioniSuperficie: Record<string, { min: number; max: number; euroMq: number }[]> = {
      residenziale: [
        { min: 0, max: 200, euroMq: 10 },      // Prime 200mq: €10/mq
        { min: 200, max: 500, euroMq: 7.5 },   // 200-500mq: €7.5/mq
        { min: 500, max: 1000, euroMq: 5 },    // 500-1000mq: €5/mq
        { min: 1000, max: 2000, euroMq: 3 },   // 1000-2000mq: €3/mq
        { min: 2000, max: 5000, euroMq: 2 },   // 2000-5000mq: €2/mq
        { min: 5000, max: 999999, euroMq: 1 }, // >5000mq: €1/mq
      ],
      uffici: [
        { min: 0, max: 200, euroMq: 12 },
        { min: 200, max: 500, euroMq: 9 },
        { min: 500, max: 1000, euroMq: 6 },
        { min: 1000, max: 2000, euroMq: 4 },
        { min: 2000, max: 5000, euroMq: 2.5 },
        { min: 5000, max: 999999, euroMq: 1.5 },
      ],
      commerciale: [
        { min: 0, max: 200, euroMq: 12 },
        { min: 200, max: 500, euroMq: 9 },
        { min: 500, max: 1000, euroMq: 6 },
        { min: 1000, max: 2000, euroMq: 4 },
        { min: 2000, max: 5000, euroMq: 2.5 },
        { min: 5000, max: 999999, euroMq: 1.5 },
      ],
      industriale: [
        { min: 0, max: 200, euroMq: 15 },
        { min: 200, max: 500, euroMq: 11 },
        { min: 500, max: 1000, euroMq: 8 },
        { min: 1000, max: 2000, euroMq: 5 },
        { min: 2000, max: 5000, euroMq: 3 },
        { min: 5000, max: 999999, euroMq: 2 },
      ],
      alberghiero: [
        { min: 0, max: 200, euroMq: 15 },
        { min: 200, max: 500, euroMq: 11 },
        { min: 500, max: 1000, euroMq: 8 },
        { min: 1000, max: 2000, euroMq: 5 },
        { min: 2000, max: 5000, euroMq: 3 },
        { min: 5000, max: 999999, euroMq: 2 },
      ],
      sanitario: [
        { min: 0, max: 200, euroMq: 15 },
        { min: 200, max: 500, euroMq: 11 },
        { min: 500, max: 1000, euroMq: 8 },
        { min: 1000, max: 2000, euroMq: 5 },
        { min: 2000, max: 5000, euroMq: 3 },
        { min: 5000, max: 999999, euroMq: 2 },
      ],
      mixeduse: [
        { min: 0, max: 200, euroMq: 14 },
        { min: 200, max: 500, euroMq: 10 },
        { min: 500, max: 1000, euroMq: 7 },
        { min: 1000, max: 2000, euroMq: 4.5 },
        { min: 2000, max: 5000, euroMq: 2.8 },
        { min: 5000, max: 999999, euroMq: 1.8 },
      ],
    };

    let prezzoBase = prezziBaseTipologia[data.tipologiaImmobile] || 2000;

    // Calcolo incremento per superficie con scaglioni decrescenti
    if (data.tipologiaImmobile && data.superficieCommerciale > 0) {
      const scaglioni = scaglioniSuperficie[data.tipologiaImmobile] || scaglioniSuperficie.residenziale;
      let superficieRimanente = data.superficieCommerciale;
      let incrementoSuperficie = 0;

      for (const scaglione of scaglioni) {
        if (superficieRimanente <= 0) break;

        const superficieScaglione = Math.min(
          superficieRimanente,
          scaglione.max - scaglione.min
        );

        incrementoSuperficie += superficieScaglione * scaglione.euroMq;
        superficieRimanente -= superficieScaglione;
      }

      prezzoBase += incrementoSuperficie;
    }

    // Moltiplicatore per numero unità (economia di scala: +10% per unità aggiuntiva, decrescente)
    if (data.numeroUnita > 1) {
      // Formula: 1 + (numeroUnita - 1) * 0.10
      // Es: 1 unità = 1.0x, 2 unità = 1.10x, 5 unità = 1.40x, 10 unità = 1.90x
      const moltiplicatoreUnita = 1 + (data.numeroUnita - 1) * 0.10;
      prezzoBase = Math.round(prezzoBase * moltiplicatoreUnita);
    }

    // Moltiplicatori
    const moltiplicatoriLivello: Record<string, number> = {
      livello1: 0.6,
      livello2: 1.0,
      livello3: 1.8,
    };

    const moltiplicatoriOperazione: Record<string, number> = {
      compravendita: 1.0,
      acquisizione: 1.3,
      cartolarizzazione: 1.5,
      finanziamento: 1.1,
      investimento: 1.4,
      ristrutturazione: 1.2,
    };

    const moltiplicatoriUrgenza: Record<string, number> = {
      standard: 1.0,
      prioritaria: 1.2,
      fasttrack: 1.4,
      emergency: 1.6,
    };

    const moltiplicatoreLivello = moltiplicatoriLivello[data.livelloApprofondimento] || 1.0;
    const moltiplicatoreOperazione = moltiplicatoriOperazione[data.tipoOperazione] || 1.0;
    const moltiplicatoreUrgenza = moltiplicatoriUrgenza[data.urgenza] || 1.0;

    const prezzoServizio = Math.round(
      prezzoBase * moltiplicatoreLivello * moltiplicatoreOperazione * moltiplicatoreUrgenza
    );

    // Maggiorazioni
    const maggiorazioni: { descrizione: string; importo: number }[] = [];

    // Portafoglio multi-asset
    if (data.portafoglioMultiAsset && data.numeroAssetAggiuntivi > 0) {
      const gruppi = Math.floor(data.numeroAssetAggiuntivi / 3);
      const magg = Math.round(prezzoServizio * 0.15 * gruppi);
      maggiorazioni.push({
        descrizione: `Portafoglio multi-asset (${data.numeroAssetAggiuntivi} unità aggiuntive)`,
        importo: magg,
      });
    }

    if (data.edificioStorico) {
      maggiorazioni.push({ descrizione: 'Edificio storico/vincolato', importo: 1500 });
    }

    if (data.accessoDifficile) {
      maggiorazioni.push({ descrizione: 'Accesso difficoltoso', importo: 800 });
    }

    if (data.traduzioni) {
      maggiorazioni.push({ descrizione: 'Necessità traduzioni', importo: 600 });
    }

    if (data.pareriLegale) {
      maggiorazioni.push({ descrizione: 'Parere legale associato', importo: 2000 });
    }

    const totaleMaggiorazioni = maggiorazioni.reduce((sum, m) => sum + m.importo, 0);

    // Riduzioni
    const riduzioni: { descrizione: string; importo: number }[] = [];

    if (data.documentazioneCompleta) {
      riduzioni.push({ descrizione: 'Documentazione completa e organizzata', importo: 400 });
    }

    if (data.edificioRecente) {
      riduzioni.push({ descrizione: 'Edificio <5 anni con collaudi regolari', importo: 500 });
    }

    const totaleRiduzioni = riduzioni.reduce((sum, r) => sum + r.importo, 0);

    // Servizi aggiuntivi
    const prezziServiziAggiuntivi: Record<string, { label: string; prezzo: number }> = {
      valutazione: { label: 'Valutazione immobile (OMI/comparativa)', prezzo: 1800 },
      computo: { label: 'Computo metrico interventi necessari', prezzo: 1200 },
      cronoprogramma: { label: 'Cronoprogramma interventi 5 anni', prezzo: 900 },
      businessplan: { label: 'Business plan ristrutturazione', prezzo: 2500 },
      esg: { label: 'Rating ESG / certificazione LEED', prezzo: 2200 },
      parereLegale: { label: 'Parere legale conformità', prezzo: 2000 },
      visura: { label: 'Visura camerale + PEC società', prezzo: 150 },
      dataroom: { label: 'Data room digitale organizzata', prezzo: 600 },
      affiancamento: { label: 'Affiancamento trattativa (2 incontri)', prezzo: 1000 },
      assistenza: { label: 'Assistenza post-vendita (3 mesi)', prezzo: 800 },
    };

    const serviziAggiuntivi = data.serviziAggiuntivi.map((key) => ({
      descrizione: prezziServiziAggiuntivi[key].label,
      importo: prezziServiziAggiuntivi[key].prezzo,
    }));

    const totaleServiziAggiuntivi = serviziAggiuntivi.reduce((sum, s) => sum + s.importo, 0);

    // Costo trasferta (solo se ci sono sopralluoghi)
    const costoTrasferta = data.numerosopralluoghi > 0 ? (data.costoTrasferta || 0) : 0;

    // Costo sopralluoghi aggiuntivi (solo se ci sono sopralluoghi)
    const sopralluogiAggiuntivi = Math.max(0, data.numerosopralluoghi - 1);
    const costoSopralluoghi = data.numerosopralluoghi > 0 ? sopralluogiAggiuntivi * (400 + (data.costoTrasferta || 0)) : 0;

    // Totale finale
    const totale =
      prezzoServizio +
      totaleMaggiorazioni -
      totaleRiduzioni +
      totaleServiziAggiuntivi +
      costoTrasferta +
      costoSopralluoghi;

    return {
      prezzoBase,
      moltiplicatoreLivello,
      moltiplicatoreOperazione,
      moltiplicatoreUrgenza,
      prezzoServizio,
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
        alert("Errore nell'invio del preventivo. Riprova più tardi.");
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      alert("Errore nell'invio del preventivo. Riprova più tardi.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Configuratore Due Diligence</h1>
                <p className="text-sm text-gray-600">Preventivo tecnico immobiliare</p>
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
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sezione 1: Caratteristiche Asset */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Caratteristiche Asset</CardTitle>
                    <p className="text-sm text-gray-600">Descrivi l'immobile oggetto di verifica</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo operazione - ora moltiplicatore */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo di operazione *
                  </label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      { value: 'compravendita', label: 'Compravendita', mult: '1.0x' },
                      { value: 'finanziamento', label: 'Finanziamento', mult: '1.1x' },
                      { value: 'ristrutturazione', label: 'Ristrutturazione', mult: '1.2x' },
                      { value: 'acquisizione', label: 'Acquisizione M&A', mult: '1.3x' },
                      { value: 'investimento', label: 'Fondi/Investimento', mult: '1.4x' },
                      { value: 'cartolarizzazione', label: 'Cartolarizzazione', mult: '1.5x' },
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
                        <div className="flex-1">
                          <span className="text-sm">{tipo.label}</span>
                        </div>
                        <Badge variant="outline">{tipo.mult}</Badge>
                      </label>
                    ))}
                  </div>
                </div>

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

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Superficie (mq) *
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
                      N° Unità
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
                    Ubicazione
                  </label>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={data.comune}
                      onChange={(e) => updateData('comune', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Comune"
                    />
                    <input
                      type="text"
                      value={data.provincia}
                      onChange={(e) => updateData('provincia', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Prov"
                    />
                    <input
                      type="number"
                      value={data.costoTrasferta || ''}
                      onChange={(e) => updateData('costoTrasferta', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Costo trasferta (€)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggerito: Campania €150, Confinanti €300, Altre €500
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Livello e Complessità */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">2. Livello e Complessità</CardTitle>
                    <p className="text-sm text-gray-600">Scegli l'approfondimento richiesto</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Livello di approfondimento *
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'livello1',
                        label: 'Desktop DD (0.6x)',
                        desc: 'Solo analisi documentale, no sopralluogo',
                        tempo: '5-7 gg',
                      },
                      {
                        value: 'livello2',
                        label: 'Standard DD (1.0x)',
                        desc: 'Sopralluogo + verifica tecnica completa',
                        tempo: '15-20 gg',
                      },
                      {
                        value: 'livello3',
                        label: 'Enhanced DD (1.8x)',
                        desc: 'Indagini strumentali + analisi approfondita',
                        tempo: '30-45 gg',
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
                            <div className="font-semibold text-gray-900">{liv.label}</div>
                            <p className="text-sm text-gray-600 mt-1">{liv.desc}</p>
                            <p className="text-xs text-gray-500 mt-1">⏱️ {liv.tempo}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Urgenza</label>
                  <div className="grid md:grid-cols-2 gap-2">
                    {[
                      { value: 'standard', label: 'Standard', mult: '1.0x' },
                      { value: 'prioritaria', label: 'Prioritaria', mult: '1.2x' },
                      { value: 'fasttrack', label: 'Fast-track', mult: '1.4x' },
                      { value: 'emergency', label: 'Emergency', mult: '1.6x' },
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
                        <Badge variant="outline">{urg.mult}</Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Fattori di complessità
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                      <input
                        type="checkbox"
                        checked={data.portafoglioMultiAsset}
                        onChange={(e) => updateData('portafoglioMultiAsset', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Portafoglio multi-asset</div>
                        <div className="text-xs text-gray-600">+15% ogni 3 unità oltre la prima</div>
                        {data.portafoglioMultiAsset && (
                          <input
                            type="number"
                            value={data.numeroAssetAggiuntivi || ''}
                            onChange={(e) =>
                              updateData('numeroAssetAggiuntivi', Number(e.target.value))
                            }
                            className="w-24 px-2 py-1 border rounded mt-2 text-sm"
                            placeholder="N° asset"
                            min="0"
                          />
                        )}
                      </div>
                    </label>

                    {[
                      { field: 'edificioStorico', label: 'Edificio storico/vincolato', importo: '+€1.500' },
                      { field: 'accessoDifficile', label: 'Accesso difficoltoso', importo: '+€800' },
                      { field: 'traduzioni', label: 'Necessità traduzioni', importo: '+€600' },
                      { field: 'pareriLegale', label: 'Parere legale associato', importo: '+€2.000' },
                    ].map((item) => (
                      <label
                        key={item.field}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={
                            data[item.field as keyof ConfiguratoreDueDiligenceData] as boolean
                          }
                          onChange={(e) => updateData(item.field as any, e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">{item.importo}</Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-green-900 mb-3">Riduzioni</h3>
                  <div className="space-y-2">
                    {[
                      {
                        field: 'documentazioneCompleta',
                        label: 'Documentazione completa e organizzata',
                        importo: '-€400',
                      },
                      {
                        field: 'edificioRecente',
                        label: 'Edificio <5 anni con collaudi',
                        importo: '-€500',
                      },
                    ].map((item) => (
                      <label
                        key={item.field}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50"
                      >
                        <input
                          type="checkbox"
                          checked={
                            data[item.field as keyof ConfiguratoreDueDiligenceData] as boolean
                          }
                          onChange={(e) => updateData(item.field as any, e.target.checked)}
                          className="w-5 h-5 text-green-600 rounded"
                        />
                        <div className="flex-1">
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          {item.importo}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero sopralluoghi
                  </label>
                  <input
                    type="number"
                    value={data.numerosopralluoghi || ''}
                    onChange={(e) => updateData('numerosopralluoghi', Number(e.target.value))}
                    className="w-32 px-3 py-2 border rounded-lg"
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1° sopralluogo incluso. Aggiuntivi: +€400 + trasferta
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Servizi Aggiuntivi */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">3. Servizi Aggiuntivi</CardTitle>
                    <p className="text-sm text-gray-600">Personalizza il pacchetto</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { value: 'valutazione', label: 'Valutazione immobile', prezzo: 1800 },
                    { value: 'computo', label: 'Computo metrico interventi', prezzo: 1200 },
                    { value: 'cronoprogramma', label: 'Cronoprogramma 5 anni', prezzo: 900 },
                    { value: 'businessplan', label: 'Business plan ristrutturazione', prezzo: 2500 },
                    { value: 'esg', label: 'Rating ESG/LEED', prezzo: 2200 },
                    { value: 'parereLegale', label: 'Parere legale', prezzo: 2000 },
                    { value: 'visura', label: 'Visura camerale', prezzo: 150 },
                    { value: 'dataroom', label: 'Data room digitale', prezzo: 600 },
                    { value: 'affiancamento', label: 'Affiancamento trattativa', prezzo: 1000 },
                    { value: 'assistenza', label: 'Assistenza post-vendita', prezzo: 800 },
                  ].map((servizio) => (
                    <label
                      key={servizio.value}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes(servizio.value)}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', servizio.value)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm">{servizio.label}</span>
                      </div>
                      <Badge className="text-xs">+€{servizio.prezzo}</Badge>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Riepilogo */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">4. Riepilogo e Dati Cliente</CardTitle>
                    <p className="text-sm text-gray-600">Completa i tuoi dati</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    Note e richieste
                  </label>
                  <textarea
                    value={data.noteCliente}
                    onChange={(e) => updateData('noteCliente', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Eventuali note..."
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <strong>Disclaimer:</strong> Preventivo indicativo soggetto a verifica
                      preliminare. Criticità emerse potrebbero richiedere approfondimenti aggiuntivi.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventivo column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Preventivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preventivo && (
                    <>
                      <div className="pb-4 border-b">
                        <div className="text-sm text-gray-600 mb-1">Prezzo base</div>
                        <div className="text-sm text-gray-500">
                          {data.tipologiaImmobile || 'N/A'} • {data.superficieCommerciale || 0} mq
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          €{preventivo.prezzoBase.toLocaleString('it-IT')}
                        </div>
                      </div>

                      <div className="pb-4 border-b">
                        <div className="text-sm text-gray-600 mb-2">Moltiplicatori</div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Livello DD</span>
                            <span className="font-medium">{preventivo.moltiplicatoreLivello}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operazione</span>
                            <span className="font-medium">{preventivo.moltiplicatoreOperazione}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Urgenza</span>
                            <span className="font-medium">{preventivo.moltiplicatoreUrgenza}x</span>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-slate-600 mt-2">
                          €{preventivo.prezzoServizio.toLocaleString('it-IT')}
                        </div>
                      </div>

                      {preventivo.maggiorazioni.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Maggiorazioni</div>
                          <div className="space-y-1">
                            {preventivo.maggiorazioni.map((magg, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{magg.descrizione}</span>
                                <span className="text-red-600 font-medium">
                                  +€{magg.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {preventivo.riduzioni.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Riduzioni</div>
                          <div className="space-y-1">
                            {preventivo.riduzioni.map((rid, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{rid.descrizione}</span>
                                <span className="text-green-600 font-medium">
                                  -€{rid.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {preventivo.serviziAggiuntivi.length > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">Servizi extra</div>
                          <div className="space-y-1">
                            {preventivo.serviziAggiuntivi.map((serv, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-600">{serv.descrizione}</span>
                                <span className="font-medium">
                                  +€{serv.importo.toLocaleString('it-IT')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(preventivo.costoTrasferta > 0 || preventivo.costoSopralluoghi > 0) && (
                        <div className="pb-4 border-b space-y-1">
                          {preventivo.costoTrasferta > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Trasferta</span>
                              <span className="font-medium">
                                +€{preventivo.costoTrasferta.toLocaleString('it-IT')}
                              </span>
                            </div>
                          )}
                          {preventivo.costoSopralluoghi > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Sopralluoghi extra</span>
                              <span className="font-medium">
                                +€{preventivo.costoSopralluoghi.toLocaleString('it-IT')}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-4 bg-slate-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Totale</span>
                          <span className="text-2xl font-bold text-slate-600">
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
                Il preventivo sarà inviato a te e allo studio.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  value={data.nomeCliente}
                  onChange={(e) => updateData('nomeCliente', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Mario Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
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
