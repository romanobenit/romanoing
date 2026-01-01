'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
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
  Upload,
  Sparkles,
  Check,
  ChevronRight
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
    dettaglio: 'Ideale per piccoli ampliamenti',
    icon: Home,
    prezzoBase: 3000,
    badge: 'PIÙ VELOCE',
    color: 'emerald'
  },
  {
    id: '30-60',
    nome: 'STANDARD',
    descrizione: '30-60 mq',
    dettaglio: 'La scelta più popolare',
    icon: Building2,
    prezzoBase: 5000,
    badge: 'PIÙ RICHIESTO',
    color: 'blue',
    popular: true
  },
  {
    id: '60-100',
    nome: 'GRANDE',
    descrizione: '60-100 mq',
    dettaglio: 'Ampliamenti importanti',
    icon: Layers,
    prezzoBase: 8000,
    color: 'purple'
  },
  {
    id: 'oltre-100',
    nome: 'EXTRA',
    descrizione: 'Oltre 100 mq',
    dettaglio: 'Soluzioni premium su misura',
    icon: Castle,
    prezzoBase: 12000,
    badge: 'PREMIUM',
    color: 'amber'
  }
];

// Tipi di ampliamento
const TIPI_AMPLIAMENTO = [
  {
    id: 'orizzontale',
    nome: 'ORIZZONTALE',
    descrizione: 'Ampliamento in larghezza',
    dettaglio: 'Estensione laterale dell\'edificio esistente',
    pratica: 'Permesso di Costruire',
    icon: ArrowUpRight,
    moltiplicatore: 1.0,
    badge: 'STANDARD',
    tempi: '6-8 settimane'
  },
  {
    id: 'verticale',
    nome: 'VERTICALE',
    descrizione: 'Sopraelevazione',
    dettaglio: 'Aggiunta di uno o più piani superiori',
    pratica: 'Permesso + Strutturale',
    icon: ArrowUp,
    moltiplicatore: 1.4,
    badge: 'COMPLESSO',
    tempi: '8-10 settimane'
  },
  {
    id: 'sottotetto',
    nome: 'SOTTOTETTO',
    descrizione: 'Recupero mansarda',
    dettaglio: 'Trasformazione sottotetto in abitabile',
    pratica: 'Permesso/SCIA (secondo regione)',
    icon: Triangle,
    moltiplicatore: 1.2,
    badge: 'AGEVOLATO',
    tempi: '5-7 settimane'
  }
];

// Servizi aggiuntivi
const SERVIZI_AGGIUNTIVI = [
  {
    id: 'progetto-strutturale',
    nome: 'Progetto Strutturale Completo',
    icon: Layers,
    costoPercentuale: 0.50,
    descrizione: 'Calcoli strutturali + deposito genio civile',
    dettaglio: 'Indispensabile per ampliamenti verticali e sopraelevazioni'
  },
  {
    id: 'direzione-lavori',
    nome: 'Direzione Lavori',
    icon: HardHat,
    costo: 800,
    descrizione: 'Supervisione cantiere e sicurezza',
    dettaglio: 'Coordinamento impresa e verifiche in opera'
  },
  {
    id: 'bonus-edilizi',
    nome: 'Pratiche Bonus Edilizi',
    icon: Gift,
    costo: 600,
    descrizione: 'Bonus Ristrutturazione, Eco-bonus, Sisma-bonus',
    dettaglio: 'Massimizza le detrazioni fiscali disponibili'
  },
  {
    id: 'render-3d',
    nome: 'Render 3D Fotorealistici',
    icon: Camera,
    costo: 400,
    descrizione: '3-5 viste esterne/interne',
    dettaglio: 'Visualizzazione realistica del progetto finito'
  },
  {
    id: 'due-diligence',
    nome: 'Due Diligence Preliminare',
    icon: FileCheck,
    costo: 500,
    descrizione: 'Verifica fattibilità urbanistica + catastale',
    dettaglio: 'Analisi preventiva vincoli e normative'
  }
];

interface ConfiguratoreAmpiamentoData {
  dimensione: string;
  tipoAmpliamento: string;
  centroStorico: boolean;
  vincoloPaesaggistico: boolean;
  vincoloIdrogeologico: boolean;
  serviziAggiuntivi: string[];
  descrizioneProgetto: string;
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
  const [data, setData] = useState<ConfiguratoreAmpiamentoData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeSection, setActiveSection] = useState(1);

  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);

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
    const maxSize = 10 * 1024 * 1024;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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

    let tempi = tipoObj.tempi;
    if (data.centroStorico || data.vincoloPaesaggistico) {
      tempi += ' (+2-3 settimane autorizzazioni)';
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

  // Scroll spy per evidenziare sezione attiva
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { ref: section1Ref, id: 1 },
        { ref: section2Ref, id: 2 },
        { ref: section3Ref, id: 3 },
        { ref: section4Ref, id: 4 }
      ];

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const steps = [
    { number: 1, title: 'Dimensione', completed: !!data.dimensione },
    { number: 2, title: 'Tipo', completed: !!data.tipoAmpliamento },
    { number: 3, title: 'Personalizza', completed: data.comune && data.regione },
    { number: 4, title: 'Finalizza', completed: data.nomeCliente && data.emailCliente && data.privacyAccettata }
  ];

  const scrollToSection = (sectionNumber: number) => {
    const refs = [section1Ref, section2Ref, section3Ref, section4Ref];
    const targetRef = refs[sectionNumber - 1];
    if (targetRef.current) {
      const yOffset = -100;
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
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
              <Link href="/bundle/BDL-AMPLIAMENTO">
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
          <Link href="/bundle/BDL-AMPLIAMENTO" className="hover:text-blue-600">
            Bundle Ampliamento
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white py-12 overflow-hidden print:py-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 print:hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center print:w-12 print:h-12">
              <Sparkles className="w-8 h-8 text-white print:w-6 print:h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 print:text-3xl">Configuratore Ampliamento</h1>
              <p className="text-purple-100 text-lg print:text-base">
                Compila il form e ottieni il tuo preventivo personalizzato
              </p>
            </div>
          </div>

          {/* Step Indicator Visuale - Clickable */}
          <div className="mt-10 flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <button
                  onClick={() => scrollToSection(step.number)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    activeSection === step.number
                      ? 'bg-white text-purple-600 shadow-lg scale-110'
                      : step.completed
                      ? 'bg-purple-400 text-white group-hover:bg-purple-300'
                      : 'bg-white/20 text-white/60 group-hover:bg-white/30'
                  }`}>
                    {step.completed && activeSection !== step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    activeSection === step.number ? 'text-white' : 'text-purple-200 group-hover:text-white'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                    step.completed ? 'bg-purple-400' : 'bg-white/20'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form Unica Pagina */}
          <div className="lg:col-span-2 space-y-8">

            {/* SEZIONE 1: Dimensione */}
            <div ref={section1Ref} id="section-1">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Dimensione Ampliamento</CardTitle>
                      <CardDescription className="text-base">
                        Seleziona i metri quadri che vuoi aggiungere
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {DIMENSIONI_AMPLIAMENTO.map((dim) => {
                      const Icon = dim.icon;
                      const isSelected = data.dimensione === dim.id;
                      return (
                        <button
                          key={dim.id}
                          onClick={() => updateData('dimensione', dim.id)}
                          className={`group relative p-8 border-3 rounded-2xl text-left transition-all duration-500 ${
                            isSelected
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-2xl scale-105'
                              : 'border-gray-200 hover:border-purple-300 hover:shadow-xl hover:scale-102'
                          }`}
                        >
                          {dim.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                              ⭐ CONSIGLIATO
                            </div>
                          )}

                          {dim.badge && !dim.popular && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                              {dim.badge}
                            </div>
                          )}

                          <div className={`w-20 h-20 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-br from-purple-600 to-violet-600 shadow-xl'
                              : 'bg-gray-100 group-hover:bg-purple-100'
                          }`}>
                            <Icon className={`w-10 h-10 transition-colors ${
                              isSelected ? 'text-white' : 'text-gray-400 group-hover:text-purple-600'
                            }`} />
                          </div>

                          <div className="text-2xl font-bold text-gray-900 mb-2">{dim.nome}</div>
                          <div className="text-sm text-gray-600 mb-1">{dim.descrizione}</div>
                          <div className="text-xs text-gray-500 mb-4">{dim.dettaglio}</div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500">da</span>
                            <span className="text-3xl font-bold text-purple-600">
                              €{dim.prezzoBase.toLocaleString()}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="absolute bottom-4 right-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEZIONE 2: Tipo Ampliamento */}
            <div ref={section2Ref} id="section-2">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Tipo Ampliamento</CardTitle>
                      <CardDescription className="text-base">
                        Scegli la tipologia di ampliamento
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                  <div className="space-y-4">
                    {TIPI_AMPLIAMENTO.map((tipo) => {
                      const Icon = tipo.icon;
                      const isSelected = data.tipoAmpliamento === tipo.id;
                      return (
                        <button
                          key={tipo.id}
                          onClick={() => updateData('tipoAmpliamento', tipo.id)}
                          className={`w-full p-6 border-3 rounded-2xl text-left transition-all duration-500 ${
                            isSelected
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-2xl scale-102'
                              : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg'
                                : 'bg-gray-100'
                            }`}>
                              <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl font-bold text-gray-900">{tipo.nome}</span>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                  {tipo.badge}
                                </span>
                              </div>

                              <div className="text-base text-gray-700 mb-2">{tipo.descrizione}</div>
                              <div className="text-sm text-gray-500 mb-3">{tipo.dettaglio}</div>

                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg">
                                  <FileCheck className="w-4 h-4 text-purple-600" />
                                  <span className="text-gray-700">{tipo.pratica}</span>
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg">
                                  <Info className="w-4 h-4 text-purple-600" />
                                  <span className="text-gray-700">Tempi: {tipo.tempi}</span>
                                </div>
                                {tipo.moltiplicatore !== 1.0 && (
                                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                                    +{Math.round((tipo.moltiplicatore - 1) * 100)}% complessità
                                  </div>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEZIONE 3: Personalizzazione */}
            <div ref={section3Ref} id="section-3">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Personalizzazione</CardTitle>
                      <CardDescription className="text-base">
                        Aggiungi vincoli e servizi aggiuntivi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                  <div className="space-y-8">
                    {/* Vincoli */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Landmark className="w-5 h-5 text-purple-600" />
                        <Label className="text-lg font-bold">Vincoli territoriali</Label>
                      </div>
                      <div className="space-y-3">
                        {[
                          { id: 'centroStorico', icon: Landmark, label: 'Centro storico / Zona vincolata', perc: '+40%' },
                          { id: 'vincoloPaesaggistico', icon: Mountain, label: 'Vincolo paesaggistico', perc: '+30%' },
                          { id: 'vincoloIdrogeologico', icon: Droplet, label: 'Vincolo idrogeologico', perc: '+25%' }
                        ].map((vincolo) => {
                          const Icon = vincolo.icon;
                          const isChecked = data[vincolo.id as keyof ConfiguratoreAmpiamentoData];
                          return (
                            <label
                              key={vincolo.id}
                              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                                isChecked
                                  ? 'border-purple-500 bg-purple-50 shadow-md'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                isChecked ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                              }`}>
                                {isChecked && <Check className="w-4 h-4 text-white" />}
                              </div>
                              <Icon className={`w-5 h-5 ${isChecked ? 'text-purple-600' : 'text-gray-400'}`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{vincolo.label}</div>
                              </div>
                              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm">
                                {vincolo.perc}
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked as boolean}
                                onChange={(e) => updateData(vincolo.id as keyof ConfiguratoreAmpiamentoData, e.target.checked)}
                                className="hidden"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Servizi aggiuntivi */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <Label className="text-lg font-bold">Servizi aggiuntivi</Label>
                        <span className="text-sm text-gray-500">(opzionali)</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {SERVIZI_AGGIUNTIVI.map((servizio) => {
                          const Icon = servizio.icon;
                          const isSelected = data.serviziAggiuntivi.includes(servizio.id);
                          const costo = servizio.costo
                            ? `€${servizio.costo}`
                            : `+${Math.round((servizio.costoPercentuale || 0) * 100)}%`;

                          return (
                            <button
                              key={servizio.id}
                              onClick={() => toggleServizio(servizio.id)}
                              className={`flex items-start gap-4 p-5 border-2 rounded-xl text-left transition-all duration-300 ${
                                isSelected
                                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-lg'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>

                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isSelected ? 'bg-purple-100' : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 mb-1">{servizio.nome}</div>
                                <div className="text-sm text-gray-600 mb-1">{servizio.descrizione}</div>
                                <div className="text-xs text-gray-500">{servizio.dettaglio}</div>
                              </div>

                              <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold flex-shrink-0">
                                {costo}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Descrizione + Upload */}
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="descrizioneProgetto" className="text-base font-semibold mb-2 block">
                          📝 Descrivi il tuo progetto
                        </Label>
                        <textarea
                          id="descrizioneProgetto"
                          value={data.descrizioneProgetto}
                          onChange={(e) => updateData('descrizioneProgetto', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                          rows={4}
                          placeholder="Es: Voglio realizzare una sopraelevazione di circa 50 mq per creare un nuovo appartamento indipendente con accesso autonomo..."
                        />
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-2 block">
                          📎 Allega documentazione
                        </Label>
                        <p className="text-sm text-gray-600 mb-3">
                          Planimetrie, foto, visure catastali (PDF, JPG, PNG, DOC - Max 10MB/file)
                        </p>

                        <label className="cursor-pointer block">
                          <div className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all">
                            <Upload className="w-6 h-6 text-purple-600" />
                            <span className="text-base font-medium text-gray-700">
                              Clicca per selezionare i file
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

                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                  </div>
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
                                  className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <X className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEZIONE 4: Dati Cliente */}
            <div ref={section4Ref} id="section-4">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div>
                      <CardTitle className="text-2xl">I tuoi dati</CardTitle>
                      <CardDescription className="text-base">
                        Completa con i tuoi dati di contatto
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="nomeCliente" className="text-base font-semibold">Nome e Cognome *</Label>
                        <Input
                          id="nomeCliente"
                          value={data.nomeCliente}
                          onChange={(e) => updateData('nomeCliente', e.target.value)}
                          placeholder="Mario Rossi"
                          className="mt-2 h-12 border-2 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emailCliente" className="text-base font-semibold">Email *</Label>
                        <Input
                          id="emailCliente"
                          type="email"
                          value={data.emailCliente}
                          onChange={(e) => updateData('emailCliente', e.target.value)}
                          placeholder="mario.rossi@email.com"
                          className="mt-2 h-12 border-2 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telefono" className="text-base font-semibold">Telefono</Label>
                      <Input
                        id="telefono"
                        type="tel"
                        value={data.telefono}
                        onChange={(e) => updateData('telefono', e.target.value)}
                        placeholder="+39 333 123 4567"
                        className="mt-2 h-12 border-2 focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="comune" className="text-base font-semibold">Comune *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="comune"
                            value={data.comune}
                            onChange={(e) => updateData('comune', e.target.value)}
                            placeholder="es. Napoli"
                            className="pl-11 mt-2 h-12 border-2 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="regione" className="text-base font-semibold">Regione *</Label>
                        <select
                          id="regione"
                          value={data.regione}
                          onChange={(e) => updateData('regione', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-md px-3 h-12 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mt-2"
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

                    <div className="pt-6 space-y-4 border-t-2 border-gray-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          data.privacyAccettata ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                        }`}>
                          {data.privacyAccettata && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700">
                          Accetto la{' '}
                          <Link href="/legal/privacy" className="text-purple-600 underline font-semibold hover:text-purple-700" target="_blank">
                            Privacy Policy
                          </Link>{' '}
                          *
                        </span>
                        <input
                          type="checkbox"
                          checked={data.privacyAccettata}
                          onChange={(e) => updateData('privacyAccettata', e.target.checked)}
                          className="hidden"
                        />
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          data.termsAccettati ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                        }`}>
                          {data.termsAccettati && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700">
                          Accetto i{' '}
                          <Link href="/legal/terms" className="text-purple-600 underline font-semibold hover:text-purple-700" target="_blank">
                            Termini e Condizioni
                          </Link>{' '}
                          *
                        </span>
                        <input
                          type="checkbox"
                          checked={data.termsAccettati}
                          onChange={(e) => updateData('termsAccettati', e.target.checked)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border-2 border-purple-200">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Info className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-2">Cosa succede dopo?</p>
                          <p className="text-sm text-gray-700">
                            Un nostro tecnico specializzato valuterà la fattibilità del tuo progetto di ampliamento
                            e ti invierà un <strong>preventivo dettagliato personalizzato</strong> entro <strong className="text-purple-600">48 ore</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottoni Finali */}
                    <div className="flex flex-wrap gap-3 pt-6">
                      <Button onClick={clearData} variant="outline" size="lg">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Cancella
                      </Button>
                      <Button onClick={downloadPDF} variant="outline" size="lg">
                        <Download className="w-5 h-5 mr-2" />
                        PDF
                      </Button>
                      <Button
                        onClick={sendEmail}
                        disabled={!data.privacyAccettata || !data.termsAccettati || emailSending}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-6 text-lg shadow-2xl hover:shadow-3xl transition-all flex-1"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {emailSending ? 'Invio in corso...' : 'Richiedi Preventivo'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Right Column - Preview Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-6 h-6" />
                    <CardTitle className="text-white text-xl">Il Tuo Preventivo</CardTitle>
                  </div>
                  <p className="text-purple-100 text-sm">Configurazione in tempo reale</p>
                </div>

                <CardContent className="pt-6">
                  {!preventivo ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Info className="w-10 h-10 text-purple-600" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Seleziona dimensione e tipo<br />di ampliamento per vedere<br />il preventivo
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Dimensione */}
                      {getDimensioneObj() && (
                        <div className="pb-6 border-b-2 border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Home className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-sm font-bold text-purple-900">DIMENSIONE</div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 mb-1">
                            {getDimensioneObj()?.nome}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{getDimensioneObj()?.descrizione}</div>
                          <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold">
                            Base: €{preventivo.prezzoBase.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Tipo */}
                      {getTipoObj() && (
                        <div className="pb-6 border-b-2 border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <ArrowUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-sm font-bold text-purple-900">TIPOLOGIA</div>
                          </div>
                          <div className="text-xl font-bold text-gray-900 mb-1">{getTipoObj()?.nome}</div>
                          <div className="text-sm text-gray-600 mb-2">{getTipoObj()?.descrizione}</div>
                          {preventivo.moltiplicatoreTipo !== 1.0 && (
                            <div className="inline-block px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-bold">
                              ×{preventivo.moltiplicatoreTipo} = €{preventivo.prezzoConTipo.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vincoli */}
                      {preventivo.moltiplicatoreVincoli > 1.0 && (
                        <div className="pb-6 border-b-2 border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Landmark className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="text-sm font-bold text-amber-900">VINCOLI</div>
                          </div>
                          <div className="space-y-2 text-sm text-gray-700 mb-3">
                            {data.centroStorico && (
                              <div className="flex items-center justify-between">
                                <span>• Centro storico</span>
                                <span className="font-semibold text-amber-600">+40%</span>
                              </div>
                            )}
                            {data.vincoloPaesaggistico && (
                              <div className="flex items-center justify-between">
                                <span>• Vincolo paesaggistico</span>
                                <span className="font-semibold text-amber-600">+30%</span>
                              </div>
                            )}
                            {data.vincoloIdrogeologico && (
                              <div className="flex items-center justify-between">
                                <span>• Vincolo idrogeologico</span>
                                <span className="font-semibold text-amber-600">+25%</span>
                              </div>
                            )}
                          </div>
                          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold">
                            Subtotale: €{preventivo.prezzoConVincoli.toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Servizi */}
                      {preventivo.costoServizi > 0 && (
                        <div className="pb-6 border-b-2 border-purple-100">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-sm font-bold text-blue-900">SERVIZI EXTRA</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            {data.serviziAggiuntivi.map((servizioId) => {
                              const servizio = SERVIZI_AGGIUNTIVI.find((s) => s.id === servizioId);
                              if (!servizio) return null;
                              const costo = servizio.costo
                                ? servizio.costo
                                : Math.round(preventivo.prezzoBase * (servizio.costoPercentuale || 0));
                              return (
                                <div key={servizioId} className="flex items-center justify-between text-gray-700">
                                  <span>• {servizio.nome}</span>
                                  <span className="font-semibold text-blue-600">€{costo.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Totale */}
                      <div className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white p-6 rounded-2xl shadow-xl">
                        <div className="text-sm font-bold mb-2 text-purple-100">💰 TOTALE PREVENTIVO</div>
                        <div className="text-5xl font-bold mb-2">€{preventivo.totale.toLocaleString()}</div>
                        <div className="text-xs text-purple-100">+ IVA di legge</div>
                      </div>

                      {/* Tempi */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                        <div className="text-xs font-bold text-blue-900 mb-2">⏰ TEMPI STIMATI</div>
                        <div className="text-sm text-gray-700 leading-relaxed">{preventivo.tempi}</div>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                        <div className="text-xs text-amber-800 leading-relaxed">
                          <p className="font-bold mb-1">📌 Nota importante</p>
                          <p>
                            Preventivo indicativo. Il costo finale sarà definito dopo sopralluogo
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
