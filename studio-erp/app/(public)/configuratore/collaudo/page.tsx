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
  FileText,
  Clock,
  AlertCircle,
  Calculator,
  Download,
  Send,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Euro,
  ChevronRight,
  Lock
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-collaudo-data';

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
interface ConfiguratoreCollaudoData {
  // Sezione 1: Localizzazione
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  tipologiaIntervento: string;
  destinazioneUso: string;

  // Sezione 2: Caratteristiche strutturali
  superficieTotale: number;
  numeroPiani: number;
  altezzaEdificio: number;
  tipoStruttura: string;
  annoCostruzione: string;
  normativaRiferimento: string;
  zonaSismica: string;

  // Sezione 3: Tipo collaudo
  servizioCollaudo: string;

  // Sezione 4: Documentazione
  documentazioneDisponibile: string[];

  // Sezione 5: Urgenza
  urgenza: string;

  // Dati cliente
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  noteCliente: string;
}

const initialData: ConfiguratoreCollaudoData = {
  indirizzo: '',
  cap: '',
  comune: '',
  provincia: '',
  regione: '',
  tipologiaIntervento: '',
  destinazioneUso: '',
  superficieTotale: 0,
  numeroPiani: 1,
  altezzaEdificio: 0,
  tipoStruttura: '',
  annoCostruzione: '',
  normativaRiferimento: '',
  zonaSismica: '',
  servizioCollaudo: '',
  documentazioneDisponibile: [],
  urgenza: 'standard',
  nomeCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  noteCliente: '',
};

interface Preventivo {
  prezzoBase: number;
  moltiplicatoreStruttura: number;
  moltiplicatoreComplessita: number;
  moltiplicatoreUrgenza: number;
  costoTrasferta: number;
  prezzoServizio: number;
  totale: number;
}

export default function ConfiguratoreCollaudo() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [data, setData] = useState<ConfiguratoreCollaudoData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  const updateData = (field: keyof ConfiguratoreCollaudoData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreCollaudoData, value: string) => {
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

  const calcolaPreventivo = (data: ConfiguratoreCollaudoData): Preventivo => {
    // Prezzi base fissi per destinazione d'uso
    const prezziBaseTipologia: Record<string, number> = {
      residenziale: 1500,
      commerciale: 2500,
      industriale: 2000,
      pubblico: 2000,
      agricolo: 1500,
      misto: 2000,
    };

    // Prezzo base fisso per tipologia
    let prezzoBase = prezziBaseTipologia[data.destinazioneUso] || 0;

    // Prezzi base per superficie con scaglioni decrescenti
    const scaglioniSuperficie = [
      { min: 0, max: 200, euroMq: 8 },
      { min: 200, max: 500, euroMq: 6 },
      { min: 500, max: 1000, euroMq: 4.5 },
      { min: 1000, max: 2000, euroMq: 3 },
      { min: 2000, max: 5000, euroMq: 2 },
      { min: 5000, max: 999999, euroMq: 1.5 },
    ];

    // Aggiungi costo superficie al prezzo base
    if (data.superficieTotale > 0) {
      let superficieRimanente = data.superficieTotale;
      for (const scaglione of scaglioniSuperficie) {
        if (superficieRimanente <= 0) break;
        const superficieScaglione = Math.min(
          superficieRimanente,
          scaglione.max - scaglione.min
        );
        prezzoBase += superficieScaglione * scaglione.euroMq;
        superficieRimanente -= superficieScaglione;
      }
    }

    // Moltiplicatore tipo struttura
    const moltiplicatoriStruttura: Record<string, number> = {
      ca: 1.0,
      acciaio: 1.2,
      muratura: 0.9,
      legno: 1.3,
      mista: 1.1,
    };
    const moltiplicatoreStruttura = moltiplicatoriStruttura[data.tipoStruttura] || 1.0;

    // Moltiplicatore complessità (numero piani)
    let moltiplicatoreComplessita = 1.0;
    if (data.numeroPiani <= 2) {
      moltiplicatoreComplessita = 1.0;
    } else if (data.numeroPiani <= 5) {
      moltiplicatoreComplessita = 1.2;
    } else {
      moltiplicatoreComplessita = 1.5;
    }

    // Moltiplicatore tipo servizio
    const moltiplicatoriServizio: Record<string, number> = {
      completo: 1.0,
      finale: 0.6,
      verifica: 1.2,
      parziale: 0.7,
    };
    const moltiplicatoreServizio = moltiplicatoriServizio[data.servizioCollaudo] || 1.0;

    // Moltiplicatore urgenza
    const moltiplicatoriUrgenza: Record<string, number> = {
      standard: 1.0,
      prioritaria: 1.2,
      urgente: 1.4,
      emergenza: 1.8,
    };
    const moltiplicatoreUrgenza = moltiplicatoriUrgenza[data.urgenza] || 1.0;

    // Calcolo prezzo servizio
    const prezzoServizio = Math.round(
      prezzoBase *
        moltiplicatoreStruttura *
        moltiplicatoreComplessita *
        moltiplicatoreServizio *
        moltiplicatoreUrgenza
    );

    // Costo trasferta
    const costoTrasferta = data.regione ? calcolaCostoTrasferta(data.regione) : 0;

    // Totale finale
    const totale = prezzoServizio + costoTrasferta;

    return {
      prezzoBase,
      moltiplicatoreStruttura,
      moltiplicatoreComplessita,
      moltiplicatoreUrgenza,
      costoTrasferta,
      prezzoServizio,
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
    if (!data.nomeCliente || !data.emailCliente) {
      alert('Inserisci nome e email per inviare il preventivo');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/configuratore/collaudo/send-email', {
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
              <Link href="/bundle/BDL-COLLAUDO">
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
          <Link href="/bundle/BDL-COLLAUDO" className="hover:text-blue-600">
            Bundle Collaudo
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-8 print:py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-3 print:text-3xl">Configuratore Collaudo Statico</h1>
          <p className="text-xl text-green-50 print:text-base">
            Ottieni un preventivo personalizzato per il collaudo della tua struttura
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sezione 1: Localizzazione */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Localizzazione e Tipo Struttura</CardTitle>
                    <p className="text-sm text-green-50">Dove si trova l'edificio da collaudare</p>
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                <div>
                  <Label htmlFor="tipologiaIntervento">Tipologia intervento *</Label>
                  <select
                    id="tipologiaIntervento"
                    value={data.tipologiaIntervento}
                    onChange={(e) => updateData('tipologiaIntervento', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipologia</option>
                    <option value="nuova">Nuova costruzione</option>
                    <option value="ristrutturazione">Ristrutturazione</option>
                    <option value="consolidamento">Consolidamento/Rinforzo</option>
                    <option value="cambio_uso">Cambio destinazione d'uso</option>
                    <option value="sopraelevazione">Sopraelevazione</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="destinazioneUso">Destinazione d'uso *</Label>
                  <select
                    id="destinazioneUso"
                    value={data.destinazioneUso}
                    onChange={(e) => updateData('destinazioneUso', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona destinazione</option>
                    <option value="residenziale">Residenziale (base €1.500)</option>
                    <option value="commerciale">Commerciale (base €2.500)</option>
                    <option value="industriale">Industriale (base €2.000)</option>
                    <option value="pubblico">Uso pubblico (base €2.000)</option>
                    <option value="agricolo">Agricolo (base €1.500)</option>
                    <option value="misto">Misto (base €2.000)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 2: Caratteristiche strutturali */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">2. Caratteristiche Strutturali</CardTitle>
                    <p className="text-sm text-green-50">Dimensioni e tipologia della struttura</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroPiani">Numero piani (totali) *</Label>
                    <Input
                      id="numeroPiani"
                      type="number"
                      value={data.numeroPiani || ''}
                      onChange={(e) => updateData('numeroPiani', Number(e.target.value))}
                      placeholder="1"
                      min="1"
                    />
                    {data.numeroPiani > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {data.numeroPiani <= 2 && '📊 Complessità: Semplice (1.0x)'}
                        {data.numeroPiani > 2 && data.numeroPiani <= 5 && '📊 Complessità: Media (1.2x)'}
                        {data.numeroPiani > 5 && '📊 Complessità: Alta (1.5x)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="altezzaEdificio">Altezza edificio (m)</Label>
                    <Input
                      id="altezzaEdificio"
                      type="number"
                      value={data.altezzaEdificio || ''}
                      onChange={(e) => updateData('altezzaEdificio', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tipoStruttura">Tipo struttura portante *</Label>
                  <select
                    id="tipoStruttura"
                    value={data.tipoStruttura}
                    onChange={(e) => updateData('tipoStruttura', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona tipo</option>
                    <option value="ca">Cemento armato (1.0x)</option>
                    <option value="acciaio">Acciaio (1.2x)</option>
                    <option value="muratura">Muratura portante (0.9x)</option>
                    <option value="legno">Legno (X-Lam, etc.) (1.3x)</option>
                    <option value="mista">Mista (1.1x)</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annoCostruzione">Anno costruzione/progetto</Label>
                    <Input
                      id="annoCostruzione"
                      value={data.annoCostruzione}
                      onChange={(e) => updateData('annoCostruzione', e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="normativaRiferimento">Normativa di riferimento</Label>
                    <select
                      id="normativaRiferimento"
                      value={data.normativaRiferimento}
                      onChange={(e) => updateData('normativaRiferimento', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Seleziona normativa</option>
                      <option value="ntc2018">NTC 2018</option>
                      <option value="ntc2008">NTC 2008</option>
                      <option value="precedenti">Precedenti normative</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="zonaSismica">Zona sismica</Label>
                  <select
                    id="zonaSismica"
                    value={data.zonaSismica}
                    onChange={(e) => updateData('zonaSismica', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Seleziona zona</option>
                    <option value="1">Zona 1 (sismicità alta)</option>
                    <option value="2">Zona 2 (sismicità media)</option>
                    <option value="3">Zona 3 (sismicità bassa)</option>
                    <option value="4">Zona 4 (sismicità molto bassa)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Tipo collaudo */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">3. Tipo Collaudo</CardTitle>
                    <p className="text-sm text-green-50">Servizio richiesto</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block">Servizio principale *</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'completo', label: 'Collaudo statico completo', mult: '1.0x' },
                      { value: 'finale', label: 'Collaudo finale (solo certificato)', mult: '0.6x' },
                      { value: 'verifica', label: 'Verifica strutturale esistente', mult: '1.2x' },
                      { value: 'parziale', label: 'Collaudo parziale (solo alcune opere)', mult: '0.7x' },
                    ].map((servizio) => (
                      <label
                        key={servizio.value}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50"
                      >
                        <input
                          type="radio"
                          name="servizioCollaudo"
                          value={servizio.value}
                          checked={data.servizioCollaudo === servizio.value}
                          onChange={(e) => updateData('servizioCollaudo', e.target.value)}
                          className="w-4 h-4 text-green-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{servizio.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {servizio.mult}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Documentazione */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">4. Documentazione</CardTitle>
                    <p className="text-sm text-green-50">Documenti disponibili</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block">Documentazione disponibile</Label>
                  <div className="space-y-2">
                    {[
                      'Progetto strutturale completo',
                      'Relazione di calcolo',
                      'Disegni esecutivi',
                      'Certificati materiali',
                      'Documentazione incompleta/assente',
                    ].map((doc) => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.documentazioneDisponibile.includes(doc)}
                          onChange={() => toggleArrayValue('documentazioneDisponibile', doc)}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="text-sm">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 5: Urgenza */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">5. Urgenza e Dati Cliente</CardTitle>
                    <p className="text-sm text-green-50">Tempistiche richieste</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="mb-3 block">Tempistica richiesta *</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'standard', label: 'Standard (30-45 gg)', mult: '1.0x' },
                      { value: 'prioritaria', label: 'Prioritaria (15-30 gg)', mult: '1.2x' },
                      { value: 'urgente', label: 'Urgente (7-15 gg)', mult: '1.4x' },
                      { value: 'emergenza', label: 'Emergenza (<7 gg)', mult: '1.8x' },
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      Cancella dati
                    </Button>
                    <Button onClick={downloadPDF} variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Scarica PDF
                    </Button>
                    <Button onClick={sendEmail} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Send className="w-4 h-4 mr-2" />
                      Invia preventivo
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
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Preventivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <Lock className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Prezzi Riservati
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Effettua l&apos;accesso per visualizzare il preventivo personalizzato
                        </p>
                      </div>
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700" size="lg">
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
                          <div className="pb-4 border-b">
                            <div className="text-sm text-gray-600 mb-1">Prezzo base</div>
                            <div className="text-sm text-gray-500">
                              {data.superficieTotale || 0} mq • {data.tipoStruttura || 'N/A'}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              €{preventivo.prezzoBase.toLocaleString('it-IT')}
                            </div>
                          </div>

                          <div className="pb-4 border-b">
                            <div className="text-sm text-gray-600 mb-2">Moltiplicatori</div>
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex justify-between">
                                <span>Tipo struttura</span>
                                <span className="font-medium">{preventivo.moltiplicatoreStruttura}x</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Complessità</span>
                                <span className="font-medium">{preventivo.moltiplicatoreComplessita}x</span>
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

                          {preventivo.costoTrasferta > 0 && (
                            <div className="pb-4 border-b">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Trasferta ({data.regione})</span>
                                <span className="font-medium text-gray-900">
                                  +€{preventivo.costoTrasferta.toLocaleString('it-IT')}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="pt-4 border-t-2 border-green-500">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Totale</span>
                              <span className="text-2xl font-bold text-green-600">
                                €{preventivo.totale.toLocaleString('it-IT')}
                              </span>
                            </div>
                          </div>

                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex gap-2">
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                              <div className="text-sm text-amber-800">
                                <p className="font-medium mb-1">Preventivo indicativo</p>
                                <p>
                                  Il preventivo finale sarà confermato dopo un sopralluogo tecnico e verifica
                                  della documentazione.
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
