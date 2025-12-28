'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  MapPin,
  Building2,
  Zap,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Download,
  Send,
  Trash2,
  Save
} from 'lucide-react';

// Costanti per regioni e costi trasferta
const REGIONI_ITALIA = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

const REGIONI_CONFINANTI = ['Lazio', 'Puglia', 'Calabria', 'Basilicata', 'Molise'];

const calcolaCostoTrasferta = (regione: string): number => {
  if (regione === 'Campania') return 120;
  if (REGIONI_CONFINANTI.includes(regione)) return 300;
  return 600;
};

// Categorie DM 151/2011
const CATEGORIE_ATTIVITA = [
  { value: '65', label: 'Cat. 65 - Locali spettacolo e intrattenimento', complessita: 1.2 },
  { value: '66', label: 'Cat. 66 - Pubblici esercizi (bar, ristoranti)', complessita: 1.0 },
  { value: '67', label: 'Cat. 67 - Alberghi, pensioni, residence', complessita: 1.3 },
  { value: '68', label: 'Cat. 68 - Scuole, asili, università', complessita: 1.15 },
  { value: '69', label: 'Cat. 69 - Ospedali, RSA, case di cura', complessita: 1.4 },
  { value: '70', label: 'Cat. 70 - Uffici con >300 persone', complessita: 1.1 },
  { value: '71', label: 'Cat. 71 - Locali commerciali/esposizioni', complessita: 1.0 },
  { value: '72', label: 'Cat. 72 - Autorimesse/parcheggi', complessita: 1.2 },
  { value: '73', label: 'Cat. 73 - Depositi/archivi', complessita: 1.1 },
  { value: '74', label: 'Cat. 74 - Impianti sportivi', complessita: 1.15 },
  { value: '75', label: 'Cat. 75 - Musei, biblioteche, archivi', complessita: 1.2 },
  { value: 'altro', label: 'Altra attività (specificare)', complessita: 1.0 },
];

// Interfaccia dati configuratore
interface ConfiguratoreData {
  // Localizzazione
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  categoriaAttivita: string;
  descrizioneAttivita: string;

  // Dimensionamento
  superficieLorda: number;
  superficieNetta: number;
  affollamentoMax: number;
  tipoUtenza: string[];
  numeroPiani: number;
  altezzaEdificio: number;
  pianoUbicazione: string;
  strutturaPortante: string;
  annoCostruzione: string;
  compartimentazioneEsistente: string[];

  // Impianti e certificazioni
  impiantiEsistenti: string[];
  certificazioniEsistenti: string[];

  // Servizi richiesti
  servizioprincipale: string;
  serviziAggiuntivi: string[];

  // Urgenza e criticità
  situazioneAttuale: string;
  vincoliTemporali: string;
  criticitaNote: string[];
  depositiSpeciali: string[];
}

const STORAGE_KEY = 'configuratore_antincendio_data';

export default function ConfiguratoreAntincendio() {
  const [data, setData] = useState<ConfiguratoreData>({
    indirizzo: '',
    cap: '',
    comune: '',
    provincia: '',
    regione: '',
    categoriaAttivita: '',
    descrizioneAttivita: '',
    superficieLorda: 0,
    superficieNetta: 0,
    affollamentoMax: 0,
    tipoUtenza: [],
    numeroPiani: 1,
    altezzaEdificio: 0,
    pianoUbicazione: 'terra',
    strutturaPortante: '',
    annoCostruzione: '',
    compartimentazioneEsistente: [],
    impiantiEsistenti: [],
    certificazioniEsistenti: [],
    servizioprincipale: '',
    serviziAggiuntivi: [],
    situazioneAttuale: '',
    vincoliTemporali: 'normale',
    criticitaNote: [],
    depositiSpeciali: [],
  });

  const [preventivo, setPreventivo] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = (field: keyof ConfiguratoreData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreData, value: string) => {
    setData((prev) => {
      const currentArray = prev[field] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  // Carica dati da localStorage all'avvio
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

  // Salva dati in localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Ricalcola preventivo ogni volta che cambiano i dati
  useEffect(() => {
    const calcolo = calcolaPreventivo(data);
    setPreventivo(calcolo);
  }, [data]);

  const clearData = () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleInviaRichiesta = async () => {
    if (!emailData.nome || !emailData.cognome || !emailData.email) {
      alert('Compila tutti i campi obbligatori (nome, cognome, email)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/preventivo-antincendio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configurazione: data,
          preventivo: preventivo,
          cliente: emailData,
        }),
      });

      if (response.ok) {
        alert('Richiesta inviata con successo! Ti contatteremo presto.');
        setShowEmailModal(false);
        setEmailData({ nome: '', cognome: '', email: '', telefono: '', note: '' });
      } else {
        alert('Errore durante l\'invio. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Errore invio:', error);
      alert('Errore durante l\'invio. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
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
                  Studio Ing. Domenico Romano
                </h1>
                <p className="text-xs text-gray-600">Ingegneria e architettura</p>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button onClick={clearData} variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Cancella
              </Button>
              <Link href="/bundle/BDL-ANTINCENDIO">
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
          <Link href="/bundle/BDL-ANTINCENDIO" className="hover:text-blue-600">
            Bundle Antincendio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <section className="container mx-auto px-4 py-8 print:py-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-5xl mb-6 mx-auto print:w-16 print:h-16">
            🔥
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 print:text-3xl">
            Configuratore Preventivo Antincendio
          </h1>
          <p className="text-xl text-gray-600 mb-6 print:text-base">
            Personalizza il tuo servizio e visualizza il preventivo in tempo reale
          </p>
          <Badge variant="secondary" className="text-sm print:hidden">
            Preventivo indicativo non vincolante • Dati salvati automaticamente
          </Badge>
        </div>
      </section>

      {/* Main Content - 2 Column Layout */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-2 space-y-6">

              {/* Sezione 1: Localizzazione */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Localizzazione e Tipo Attività</CardTitle>
                      <p className="text-sm text-gray-600">Dove si trova l'attività?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="indirizzo">Indirizzo completo *</Label>
                      <Input
                        id="indirizzo"
                        value={data.indirizzo}
                        onChange={(e) => updateData('indirizzo', e.target.value)}
                        placeholder="Via, numero civico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cap">CAP *</Label>
                      <Input
                        id="cap"
                        value={data.cap}
                        onChange={(e) => updateData('cap', e.target.value)}
                        placeholder="80100"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comune">Comune *</Label>
                      <Input
                        id="comune"
                        value={data.comune}
                        onChange={(e) => updateData('comune', e.target.value)}
                        placeholder="Napoli"
                      />
                    </div>
                    <div>
                      <Label htmlFor="provincia">Provincia *</Label>
                      <Input
                        id="provincia"
                        value={data.provincia}
                        onChange={(e) => updateData('provincia', e.target.value)}
                        placeholder="NA"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="regione">Regione *</Label>
                      <select
                        id="regione"
                        value={data.regione}
                        onChange={(e) => updateData('regione', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Seleziona regione</option>
                        {REGIONI_ITALIA.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label htmlFor="categoria">Categoria Attività secondo DM 151/2011 *</Label>
                    <select
                      id="categoria"
                      value={data.categoriaAttivita}
                      onChange={(e) => updateData('categoriaAttivita', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleziona categoria</option>
                      {CATEGORIE_ATTIVITA.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {data.categoriaAttivita === 'altro' && (
                    <div>
                      <Label htmlFor="descrizioneAttivita">Descrizione dettagliata attività *</Label>
                      <textarea
                        id="descrizioneAttivita"
                        value={data.descrizioneAttivita}
                        onChange={(e) => updateData('descrizioneAttivita', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                        placeholder="Descrivi nel dettaglio l'attività..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sezione 2: Dimensionamento */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Dimensionamento Attività</CardTitle>
                      <p className="text-sm text-gray-600">Caratteristiche dimensionali e strutturali</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superficieLorda">Superficie lorda (mq) *</Label>
                      <Input
                        id="superficieLorda"
                        type="number"
                        value={data.superficieLorda || ''}
                        onChange={(e) => updateData('superficieLorda', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="superficieNetta">Superficie netta attività (mq) *</Label>
                      <Input
                        id="superficieNetta"
                        type="number"
                        value={data.superficieNetta || ''}
                        onChange={(e) => updateData('superficieNetta', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="affollamentoMax">Affollamento massimo previsto (persone) *</Label>
                    <Input
                      id="affollamentoMax"
                      type="number"
                      value={data.affollamentoMax || ''}
                      onChange={(e) => updateData('affollamentoMax', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    {data.affollamentoMax > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {data.affollamentoMax < 100 && '📊 Categoria A - Rischio basso'}
                        {data.affollamentoMax >= 100 && data.affollamentoMax < 300 && '📊 Categoria B - Rischio medio (+15%)'}
                        {data.affollamentoMax >= 300 && '📊 Categoria C - Rischio alto (+35%)'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="mb-3 block">Tipologia utenza</Label>
                    <div className="space-y-2">
                      {['autonoma', 'disabilita', 'nonAutonomi'].map((tipo) => (
                        <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.tipoUtenza.includes(tipo)}
                            onChange={() => toggleArrayValue('tipoUtenza', tipo)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">
                            {tipo === 'autonoma' && 'Prevalentemente autonoma'}
                            {tipo === 'disabilita' && 'Presenza disabilità motorie/sensoriali'}
                            {tipo === 'nonAutonomi' && 'Utenti non autonomi (bambini, anziani, degenti)'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numeroPiani">Numero piani edificio *</Label>
                      <select
                        id="numeroPiani"
                        value={data.numeroPiani}
                        onChange={(e) => updateData('numeroPiani', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="1">1 piano</option>
                        <option value="2">2 piani</option>
                        <option value="3">3 piani</option>
                        <option value="4">4 piani</option>
                        <option value="5">5 piani</option>
                        <option value="6">Più di 5 piani</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="altezzaEdificio">Altezza antincendio (m) *</Label>
                      <Input
                        id="altezzaEdificio"
                        type="number"
                        value={data.altezzaEdificio || ''}
                        onChange={(e) => updateData('altezzaEdificio', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pianoUbicazione">Piano ubicazione attività *</Label>
                    <select
                      id="pianoUbicazione"
                      value={data.pianoUbicazione}
                      onChange={(e) => updateData('pianoUbicazione', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="terra">Piano terra</option>
                      <option value="interrato">Piano interrato/seminterrato</option>
                      <option value="superiore">Piani superiori</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="strutturaPortante">Struttura portante *</Label>
                      <select
                        id="strutturaPortante"
                        value={data.strutturaPortante}
                        onChange={(e) => updateData('strutturaPortante', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Seleziona</option>
                        <option value="ca">Calcestruzzo armato</option>
                        <option value="acciaio">Acciaio</option>
                        <option value="muratura">Muratura</option>
                        <option value="legno">Legno</option>
                        <option value="mista">Mista</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="annoCostruzione">Anno costruzione *</Label>
                      <select
                        id="annoCostruzione"
                        value={data.annoCostruzione}
                        onChange={(e) => updateData('annoCostruzione', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Seleziona</option>
                        <option value="pre1980">Prima del 1980</option>
                        <option value="1980-2000">1980-2000</option>
                        <option value="2001-2010">2001-2010</option>
                        <option value="post2010">Dopo 2010</option>
                        <option value="nuova">Nuova costruzione</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Compartimentazione esistente</Label>
                    <div className="space-y-2">
                      {['compartimentiREI', 'porteREI', 'nessuna'].map((comp) => (
                        <label key={comp} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.compartimentazioneEsistente.includes(comp)}
                            onChange={() => toggleArrayValue('compartimentazioneEsistente', comp)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">
                            {comp === 'compartimentiREI' && 'Presenza compartimenti REI'}
                            {comp === 'porteREI' && 'Porte REI esistenti'}
                            {comp === 'nessuna' && 'Nessuna compartimentazione'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sezione 3: Impianti e Certificazioni */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Impianti e Certificazioni</CardTitle>
                      <p className="text-sm text-gray-600">Cosa è presente nell'attività?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">Impianti antincendio esistenti</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { value: 'rilevazione', label: 'Impianto rilevazione incendi' },
                        { value: 'centrale', label: 'Centrale antincendio' },
                        { value: 'estintori', label: 'Estintori portatili' },
                        { value: 'idranti', label: 'Rete idranti (UNI 45/70)' },
                        { value: 'sprinkler', label: 'Impianto sprinkler automatico' },
                        { value: 'gasInerte', label: 'Impianto gas inerte (FM200, Novec)' },
                        { value: 'efc', label: 'Evacuatori fumo e calore (EFC)' },
                        { value: 'illuminazione', label: 'Illuminazione di emergenza' },
                        { value: 'segnaletica', label: 'Segnaletica di sicurezza' },
                        { value: 'porteREI', label: 'Porte REI con maniglione' },
                        { value: 'nessuno', label: 'Nessun impianto esistente' },
                      ].map((imp) => (
                        <label key={imp.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.impiantiEsistenti.includes(imp.value)}
                            onChange={() => toggleArrayValue('impiantiEsistenti', imp.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{imp.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">Certificazioni e documentazione esistente</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'cpi', label: 'CPI (Certificato Prevenzione Incendi) valido' },
                        { value: 'scia', label: 'SCIA antincendio presentata' },
                        { value: 'progetto', label: 'Progetto antincendio approvato VVF' },
                        { value: 'parere', label: 'Parere di conformità VVF' },
                        { value: 'nulla', label: 'Nessuna documentazione' },
                      ].map((cert) => (
                        <label key={cert.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.certificazioniEsistenti.includes(cert.value)}
                            onChange={() => toggleArrayValue('certificazioniEsistenti', cert.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{cert.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sezione 4: Servizi Richiesti */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Servizi Richiesti</CardTitle>
                      <p className="text-sm text-gray-600">Cosa ti serve esattamente?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block font-semibold">Servizio principale *</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'scia', label: 'SCIA antincendio (Cat. A)', prezzo: 2000 },
                        { value: 'progetto', label: 'Istanza valutazione progetto (Cat. B/C)', prezzo: 4000 },
                        { value: 'rinnovo', label: 'Rinnovo periodico CPI (ogni 5 anni)', prezzo: 1500 },
                        { value: 'adeguamento', label: 'Adeguamento normativo (attività esistente)', prezzo: 3000 },
                        { value: 'nuova', label: 'Progetto nuova attività (ex novo)', prezzo: 4500 },
                        { value: 'variante', label: 'Variante progetto approvato', prezzo: 2500 },
                        { value: 'cpi', label: 'Certificato Prevenzione Incendi (CPI) finale', prezzo: 2000 },
                        { value: 'assistenza', label: 'Assistenza ispezione VVF', prezzo: 600 },
                      ].map((serv) => (
                        <label key={serv.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50 transition">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="servizioprincipale"
                              value={serv.value}
                              checked={data.servizioprincipale === serv.value}
                              onChange={() => updateData('servizioprincipale', serv.value)}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-sm">{serv.label}</span>
                          </div>
                          <Badge variant="secondary">da €{serv.prezzo}</Badge>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block font-semibold">Servizi aggiuntivi (opzionali)</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { value: 'sopralluogo', label: 'Sopralluogo tecnico preventivo', prezzo: 500 },
                        { value: 'rilievo', label: 'Rilievo geometrico', prezzo: 800 },
                        { value: 'planimetrie', label: 'Planimetrie CAD aggiornate', prezzo: 500 },
                        { value: 'progRilevazione', label: 'Progetto impianto rilevazione', prezzo: 900 },
                        { value: 'progSprinkler', label: 'Progetto impianto sprinkler/idranti', prezzo: 1500 },
                        { value: 'pianoEmergenza', label: 'Piano di emergenza ed evacuazione', prezzo: 700 },
                        { value: 'registro', label: 'Registro antincendio', prezzo: 300 },
                        { value: 'formazione', label: 'Formazione addetti antincendio', prezzo: 400 },
                        { value: 'proveEvac', label: 'Prove di evacuazione assistite', prezzo: 500 },
                        { value: 'assistenzaLavori', label: 'Assistenza durante i lavori', prezzo: 1000 },
                        { value: 'collaudo', label: 'Collaudo impianti antincendio', prezzo: 800 },
                      ].map((serv) => (
                        <label key={serv.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.serviziAggiuntivi.includes(serv.value)}
                            onChange={() => toggleArrayValue('serviziAggiuntivi', serv.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{serv.label} <span className="text-gray-500">(+€{serv.prezzo})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sezione 5: Urgenza e Criticità */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Urgenza e Criticità</CardTitle>
                      <p className="text-sm text-gray-600">Tempistiche e situazioni particolari</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Situazione attuale *</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'operativa', label: 'Attività già operativa (necessità adeguamento)' },
                        { value: 'avvio', label: 'Attività in fase di avvio' },
                        { value: 'futura', label: 'Attività futura (progetto preliminare)' },
                        { value: 'sospesa', label: 'Attività sospesa per non conformità VVF' },
                      ].map((sit) => (
                        <label key={sit.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="situazioneAttuale"
                            value={sit.value}
                            checked={data.situazioneAttuale === sit.value}
                            onChange={() => updateData('situazioneAttuale', sit.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{sit.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Vincoli temporali *</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'normale', label: 'Nessuna urgenza particolare (tempi standard)', extra: 0 },
                        { value: 'urgente', label: 'Urgente (entro 30 giorni)', extra: 10 },
                        { value: 'moltoUrgente', label: 'Molto urgente (entro 15 giorni)', extra: 20 },
                        { value: 'emergenza', label: 'Emergenza (entro 7 giorni)', extra: 30 },
                      ].map((vinc) => (
                        <label key={vinc.value} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-orange-50 transition">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="vincoliTemporali"
                              value={vinc.value}
                              checked={data.vincoliTemporali === vinc.value}
                              onChange={() => updateData('vincoliTemporali', vinc.value)}
                              className="w-4 h-4 text-orange-600"
                            />
                            <span className="text-sm">{vinc.label}</span>
                          </div>
                          {vinc.extra > 0 && <Badge variant="destructive">+{vinc.extra}%</Badge>}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Criticità note (se presenti)</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'vieFuga', label: 'Vie di fuga insufficienti/bloccate' },
                        { value: 'porteNonConformi', label: 'Porte tagliafuoco mancanti/non conformi' },
                        { value: 'impiantiNonConformi', label: 'Impianti elettrici non conformi' },
                        { value: 'materialiInfiammabili', label: 'Deposito materiali infiammabili' },
                        { value: 'sovraffollamento', label: 'Sovraffollamento rispetto capienza' },
                        { value: 'segnaleticaMancante', label: 'Assenza segnaletica/illuminazione emergenza' },
                        { value: 'vincoli', label: 'Edificio vincolato (Soprintendenza)' },
                      ].map((crit) => (
                        <label key={crit.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.criticitaNote.includes(crit.value)}
                            onChange={() => toggleArrayValue('criticitaNote', crit.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{crit.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Depositi e materiali speciali</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'archivi', label: 'Deposito archivi cartacei' },
                        { value: 'merci', label: 'Deposito merci' },
                        { value: 'gpl', label: 'Presenza GPL/metano (bombole, serbatoi)' },
                        { value: 'liquidi', label: 'Liquidi infiammabili (vernici, solventi, carburanti)' },
                        { value: 'esplosivi', label: 'Sostanze comburenti/esplosive' },
                      ].map((dep) => (
                        <label key={dep.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.depositiSpeciali.includes(dep.value)}
                            onChange={() => toggleArrayValue('depositiSpeciali', dep.value)}
                            className="w-4 h-4 text-orange-600"
                          />
                          <span className="text-sm">{dep.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Preventivo (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <RiepilogoPreventivo
                  preventivo={preventivo}
                  data={data}
                  onDownloadPDF={downloadPDF}
                  onInviaRichiesta={() => setShowEmailModal(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Invio Email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Richiedi Preventivo</h2>
            <p className="text-sm text-gray-600 mb-6">
              Inserisci i tuoi dati per ricevere il preventivo dettagliato via email
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={emailData.nome}
                  onChange={(e) => setEmailData({...emailData, nome: e.target.value})}
                  placeholder="Mario"
                />
              </div>
              <div>
                <Label htmlFor="cognome">Cognome *</Label>
                <Input
                  id="cognome"
                  value={emailData.cognome}
                  onChange={(e) => setEmailData({...emailData, cognome: e.target.value})}
                  placeholder="Rossi"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailData.email}
                  onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                  placeholder="mario.rossi@example.com"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={emailData.telefono}
                  onChange={(e) => setEmailData({...emailData, telefono: e.target.value})}
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="note">Note aggiuntive</Label>
                <textarea
                  id="note"
                  value={emailData.note}
                  onChange={(e) => setEmailData({...emailData, note: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Eventuali richieste particolari..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEmailModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Annulla
              </Button>
              <Button
                onClick={handleInviaRichiesta}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Invio...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Invia Richiesta
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Riepilogo Preventivo
function RiepilogoPreventivo({
  preventivo,
  data,
  onDownloadPDF,
  onInviaRichiesta
}: {
  preventivo: any;
  data: ConfiguratoreData;
  onDownloadPDF: () => void;
  onInviaRichiesta: () => void;
}) {
  if (!preventivo) {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Preventivo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600 text-sm">Compila i campi per visualizzare il preventivo</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-orange-500 shadow-lg" id="preventivo-card">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Il Tuo Preventivo
        </CardTitle>
        <p className="text-orange-100 text-sm">Aggiornato in tempo reale</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">

        {/* Riepilogo attività */}
        {data.regione && (
          <div className="pb-4 border-b">
            <p className="text-xs text-gray-500 mb-1">Località</p>
            <p className="font-medium">{data.comune || 'Non specificato'}, {data.regione}</p>
          </div>
        )}

        {data.affollamentoMax > 0 && (
          <div className="pb-4 border-b">
            <p className="text-xs text-gray-500 mb-1">Categoria Rischio</p>
            <p className="font-medium">
              {preventivo.categoriaRischio} ({data.affollamentoMax} persone)
            </p>
          </div>
        )}

        {/* Servizi base */}
        <div>
          <h3 className="font-bold text-sm mb-3">Servizi inclusi</h3>
          <div className="space-y-2">
            {preventivo.dettaglioBase.map((voce: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{voce.descrizione}</span>
                <span className="font-medium">€{voce.importo.toLocaleString('it-IT')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Servizi aggiuntivi */}
        {preventivo.serviziAggiuntivi.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-bold text-sm mb-3">Servizi aggiuntivi</h3>
            <div className="space-y-2">
              {preventivo.serviziAggiuntivi.map((serv: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{serv.descrizione}</span>
                  <span className="font-medium text-orange-600">+€{serv.importo.toLocaleString('it-IT')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maggiorazioni */}
        {preventivo.maggiorazioni.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-bold text-sm mb-3">Maggiorazioni</h3>
            <div className="space-y-2">
              {preventivo.maggiorazioni.map((magg: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{magg.descrizione}</span>
                  <span className="font-medium text-orange-600">+€{magg.importo.toLocaleString('it-IT')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Urgenza */}
        {preventivo.urgenza > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium">Urgenza/Emergenza</span>
              <span className="font-medium text-red-600">+€{preventivo.urgenza.toLocaleString('it-IT')}</span>
            </div>
          </div>
        )}

        {/* Trasferta */}
        {preventivo.trasferta > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium">Trasferta ({data.regione})</span>
              <span className="font-medium text-blue-600">+€{preventivo.trasferta.toLocaleString('it-IT')}</span>
            </div>
          </div>
        )}

        {/* Totale */}
        <div className="pt-4 border-t-2 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Totale preventivo</p>
              <p className="text-xs text-gray-500">IVA esclusa</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                €{preventivo.totale.toLocaleString('it-IT')}
              </p>
            </div>
          </div>
        </div>

        {/* Tempi */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Tempi realizzazione</p>
          <p className="font-medium text-sm">{preventivo.tempi}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 print:hidden">
          <Button onClick={onInviaRichiesta} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            <Send className="w-5 h-5 mr-2" />
            Richiedi Preventivo
          </Button>
          <Button onClick={onDownloadPDF} variant="outline" className="w-full" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Scarica PDF
          </Button>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              Preventivo indicativo non vincolante. Il preventivo definitivo sarà fornito dopo sopralluogo tecnico.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Funzione di calcolo preventivo
function calcolaPreventivo(data: ConfiguratoreData) {
  const dettaglioBase: Array<{ descrizione: string; importo: number }> = [];
  const serviziAggiuntivi: Array<{ descrizione: string; importo: number }> = [];
  const maggiorazioni: Array<{ descrizione: string; importo: number }> = [];

  // Prezzo base servizio principale
  const prezziServizi: Record<string, number> = {
    scia: 2000,
    progetto: 4000,
    rinnovo: 1500,
    adeguamento: 3000,
    nuova: 4500,
    variante: 2500,
    cpi: 2000,
    assistenza: 600,
  };

  let prezzoBase = prezziServizi[data.servizioprincipale] || 0;
  if (prezzoBase > 0) {
    const nomeServizio = {
      scia: 'SCIA antincendio',
      progetto: 'Istanza valutazione progetto',
      rinnovo: 'Rinnovo CPI',
      adeguamento: 'Adeguamento normativo',
      nuova: 'Progetto nuova attività',
      variante: 'Variante progetto',
      cpi: 'Certificato CPI finale',
      assistenza: 'Assistenza ispezione VVF',
    }[data.servizioprincipale] || 'Servizio principale';

    dettaglioBase.push({
      descrizione: nomeServizio,
      importo: prezzoBase,
    });
  }

  // Adeguamento superficie
  if (data.superficieNetta > 300 && data.superficieNetta <= 600) {
    const extra = 500;
    dettaglioBase.push({ descrizione: 'Maggiorazione superficie 300-600 mq', importo: extra });
    prezzoBase += extra;
  } else if (data.superficieNetta > 600) {
    const extra = 1000 + (data.superficieNetta - 600) * 2;
    dettaglioBase.push({ descrizione: `Maggiorazione superficie >600 mq`, importo: extra });
    prezzoBase += extra;
  }

  // Categoria rischio
  let categoriaRischio = 'A';
  let fattoreMoltiplicativo = 1.0;
  if (data.affollamentoMax >= 300) {
    categoriaRischio = 'Categoria C';
    fattoreMoltiplicativo = 1.35;
  } else if (data.affollamentoMax >= 100) {
    categoriaRischio = 'Categoria B';
    fattoreMoltiplicativo = 1.15;
  } else if (data.affollamentoMax > 0) {
    categoriaRischio = 'Categoria A';
  }

  if (fattoreMoltiplicativo > 1.0) {
    const maggiorazione = prezzoBase * (fattoreMoltiplicativo - 1.0);
    maggiorazioni.push({
      descrizione: `${categoriaRischio} (${data.affollamentoMax} persone)`,
      importo: Math.round(maggiorazione),
    });
  }

  // Complessità edificio
  if (data.numeroPiani > 2) {
    maggiorazioni.push({ descrizione: `Edificio ${data.numeroPiani} piani`, importo: 500 });
  }
  if (data.altezzaEdificio > 12) {
    maggiorazioni.push({ descrizione: `Altezza ${data.altezzaEdificio}m`, importo: 800 });
  }
  if (data.pianoUbicazione === 'interrato') {
    maggiorazioni.push({ descrizione: 'Piano interrato', importo: 600 });
  }

  // Impianti mancanti
  if (!data.impiantiEsistenti.includes('rilevazione')) {
    dettaglioBase.push({ descrizione: 'Progetto impianto rilevazione', importo: 900 });
  }
  if (!data.impiantiEsistenti.includes('idranti') && data.superficieNetta > 400) {
    dettaglioBase.push({ descrizione: 'Progetto rete idranti', importo: 1200 });
  }

  // Servizi aggiuntivi
  const prezziAggiuntivi: Record<string, { label: string; prezzo: number }> = {
    sopralluogo: { label: 'Sopralluogo tecnico', prezzo: 500 },
    rilievo: { label: 'Rilievo geometrico', prezzo: 800 },
    planimetrie: { label: 'Planimetrie CAD', prezzo: 500 },
    progRilevazione: { label: 'Progetto impianto rilevazione', prezzo: 900 },
    progSprinkler: { label: 'Progetto sprinkler/idranti', prezzo: 1500 },
    pianoEmergenza: { label: 'Piano emergenza', prezzo: 700 },
    registro: { label: 'Registro antincendio', prezzo: 300 },
    formazione: { label: 'Formazione addetti', prezzo: 400 },
    proveEvac: { label: 'Prove evacuazione', prezzo: 500 },
    assistenzaLavori: { label: 'Assistenza lavori', prezzo: 1000 },
    collaudo: { label: 'Collaudo impianti', prezzo: 800 },
  };

  data.serviziAggiuntivi.forEach((servizio) => {
    const serv = prezziAggiuntivi[servizio];
    if (serv) {
      serviziAggiuntivi.push({ descrizione: serv.label, importo: serv.prezzo });
    }
  });

  // Urgenza
  const fattoriUrgenza: Record<string, number> = {
    normale: 0,
    urgente: 0.10,
    moltoUrgente: 0.20,
    emergenza: 0.30,
  };

  const fattoreUrgenza = fattoriUrgenza[data.vincoliTemporali] || 0;
  let importoUrgenza = 0;
  if (fattoreUrgenza > 0) {
    const subtotale = dettaglioBase.reduce((sum, v) => sum + v.importo, 0) +
                     serviziAggiuntivi.reduce((sum, v) => sum + v.importo, 0) +
                     maggiorazioni.reduce((sum, v) => sum + v.importo, 0);
    importoUrgenza = Math.round(subtotale * fattoreUrgenza);
  }

  // Trasferta
  const costoTrasferta = data.regione ? calcolaCostoTrasferta(data.regione) : 0;

  // Totale
  const subtotale = dettaglioBase.reduce((sum, v) => sum + v.importo, 0);
  const totaleAggiuntivi = serviziAggiuntivi.reduce((sum, v) => sum + v.importo, 0);
  const totaleMaggiorazioni = maggiorazioni.reduce((sum, v) => sum + v.importo, 0);
  const totale = subtotale + totaleAggiuntivi + totaleMaggiorazioni + importoUrgenza + costoTrasferta;

  // Tempi
  let tempi = '6-10 settimane';
  if (data.vincoliTemporali === 'urgente') tempi = '4-6 settimane';
  if (data.vincoliTemporali === 'moltoUrgente') tempi = '2-4 settimane';
  if (data.vincoliTemporali === 'emergenza') tempi = '1-2 settimane';

  return {
    dettaglioBase,
    serviziAggiuntivi,
    maggiorazioni,
    urgenza: importoUrgenza,
    trasferta: costoTrasferta,
    totale,
    tempi,
    categoriaRischio,
  };
}
