'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChevronRight,
  ChevronLeft,
  Flame,
  MapPin,
  Building2,
  Users,
  Zap,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2
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
  // Step 1: Localizzazione
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  categoriaAttivita: string;
  descrizioneAttivita: string;

  // Step 2: Dimensionamento
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

  // Step 3: Impianti esistenti
  impiantiEsistenti: string[];
  certificazioniEsistenti: string[];

  // Step 4: Servizi richiesti
  servizioprincipale: string;
  serviziAggiuntivi: string[];

  // Step 5: Urgenza e criticità
  situazioneAttuale: string;
  vincoliTemporali: string;
  criticitaNote: string[];
  depositiSpeciali: string[];
}

export default function ConfiguratoreAntincendio() {
  const [step, setStep] = useState(1);
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
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
                  Studio Ing. Domenico Romano
                </h1>
                <p className="text-xs text-gray-600">Ingegneria e architettura</p>
              </div>
            </Link>
            <Link href="/bundle/BDL-ANTINCENDIO">
              <Button variant="outline">← Torna al Bundle</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <section className="container mx-auto px-4 py-4">
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
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-5xl mb-6 mx-auto">
            🔥
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Configuratore Preventivo Antincendio
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Rispondi alle domande per ricevere un preventivo personalizzato in tempo reale
          </p>
          <Badge variant="secondary" className="text-sm">
            Preventivo indicativo non vincolante
          </Badge>
        </div>
      </section>

      {/* Progress Bar */}
      <section className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {step} di {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((step / totalSteps) * 100)}% completato
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Form Steps */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <Step1Localizzazione
              data={data}
              updateData={updateData}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 2 && (
            <Step2Dimensionamento
              data={data}
              updateData={updateData}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 3 && (
            <Step3Impianti
              data={data}
              updateData={updateData}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 4 && (
            <Step4Servizi
              data={data}
              updateData={updateData}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 5 && (
            <Step5Urgenza
              data={data}
              updateData={updateData}
              toggleArrayValue={toggleArrayValue}
            />
          )}
          {step === 6 && (
            <Step6Riepilogo data={data} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              size="lg"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Indietro
            </Button>
            {step < totalSteps ? (
              <Button onClick={nextStep} size="lg">
                Avanti
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Invia Richiesta
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Step 1: Localizzazione e Tipo Attività
function Step1Localizzazione({ data, updateData, toggleArrayValue }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Localizzazione e Tipo Attività</CardTitle>
            <p className="text-sm text-gray-600">Dove si trova l'attività e di cosa si occupa?</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {data.regione && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              💡 Costo trasferta per {data.regione}: €{calcolaCostoTrasferta(data.regione)}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {data.regione === 'Campania' && 'Regione dello studio - tariffa base'}
              {REGIONI_CONFINANTI.includes(data.regione) && 'Regione confinante'}
              {data.regione !== 'Campania' && !REGIONI_CONFINANTI.includes(data.regione) && 'Altre regioni'}
            </p>
          </div>
        )}

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
  );
}

// Step 2: Dimensionamento
function Step2Dimensionamento({ data, updateData, toggleArrayValue }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Dimensionamento Attività</CardTitle>
            <p className="text-sm text-gray-600">Caratteristiche dimensionali e strutturali</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
  );
}

// Step 3: Impianti Esistenti
function Step3Impianti({ data, updateData, toggleArrayValue }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Impianti e Certificazioni</CardTitle>
            <p className="text-sm text-gray-600">Cosa è già presente nell'attività?</p>
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
  );
}

// Step 4: Servizi Richiesti
function Step4Servizi({ data, updateData, toggleArrayValue }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Servizi Richiesti</CardTitle>
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
              { value: 'rilievo', label: 'Rilievo geometrico laser-scan', prezzo: 800 },
              { value: 'planimetrie', label: 'Planimetrie CAD aggiornate', prezzo: 500 },
              { value: 'carico', label: 'Calcolo carico d\'incendio specifico', prezzo: 600 },
              { value: 'esodo', label: 'Studio vie di esodo (simulazione)', prezzo: 1200 },
              { value: 'progRilevazione', label: 'Progetto impianto rilevazione', prezzo: 900 },
              { value: 'progSprinkler', label: 'Progetto impianto sprinkler/idranti', prezzo: 1500 },
              { value: 'relazione', label: 'Relazione tecnica rischio incendio', prezzo: 700 },
              { value: 'pianoEmergenza', label: 'Piano di emergenza ed evacuazione', prezzo: 700 },
              { value: 'registro', label: 'Registro antincendio', prezzo: 300 },
              { value: 'formazione', label: 'Formazione addetti antincendio', prezzo: 400 },
              { value: 'proveEvac', label: 'Prove di evacuazione assistite', prezzo: 500 },
              { value: 'dvr', label: 'DVR sezione incendio', prezzo: 600 },
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
  );
}

// Step 5: Urgenza e Criticità
function Step5Urgenza({ data, updateData, toggleArrayValue }: any) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-2xl">Urgenza e Criticità</CardTitle>
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
              { value: 'nessuna', label: 'Nessuna criticità nota' },
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
              { value: 'nessuno', label: 'Nessun deposito speciale' },
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
  );
}

// Step 6: Riepilogo e Preventivo
function Step6Riepilogo({ data }: { data: ConfiguratoreData }) {
  // Calcolo preventivo
  const calcolo = calcolaPreventivo(data);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-orange-500">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="text-3xl text-center">Preventivo Personalizzato</CardTitle>
          <p className="text-center text-orange-100">Bundle Antincendio - Studio Ing. Domenico Romano</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Riepilogo Attività */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">📋 Riepilogo Attività</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Località:</span>
                <p className="font-medium">{data.comune}, {data.provincia} ({data.regione})</p>
              </div>
              <div>
                <span className="text-gray-600">Categoria:</span>
                <p className="font-medium">
                  {CATEGORIE_ATTIVITA.find(c => c.value === data.categoriaAttivita)?.label || 'Non specificata'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Superficie:</span>
                <p className="font-medium">{data.superficieNetta} mq</p>
              </div>
              <div>
                <span className="text-gray-600">Affollamento:</span>
                <p className="font-medium">{data.affollamentoMax} persone</p>
              </div>
              <div>
                <span className="text-gray-600">Edificio:</span>
                <p className="font-medium">{data.numeroPiani} piani, h={data.altezzaEdificio}m</p>
              </div>
              <div>
                <span className="text-gray-600">Anno costruzione:</span>
                <p className="font-medium">{data.annoCostruzione || 'Non specificato'}</p>
              </div>
            </div>
          </div>

          {/* Dettaglio Costi */}
          <div>
            <h3 className="font-bold text-lg mb-3">💰 Dettaglio Costi</h3>
            <div className="space-y-2">
              {calcolo.dettaglio.map((voce, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm">{voce.descrizione}</span>
                  <span className="font-medium">€{voce.importo.toLocaleString('it-IT')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Maggiorazioni */}
          {calcolo.maggiorazioni.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">📊 Maggiorazioni</h3>
              <div className="space-y-2">
                {calcolo.maggiorazioni.map((magg, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">{magg.descrizione}</span>
                    <span className="font-medium text-orange-600">+€{magg.importo.toLocaleString('it-IT')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trasferta */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3">🚗 Trasferta</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sopralluoghi e assistenza - {data.regione}</span>
              <span className="font-medium text-blue-600">+€{calcolo.trasferta.toLocaleString('it-IT')}</span>
            </div>
          </div>

          {/* Totale */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-100">TOTALE PREVENTIVO</p>
                <p className="text-4xl font-bold">€{calcolo.totale.toLocaleString('it-IT')}</p>
              </div>
              <CheckCircle2 className="w-16 h-16 text-green-200" />
            </div>
            <div className="mt-4 pt-4 border-t border-green-400 flex justify-between text-sm">
              <span>Tempi realizzazione: {calcolo.tempi}</span>
              <span>Validità: 60 giorni</span>
            </div>
          </div>

          {/* Note */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">📌 Note importanti:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Preventivo indicativo non vincolante</li>
                  <li>Il preventivo definitivo sarà fornito dopo sopralluogo tecnico</li>
                  <li>I tempi possono variare in base alla complessità del progetto</li>
                  <li>Non include costi di realizzazione impianti</li>
                  <li>Include assistenza durante ispezione VVF</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Funzione di calcolo preventivo
function calcolaPreventivo(data: ConfiguratoreData) {
  const dettaglio: Array<{ descrizione: string; importo: number }> = [];
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
  dettaglio.push({
    descrizione: `Servizio principale: ${data.servizioprincipale}`,
    importo: prezzoBase,
  });

  // Adeguamento superficie
  if (data.superficieNetta > 300 && data.superficieNetta <= 600) {
    const extra = 500;
    dettaglio.push({ descrizione: 'Superficie 300-600 mq', importo: extra });
    prezzoBase += extra;
  } else if (data.superficieNetta > 600) {
    const extra = 1000 + (data.superficieNetta - 600) * 2;
    dettaglio.push({ descrizione: `Superficie >600 mq (${data.superficieNetta} mq)`, importo: extra });
    prezzoBase += extra;
  }

  // Categoria rischio
  let categoriaRischio = 'A';
  let fattoreMoltiplicativo = 1.0;
  if (data.affollamentoMax >= 300) {
    categoriaRischio = 'C';
    fattoreMoltiplicativo = 1.35;
  } else if (data.affollamentoMax >= 100) {
    categoriaRischio = 'B';
    fattoreMoltiplicativo = 1.15;
  }

  if (fattoreMoltiplicativo > 1.0) {
    const maggiorazione = prezzoBase * (fattoreMoltiplicativo - 1.0);
    maggiorazioni.push({
      descrizione: `Categoria rischio ${categoriaRischio} (affollamento ${data.affollamentoMax} persone)`,
      importo: Math.round(maggiorazione),
    });
  }

  // Complessità edificio
  if (data.numeroPiani > 2) {
    maggiorazioni.push({ descrizione: `Edificio multipiano (${data.numeroPiani} piani)`, importo: 500 });
  }
  if (data.altezzaEdificio > 12) {
    maggiorazioni.push({ descrizione: `Altezza >12m (${data.altezzaEdificio}m)`, importo: 800 });
  }
  if (data.pianoUbicazione === 'interrato') {
    maggiorazioni.push({ descrizione: 'Piano interrato/seminterrato', importo: 600 });
  }

  // Impianti mancanti
  if (!data.impiantiEsistenti.includes('rilevazione')) {
    dettaglio.push({ descrizione: 'Progetto impianto rilevazione incendi', importo: 900 });
  }
  if (!data.impiantiEsistenti.includes('idranti') && data.superficieNetta > 400) {
    dettaglio.push({ descrizione: 'Progetto rete idranti', importo: 1200 });
  }

  // Servizi aggiuntivi
  const prezziAggiuntivi: Record<string, number> = {
    sopralluogo: 500,
    rilievo: 800,
    planimetrie: 500,
    carico: 600,
    esodo: 1200,
    progRilevazione: 900,
    progSprinkler: 1500,
    relazione: 700,
    pianoEmergenza: 700,
    registro: 300,
    formazione: 400,
    proveEvac: 500,
    dvr: 600,
    assistenzaLavori: 1000,
    collaudo: 800,
  };

  data.serviziAggiuntivi.forEach((servizio) => {
    const prezzo = prezziAggiuntivi[servizio];
    if (prezzo) {
      dettaglio.push({ descrizione: `Servizio aggiuntivo: ${servizio}`, importo: prezzo });
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
  if (fattoreUrgenza > 0) {
    const subtotale = dettaglio.reduce((sum, v) => sum + v.importo, 0) +
                     maggiorazioni.reduce((sum, v) => sum + v.importo, 0);
    const maggiorazioneUrgenza = Math.round(subtotale * fattoreUrgenza);
    maggiorazioni.push({
      descrizione: `Urgenza (${data.vincoliTemporali})`,
      importo: maggiorazioneUrgenza,
    });
  }

  // Trasferta
  const costoTrasferta = calcolaCostoTrasferta(data.regione);

  // Totale
  const subtotale = dettaglio.reduce((sum, v) => sum + v.importo, 0);
  const totaleMaggiorazioni = maggiorazioni.reduce((sum, v) => sum + v.importo, 0);
  const totale = subtotale + totaleMaggiorazioni + costoTrasferta;

  // Tempi
  let tempi = '6-10 settimane';
  if (data.vincoliTemporali === 'urgente') tempi = '4-6 settimane';
  if (data.vincoliTemporali === 'moltoUrgente') tempi = '2-4 settimane';
  if (data.vincoliTemporali === 'emergenza') tempi = '1-2 settimane';

  return {
    dettaglio,
    maggiorazioni,
    trasferta: costoTrasferta,
    totale,
    tempi,
  };
}
