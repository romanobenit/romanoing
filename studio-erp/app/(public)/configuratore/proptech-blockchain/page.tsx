'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Check,
  FileText,
  Code,
  Network,
  Lightbulb,
  Sparkles,
  Shield,
  Coins,
  BarChart3,
  Blocks,
  Globe,
  Users,
  ChevronDown,
  Upload,
  X
} from 'lucide-react';
import Link from 'next/link';

interface FormData {
  // Sezione 1: Servizi
  servizioFattibilita: boolean;
  servizioPoc: boolean;
  servizioArchitettura: boolean;

  // Sezione 2: Opzioni PoC
  opzionePoc: 'essential' | 'interactive' | null;

  // Sezione 3: Personalizzazione
  tipologiaAsset: string;
  valoreStimatoAsset: string;
  obiettiviProgetto: string;
  tempisticheDesiderate: string;
  requirementsAggiuntivi: string;

  // Sezione 4: Dati Cliente
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  azienda: string;
  noteAggiuntive: string;
}

interface FileUpload {
  name: string;
  size: number;
  type: string;
  data: string;
}

const SERVIZI_RD = [
  {
    id: 'fattibilita',
    nome: 'Studio di Fattibilità',
    sottotitolo: 'Tokenizzazione Immobiliare',
    descrizione: 'Analisi completa di fattibilità tecnica, economica e legale',
    icon: FileText,
    prezzoMin: 8000,
    prezzoMax: 15000,
    durata: '4-6 settimane',
    deliverables: [
      'Analisi asset e valutazione',
      'Struttura SPV e token economics',
      'Whitepaper tecnico',
      'Roadmap implementazione',
      'Framework compliance (MiFID II, MICA)',
      'File di lavoro (Excel, templates, diagrammi)'
    ],
    popular: true
  },
  {
    id: 'poc',
    nome: 'Proof of Concept',
    sottotitolo: 'Smart Contract + Dashboard MVP',
    descrizione: 'Sviluppo prototipo smart contract su testnet con interfaccia',
    icon: Code,
    prezzoMinEssential: 12000,
    prezzoMaxEssential: 18000,
    prezzoMinInteractive: 18000,
    prezzoMaxInteractive: 28000,
    durata: '6-12 settimane',
    deliverables: [
      'Smart contract Solidity (ERC-20/ERC-1400)',
      'Test suite completa',
      'Security assessment',
      'Deployment testnet',
      'Repository GitHub',
      'Dashboard Test MVP (opzione Interactive)'
    ],
    popular: true
  },
  {
    id: 'architettura',
    nome: 'Linee Guida Architettura',
    sottotitolo: 'Blockchain Infrastructure',
    descrizione: 'Raccomandazioni architetturali e scelta tecnologie',
    icon: Network,
    prezzoMin: 3000,
    prezzoMax: 5000,
    durata: '1-2 settimane',
    deliverables: [
      'Comparazione layer (Ethereum, Polygon, Arbitrum)',
      'Schema componenti essenziali',
      'Raccomandazioni tech stack',
      'Stime costi operativi',
      'Documento linee guida (10-15 pagine)'
    ]
  }
];

const OPZIONI_POC = [
  {
    id: 'essential',
    nome: 'Essential',
    descrizione: 'Solo Smart Contract',
    icon: Blocks,
    prezzoMin: 12000,
    prezzoMax: 18000,
    features: [
      'Smart contract Solidity',
      'Funzioni core (mint, burn, transfer)',
      'Test suite completa',
      'Security assessment',
      'Deployment testnet',
      'Documentazione tecnica'
    ]
  },
  {
    id: 'interactive',
    nome: 'Interactive + Dashboard',
    descrizione: 'Smart Contract + Interfaccia Web',
    icon: Globe,
    prezzoMin: 18000,
    prezzoMax: 28000,
    features: [
      'Tutto di Essential, più:',
      'Dashboard Test MVP Next.js',
      'Connessione wallet (MetaMask, WalletConnect)',
      'UI operazioni token',
      'Interfaccia governance',
      'Gestione rewards',
      'Deploy su Vercel testnet'
    ],
    popular: true
  }
];

const TIPOLOGIE_ASSET = [
  { id: 'residenziale', nome: 'Immobiliare Residenziale', icon: '🏘️' },
  { id: 'commerciale', nome: 'Immobiliare Commerciale', icon: '🏢' },
  { id: 'industriale', nome: 'Immobiliare Industriale', icon: '🏭' },
  { id: 'terreni', nome: 'Terreni e Aree', icon: '🌳' },
  { id: 'misto', nome: 'Portfolio Misto', icon: '📊' },
  { id: 'altro', nome: 'Altro Asset', icon: '💼' }
];

export default function ConfiguratorePropTechBlockchain() {
  const [formData, setFormData] = useState<FormData>({
    servizioFattibilita: false,
    servizioPoc: false,
    servizioArchitettura: false,
    opzionePoc: null,
    tipologiaAsset: '',
    valoreStimatoAsset: '',
    obiettiviProgetto: '',
    tempisticheDesiderate: '',
    requirementsAggiuntivi: '',
    nomeCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    azienda: '',
    noteAggiuntive: ''
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  // Refs per le sezioni
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);

  // Auto-save su localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('configuratore-proptech-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Errore nel caricamento dei dati salvati:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('configuratore-proptech-data', JSON.stringify(formData));
  }, [formData]);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const sections = [
        { id: 1, ref: section1Ref },
        { id: 2, ref: section2Ref },
        { id: 3, ref: section3Ref },
        { id: 4, ref: section4Ref }
      ];

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

  const scrollToSection = (sectionNumber: number) => {
    const refs = [section1Ref, section2Ref, section3Ref, section4Ref];
    const targetRef = refs[sectionNumber - 1];

    if (targetRef.current) {
      const yOffset = -100;
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUpload[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validazione dimensione (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Il file ${file.name} supera il limite di 10MB`);
        continue;
      }

      // Validazione tipo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(`Il file ${file.name} non è di un tipo supportato`);
        continue;
      }

      // Converti in base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            data: event.target.result as string
          });

          if (newFiles.length === selectedFiles.length || newFiles.length + files.length >= 5) {
            setFiles(prev => [...prev, ...newFiles].slice(0, 5));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const calcolaPreventivo = () => {
    let totaleMin = 0;
    let totaleMax = 0;
    const serviziInclusi: string[] = [];

    if (formData.servizioFattibilita) {
      totaleMin += SERVIZI_RD[0].prezzoMin;
      totaleMax += SERVIZI_RD[0].prezzoMax;
      serviziInclusi.push('Studio di Fattibilità');
    }

    if (formData.servizioPoc) {
      if (formData.opzionePoc === 'essential') {
        totaleMin += SERVIZI_RD[1].prezzoMinEssential;
        totaleMax += SERVIZI_RD[1].prezzoMaxEssential;
        serviziInclusi.push('PoC Essential');
      } else if (formData.opzionePoc === 'interactive') {
        totaleMin += SERVIZI_RD[1].prezzoMinInteractive;
        totaleMax += SERVIZI_RD[1].prezzoMaxInteractive;
        serviziInclusi.push('PoC Interactive + Dashboard');
      }
    }

    if (formData.servizioArchitettura) {
      totaleMin += SERVIZI_RD[2].prezzoMin;
      totaleMax += SERVIZI_RD[2].prezzoMax;
      serviziInclusi.push('Linee Guida Architettura');
    }

    // Sconto bundle se prende più servizi
    let scontoPercentuale = 0;
    if (serviziInclusi.length === 2) {
      scontoPercentuale = 10;
    } else if (serviziInclusi.length === 3) {
      scontoPercentuale = 15;
    }

    const totaleMinConSconto = Math.round(totaleMin * (1 - scontoPercentuale / 100));
    const totaleMaxConSconto = Math.round(totaleMax * (1 - scontoPercentuale / 100));

    return {
      totaleMin: totaleMinConSconto,
      totaleMax: totaleMaxConSconto,
      scontoPercentuale,
      serviziInclusi
    };
  };

  const preventivo = calcolaPreventivo();

  const handleSubmit = async () => {
    // Validazione
    if (!formData.servizioFattibilita && !formData.servizioPoc && !formData.servizioArchitettura) {
      alert('Seleziona almeno un servizio');
      scrollToSection(1);
      return;
    }

    if (formData.servizioPoc && !formData.opzionePoc) {
      alert('Seleziona un\'opzione per il Proof of Concept');
      scrollToSection(2);
      return;
    }

    if (!formData.tipologiaAsset) {
      alert('Seleziona la tipologia di asset');
      scrollToSection(3);
      return;
    }

    if (!formData.nomeCliente || !formData.emailCliente || !formData.telefonoCliente) {
      alert('Compila tutti i campi obbligatori dei dati cliente');
      scrollToSection(4);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/configuratore/proptech-blockchain/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formData,
          preventivo,
          files
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        localStorage.removeItem('configuratore-proptech-data');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Errore durante l\'invio. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante l\'invio. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center p-12 border-3 border-teal-200 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Richiesta Inviata con Successo! 🎉
            </h1>
            <p className="text-gray-600 mb-8">
              Grazie per il tuo interesse nei nostri servizi di R&D PropTech/Blockchain.
              <br />
              Ti contatteremo entro 24-48 ore per discutere i dettagli del progetto.
            </p>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                <Link href="/">
                  Torna alla Home
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    servizioFattibilita: false,
                    servizioPoc: false,
                    servizioArchitettura: false,
                    opzionePoc: null,
                    tipologiaAsset: '',
                    valoreStimatoAsset: '',
                    obiettiviProgetto: '',
                    tempisticheDesiderate: '',
                    requirementsAggiuntivi: '',
                    nomeCliente: '',
                    emailCliente: '',
                    telefonoCliente: '',
                    azienda: '',
                    noteAggiuntive: ''
                  });
                  setFiles([]);
                }}
              >
                Nuova Configurazione
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Servizi R&D', icon: Lightbulb, completed: formData.servizioFattibilita || formData.servizioPoc || formData.servizioArchitettura, ref: section1Ref },
    { number: 2, title: 'Opzioni PoC', icon: Code, completed: !formData.servizioPoc || formData.opzionePoc !== null, ref: section2Ref },
    { number: 3, title: 'Dettagli Progetto', icon: BarChart3, completed: formData.tipologiaAsset !== '', ref: section3Ref },
    { number: 4, title: 'Dati Cliente', icon: Users, completed: formData.nomeCliente !== '' && formData.emailCliente !== '', ref: section4Ref }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header Hero */}
      <div className="relative bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container mx-auto px-4 py-12 relative">
          <Link href="/" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Torna alla Home
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  R&D Services • ATECO 72.19
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Configuratore PropTech/Blockchain
                </h1>
              </div>
            </div>
            <p className="text-xl text-teal-50 max-w-3xl">
              Servizi di Ricerca & Sviluppo per tokenizzazione immobiliare, smart contract e architetture blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-teal-100 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  onClick={() => scrollToSection(step.number)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold
                    transition-all duration-500 transform
                    ${activeSection === step.number
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white scale-110 shadow-xl'
                      : step.completed && activeSection !== step.number
                      ? 'bg-teal-100 text-teal-600 group-hover:scale-105'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:scale-105'
                    }
                  `}>
                    {step.completed && activeSection !== step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium transition-colors hidden sm:block ${
                    activeSection === step.number ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded-full transition-all duration-500 ${
                    step.completed ? 'bg-gradient-to-r from-teal-400 to-cyan-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex-1 space-y-8">

            {/* Sezione 1: Servizi R&D */}
            <div ref={section1Ref} id="section-1">
              <Card className="border-3 border-teal-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Lightbulb className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Servizi di R&D</CardTitle>
                      <CardDescription className="text-teal-50 text-base mt-1">
                        Seleziona i servizi di ricerca e sviluppo di cui hai bisogno
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {SERVIZI_RD.map((servizio) => {
                      const isSelected =
                        (servizio.id === 'fattibilita' && formData.servizioFattibilita) ||
                        (servizio.id === 'poc' && formData.servizioPoc) ||
                        (servizio.id === 'architettura' && formData.servizioArchitettura);

                      return (
                        <button
                          key={servizio.id}
                          onClick={() => {
                            if (servizio.id === 'fattibilita') {
                              setFormData({ ...formData, servizioFattibilita: !formData.servizioFattibilita });
                            } else if (servizio.id === 'poc') {
                              setFormData({
                                ...formData,
                                servizioPoc: !formData.servizioPoc,
                                opzionePoc: !formData.servizioPoc ? formData.opzionePoc : null
                              });
                            } else if (servizio.id === 'architettura') {
                              setFormData({ ...formData, servizioArchitettura: !formData.servizioArchitettura });
                            }
                          }}
                          className={`group relative w-full p-8 border-3 rounded-2xl text-left transition-all duration-500 ${
                            isSelected
                              ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-2xl scale-102'
                              : 'border-gray-200 hover:border-teal-300 hover:shadow-xl hover:scale-101'
                          }`}
                        >
                          {servizio.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                              ⭐ CONSIGLIATO
                            </div>
                          )}

                          <div className="flex items-start gap-6">
                            <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                              isSelected
                                ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl scale-110'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 group-hover:from-teal-100 group-hover:to-cyan-100 group-hover:text-teal-600'
                            }`}>
                              <servizio.icon className="w-10 h-10" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                    {servizio.nome}
                                  </h3>
                                  <p className="text-teal-600 font-semibold">
                                    {servizio.sottotitolo}
                                  </p>
                                </div>
                                <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? 'border-teal-500 bg-teal-500'
                                    : 'border-gray-300 group-hover:border-teal-400'
                                }`}>
                                  {isSelected && <Check className="w-5 h-5 text-white" />}
                                </div>
                              </div>

                              <p className="text-gray-600 mb-4">
                                {servizio.descrizione}
                              </p>

                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-teal-600 border-teal-300">
                                    💰 €{servizio.id === 'poc' ? servizio.prezzoMinEssential.toLocaleString() : servizio.prezzoMin.toLocaleString()} - €{servizio.id === 'poc' ? servizio.prezzoMaxInteractive.toLocaleString() : servizio.prezzoMax.toLocaleString()}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                                    ⏱️ {servizio.durata}
                                  </Badge>
                                </div>
                              </div>

                              <div className="bg-white/50 rounded-lg p-4 border border-teal-100">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Deliverables:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {servizio.deliverables.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <Check className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 2: Opzioni PoC */}
            {formData.servizioPoc && (
              <div ref={section2Ref} id="section-2">
                <Card className="border-3 border-cyan-100 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Code className="w-8 h-8" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl">Opzioni Proof of Concept</CardTitle>
                        <CardDescription className="text-cyan-50 text-base mt-1">
                          Scegli il livello di sviluppo del PoC
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {OPZIONI_POC.map((opzione) => {
                        const isSelected = formData.opzionePoc === opzione.id;

                        return (
                          <button
                            key={opzione.id}
                            onClick={() => setFormData({ ...formData, opzionePoc: opzione.id as 'essential' | 'interactive' })}
                            className={`group relative p-8 border-3 rounded-2xl text-left transition-all duration-500 ${
                              isSelected
                                ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-2xl scale-105'
                                : 'border-gray-200 hover:border-cyan-300 hover:shadow-xl hover:scale-102'
                            }`}
                          >
                            {opzione.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                                ⭐ CONSIGLIATO
                              </div>
                            )}

                            <div className="flex flex-col h-full">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl scale-110'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 group-hover:from-cyan-100 group-hover:to-blue-100 group-hover:text-cyan-600'
                              }`}>
                                <opzione.icon className="w-8 h-8" />
                              </div>

                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                                    {opzione.nome}
                                  </h3>
                                  <p className="text-sm text-cyan-600 font-semibold">
                                    {opzione.descrizione}
                                  </p>
                                </div>
                                <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all duration-300 flex-shrink-0 ml-2 ${
                                  isSelected
                                    ? 'border-cyan-500 bg-cyan-500'
                                    : 'border-gray-300 group-hover:border-cyan-400'
                                }`}>
                                  {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                              </div>

                              <div className="mb-4">
                                <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                                  💰 €{opzione.prezzoMin.toLocaleString()} - €{opzione.prezzoMax.toLocaleString()}
                                </Badge>
                              </div>

                              <div className="bg-white/50 rounded-lg p-4 border border-cyan-100 flex-1">
                                <ul className="text-sm text-gray-600 space-y-2">
                                  {opzione.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <Check className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        <Shield className="w-4 h-4 inline mr-2" />
                        <strong>Nota:</strong> Il PoC viene deployato su testnet (Sepolia/Goerli). Non è software di produzione ma un prototipo R&D per validazione tecnica.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!formData.servizioPoc && (
              <div ref={section2Ref} id="section-2" className="h-20"></div>
            )}

            {/* Sezione 3: Dettagli Progetto */}
            <div ref={section3Ref} id="section-3">
              <Card className="border-3 border-teal-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Dettagli Progetto</CardTitle>
                      <CardDescription className="text-teal-50 text-base mt-1">
                        Fornisci informazioni sul tuo asset e obiettivi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {/* Tipologia Asset */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipologia Asset *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TIPOLOGIE_ASSET.map((tipo) => {
                        const isSelected = formData.tipologiaAsset === tipo.id;
                        return (
                          <button
                            key={tipo.id}
                            onClick={() => setFormData({ ...formData, tipologiaAsset: tipo.id })}
                            className={`p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                              isSelected
                                ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                            }`}
                          >
                            <div className="text-2xl mb-2">{tipo.icon}</div>
                            <div className="text-sm font-semibold text-gray-900">{tipo.nome}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Valore Stimato */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valore Stimato Asset (€)
                    </label>
                    <Input
                      type="text"
                      placeholder="es. 500.000"
                      value={formData.valoreStimatoAsset}
                      onChange={(e) => setFormData({ ...formData, valoreStimatoAsset: e.target.value })}
                      className="border-2 focus:border-teal-500 text-lg p-3"
                    />
                  </div>

                  {/* Obiettivi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Obiettivi del Progetto
                    </label>
                    <Textarea
                      placeholder="Descrivi gli obiettivi principali: fundraising, liquidità, governance, altro..."
                      value={formData.obiettiviProgetto}
                      onChange={(e) => setFormData({ ...formData, obiettiviProgetto: e.target.value })}
                      className="border-2 focus:border-teal-500 min-h-[100px]"
                    />
                  </div>

                  {/* Tempistiche */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tempistiche Desiderate
                    </label>
                    <Input
                      type="text"
                      placeholder="es. Entro 3 mesi, Q2 2026, etc."
                      value={formData.tempisticheDesiderate}
                      onChange={(e) => setFormData({ ...formData, tempisticheDesiderate: e.target.value })}
                      className="border-2 focus:border-teal-500 text-lg p-3"
                    />
                  </div>

                  {/* Requirements Aggiuntivi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Requirements Tecnici/Legali Specifici
                    </label>
                    <Textarea
                      placeholder="Eventuali vincoli normativi, preferenze tecnologiche, compliance specifica..."
                      value={formData.requirementsAggiuntivi}
                      onChange={(e) => setFormData({ ...formData, requirementsAggiuntivi: e.target.value })}
                      className="border-2 focus:border-teal-500 min-h-[100px]"
                    />
                  </div>

                  {/* Upload Documenti */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Documenti Opzionali
                    </label>
                    <div className="border-2 border-dashed border-teal-300 rounded-xl p-6 bg-teal-50/30 hover:bg-teal-50/50 transition-colors">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                        <label className="cursor-pointer">
                          <span className="text-teal-600 font-semibold hover:text-teal-700">
                            Carica documenti
                          </span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, Word, Excel, Immagini (max 10MB, max 5 files)
                        </p>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-teal-200">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-teal-500" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 4: Dati Cliente */}
            <div ref={section4Ref} id="section-4">
              <Card className="border-3 border-cyan-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Dati Cliente</CardTitle>
                      <CardDescription className="text-cyan-50 text-base mt-1">
                        Informazioni di contatto per il preventivo
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome e Cognome *
                      </label>
                      <Input
                        type="text"
                        placeholder="Mario Rossi"
                        value={formData.nomeCliente}
                        onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                        className="border-2 focus:border-cyan-500 text-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="mario.rossi@example.com"
                        value={formData.emailCliente}
                        onChange={(e) => setFormData({ ...formData, emailCliente: e.target.value })}
                        className="border-2 focus:border-cyan-500 text-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefono *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+39 333 1234567"
                        value={formData.telefonoCliente}
                        onChange={(e) => setFormData({ ...formData, telefonoCliente: e.target.value })}
                        className="border-2 focus:border-cyan-500 text-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Azienda/Ente
                      </label>
                      <Input
                        type="text"
                        placeholder="Nome azienda (opzionale)"
                        value={formData.azienda}
                        onChange={(e) => setFormData({ ...formData, azienda: e.target.value })}
                        className="border-2 focus:border-cyan-500 text-lg p-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note Aggiuntive
                    </label>
                    <Textarea
                      placeholder="Eventuali informazioni aggiuntive o domande..."
                      value={formData.noteAggiuntive}
                      onChange={(e) => setFormData({ ...formData, noteAggiuntive: e.target.value })}
                      className="border-2 focus:border-cyan-500 min-h-[100px]"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-2">Privacy & Sicurezza</p>
                        <p className="text-xs leading-relaxed">
                          I tuoi dati saranno trattati in conformità al GDPR. Li utilizzeremo esclusivamente per contattarti
                          e preparare il preventivo personalizzato. Non verranno condivisi con terze parti.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar Preventivo */}
          <div className="lg:w-96">
            <div className="sticky top-32 space-y-6">
              <Card className="border-3 border-teal-200 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white p-6">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Coins className="w-6 h-6" />
                    Riepilogo Preventivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {preventivo.serviziInclusi.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">Seleziona i servizi per vedere il preventivo</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Servizi selezionati:</p>
                        {preventivo.serviziInclusi.map((servizio, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{servizio}</span>
                          </div>
                        ))}
                      </div>

                      {preventivo.scontoPercentuale > 0 && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
                          <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Sconto Bundle {preventivo.scontoPercentuale}%
                          </p>
                        </div>
                      )}

                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Range investimento:</span>
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                          €{preventivo.totaleMin.toLocaleString()} - €{preventivo.totaleMax.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Il preventivo finale dipenderà dalla complessità del progetto
                        </p>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-6 text-lg shadow-xl"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Invio in corso...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Richiedi Preventivo
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Info Box */}
              <Card className="border-2 border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">R&D Services</p>
                      <p className="text-xs text-gray-600">
                        Servizi di ricerca e sviluppo (ATECO 72.19). Non produciamo software in produzione.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Consulenza Inclusa</p>
                      <p className="text-xs text-gray-600">
                        Ogni servizio include supporto consulenziale durante tutto il progetto.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Deliverables Garantiti</p>
                      <p className="text-xs text-gray-600">
                        Tutti i deliverables sono documentati e rilasciati al cliente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
