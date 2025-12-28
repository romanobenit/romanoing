'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  MapPin,
  Building2,
  FileText,
  Wrench,
  Clock,
  Calculator,
  Download,
  Send,
  Trash2,
  AlertTriangle,
  Shield,
  Home,
  TrendingUp,
  Activity,
  Layers,
  Settings,
} from 'lucide-react';

import zonizzazioneSismica from '@/data/zonizzazione-sismica.json';

// Interfaccia dati configuratore
interface ConfiguratoreSismicaData {
  // Localizzazione
  indirizzo: string;
  cap: string;
  comune: string;
  provincia: string;
  regione: string;
  zonaSismica: number | null;
  categoriaSottosuolo: string;
  categoriaTopografica: string;

  // Caratteristiche edificio
  tipologiaStrutturale: string;
  superficieTotale: number;
  numeroPianiFuoriTerra: number;
  numeroPianiInterrati: number;
  altezzaInterpiano: number;
  altezzaTotale: number;
  annoCostruzione: string;
  destinazioneUso: string;

  // Stato conservazione
  statoConservazione: string;
  documentazioneDisponibile: string[];
  interventiPregressi: string[];

  // Servizio richiesto
  servizioprincipale: string;
  serviziAggiuntivi: string[];

  // Complessità strutturale
  irregolaritaPlanimetrica: string;
  irregolaritaAltezza: string;
  elementiCritici: string[];

  // Urgenza
  situazioneAttuale: string;
  vincoliTemporali: string;
  criticitaParticolari: string[];

  // Sismabonus
  interessatoSismabonus: boolean;
  classeRischioAnte: string;
  classeRischioPost: string;
}

const STORAGE_KEY = 'configuratore_sismica_data';

export default function ConfiguratoreSismica() {
  const [data, setData] = useState<ConfiguratoreSismicaData>({
    indirizzo: '',
    cap: '',
    comune: '',
    provincia: '',
    regione: '',
    zonaSismica: null,
    categoriaSottosuolo: '',
    categoriaTopografica: 'T1',
    tipologiaStrutturale: '',
    superficieTotale: 0,
    numeroPianiFuoriTerra: 1,
    numeroPianiInterrati: 0,
    altezzaInterpiano: 3.0,
    altezzaTotale: 0,
    annoCostruzione: '',
    destinazioneUso: '',
    statoConservazione: '',
    documentazioneDisponibile: [],
    interventiPregressi: [],
    servizioprincipale: '',
    serviziAggiuntivi: [],
    irregolaritaPlanimetrica: 'regolare',
    irregolaritaAltezza: 'regolare',
    elementiCritici: [],
    situazioneAttuale: '',
    vincoliTemporali: 'standard',
    criticitaParticolari: [],
    interessatoSismabonus: false,
    classeRischioAnte: 'D',
    classeRischioPost: 'B',
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

  const updateData = (field: keyof ConfiguratoreSismicaData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: keyof ConfiguratoreSismicaData, value: string) => {
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

  // Auto-calcola altezza totale
  useEffect(() => {
    const altezza = data.numeroPianiFuoriTerra * data.altezzaInterpiano;
    updateData('altezzaTotale', altezza);
  }, [data.numeroPianiFuoriTerra, data.altezzaInterpiano]);

  // Auto-completa dati da CAP/Comune
  useEffect(() => {
    if (data.comune) {
      const comuneData = zonizzazioneSismica.comuni.find(
        (c) => c.comune.toLowerCase() === data.comune.toLowerCase()
      );
      if (comuneData) {
        updateData('provincia', comuneData.provincia);
        updateData('regione', comuneData.regione);
        updateData('zonaSismica', comuneData.zona);
        if (!data.cap) {
          updateData('cap', comuneData.cap);
        }
      }
    }
  }, [data.comune]);

  // Calcola preventivo quando cambiano i dati
  useEffect(() => {
    const prev = calcolaPreventivo(data);
    setPreventivo(prev);
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
      const response = await fetch('/api/preventivo-sismica', {
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
        alert("Errore durante l'invio. Riprova più tardi.");
      }
    } catch (error) {
      console.error('Errore invio:', error);
      alert("Errore durante l'invio. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuratore Vulnerabilità Sismica</h1>
                <p className="text-sm text-gray-600">Studio Ing. Romano - NTC 2018</p>
              </div>
            </div>
            <Button onClick={clearData} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Cancella
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-8 print:py-4">
        <div className="text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 print:w-16 print:h-16">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 print:text-3xl">
            Valutazione Vulnerabilità Sismica
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Configura la tua richiesta di valutazione sismica secondo le NTC 2018.
            Ottieni un preventivo personalizzato in pochi minuti.
          </p>
          <Badge variant="secondary" className="text-sm print:hidden">
            Preventivo indicativo non vincolante • Dati salvati automaticamente
          </Badge>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Localizzazione */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Localizzazione e Classificazione Sismica</CardTitle>
                    <p className="text-sm text-gray-600">Dove si trova l'edificio?</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comune *
                  </label>
                  <input
                    type="text"
                    value={data.comune}
                    onChange={(e) => updateData('comune', e.target.value)}
                    placeholder="Es: Napoli"
                    className="w-full px-3 py-2 border rounded-lg"
                    list="comuni-list"
                  />
                  <datalist id="comuni-list">
                    {zonizzazioneSismica.comuni.map((c) => (
                      <option key={c.comune} value={c.comune} />
                    ))}
                  </datalist>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CAP</label>
                    <input
                      type="text"
                      value={data.cap}
                      onChange={(e) => updateData('cap', e.target.value)}
                      placeholder="80100"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                      type="text"
                      value={data.provincia}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo</label>
                  <input
                    type="text"
                    value={data.indirizzo}
                    onChange={(e) => updateData('indirizzo', e.target.value)}
                    placeholder="Via/Piazza, Numero civico"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Regione</label>
                  <input
                    type="text"
                    value={data.regione}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  />
                </div>

                {data.zonaSismica !== null && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        Zona Sismica: {data.zonaSismica}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {data.zonaSismica === 1 && 'Zona a sismicità alta (accelerazione ag > 0.25g)'}
                      {data.zonaSismica === 2 && 'Zona a sismicità media (0.15g < ag ≤ 0.25g)'}
                      {data.zonaSismica === 3 && 'Zona a sismicità bassa (0.05g < ag ≤ 0.15g)'}
                      {data.zonaSismica === 4 && 'Zona a sismicità molto bassa (ag ≤ 0.05g)'}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria Sottosuolo
                    </label>
                    <select
                      value={data.categoriaSottosuolo}
                      onChange={(e) => updateData('categoriaSottosuolo', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Non nota</option>
                      <option value="A">A - Roccia affiorante (Vs30 &gt; 800 m/s)</option>
                      <option value="B">B - Rocce tenere (360 &lt; Vs30 ≤ 800 m/s)</option>
                      <option value="C">C - Depositi sabbiosi (180 &lt; Vs30 ≤ 360 m/s)</option>
                      <option value="D">D - Depositi argillosi (100 &lt; Vs30 ≤ 180 m/s)</option>
                      <option value="E">E - Depositi superficiali (Vs30 &lt; 100 m/s)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria Topografica
                    </label>
                    <select
                      value={data.categoriaTopografica}
                      onChange={(e) => updateData('categoriaTopografica', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="T1">T1 - Superficie pianeggiante</option>
                      <option value="T2">T2 - Pendii moderati (&lt; 15°)</option>
                      <option value="T3">T3 - Rilievi isolati</option>
                      <option value="T4">T4 - Creste montagne</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Caratteristiche Edificio */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Caratteristiche Edificio</CardTitle>
                    <p className="text-sm text-gray-600">Dati dimensionali e tipologia strutturale</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipologia Strutturale *
                  </label>
                  <select
                    value={data.tipologiaStrutturale}
                    onChange={(e) => updateData('tipologiaStrutturale', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleziona tipologia</option>
                    <option value="muratura">Muratura portante</option>
                    <option value="ca_telaio">Cemento armato (telaio)</option>
                    <option value="ca_pareti">Cemento armato (pareti/setti)</option>
                    <option value="acciaio">Acciaio</option>
                    <option value="legno">Legno</option>
                    <option value="mista">Mista (specificare nelle note)</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Superficie Totale (m²) *
                    </label>
                    <input
                      type="number"
                      value={data.superficieTotale || ''}
                      onChange={(e) => updateData('superficieTotale', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Piani fuori terra *
                    </label>
                    <input
                      type="number"
                      value={data.numeroPianiFuoriTerra || ''}
                      onChange={(e) => updateData('numeroPianiFuoriTerra', parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Piani interrati
                    </label>
                    <input
                      type="number"
                      value={data.numeroPianiInterrati || ''}
                      onChange={(e) => updateData('numeroPianiInterrati', parseInt(e.target.value) || 0)}
                      min="0"
                      max="5"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altezza interpiano media (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={data.altezzaInterpiano || ''}
                      onChange={(e) => updateData('altezzaInterpiano', parseFloat(e.target.value) || 3.0)}
                      min="2.4"
                      max="6"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altezza totale (m)
                    </label>
                    <input
                      type="number"
                      value={data.altezzaTotale.toFixed(1)}
                      readOnly
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anno di Costruzione *
                  </label>
                  <select
                    value={data.annoCostruzione}
                    onChange={(e) => updateData('annoCostruzione', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleziona periodo</option>
                    <option value="pre1971">Prima del 1971 (pre-normativa sismica)</option>
                    <option value="1971-1984">1972-1984 (L. 64/74)</option>
                    <option value="1984-1996">1984-1996 (DM 84)</option>
                    <option value="1996-2003">1996-2003 (DM 96)</option>
                    <option value="2003-2008">2003-2008 (OPCM 3274)</option>
                    <option value="2008-2018">2008-2018 (NTC 2008)</option>
                    <option value="post2018">Dopo 2018 (NTC 2018)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinazione d'Uso (Classe d'Uso NTC) *
                  </label>
                  <select
                    value={data.destinazioneUso}
                    onChange={(e) => updateData('destinazioneUso', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleziona classe</option>
                    <option value="classe1">Classe I - Edifici agricoli, depositi</option>
                    <option value="classe2">Classe II - Residenziale, commerciale, uffici</option>
                    <option value="classe3">Classe III - Scuole, ospedali, musei</option>
                    <option value="classe4">Classe IV - Edifici strategici (protezione civile)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Stato Conservazione */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Stato di Conservazione e Documentazione</CardTitle>
                    <p className="text-sm text-gray-600">Condizioni attuali e documenti disponibili</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stato di Conservazione *
                  </label>
                  <select
                    value={data.statoConservazione}
                    onChange={(e) => updateData('statoConservazione', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleziona stato</option>
                    <option value="ottimo">Ottimo - Nessun danno visibile</option>
                    <option value="buono">Buono - Lievi fessurazioni non strutturali</option>
                    <option value="discreto">Discreto - Fessure diffuse, necessita manutenzione</option>
                    <option value="mediocre">Mediocre - Lesioni strutturali evidenti</option>
                    <option value="pessimo">Pessimo - Gravi dissesti, elementi degradati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Documentazione Disponibile
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'progetto', label: 'Progetto strutturale originale' },
                      { value: 'relazione', label: 'Relazione di calcolo' },
                      { value: 'collaudo', label: 'Collaudo statico' },
                      { value: 'agibilita', label: 'Certificato di agibilità' },
                      { value: 'planimetrie', label: 'Planimetrie architettoniche' },
                      { value: 'indagini', label: 'Indagini/prove precedenti' },
                      { value: 'geologica', label: 'Relazione geologica' },
                      { value: 'nessuna', label: 'Nessuna documentazione disponibile' },
                    ].map((doc) => (
                      <label key={doc.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.documentazioneDisponibile.includes(doc.value)}
                          onChange={() => toggleArrayValue('documentazioneDisponibile', doc.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{doc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interventi Strutturali Pregressi
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'nessuno', label: 'Nessun intervento' },
                      { value: 'sopraelevazione', label: 'Sopraelevazione' },
                      { value: 'ampliamento', label: 'Ampliamento' },
                      { value: 'rinforzi', label: 'Rinforzi locali' },
                      { value: 'consolidamento', label: 'Consolidamento generale' },
                      { value: 'cambio_uso', label: 'Cambio destinazione d\'uso' },
                    ].map((int) => (
                      <label key={int.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.interventiPregressi.includes(int.value)}
                          onChange={() => toggleArrayValue('interventiPregressi', int.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{int.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 4: Servizio Richiesto */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Servizio Richiesto</CardTitle>
                    <p className="text-sm text-gray-600">Seleziona il tipo di prestazione necessaria</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Servizio Principale *
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        value: 'el0',
                        label: 'Valutazione preliminare (EL0)',
                        desc: 'Sopralluogo, check-list vulnerabilità, relazione preliminare',
                        prezzo: 1200,
                      },
                      {
                        value: 'el1',
                        label: 'Valutazione sicurezza Livello 1 (EL1)',
                        desc: 'Analisi semplificata, verifica normativa, indice ζE',
                        prezzo: 2800,
                      },
                      {
                        value: 'el2',
                        label: 'Valutazione sicurezza Livello 2 (EL2)',
                        desc: 'Analisi completa con modellazione, verifiche SLV/SLD/SLO',
                        prezzo: 5500,
                      },
                      {
                        value: 'el3',
                        label: 'Valutazione sicurezza Livello 3 (EL3)',
                        desc: 'Analisi approfondita con prove estese, FEM avanzato',
                        prezzo: 9000,
                      },
                      {
                        value: 'miglioramento',
                        label: 'Progetto miglioramento sismico',
                        desc: 'Progetto esecutivo interventi, relazioni di calcolo',
                        prezzo: 7500,
                      },
                      {
                        value: 'adeguamento',
                        label: 'Progetto adeguamento sismico',
                        desc: 'Progetto esecutivo completo NTC 2018, DL inclusa',
                        prezzo: 12000,
                      },
                      {
                        value: 'sismabonus',
                        label: 'Sismabonus + Asseverazioni',
                        desc: 'Verifica classi di rischio, asseverazioni ante/post operam',
                        prezzo: 3500,
                      },
                      {
                        value: 'intervento_locale',
                        label: 'Intervento locale',
                        desc: 'Rinforzo/consolidamento locale su elementi strutturali puntuali. Include progetto locale, direzione lavori e collaudo elemento.',
                        prezzo: 2000,
                        prezzoMax: 8000,
                      },
                      {
                        value: 'direzione_lavori',
                        label: 'Direzione Lavori (DL) interventi',
                        desc: 'Solo DL per cantiere. Richiede progetto esistente tranne per lavori privi di rilevanza.',
                        prezzo: 4000,
                        disclaimer: true,
                      },
                      {
                        value: 'collaudo',
                        label: 'Collaudo statico',
                        desc: 'Solo collaudo opere strutturali. Richiede lavori completati con DL.',
                        prezzo: 3000,
                        disclaimer: true,
                      },
                    ].map((serv) => (
                      <label
                        key={serv.value}
                        className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="servizioprincipale"
                          value={serv.value}
                          checked={data.servizioprincipale === serv.value}
                          onChange={() => updateData('servizioprincipale', serv.value)}
                          className="mt-1 w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{serv.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{serv.desc}</div>
                          <div className="text-sm font-semibold text-blue-600 mt-2">
                            {serv.prezzoMax
                              ? `Range: €${serv.prezzo.toLocaleString('it-IT')} - €${serv.prezzoMax.toLocaleString('it-IT')}`
                              : `Base: €${serv.prezzo.toLocaleString('it-IT')}`}
                          </div>
                          {serv.disclaimer && (
                            <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                              ⚠️ {serv.desc.split('.')[1]?.trim()}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Servizi Aggiuntivi
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'rilievo', label: 'Rilievo geometrico-strutturale', prezzo: 1200 },
                      { value: 'indaginiCA', label: 'Indagini diagnostiche CA (pacchetto base)', prezzo: 2500 },
                      { value: 'indaginiMuratura', label: 'Indagini muratura (martinetti, endoscopia)', prezzo: 2000 },
                      { value: 'laboratorio', label: 'Prove materiali in laboratorio', prezzo: 1500 },
                      { value: 'geologica', label: 'Relazione geologica/geotecnica', prezzo: 1800 },
                      { value: 'modellazione3d', label: 'Modellazione 3D avanzata (pushover)', prezzo: 2200 },
                      { value: 'analisiNonLineare', label: 'Analisi non lineare dinamica', prezzo: 3500 },
                      { value: 'coordinamento', label: 'Coordinamento sicurezza (CSP/CSE)', prezzo: 2500 },
                      { value: 'praticaGenio', label: 'Pratica Genio Civile', prezzo: 800 },
                      { value: 'durc', label: 'DURC e documentazione appalto', prezzo: 500 },
                    ].map((serv) => (
                      <label key={serv.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.serviziAggiuntivi.includes(serv.value)}
                          onChange={() => toggleArrayValue('serviziAggiuntivi', serv.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">
                          {serv.label}{' '}
                          <span className="text-gray-500">(+€{serv.prezzo.toLocaleString('it-IT')})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 5: Complessità Strutturale */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Complessità Strutturale</CardTitle>
                    <p className="text-sm text-gray-600">Irregolarità ed elementi critici</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Irregolarità Planimetrica
                    </label>
                    <select
                      value={data.irregolaritaPlanimetrica}
                      onChange={(e) => updateData('irregolaritaPlanimetrica', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="regolare">Regolare (pianta rettangolare/quadrata)</option>
                      <option value="lieve">Lievemente irregolare (forme a L, T)</option>
                      <option value="molto">Molto irregolare (forme complesse, rientranze)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Irregolarità in Altezza
                    </label>
                    <select
                      value={data.irregolaritaAltezza}
                      onChange={(e) => updateData('irregolaritaAltezza', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="regolare">Regolare (sezioni costanti)</option>
                      <option value="lieve">Lievemente irregolare (piccole variazioni)</option>
                      <option value="molto">Molto irregolare (pilotis, piani sfalsati)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Elementi Critici Presenti
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'tamponature', label: 'Tamponature non solidali' },
                      { value: 'solai_spingenti', label: 'Solai spingenti (volte, non rigidi)' },
                      { value: 'pilastri_tozzi', label: 'Pilastri tozzi (h/b < 3)' },
                      { value: 'travi_emergenti', label: 'Travi emergenti' },
                      { value: 'nodi_non_confinati', label: 'Nodi trave-pilastro non confinati' },
                      { value: 'plinti_isolati', label: 'Plinti isolati in zona sismica' },
                      { value: 'no_cordoli', label: 'Assenza cordoli sommitali (muratura)' },
                      { value: 'aggetti', label: 'Aggetti/balconi importanti' },
                    ].map((elem) => (
                      <label key={elem.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.elementiCritici.includes(elem.value)}
                          onChange={() => toggleArrayValue('elementiCritici', elem.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{elem.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 6: Urgenza */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Urgenza e Tempistiche</CardTitle>
                    <p className="text-sm text-gray-600">Situazione attuale e vincoli temporali</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Situazione Attuale
                  </label>
                  <select
                    value={data.situazioneAttuale}
                    onChange={(e) => updateData('situazioneAttuale', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Seleziona situazione</option>
                    <option value="nessuna_urgenza">Nessuna urgenza (valutazione preventiva)</option>
                    <option value="compravendita">Compravendita immobiliare in corso</option>
                    <option value="richiesta_banca">Richiesta banca/assicurazione</option>
                    <option value="ristrutturazione">Ristrutturazione programmata</option>
                    <option value="sismabonus">Sismabonus in corso</option>
                    <option value="danni_recenti">Danni recenti post-sisma</option>
                    <option value="ordinanza">Ordinanza sindacale/ingiunzione</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempistiche Richieste
                  </label>
                  <select
                    value={data.vincoliTemporali}
                    onChange={(e) => updateData('vincoliTemporali', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="standard">Standard (60-90 giorni)</option>
                    <option value="veloce">Veloce (30-45 giorni) - maggiorazione +15%</option>
                    <option value="urgente">Urgente (15-30 giorni) - maggiorazione +30%</option>
                    <option value="emergenza">Emergenza (&lt;15 giorni) - maggiorazione +50%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Criticità Particolari
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'vincolato', label: 'Edificio vincolato (Soprintendenza)' },
                      { value: 'amianto', label: 'Presenza amianto' },
                      { value: 'occupato', label: 'Edificio occupato (difficoltà accesso)' },
                      { value: 'scia', label: 'Necessità SCIA/permessi urgenti' },
                      { value: 'contenziosi', label: 'Contenziosi in corso' },
                      { value: 'danneggiato', label: 'Edificio danneggiato/puntellato' },
                    ].map((crit) => (
                      <label key={crit.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.criticitaParticolari.includes(crit.value)}
                          onChange={() => toggleArrayValue('criticitaParticolari', crit.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{crit.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 7: Sismabonus */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Sismabonus e Detrazioni Fiscali</CardTitle>
                    <p className="text-sm text-gray-600">
                      Simula il salto di classe e calcola le detrazioni
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.interessatoSismabonus}
                      onChange={(e) => updateData('interessatoSismabonus', e.target.checked)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="font-medium text-gray-900">
                      Sono interessato al Sismabonus
                    </span>
                  </label>
                </div>

                {data.interessatoSismabonus && (
                  <>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">
                            ⚠️ DISCLAIMER IMPORTANTE
                          </h4>
                          <p className="text-sm text-yellow-800">
                            La simulazione del salto di classe è puramente indicativa e basata su parametri
                            generali. <strong>La classe di rischio EFFETTIVA</strong> (sia ante che post
                            operam) può essere determinata <strong>SOLO dopo una valutazione strutturale
                            completa con modellazione</strong> secondo le Linee Guida MIT. I valori mostrati
                            NON hanno alcun valore legale o contrattuale.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Classe di Rischio Stimata ANTE operam
                        </label>
                        <select
                          value={data.classeRischioAnte}
                          onChange={(e) => updateData('classeRischioAnte', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="A+">A+ - Eccellente (ζE ≥ 100%)</option>
                          <option value="A">A - Ottimo (80% ≤ ζE &lt; 100%)</option>
                          <option value="B">B - Buono (60% ≤ ζE &lt; 80%)</option>
                          <option value="C">C - Sufficiente (45% ≤ ζE &lt; 60%)</option>
                          <option value="D">D - Insufficiente (30% ≤ ζE &lt; 45%)</option>
                          <option value="E">E - Carente (15% ≤ ζE &lt; 30%)</option>
                          <option value="F">F - Grave (10% ≤ ζE &lt; 15%)</option>
                          <option value="G">G - Critico (ζE &lt; 10%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Classe di Rischio Prevista POST operam
                        </label>
                        <select
                          value={data.classeRischioPost}
                          onChange={(e) => updateData('classeRischioPost', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="A+">A+ - Eccellente (ζE ≥ 100%)</option>
                          <option value="A">A - Ottimo (80% ≤ ζE &lt; 100%)</option>
                          <option value="B">B - Buono (60% ≤ ζE &lt; 80%)</option>
                          <option value="C">C - Sufficiente (45% ≤ ζE &lt; 60%)</option>
                          <option value="D">D - Insufficiente (30% ≤ ζE &lt; 45%)</option>
                          <option value="E">E - Carente (15% ≤ ζE &lt; 30%)</option>
                          <option value="F">F - Grave (10% ≤ ζE &lt; 15%)</option>
                          <option value="G">G - Critico (ζE &lt; 10%)</option>
                        </select>
                      </div>
                    </div>

                    {preventivo && preventivo.sismabonus && (
                      <div className="bg-white p-6 rounded-lg border-2 border-green-300">
                        <h3 className="font-bold text-lg mb-4 text-green-900">
                          Simulazione Sismabonus
                        </h3>

                        {/* Visualizzazione classi */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Situazione ANTE operam:</p>
                            <div className="flex gap-2">
                              {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((classe) => (
                                <div
                                  key={classe}
                                  className={`flex-1 h-12 rounded flex items-center justify-center font-bold text-sm ${
                                    data.classeRischioAnte === classe
                                      ? getClasseColor(classe)
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  {classe}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <div className="text-2xl text-green-600">↓</div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Situazione POST operam (prevista):</p>
                            <div className="flex gap-2">
                              {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((classe) => (
                                <div
                                  key={classe}
                                  className={`flex-1 h-12 rounded flex items-center justify-center font-bold text-sm ${
                                    data.classeRischioPost === classe
                                      ? getClasseColor(classe)
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  {classe}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Risultati */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-green-100 p-4 rounded-lg">
                            <p className="text-sm text-green-700 mb-1">Salto di Classe</p>
                            <p className="text-2xl font-bold text-green-900">
                              {data.classeRischioAnte} → {data.classeRischioPost}
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              {preventivo.sismabonus.saltoClassi > 0 ? '+' : ''}
                              {preventivo.sismabonus.saltoClassi} classi
                            </p>
                          </div>
                          <div className="bg-green-100 p-4 rounded-lg">
                            <p className="text-sm text-green-700 mb-1">Detrazione Fiscale</p>
                            <p className="text-2xl font-bold text-green-900">
                              {preventivo.sismabonus.percentualeDetrazione}%
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              {preventivo.sismabonus.descrizione}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            💰 Stima Detrazione Massima
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-blue-700">Spesa massima ammissibile:</p>
                              <p className="font-bold text-blue-900">€96.000</p>
                            </div>
                            <div>
                              <p className="text-blue-700">Detrazione massima:</p>
                              <p className="font-bold text-blue-900">
                                €{preventivo.sismabonus.detrazioneMassima.toLocaleString('it-IT')}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-blue-700 mt-2">
                            *In 5 anni. Massimale per singola unità immobiliare.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preventivo Column */}
          {preventivo && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-2 border-blue-300 shadow-lg">
                  <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-6 h-6 text-blue-600" />
                      <CardTitle className="text-xl">Preventivo</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">Stima indicativa non vincolante</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {/* Servizio base */}
                    <div>
                      <h3 className="font-bold text-sm mb-3">Servizio principale</h3>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{preventivo.nomeServizio}</span>
                          <span className="font-bold text-blue-600">
                            €{preventivo.servizioBase.toLocaleString('it-IT')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Maggiorazioni */}
                    {preventivo.maggiorazioni.length > 0 && (
                      <div>
                        <h3 className="font-bold text-sm mb-3">Maggiorazioni</h3>
                        <div className="space-y-2">
                          {preventivo.maggiorazioni.map((magg: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{magg.descrizione}</span>
                              <span className="font-medium text-blue-600">
                                +€{magg.importo.toLocaleString('it-IT')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Servizi aggiuntivi */}
                    {preventivo.serviziAggiuntivi.length > 0 && (
                      <div className="pt-4 border-t">
                        <h3 className="font-bold text-sm mb-3">Servizi aggiuntivi</h3>
                        <div className="space-y-2">
                          {preventivo.serviziAggiuntivi.map((serv: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{serv.descrizione}</span>
                              <span className="font-medium text-blue-600">
                                +€{serv.importo.toLocaleString('it-IT')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Urgenza */}
                    {preventivo.urgenza > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">Maggiorazione urgenza</span>
                          <span className="font-medium text-orange-600">
                            +€{preventivo.urgenza.toLocaleString('it-IT')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trasferta */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">Costo trasferta</span>
                        <span className="font-medium text-gray-900">
                          €{preventivo.trasferta.toLocaleString('it-IT')}
                        </span>
                      </div>
                    </div>

                    {/* Totale */}
                    <div className="pt-4 border-t-2 border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">TOTALE</span>
                        <span className="font-bold text-2xl text-blue-600">
                          €{preventivo.totaleGenerale.toLocaleString('it-IT')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">IVA esclusa se dovuta</p>
                    </div>

                    {/* Azioni */}
                    <div className="space-y-2 print:hidden">
                      <Button
                        onClick={() => setShowEmailModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Richiedi Preventivo
                      </Button>
                      <Button onClick={downloadPDF} variant="outline" className="w-full" size="lg">
                        <Download className="w-5 h-5 mr-2" />
                        Scarica PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Richiedi Preventivo</h2>
            <p className="text-sm text-gray-600 mb-6">
              Inserisci i tuoi dati per ricevere il preventivo dettagliato via email
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={emailData.nome}
                  onChange={(e) => setEmailData({ ...emailData, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  value={emailData.cognome}
                  onChange={(e) => setEmailData({ ...emailData, cognome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Il tuo cognome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="tua@email.it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={emailData.telefono}
                  onChange={(e) => setEmailData({ ...emailData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="+39 XXX XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={emailData.note}
                  onChange={(e) => setEmailData({ ...emailData, note: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Eventuali note o richieste particolari..."
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Invio...' : 'Invia Richiesta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Funzione calcolo preventivo
function calcolaPreventivo(data: ConfiguratoreSismicaData) {
  const maggiorazioni: Array<{ descrizione: string; importo: number }> = [];
  const serviziAggiuntivi: Array<{ descrizione: string; importo: number }> = [];

  // Prezzi base servizi principali
  const prezziServizi: Record<string, number> = {
    el0: 1200,
    el1: 2800,
    el2: 5500,
    el3: 9000,
    miglioramento: 7500,
    adeguamento: 12000,
    sismabonus: 3500,
    intervento_locale: 2000,
    direzione_lavori: 4000,
    collaudo: 3000,
  };

  const nomiServizi: Record<string, string> = {
    el0: 'Valutazione preliminare (EL0)',
    el1: 'Valutazione sicurezza Livello 1 (EL1)',
    el2: 'Valutazione sicurezza Livello 2 (EL2)',
    el3: 'Valutazione sicurezza Livello 3 (EL3)',
    miglioramento: 'Progetto miglioramento sismico',
    adeguamento: 'Progetto adeguamento sismico',
    sismabonus: 'Sismabonus + Asseverazioni',
    intervento_locale: 'Intervento locale',
    direzione_lavori: 'Direzione Lavori (DL) interventi',
    collaudo: 'Collaudo statico',
  };

  let prezzoBase = prezziServizi[data.servizioprincipale] || 0;
  const nomeServizio = nomiServizi[data.servizioprincipale] || 'Servizio principale';

  // Maggiorazioni per superficie
  if (data.superficieTotale > 2000) {
    const magg = Math.round(prezzoBase * 0.8);
    maggiorazioni.push({ descrizione: 'Superficie > 2000 m² (+80%)', importo: magg });
  } else if (data.superficieTotale > 1000) {
    const magg = Math.round(prezzoBase * 0.6);
    maggiorazioni.push({ descrizione: 'Superficie 1001-2000 m² (+60%)', importo: magg });
  } else if (data.superficieTotale > 500) {
    const magg = Math.round(prezzoBase * 0.4);
    maggiorazioni.push({ descrizione: 'Superficie 501-1000 m² (+40%)', importo: magg });
  } else if (data.superficieTotale > 200) {
    const magg = Math.round(prezzoBase * 0.2);
    maggiorazioni.push({ descrizione: 'Superficie 201-500 m² (+20%)', importo: magg });
  }

  // Maggiorazioni per numero piani
  if (data.numeroPianiFuoriTerra > 6) {
    const magg = Math.round(prezzoBase * 0.5);
    maggiorazioni.push({ descrizione: 'Edificio > 6 piani (+50%)', importo: magg });
  } else if (data.numeroPianiFuoriTerra >= 5) {
    const magg = Math.round(prezzoBase * 0.3);
    maggiorazioni.push({ descrizione: 'Edificio 5-6 piani (+30%)', importo: magg });
  } else if (data.numeroPianiFuoriTerra >= 3) {
    const magg = Math.round(prezzoBase * 0.15);
    maggiorazioni.push({ descrizione: 'Edificio 3-4 piani (+15%)', importo: magg });
  }

  // Maggiorazioni per zona sismica
  if (data.zonaSismica === 1) {
    const magg = Math.round(prezzoBase * 0.35);
    maggiorazioni.push({ descrizione: 'Zona sismica 1 (+35%)', importo: magg });
  } else if (data.zonaSismica === 2) {
    const magg = Math.round(prezzoBase * 0.2);
    maggiorazioni.push({ descrizione: 'Zona sismica 2 (+20%)', importo: magg });
  } else if (data.zonaSismica === 3) {
    const magg = Math.round(prezzoBase * 0.1);
    maggiorazioni.push({ descrizione: 'Zona sismica 3 (+10%)', importo: magg });
  }

  // Maggiorazioni per classe d'uso
  if (data.destinazioneUso === 'classe4') {
    const magg = Math.round(prezzoBase * 0.5);
    maggiorazioni.push({ descrizione: 'Classe IV - Edifici strategici (+50%)', importo: magg });
  } else if (data.destinazioneUso === 'classe3') {
    const magg = Math.round(prezzoBase * 0.25);
    maggiorazioni.push({ descrizione: 'Classe III - Scuole/Ospedali (+25%)', importo: magg });
  } else if (data.destinazioneUso === 'classe1') {
    const magg = Math.round(prezzoBase * -0.1);
    maggiorazioni.push({ descrizione: 'Classe I - Depositi (-10%)', importo: magg });
  }

  // Maggiorazioni per anno costruzione
  if (data.annoCostruzione === 'pre1971') {
    const magg = Math.round(prezzoBase * 0.3);
    maggiorazioni.push({ descrizione: 'Pre-1971 - Pre-normativa (+30%)', importo: magg });
  } else if (data.annoCostruzione === '1971-1984' || data.annoCostruzione === '1984-1996') {
    const magg = Math.round(prezzoBase * 0.2);
    maggiorazioni.push({ descrizione: 'Edificio 1971-1996 (+20%)', importo: magg });
  } else if (data.annoCostruzione === '1996-2003' || data.annoCostruzione === '2003-2008') {
    const magg = Math.round(prezzoBase * 0.1);
    maggiorazioni.push({ descrizione: 'Edificio 1996-2008 (+10%)', importo: magg });
  }

  // Maggiorazioni per complessità
  if (
    data.irregolaritaPlanimetrica === 'molto' ||
    data.irregolaritaAltezza === 'molto'
  ) {
    const magg = Math.round(prezzoBase * 0.25);
    maggiorazioni.push({ descrizione: 'Irregolarità strutturale elevata (+25%)', importo: magg });
  }

  const elementiCriticiCount = data.elementiCritici.length;
  if (elementiCriticiCount >= 2) {
    const numeroGruppi = Math.floor(elementiCriticiCount / 2);
    const magg = Math.round(prezzoBase * 0.15 * numeroGruppi);
    maggiorazioni.push({
      descrizione: `${elementiCriticiCount} elementi critici (+15% ogni 2)`,
      importo: magg,
    });
  }

  // Maggiorazioni per documentazione mancante
  if (data.documentazioneDisponibile.includes('nessuna')) {
    maggiorazioni.push({ descrizione: 'Assenza documentazione completa', importo: 1500 });
  } else {
    if (!data.documentazioneDisponibile.includes('progetto')) {
      maggiorazioni.push({ descrizione: 'Assenza progetto originale', importo: 800 });
    }
    if (!data.documentazioneDisponibile.includes('relazione')) {
      maggiorazioni.push({ descrizione: 'Assenza relazione calcolo', importo: 600 });
    }
  }

  // Maggiorazione edificio vincolato
  if (data.criticitaParticolari.includes('vincolato')) {
    maggiorazioni.push({ descrizione: 'Edificio vincolato (Soprintendenza)', importo: 1200 });
  }

  // Servizi aggiuntivi
  const prezziAggiuntivi: Record<string, { label: string; prezzo: number }> = {
    rilievo: { label: 'Rilievo geometrico-strutturale', prezzo: 1200 },
    indaginiCA: { label: 'Indagini diagnostiche CA', prezzo: 2500 },
    indaginiMuratura: { label: 'Indagini muratura', prezzo: 2000 },
    laboratorio: { label: 'Prove materiali in laboratorio', prezzo: 1500 },
    geologica: { label: 'Relazione geologica/geotecnica', prezzo: 1800 },
    modellazione3d: { label: 'Modellazione 3D avanzata (pushover)', prezzo: 2200 },
    analisiNonLineare: { label: 'Analisi non lineare dinamica', prezzo: 3500 },
    coordinamento: { label: 'Coordinamento sicurezza (CSP/CSE)', prezzo: 2500 },
    praticaGenio: { label: 'Pratica Genio Civile', prezzo: 800 },
    durc: { label: 'DURC e documentazione appalto', prezzo: 500 },
  };

  data.serviziAggiuntivi.forEach((servizio) => {
    const serv = prezziAggiuntivi[servizio];
    if (serv) {
      serviziAggiuntivi.push({ descrizione: serv.label, importo: serv.prezzo });
    }
  });

  // Urgenza
  const fattoriUrgenza: Record<string, number> = {
    standard: 0,
    veloce: 0.15,
    urgente: 0.3,
    emergenza: 0.5,
  };

  const fattoreUrgenza = fattoriUrgenza[data.vincoliTemporali] || 0;
  let importoUrgenza = 0;
  if (fattoreUrgenza > 0) {
    const subtotale =
      prezzoBase +
      maggiorazioni.reduce((sum, v) => sum + v.importo, 0) +
      serviziAggiuntivi.reduce((sum, v) => sum + v.importo, 0);
    importoUrgenza = Math.round(subtotale * fattoreUrgenza);
  }

  // Costo trasferta
  const regione = data.regione || '';
  let costoTrasferta = 0;
  if (regione === 'Campania') {
    costoTrasferta = 120;
  } else if (
    ['Lazio', 'Puglia', 'Calabria', 'Basilicata', 'Molise', 'Abruzzo'].includes(regione)
  ) {
    costoTrasferta = 300;
  } else if (regione) {
    costoTrasferta = 600;
  }

  // Totale
  const totaleAggiuntivi = serviziAggiuntivi.reduce((sum, v) => sum + v.importo, 0);
  const totaleMaggiorazioni = maggiorazioni.reduce((sum, v) => sum + v.importo, 0);
  let totale =
    prezzoBase + totaleMaggiorazioni + totaleAggiuntivi + importoUrgenza + costoTrasferta;

  // Cap per intervento locale (max €8.000)
  if (data.servizioprincipale === 'intervento_locale') {
    const totaleServizio = prezzoBase + totaleMaggiorazioni + importoUrgenza;
    if (totaleServizio > 8000) {
      const differenza = totaleServizio - 8000;
      // Riduci maggiorazioni proporzionalmente per rientrare nel cap
      const fattoreRiduzione = (totaleMaggiorazioni - differenza) / totaleMaggiorazioni;
      maggiorazioni.forEach(magg => {
        magg.importo = Math.round(magg.importo * fattoreRiduzione);
      });
      totale = 8000 + totaleAggiuntivi + costoTrasferta;
    }
  }

  // Calcolo Sismabonus
  let sismabonus = null;
  if (data.interessatoSismabonus) {
    sismabonus = calcolaSismabonus(data.classeRischioAnte, data.classeRischioPost);
  }

  return {
    servizioBase: prezzoBase,
    nomeServizio,
    maggiorazioni,
    serviziAggiuntivi,
    urgenza: importoUrgenza,
    trasferta: costoTrasferta,
    totaleServiziAggiuntivi: totaleAggiuntivi,
    totaleGenerale: totale,
    sismabonus,
  };
}

// Funzione calcolo Sismabonus
function calcolaSismabonus(classeAnte: string, classePost: string) {
  const classi = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+'];
  const indiceAnte = classi.indexOf(classeAnte);
  const indicePost = classi.indexOf(classePost);

  const saltoClassi = indicePost - indiceAnte;

  let percentualeDetrazione = 0;
  let descrizione = '';

  if (saltoClassi >= 2) {
    percentualeDetrazione = 85;
    descrizione = 'Salto di 2 o più classi';
  } else if (saltoClassi === 1) {
    percentualeDetrazione = 75;
    descrizione = 'Salto di 1 classe';
  } else if (saltoClassi === 0) {
    percentualeDetrazione = 50;
    descrizione = 'Miglioramento senza salto';
  } else {
    percentualeDetrazione = 0;
    descrizione = 'Nessun miglioramento';
  }

  const detrazioneMassima = Math.round((96000 * percentualeDetrazione) / 100);

  return {
    saltoClassi,
    percentualeDetrazione,
    descrizione,
    detrazioneMassima,
  };
}

// Funzione colori classi
function getClasseColor(classe: string): string {
  const colori: Record<string, string> = {
    'A+': 'bg-green-600 text-white',
    A: 'bg-green-500 text-white',
    B: 'bg-yellow-400 text-gray-900',
    C: 'bg-yellow-500 text-gray-900',
    D: 'bg-orange-400 text-white',
    E: 'bg-orange-500 text-white',
    F: 'bg-red-500 text-white',
    G: 'bg-red-700 text-white',
  };
  return colori[classe] || 'bg-gray-300 text-gray-700';
}
