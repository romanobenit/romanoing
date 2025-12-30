'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  Download,
  Send,
  Info,
  Home,
  Building2,
  Castle,
  ArrowUpRight,
  ArrowUp,
  Triangle,
  Landmark,
  Mountain,
  Droplet,
  HardHat,
  Gift,
  Camera,
  FileCheck,
  Layers,
  MapPin,
  FileText,
  X,
  Upload
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-ampliamento-data';

// Regioni Italia
const REGIONI_ITALIA = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

// Dimensioni ampliamento
const DIMENSIONI_AMPLIAMENTO = [
  {
    id: 'fino-30',
    nome: 'MINI',
    descrizione: 'Fino a 30 mq',
    icon: Home,
    prezzoBase: 3000,
    badge: '💚 PIÙ VELOCE'
  },
  {
    id: '30-60',
    nome: 'STANDARD',
    descrizione: '30-60 mq',
    icon: Building2,
    prezzoBase: 5000,
    badge: '⭐ PIÙ RICHIESTO'
  },
  {
    id: '60-100',
    nome: 'GRANDE',
    descrizione: '60-100 mq',
    icon: Layers,
    prezzoBase: 8000
  },
  {
    id: 'oltre-100',
    nome: 'EXTRA',
    descrizione: 'Oltre 100 mq',
    icon: Castle,
    prezzoBase: 12000,
    badge: '🏆 PREMIUM'
  }
];

// Tipi di ampliamento
const TIPI_AMPLIAMENTO = [
  {
    id: 'orizzontale',
    nome: 'ORIZZONTALE',
    descrizione: 'Ampliamento in larghezza',
    pratica: 'Permesso di Costruire',
    icon: ArrowUpRight,
    moltiplicatore: 1.0,
    badge: '📐 STANDARD'
  },
  {
    id: 'verticale',
    nome: 'VERTICALE',
    descrizione: 'Sopraelevazione',
    pratica: 'Permesso + Strutturale',
    icon: ArrowUp,
    moltiplicatore: 1.4,
    badge: '🏗️ COMPLESSO'
  },
  {
    id: 'sottotetto',
    nome: 'SOTTOTETTO',
    descrizione: 'Recupero mansarda',
    pratica: 'Permesso/SCIA (secondo regione)',
    icon: Triangle,
    moltiplicatore: 1.2,
    badge: '⚡ AGEVOLATO'
  }
];

// Servizi aggiuntivi
const SERVIZI_AGGIUNTIVI = [
  {
    id: 'progetto-strutturale',
    nome: 'Progetto Strutturale Completo',
    icon: Layers,
    costoPercentuale: 0.50,
    descrizione: 'Calcoli strutturali + deposito genio civile'
  },
  {
    id: 'direzione-lavori',
    nome: 'Direzione Lavori',
    icon: HardHat,
    costo: 800,
    descrizione: 'Supervisione cantiere e sicurezza'
  },
  {
    id: 'bonus-edilizi',
    nome: 'Pratiche Bonus Edilizi',
    icon: Gift,
    costo: 600,
    descrizione: 'Bonus Ristrutturazione, Eco-bonus, Sisma-bonus'
  },
  {
    id: 'render-3d',
    nome: 'Render 3D Fotorealistici',
    icon: Camera,
    costo: 400,
    descrizione: '3-5 viste esterne/interne'
  },
  {
    id: 'due-diligence',
    nome: 'Due Diligence Preliminare',
    icon: FileCheck,
    costo: 500,
    descrizione: 'Verifica fattibilità urbanistica + catastale'
  }
];

interface ConfiguratoreAmpiamentoData {
  // Sezione 1
  dimensione: string;

  // Sezione 2
  tipoAmpliamento: string;

  // Sezione 3
  centroStorico: boolean;
  vincoloPaesaggistico: boolean;
  vincoloIdrogeologico: boolean;
  serviziAggiuntivi: string[];
  descrizioneProgetto: string;

  // Sezione 4
  nomeCliente: string;
  emailCliente: string;
  telefono: string;
  comune: string;
  regione: string;
  privacyAccettata: boolean;
  termsAccettati: boolean;
}

const initialData: ConfiguratoreAmpiamentoData = {
  dimensione: '',
  tipoAmpliamento: '',
  centroStorico: false,
  vincoloPaesaggistico: false,
  vincoloIdrogeologico: false,
  serviziAggiuntivi: [],
  descrizioneProgetto: '',
  nomeCliente: '',
  emailCliente: '',
  telefono: '',
  comune: '',
  regione: '',
  privacyAccettata: false,
  termsAccettati: false
};

interface Preventivo {
  prezzoBase: number;
  moltiplicatoreTipo: number;
  prezzoConTipo: number;
  moltiplicatoreVincoli: number;
  prezzoConVincoli: number;
  costoServizi: number;
  totale: number;
  tempi: string;
}

export default function ConfiguratoreAmpliamento() {
  const [currentSection, setCurrentSection] = useState(1);
  const [data, setData] = useState<ConfiguratoreAmpiamentoData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const updateData = (field: keyof ConfiguratoreAmpiamentoData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleServizio = (servizioId: string) => {
    setData((prev) => {
      const newServizi = prev.serviziAggiuntivi.includes(servizioId)
        ? prev.serviziAggiuntivi.filter((s) => s !== servizioId)
        : [...prev.serviziAggiuntivi, servizioId];
      return { ...prev, serviziAggiuntivi: newServizi };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`Il file ${file.name} supera i 10MB`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`Il file ${file.name} non è un formato supportato`);
        return false;
      }
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData(parsed);
      } catch (error) {
        console.error('Errore parsing localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Calcola preventivo
  useEffect(() => {
    if (!data.dimensione || !data.tipoAmpliamento) {
      setPreventivo(null);
      return;
    }

    const dimensioneObj = DIMENSIONI_AMPLIAMENTO.find(d => d.id === data.dimensione);
    const tipoObj = TIPI_AMPLIAMENTO.find(t => t.id === data.tipoAmpliamento);

    if (!dimensioneObj || !tipoObj) return;

    const prezzoBase = dimensioneObj.prezzoBase;
    const moltiplicatoreTipo = tipoObj.moltiplicatore;
    const prezzoConTipo = Math.round(prezzoBase * moltiplicatoreTipo);

    let moltiplicatoreVincoli = 1.0;
    if (data.centroStorico) moltiplicatoreVincoli += 0.40;
    if (data.vincoloPaesaggistico) moltiplicatoreVincoli += 0.30;
    if (data.vincoloIdrogeologico) moltiplicatoreVincoli += 0.25;

    const prezzoConVincoli = Math.round(prezzoConTipo * moltiplicatoreVincoli);

    let costoServizi = 0;
    if (data.serviziAggiuntivi.includes('progetto-strutturale')) {
      costoServizi += Math.round(prezzoBase * 0.50);
    }
    if (data.serviziAggiuntivi.includes('direzione-lavori')) {
      costoServizi += 800;
    }
    if (data.serviziAggiuntivi.includes('bonus-edilizi')) {
      costoServizi += 600;
    }
    if (data.serviziAggiuntivi.includes('render-3d')) {
      costoServizi += 400;
    }
    if (data.serviziAggiuntivi.includes('due-diligence')) {
      costoServizi += 500;
    }

    const totale = prezzoConVincoli + costoServizi;

    const tempiBase: Record<string, string> = {
      'orizzontale': '6-8 settimane',
      'verticale': '8-10 settimane',
      'sottotetto': '5-7 settimane'
    };

    let tempi = tempiBase[data.tipoAmpliamento] || '6-8 settimane';
    if (data.centroStorico || data.vincoloPaesaggistico) {
      tempi += ' (+2-3 settimane per autorizzazioni)';
    }

    setPreventivo({
      prezzoBase,
      moltiplicatoreTipo,
      prezzoConTipo,
      moltiplicatoreVincoli,
      prezzoConVincoli,
      costoServizi,
      totale,
      tempi
    });
  }, [data]);

  const getProgress = () => {
    if (!data.dimensione) return 0;
    if (!data.tipoAmpliamento) return 33;
    if (!data.comune || !data.regione) return 66;
    if (!data.nomeCliente || !data.emailCliente) return 90;
    return 100;
  };

  const clearData = () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      localStorage.removeItem(STORAGE_KEY);
      setUploadedFiles([]);
      window.location.reload();
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const sendEmail = async () => {
    if (!data.nomeCliente || !data.emailCliente || !data.privacyAccettata) {
      alert('Compila tutti i campi obbligatori e accetta Privacy Policy');
      return;
    }

    setEmailSending(true);
    try {
      const fileInfo = uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      const response = await fetch('/api/configuratore/ampliamento/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          preventivo,
          files: fileInfo
        }),
      });

      if (response.ok) {
        alert('Richiesta inviata con successo! Ti contatteremo entro 48 ore.');
      } else {
        alert('Errore nell\'invio della richiesta');
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      alert('Errore nell\'invio della richiesta');
    } finally {
      setEmailSending(false);
    }
  };

  const getDimensioneObj = () => DIMENSIONI_AMPLIAMENTO.find(d => d.id === data.dimensione);
  const getTipoObj = () => TIPI_AMPLIAMENTO.find(t => t.id === data.tipoAmpliamento);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-purple-100 hover:text-white mb-4 text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Torna alla home
          </Link>
          <h1 className="text-4xl font-bold mb-3">Configuratore Ampliamento</h1>
          <p className="text-purple-100 text-lg">
            Ottieni un preventivo personalizzato per il tuo progetto di ampliamento in 4 semplici passaggi
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso: {getProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentSection === 1 && '1️⃣ Dimensione Ampliamento'}
                  {currentSection === 2 && '2️⃣ Tipo Ampliamento'}
                  {currentSection === 3 && '3️⃣ Personalizzazione'}
                  {currentSection === 4 && '4️⃣ I tuoi dati'}
                </CardTitle>
                <CardDescription>
                  {currentSection === 1 && 'Seleziona i metri quadri dell\'ampliamento desiderato'}
                  {currentSection === 2 && 'Scegli il tipo di ampliamento più adatto'}
                  {currentSection === 3 && 'Aggiungi vincoli e servizi aggiuntivi'}
                  {currentSection === 4 && 'Inserisci i tuoi dati per ricevere il preventivo'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SEZIONE 1: Dimensione */}
                {currentSection === 1 && (
                  <div className="space-y-4">
                    <Label>Seleziona la dimensione dell'ampliamento</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DIMENSIONI_AMPLIAMENTO.map((dim) => {
                        const Icon = dim.icon;
                        const isSelected = data.dimensione === dim.id;
                        return (
                          <button
                            key={dim.id}
                            onClick={() => updateData('dimensione', dim.id)}
                            className={`relative p-6 border-2 rounded-xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 shadow-lg'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {dim.badge && (
                              <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                {dim.badge}
                              </div>
                            )}
                            <Icon className={`w-10 h-10 mb-3 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                            <div className="text-xl font-bold text-gray-900 mb-1">{dim.nome}</div>
                            <div className="text-sm text-gray-600 mb-3">{dim.descrizione}</div>
                            <div className="text-2xl font-bold text-purple-600">
                              €{dim.prezzoBase.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">prezzo base progettazione</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => setCurrentSection(2)}
                        disabled={!data.dimensione}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                      >
                        Continua <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SEZIONE 2: Tipo Ampliamento */}
                {currentSection === 2 && (
                  <div className="space-y-4">
                    <Label>Scegli il tipo di ampliamento</Label>
                    <div className="space-y-3">
                      {TIPI_AMPLIAMENTO.map((tipo) => {
                        const Icon = tipo.icon;
                        const isSelected = data.tipoAmpliamento === tipo.id;
                        return (
                          <button
                            key={tipo.id}
                            onClick={() => updateData('tipoAmpliamento', tipo.id)}
                            className={`w-full p-5 border-2 rounded-xl text-left transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <Icon className={`w-8 h-8 flex-shrink-0 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg font-bold text-gray-900">{tipo.nome}</span>
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                                    {tipo.badge}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">{tipo.descrizione}</div>
                                <div className="text-xs text-gray-500 mb-2">
                                  📋 Pratica: <span className="font-medium">{tipo.pratica}</span>
                                </div>
                                {tipo.moltiplicatore !== 1.0 && (
                                  <div className="text-sm font-semibold text-purple-600">
                                    +{Math.round((tipo.moltiplicatore - 1) * 100)}% complessità progettuale
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button onClick={() => setCurrentSection(1)} variant="outline">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Indietro
                      </Button>
                      <Button
                        onClick={() => setCurrentSection(3)}
                        disabled={!data.tipoAmpliamento}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                      >
                        Continua <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SEZIONE 3: Personalizzazione */}
                {currentSection === 3 && (
                  <div className="space-y-6">
                    {/* Vincoli */}
                    <div>
                      <Label className="mb-3 block">🏛️ Vincoli territoriali</Label>
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all">
                          <input
                            type="checkbox"
                            checked={data.centroStorico}
                            onChange={(e) => updateData('centroStorico', e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Landmark className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-gray-900">Centro storico / Zona vincolata</span>
                            </div>
                            <p className="text-sm text-gray-600">+40% complessità iter autorizzativo</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all">
                          <input
                            type="checkbox"
                            checked={data.vincoloPaesaggistico}
                            onChange={(e) => updateData('vincoloPaesaggistico', e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Mountain className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-gray-900">Vincolo paesaggistico</span>
                            </div>
                            <p className="text-sm text-gray-600">+30% per autorizzazione paesaggistica</p>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all">
                          <input
                            type="checkbox"
                            checked={data.vincoloIdrogeologico}
                            onChange={(e) => updateData('vincoloIdrogeologico', e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Droplet className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-gray-900">Vincolo idrogeologico</span>
                            </div>
                            <p className="text-sm text-gray-600">+25% per valutazione idrogeologica</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Servizi aggiuntivi */}
                    <div>
                      <Label className="mb-3 block">⚙️ Servizi aggiuntivi (opzionali)</Label>
                      <div className="space-y-3">
                        {SERVIZI_AGGIUNTIVI.map((servizio) => {
                          const Icon = servizio.icon;
                          const isSelected = data.serviziAggiuntivi.includes(servizio.id);
                          const costo = servizio.costo
                            ? `€${servizio.costo}`
                            : `+${Math.round((servizio.costoPercentuale || 0) * 100)}% del base`;

                          return (
                            <button
                              key={servizio.id}
                              onClick={() => toggleServizio(servizio.id)}
                              className={`w-full flex items-start gap-3 p-4 border-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 mb-1">{servizio.nome}</div>
                                <div className="text-sm text-gray-600 mb-1">{servizio.descrizione}</div>
                                <div className="text-sm font-semibold text-purple-600">{costo}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Descrizione progetto */}
                    <div>
                      <Label htmlFor="descrizioneProgetto">📝 Descrivi il tuo progetto</Label>
                      <textarea
                        id="descrizioneProgetto"
                        value={data.descrizioneProgetto}
                        onChange={(e) => updateData('descrizioneProgetto', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
                        rows={4}
                        placeholder="Esempio: Voglio realizzare una sopraelevazione di circa 50 mq per creare un nuovo appartamento indipendente..."
                      />
                    </div>

                    {/* Upload Documentazione */}
                    <div>
                      <Label className="mb-2 block">📎 Allega documentazione (opzionale)</Label>
                      <p className="text-xs text-gray-600 mb-3">
                        Planimetrie, foto edificio esistente, visure catastali (PDF, JPG, PNG, DOC - Max 10MB per file)
                      </p>

                      <div className="mb-4">
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                            <Upload className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Seleziona file da caricare
                            </span>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            File allegati ({uploadedFiles.length}):
                          </p>
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0"
                                type="button"
                              >
                                <X className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button onClick={() => setCurrentSection(2)} variant="outline">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Indietro
                      </Button>
                      <Button
                        onClick={() => setCurrentSection(4)}
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                      >
                        Continua <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* SEZIONE 4: Dati Cliente */}
                {currentSection === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nomeCliente">Nome e Cognome *</Label>
                        <Input
                          id="nomeCliente"
                          value={data.nomeCliente}
                          onChange={(e) => updateData('nomeCliente', e.target.value)}
                          placeholder="Mario Rossi"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emailCliente">Email *</Label>
                        <Input
                          id="emailCliente"
                          type="email"
                          value={data.emailCliente}
                          onChange={(e) => updateData('emailCliente', e.target.value)}
                          placeholder="mario.rossi@email.com"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telefono">Telefono (opzionale)</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={data.telefono}
                        onChange={(e) => updateData('telefono', e.target.value)}
                        placeholder="+39 333 123 4567"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="comune">Comune *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="comune"
                            value={data.comune}
                            onChange={(e) => updateData('comune', e.target.value)}
                            placeholder="es. Napoli"
                            className="pl-10 mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="regione">Regione *</Label>
                        <select
                          id="regione"
                          value={data.regione}
                          onChange={(e) => updateData('regione', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-1"
                        >
                          <option value="">Seleziona regione</option>
                          {REGIONI_ITALIA.map((regione) => (
                            <option key={regione} value={regione}>
                              {regione}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.privacyAccettata}
                          onChange={(e) => updateData('privacyAccettata', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                          Accetto la{' '}
                          <Link href="/legal/privacy" className="text-purple-600 underline" target="_blank">
                            Privacy Policy
                          </Link>{' '}
                          *
                        </span>
                      </label>

                      <label className="flex items-start gap-2 cursor-pointer mt-3">
                        <input
                          type="checkbox"
                          checked={data.termsAccettati}
                          onChange={(e) => updateData('termsAccettati', e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                          Accetto i{' '}
                          <Link href="/legal/terms" className="text-purple-600 underline" target="_blank">
                            Termini e Condizioni
                          </Link>{' '}
                          *
                        </span>
                      </label>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex gap-2">
                        <Info className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                          <p className="font-medium mb-1">Cosa succede dopo?</p>
                          <p>
                            Un nostro tecnico valuterà la fattibilità del tuo progetto e ti invierà un preventivo
                            dettagliato personalizzato entro <strong>48 ore</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button onClick={() => setCurrentSection(3)} variant="outline">
                        <ChevronLeft className="w-4 h-4 mr-2" /> Indietro
                      </Button>
                      <div className="flex gap-3">
                        <Button onClick={clearData} variant="outline">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancella
                        </Button>
                        <Button onClick={downloadPDF} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          onClick={sendEmail}
                          disabled={!data.privacyAccettata || !data.termsAccettati || emailSending}
                          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {emailSending ? 'Invio...' : 'Richiedi Preventivo'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardTitle className="text-purple-900">📋 Riepilogo Preventivo</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!preventivo ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-gray-600 text-sm">
                        Seleziona dimensione e tipo di ampliamento per vedere il preventivo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Dimensione */}
                      {getDimensioneObj() && (
                        <div className="pb-4 border-b border-purple-200">
                          <div className="text-sm font-bold text-purple-900 mb-2">📏 DIMENSIONE</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {getDimensioneObj()?.nome} - {getDimensioneObj()?.descrizione}
                          </div>
                          <div className="text-sm text-gray-600">
                            Base: €{preventivo.prezzoBase.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Tipo */}
                      {getTipoObj() && (
                        <div className="pb-4 border-b border-purple-200">
                          <div className="text-sm font-bold text-purple-900 mb-2">🏗️ TIPO AMPLIAMENTO</div>
                          <div className="text-lg font-semibold text-gray-900">{getTipoObj()?.nome}</div>
                          <div className="text-sm text-gray-600">{getTipoObj()?.descrizione}</div>
                          {preventivo.moltiplicatoreTipo !== 1.0 && (
                            <div className="text-sm text-purple-600 font-medium mt-1">
                              x{preventivo.moltiplicatoreTipo} = €{preventivo.prezzoConTipo.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vincoli */}
                      {preventivo.moltiplicatoreVincoli > 1.0 && (
                        <div className="pb-4 border-b border-purple-200">
                          <div className="text-sm font-bold text-purple-900 mb-2">🏛️ VINCOLI</div>
                          <div className="space-y-1 text-sm text-gray-700 mb-2">
                            {data.centroStorico && <div>• Centro storico (+40%)</div>}
                            {data.vincoloPaesaggistico && <div>• Vincolo paesaggistico (+30%)</div>}
                            {data.vincoloIdrogeologico && <div>• Vincolo idrogeologico (+25%)</div>}
                          </div>
                          <div className="text-sm text-purple-600 font-medium">
                            Subtotale: €{preventivo.prezzoConVincoli.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Servizi */}
                      {preventivo.costoServizi > 0 && (
                        <div className="pb-4 border-b border-purple-200">
                          <div className="text-sm font-bold text-purple-900 mb-2">⚙️ SERVIZI AGGIUNTIVI</div>
                          <div className="space-y-1 text-sm text-gray-700">
                            {data.serviziAggiuntivi.map((servizioId) => {
                              const servizio = SERVIZI_AGGIUNTIVI.find((s) => s.id === servizioId);
                              if (!servizio) return null;
                              const costo = servizio.costo
                                ? servizio.costo
                                : Math.round(preventivo.prezzoBase * (servizio.costoPercentuale || 0));
                              return (
                                <div key={servizioId}>
                                  • {servizio.nome}: €{costo.toLocaleString()}
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-sm text-purple-600 font-medium mt-2">
                            Totale servizi: €{preventivo.costoServizi.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Totale */}
                      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-4 rounded-lg">
                        <div className="text-sm font-bold mb-1">💰 TOTALE PREVENTIVO</div>
                        <div className="text-3xl font-bold">€{preventivo.totale.toLocaleString()}</div>
                        <div className="text-xs text-purple-100 mt-1">IVA esclusa</div>
                      </div>

                      {/* Tempi */}
                      <div className="pt-4 border-t border-purple-200">
                        <div className="text-sm font-bold text-purple-900 mb-2">⏰ TEMPI STIMATI</div>
                        <div className="text-sm text-gray-700">{preventivo.tempi}</div>
                      </div>

                      {/* Note */}
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <div className="text-xs text-amber-800">
                          <p className="font-medium mb-1">📌 Nota importante</p>
                          <p>
                            Questo è un preventivo indicativo. Il costo finale verrà definito dopo sopralluogo
                            e verifica fattibilità tecnico-urbanistica.
                          </p>
                        </div>
                      </div>
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
