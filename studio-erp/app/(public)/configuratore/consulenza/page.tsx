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
  FileText,
  Clock,
  AlertCircle,
  Download,
  Send,
  Trash2,
  ArrowLeft,
  Euro,
  MessageSquare,
  MapPin,
  CheckCircle,
  Video,
  Home,
  Car,
  ChevronRight
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-consulenza-data';

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
interface ConfiguratoreConsulenzaData {
  // Sezione 1: Ambito Consulenza
  macroAmbito: string;
  descrizioneProblema: string;

  // Sezione 2: Situazione Attuale
  documentazioneDisponibile: string[];
  tipologiaImmobile: string;
  superficieIndicativa: string;
  comune: string;
  regione: string;

  // Sezione 3: Modalità e Urgenza
  modalitaConsulenza: string;
  urgenza: string;
  serviziAggiuntivi: string[];

  // Sezione 4: Dati Cliente
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  fasciaOraria: string;
  noteAggiuntive: string;
}

const initialData: ConfiguratoreConsulenzaData = {
  macroAmbito: '',
  descrizioneProblema: '',
  documentazioneDisponibile: [],
  tipologiaImmobile: '',
  superficieIndicativa: '',
  comune: '',
  regione: '',
  modalitaConsulenza: '',
  urgenza: 'standard',
  serviziAggiuntivi: [],
  nomeCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  fasciaOraria: '',
  noteAggiuntive: '',
};

interface Preventivo {
  prezzoBase: number;
  costoTrasferta: number;
  costoServiziAggiuntivi: number;
  subtotale: number;
  moltiplicatoreUrgenza: number;
  totale: number;
  modalitaDescrizione: string;
  durataSessione: string;
  disponibilita: string;
  cosaInclude: string[];
}

export default function ConfiguratoreConsulenza() {
  const [data, setData] = useState<ConfiguratoreConsulenzaData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  const updateData = (field: keyof ConfiguratoreConsulenzaData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreConsulenzaData, value: string) => {
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

  const calcolaPreventivo = (data: ConfiguratoreConsulenzaData): Preventivo => {
    // 1. PREZZO BASE PER MODALITÀ
    let prezzoBase = 0;
    let modalitaDescrizione = '';
    let durataSessione = '';
    const cosaInclude: string[] = [];

    if (data.modalitaConsulenza === 'online') {
      prezzoBase = 180;
      modalitaDescrizione = 'Consulenza Online (Videocall)';
      durataSessione = '60 minuti';
      cosaInclude.push('Sessione videocall 60 min');
      cosaInclude.push('Analisi criticità');
      cosaInclude.push('Fattibilità tecnica');
      cosaInclude.push('Stima costi indicativa');
    } else if (data.modalitaConsulenza === 'presenza') {
      prezzoBase = 300;
      modalitaDescrizione = 'Consulenza in Presenza (presso studio)';
      durataSessione = '90 minuti';
      cosaInclude.push('Sessione in studio 90 min');
      cosaInclude.push('Analisi criticità');
      cosaInclude.push('Fattibilità tecnica');
      cosaInclude.push('Stima costi indicativa');
      cosaInclude.push('Roadmap operativa');
    } else if (data.modalitaConsulenza === 'sopralluogo') {
      prezzoBase = 450;
      modalitaDescrizione = 'Consulenza con Sopralluogo';
      durataSessione = '90 minuti + sopralluogo';
      cosaInclude.push('Sopralluogo presso immobile 90 min');
      cosaInclude.push('Analisi criticità in loco');
      cosaInclude.push('Fattibilità tecnica');
      cosaInclude.push('Stima costi dettagliata');
      cosaInclude.push('Roadmap operativa');
      cosaInclude.push('Documentazione fotografica');
    }

    // 2. TRASFERTA (solo se sopralluogo)
    let costoTrasferta = 0;
    if (data.modalitaConsulenza === 'sopralluogo' && data.regione) {
      costoTrasferta = calcolaCostoTrasferta(data.regione);
    }

    // 3. SERVIZI AGGIUNTIVI
    const prezziServiziAggiuntivi: Record<string, number> = {
      report_scritto: 100,
      preventivo_dettagliato: 150,
      ricerca_documentazione: 200,
    };

    let costoServiziAggiuntivi = 0;
    data.serviziAggiuntivi.forEach((servizio) => {
      costoServiziAggiuntivi += prezziServiziAggiuntivi[servizio] || 0;

      // Aggiungi a "cosa include"
      if (servizio === 'report_scritto') {
        cosaInclude.push('Report scritto post-consulenza');
      } else if (servizio === 'preventivo_dettagliato') {
        cosaInclude.push('Preventivo servizi dettagliato');
      } else if (servizio === 'ricerca_documentazione') {
        cosaInclude.push('Ricerca documentazione catastale/urbanistica');
      }
    });

    // 4. SUBTOTALE
    const subtotale = prezzoBase + costoTrasferta + costoServiziAggiuntivi;

    // 5. MOLTIPLICATORE URGENZA
    const moltiplicatoriUrgenza: Record<string, number> = {
      standard: 1.0,
      prioritaria: 1.3,
      urgente: 1.6,
    };
    const moltiplicatoreUrgenza = moltiplicatoriUrgenza[data.urgenza] || 1.0;

    // 6. TOTALE
    const totale = Math.round(subtotale * moltiplicatoreUrgenza);

    // 7. DISPONIBILITÀ
    let disponibilita = '';
    if (data.urgenza === 'standard') {
      disponibilita = 'Entro 15-20 giorni';
    } else if (data.urgenza === 'prioritaria') {
      disponibilita = 'Entro 7-10 giorni';
    } else {
      disponibilita = 'Entro 2-5 giorni';
    }

    return {
      prezzoBase,
      costoTrasferta,
      costoServiziAggiuntivi,
      subtotale,
      moltiplicatoreUrgenza,
      totale,
      modalitaDescrizione,
      durataSessione,
      disponibilita,
      cosaInclude,
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
    if (!data.nomeCliente || !data.emailCliente) {
      alert('Inserisci nome e email per prenotare la consulenza');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/configuratore/consulenza/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, preventivo }),
      });

      if (response.ok) {
        alert('Richiesta di consulenza inviata con successo! Ti contatteremo entro 24 ore.');
      } else {
        alert('Errore nell\'invio della richiesta');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore nell\'invio della richiesta');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
              <Link href="/bundle/BDL-CONSULENZA">
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
          <Link href="/bundle/BDL-CONSULENZA" className="hover:text-blue-600">
            Bundle Consulenza
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 print:py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3 print:text-3xl">Configuratore Consulenza Tecnica</h1>
          <p className="text-xl text-green-50 print:text-base">
            Prenota una consulenza preliminare per inquadrare il tuo progetto
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sezione 1: Ambito Consulenza */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Ambito Consulenza</CardTitle>
                    <p className="text-sm text-green-50">Di cosa hai bisogno?</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Macro-ambito *</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'ristrutturazione', label: '🏗️ Ristrutturazione/Ampliamento', desc: 'Progetto opere edilizie' },
                      { value: 'antincendio', label: '🔥 Antincendio/Sicurezza', desc: 'Prevenzione incendi, sicurezza' },
                      { value: 'efficientamento', label: '⚡ Efficientamento energetico', desc: 'Risparmio energetico, incentivi' },
                      { value: 'sismica', label: '🏛️ Vulnerabilità sismica', desc: 'Valutazione e miglioramento' },
                      { value: 'duediligence', label: '🏢 Due diligence immobiliare', desc: 'Verifica pre-acquisizione' },
                      { value: 'normativa', label: '📋 Normativa/Conformità', desc: 'Adeguamenti normativi' },
                      { value: 'generico', label: '🤔 Non so/Consulenza generica', desc: 'Inquadramento preliminare' },
                    ].map((ambito) => (
                      <label
                        key={ambito.value}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition"
                      >
                        <input
                          type="radio"
                          name="macroAmbito"
                          value={ambito.value}
                          checked={data.macroAmbito === ambito.value}
                          onChange={(e) => updateData('macroAmbito', e.target.value)}
                          className="w-5 h-5 text-green-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{ambito.label}</div>
                          <p className="text-xs text-gray-600">{ambito.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label htmlFor="descrizioneProblema">Breve descrizione problema/esigenza</Label>
                  <textarea
                    id="descrizioneProblema"
                    value={data.descrizioneProblema}
                    onChange={(e) => updateData('descrizioneProblema', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent mt-2"
                    rows={4}
                    maxLength={300}
                    placeholder="Descrivi in 2-3 righe cosa ti serve... (max 300 caratteri)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {data.descrizioneProblema.length}/300 caratteri
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Situazione Attuale */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">2. Situazione Attuale</CardTitle>
                    <p className="text-sm text-green-50">Cosa hai già?</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Hai già:</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'progetto', label: 'Progetto preliminare' },
                      { value: 'documentazione', label: 'Documentazione tecnica (APE, planimetrie, ecc.)' },
                      { value: 'preventivi', label: 'Preventivi da imprese' },
                      { value: 'nessuna', label: 'Nessuna documentazione' },
                      { value: 'urgente', label: 'Problema urgente da risolvere' },
                    ].map((doc) => (
                      <label key={doc.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.documentazioneDisponibile.includes(doc.value)}
                          onChange={() => toggleArrayValue('documentazioneDisponibile', doc.value)}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipologiaImmobile">Tipologia immobile/progetto</Label>
                      <select
                        id="tipologiaImmobile"
                        value={data.tipologiaImmobile}
                        onChange={(e) => updateData('tipologiaImmobile', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Seleziona tipologia</option>
                        <option value="residenziale">Residenziale</option>
                        <option value="commerciale">Commerciale</option>
                        <option value="industriale">Industriale</option>
                        <option value="misto">Misto</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="superficieIndicativa">Superficie indicativa</Label>
                      <select
                        id="superficieIndicativa"
                        value={data.superficieIndicativa}
                        onChange={(e) => updateData('superficieIndicativa', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Seleziona range</option>
                        <option value="0-100">0-100 mq</option>
                        <option value="101-300">101-300 mq</option>
                        <option value="301-500">301-500 mq</option>
                        <option value="500+">Oltre 500 mq</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="comune">Comune</Label>
                      <Input
                        id="comune"
                        value={data.comune}
                        onChange={(e) => updateData('comune', e.target.value)}
                        placeholder="Nome comune"
                      />
                    </div>

                    <div>
                      <Label htmlFor="regione">Regione</Label>
                      <select
                        id="regione"
                        value={data.regione}
                        onChange={(e) => updateData('regione', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Seleziona regione</option>
                        {REGIONI_ITALIA.map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Modalità e Urgenza */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">3. Modalità e Urgenza</CardTitle>
                    <p className="text-sm text-green-50">Come preferisci la consulenza?</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block font-semibold">Modalità consulenza preferita *</Label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition">
                      <input
                        type="radio"
                        name="modalitaConsulenza"
                        value="online"
                        checked={data.modalitaConsulenza === 'online'}
                        onChange={(e) => updateData('modalitaConsulenza', e.target.value)}
                        className="w-5 h-5 text-green-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Video className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Online (Videocall 60 min)</span>
                        </div>
                        <p className="text-sm text-gray-600">Consulenza da remoto tramite Google Meet o Zoom</p>
                        <Badge className="mt-2 bg-green-100 text-green-800">€180</Badge>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition">
                      <input
                        type="radio"
                        name="modalitaConsulenza"
                        value="presenza"
                        checked={data.modalitaConsulenza === 'presenza'}
                        onChange={(e) => updateData('modalitaConsulenza', e.target.value)}
                        className="w-5 h-5 text-green-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="w-5 h-5 text-green-600" />
                          <span className="font-medium">In Presenza (presso studio, 90 min)</span>
                        </div>
                        <p className="text-sm text-gray-600">Consulenza presso il nostro studio a Napoli</p>
                        <Badge className="mt-2 bg-green-100 text-green-800">€300</Badge>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition">
                      <input
                        type="radio"
                        name="modalitaConsulenza"
                        value="sopralluogo"
                        checked={data.modalitaConsulenza === 'sopralluogo'}
                        onChange={(e) => updateData('modalitaConsulenza', e.target.value)}
                        className="w-5 h-5 text-green-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Con Sopralluogo (presso immobile, 90 min)</span>
                        </div>
                        <p className="text-sm text-gray-600">Sopralluogo presso l'immobile + trasferta</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-800">€450</Badge>
                          {data.regione && (
                            <Badge variant="outline" className="text-xs">
                              + €{calcolaCostoTrasferta(data.regione)} trasferta
                            </Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold">Urgenza *</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'standard', label: 'Standard (15-20 gg)', mult: '1.0x' },
                      { value: 'prioritaria', label: 'Prioritaria (7-10 gg)', mult: '1.3x' },
                      { value: 'urgente', label: 'Urgente (2-5 gg)', mult: '1.6x' },
                    ].map((urg) => (
                      <label
                        key={urg.value}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50"
                      >
                        <input
                          type="radio"
                          name="urgenza"
                          value={urg.value}
                          checked={data.urgenza === urg.value}
                          onChange={(e) => updateData('urgenza', e.target.value)}
                          className="w-4 h-4 text-green-600"
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
                  <Label className="mb-3 block font-semibold">Servizi Aggiuntivi (opzionali)</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('report_scritto')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'report_scritto')}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="flex-1 text-sm font-medium">Report scritto post-consulenza</span>
                      <span className="text-sm text-gray-600">+€100</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('preventivo_dettagliato')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'preventivo_dettagliato')}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="flex-1 text-sm font-medium">Preventivo dettagliato servizi</span>
                      <span className="text-sm text-gray-600">+€150</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50">
                      <input
                        type="checkbox"
                        checked={data.serviziAggiuntivi.includes('ricerca_documentazione')}
                        onChange={() => toggleArrayValue('serviziAggiuntivi', 'ricerca_documentazione')}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="flex-1 text-sm font-medium">Ricerca documentazione catastale/urbanistica</span>
                      <span className="text-sm text-gray-600">+€200</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Dati Cliente */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">4. Dati Cliente e Prenotazione</CardTitle>
                    <p className="text-sm text-green-50">I tuoi dati per la prenotazione</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
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
                    <Label htmlFor="telefonoCliente">Telefono *</Label>
                    <Input
                      id="telefonoCliente"
                      type="tel"
                      value={data.telefonoCliente}
                      onChange={(e) => updateData('telefonoCliente', e.target.value)}
                      placeholder="+39 333 1234567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fasciaOraria">Fascia oraria preferita</Label>
                  <select
                    id="fasciaOraria"
                    value={data.fasciaOraria}
                    onChange={(e) => updateData('fasciaOraria', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona fascia</option>
                    <option value="mattina">Mattina (9:00-13:00)</option>
                    <option value="pomeriggio">Pomeriggio (14:00-18:00)</option>
                    <option value="indifferente">Indifferente</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="noteAggiuntive">Note aggiuntive</Label>
                  <textarea
                    id="noteAggiuntive"
                    value={data.noteAggiuntive}
                    onChange={(e) => updateData('noteAggiuntive', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Eventuali note o richieste particolari..."
                  />
                </div>

                {/* Banner Garanzia */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-1">
                        🔒 Prenota senza rischi
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        Se non sei soddisfatto della consulenza, puoi richiedere un rimborso entro 7 giorni.
                        Valutiamo caso per caso con massima trasparenza.
                      </p>
                      <Link
                        href="/legal/garanzia-consulenza"
                        className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                      >
                        Scopri i dettagli della garanzia →
                      </Link>
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
                    <Button
                      onClick={sendEmail}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={emailSending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {emailSending ? 'Invio...' : 'Prenota Consulenza'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventivo column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-green-500">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Preventivo Consulenza
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preventivo && preventivo.prezzoBase > 0 ? (
                    <>
                      {/* Servizio base */}
                      <div className="pb-4 border-b">
                        <div className="text-sm font-medium text-gray-700 mb-3">SERVIZIO BASE</div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">{preventivo.modalitaDescrizione}</span>
                          <span className="font-medium">€{preventivo.prezzoBase.toLocaleString('it-IT')}</span>
                        </div>

                        {preventivo.costoTrasferta > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Trasferta ({data.regione})</span>
                            <span className="font-medium">€{preventivo.costoTrasferta.toLocaleString('it-IT')}</span>
                          </div>
                        )}
                      </div>

                      {/* Servizi aggiuntivi */}
                      {preventivo.costoServiziAggiuntivi > 0 && (
                        <div className="pb-4 border-b">
                          <div className="text-sm font-medium text-gray-700 mb-2">SERVIZI AGGIUNTIVI</div>
                          {data.serviziAggiuntivi.includes('report_scritto') && (
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Report scritto</span>
                              <span className="font-medium">€100</span>
                            </div>
                          )}
                          {data.serviziAggiuntivi.includes('preventivo_dettagliato') && (
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Preventivo dettagliato</span>
                              <span className="font-medium">€150</span>
                            </div>
                          )}
                          {data.serviziAggiuntivi.includes('ricerca_documentazione') && (
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Ricerca documentazione</span>
                              <span className="font-medium">€200</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Subtotale */}
                      <div className="pb-4 border-b">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">Subtotale</span>
                          <span className="font-semibold">€{preventivo.subtotale.toLocaleString('it-IT')}</span>
                        </div>
                      </div>

                      {/* Moltiplicatore urgenza */}
                      {preventivo.moltiplicatoreUrgenza > 1.0 && (
                        <div className="pb-4 border-b bg-green-50 -mx-6 px-6 py-3">
                          <div className="text-sm font-medium text-green-800 mb-2">MOLTIPLICATORI</div>
                          <div className="flex justify-between text-sm text-green-700">
                            <span>Urgenza</span>
                            <span className="font-medium">{preventivo.moltiplicatoreUrgenza.toFixed(1)}x</span>
                          </div>
                        </div>
                      )}

                      {/* Totale */}
                      <div className="pt-4 border-t-2 border-green-500">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-gray-900">TOTALE</span>
                          <span className="text-2xl font-bold text-green-600">
                            €{preventivo.totale.toLocaleString('it-IT')}
                          </span>
                        </div>
                      </div>

                      {/* Cosa include */}
                      <div className="pt-4 border-t bg-gradient-to-br from-green-50 to-emerald-50 -mx-6 px-6 py-4">
                        <div className="text-sm font-bold text-green-900 mb-3">📋 COSA INCLUDE</div>
                        <div className="space-y-1">
                          {preventivo.cosaInclude.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="text-sm font-bold text-green-900 mb-2">⏰ DISPONIBILITÀ</div>
                          <div className="text-sm text-gray-700">{preventivo.disponibilita}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="text-sm font-bold text-green-900 mb-2">🔒 GARANZIA</div>
                          <div className="text-sm text-gray-700 mb-2">Soddisfatti o Rimborsati</div>
                          <Link
                            href="/legal/garanzia-consulenza"
                            className="text-xs text-green-600 hover:text-green-700 underline flex items-center gap-1"
                          >
                            Leggi dettagli garanzia →
                          </Link>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Consulenza preliminare</p>
                            <p>
                              Questa consulenza serve per inquadrare il tuo progetto.
                              Il preventivo per i servizi completi verrà fornito a seguito della consulenza.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 print:hidden">
                        <Button onClick={sendEmail} className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={emailSending}>
                          <Send className="w-5 h-5 mr-2" />
                          {emailSending ? 'Invio...' : 'Prenota Consulenza'}
                        </Button>
                        <Button onClick={downloadPDF} variant="outline" className="w-full" size="lg">
                          <Download className="w-5 h-5 mr-2" />
                          Scarica PDF
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Seleziona una modalità di consulenza per vedere il preventivo</p>
                    </div>
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
