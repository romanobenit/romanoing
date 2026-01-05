'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Trash2,
  ChevronRight,
  Download,
  Send,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface FormData {
  // Servizi base
  servizioFattibilita: boolean;
  servizioSmartContract: boolean;
  servizioDashboard: boolean;
  servizioArchitettura: boolean;

  // Add-on Fattibilità
  addonSpv: boolean;
  addonTokenomics: boolean;
  addonMarket: boolean;

  // Add-on Smart Contract
  addonRestrictions: boolean;
  addonDividend: boolean;
  addonGovernance: boolean;
  addonAudit: boolean;

  // Add-on Dashboard
  addonGovernanceUI: boolean;
  addonAnalytics: boolean;

  // Altri dati
  tipologiaAsset: string;
  timeline: 'standard' | 'priority' | 'express' | '';

  // Dati cliente
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  azienda: string;
  note: string;
}

interface FileUpload {
  name: string;
  size: number;
  type: string;
  data: string;
}

const SERVIZI_BASE = [
  {
    id: 'fattibilita',
    nome: 'Studio di Fattibilità',
    sottotitolo: 'Tokenizzazione Immobiliare',
    descrizione: 'Analisi completa di fattibilità tecnica, economica e legale',
    icon: FileText,
    prezzo: 8000,
    durata: '4-6 settimane',
    deliverables: [
      'Analisi asset e valutazione',
      'Token economics essenziali',
      'Compliance framework (MiFID II, MICA)',
      'Whitepaper tecnico base',
      'File di lavoro (Excel, templates)'
    ],
    hasAddons: true,
    popular: true
  },
  {
    id: 'smartcontract',
    nome: 'Smart Contract PoC',
    sottotitolo: 'Prototipo su Testnet',
    descrizione: 'Sviluppo smart contract prototipale con test e deploy testnet',
    icon: Code,
    prezzo: 12000,
    durata: '6-10 settimane',
    deliverables: [
      'Smart contract Solidity (ERC-20/ERC-1400)',
      'Funzioni base: Mint, Burn, Transfer con whitelist',
      'Testing suite completa',
      'Security scan automatico',
      'Deploy testnet (Sepolia/Goerli)',
      'Documentazione e repository GitHub'
    ],
    hasAddons: true,
    popular: true
  },
  {
    id: 'dashboard',
    nome: 'Dashboard Test MVP',
    sottotitolo: 'Interfaccia Web Prototipo',
    descrizione: 'Applicazione web basilare per interazione con smart contract',
    icon: Globe,
    prezzo: 8000,
    durata: '4-6 settimane',
    deliverables: [
      'Web app Next.js responsive',
      'Connessione wallet (MetaMask, WalletConnect)',
      'UI operazioni token base',
      'Dashboard overview holdings',
      'Deploy Vercel testnet'
    ],
    hasAddons: true
  },
  {
    id: 'architettura',
    nome: 'Linee Guida Architettura',
    sottotitolo: 'Blockchain Infrastructure',
    descrizione: 'Raccomandazioni architetturali ad alto livello',
    icon: Network,
    prezzo: 4000,
    durata: '1-2 settimane',
    deliverables: [
      'Comparazione layer (Ethereum, Polygon, Arbitrum)',
      'Schema componenti essenziali',
      'Raccomandazioni tech stack',
      'Stime costi operativi',
      'Documento linee guida (10-15 pagine)'
    ],
    hasAddons: false
  }
];

const ADDONS_FATTIBILITA = [
  {
    id: 'spv',
    nome: 'SPV Structure Dettagliata',
    descrizione: 'Design veicolo societario completo',
    prezzo: 2000,
    details: ['Forma giuridica ottimale', 'Statuto societario draft', 'Mappatura token-quote sociali']
  },
  {
    id: 'tokenomics',
    nome: 'Token Economics Avanzato',
    descrizione: 'Meccanismi governance e incentivi',
    prezzo: 2000,
    details: ['Staking rewards design', 'Governance voting mechanism', 'Incentive structure modeling']
  },
  {
    id: 'market',
    nome: 'Market Analysis',
    descrizione: 'Analisi mercato e posizionamento',
    prezzo: 1500,
    details: ['Target investor profiling', 'Competitive landscape', 'Go-to-market strategy']
  }
];

const ADDONS_SMARTCONTRACT = [
  {
    id: 'restrictions',
    nome: 'Transfer Restrictions Avanzate',
    descrizione: 'Timelock, vesting, transfer limits',
    prezzo: 3000,
    details: ['Vesting periods configurabili', 'Transfer limits per wallet', 'Timelock mechanisms']
  },
  {
    id: 'dividend',
    nome: 'Dividend Distribution Automation',
    descrizione: 'Distribuzione dividendi automatica on-chain',
    prezzo: 4000,
    details: ['Calcolo pro-rata automatico', 'Batch distribution gas-optimized', 'Claim selettivo investitori']
  },
  {
    id: 'governance',
    nome: 'Governance On-Chain Completa',
    descrizione: 'Sistema votazione e proposte on-chain',
    prezzo: 5000,
    details: ['Propose, vote, execute functions', 'Quorum e majority requirements', 'Timelock per sicurezza']
  },
  {
    id: 'audit',
    nome: 'Security Audit Manuale',
    descrizione: 'Code review professionale approfondito',
    prezzo: 4000,
    details: ['Manual code review completo', 'OWASP checklist verification', 'Report audit + remediation']
  }
];

const ADDONS_DASHBOARD = [
  {
    id: 'governanceui',
    nome: 'Governance UI Module',
    descrizione: 'Interfaccia per proposals e voting',
    prezzo: 3000,
    details: ['Proposals list e dettaglio', 'Voting interface', 'Proposal creation form']
  },
  {
    id: 'analytics',
    nome: 'Analytics Dashboard',
    descrizione: 'Charts, metrics, holder analytics',
    prezzo: 2500,
    details: ['Token metrics e KPI', 'Holder distribution charts', 'Transaction volume analytics']
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

const TIMELINE_OPTIONS = [
  {
    id: 'standard',
    nome: 'Standard',
    descrizione: 'Timeline normale, nessuna urgenza',
    settimane: 12,
    moltiplicatore: 1.0,
    icon: '📅'
  },
  {
    id: 'priority',
    nome: 'Priority',
    descrizione: 'Priorità alta, consegna anticipata',
    settimane: 8,
    moltiplicatore: 1.15,
    surcharge: '+15%',
    icon: '⚡'
  },
  {
    id: 'express',
    nome: 'Express',
    descrizione: 'Massima urgenza, team dedicato',
    settimane: 4,
    moltiplicatore: 1.30,
    surcharge: '+30%',
    icon: '🚀'
  }
];

export default function ConfiguratorePropTechBlockchain() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [formData, setFormData] = useState<FormData>({
    servizioFattibilita: false,
    servizioSmartContract: false,
    servizioDashboard: false,
    servizioArchitettura: false,
    addonSpv: false,
    addonTokenomics: false,
    addonMarket: false,
    addonRestrictions: false,
    addonDividend: false,
    addonGovernance: false,
    addonAudit: false,
    addonGovernanceUI: false,
    addonAnalytics: false,
    tipologiaAsset: '',
    timeline: '',
    nomeCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    azienda: '',
    note: ''
  });

  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [expandedAddons, setExpandedAddons] = useState<string[]>([]);

  // Refs
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLDivElement>(null);
  const section5Ref = useRef<HTMLDivElement>(null);

  // Auto-save
  useEffect(() => {
    const savedData = localStorage.getItem('configuratore-proptech-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Errore caricamento dati:', e);
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
        { id: 4, ref: section4Ref },
        { id: 5, ref: section5Ref }
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
    const refs = [section1Ref, section2Ref, section3Ref, section4Ref, section5Ref];
    const targetRef = refs[sectionNumber - 1];
    if (targetRef.current) {
      const yOffset = -100;
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleAddonSection = (serviceId: string) => {
    setExpandedAddons(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUpload[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      if (file.size > 10 * 1024 * 1024) {
        alert(`Il file ${file.name} supera il limite di 10MB`);
        continue;
      }

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
    let totale = 0;
    const serviziInclusi: string[] = [];
    const addonsInclusi: string[] = [];

    // Servizi base
    if (formData.servizioFattibilita) {
      totale += 8000;
      serviziInclusi.push('Studio di Fattibilità');
    }
    if (formData.servizioSmartContract) {
      totale += 12000;
      serviziInclusi.push('Smart Contract PoC');
    }
    if (formData.servizioDashboard) {
      totale += 8000;
      serviziInclusi.push('Dashboard Test MVP');
    }
    if (formData.servizioArchitettura) {
      totale += 4000;
      serviziInclusi.push('Linee Guida Architettura');
    }

    // Add-on Fattibilità
    if (formData.addonSpv) {
      totale += 2000;
      addonsInclusi.push('SPV Structure (+€2K)');
    }
    if (formData.addonTokenomics) {
      totale += 2000;
      addonsInclusi.push('Token Economics (+€2K)');
    }
    if (formData.addonMarket) {
      totale += 1500;
      addonsInclusi.push('Market Analysis (+€1.5K)');
    }

    // Add-on Smart Contract
    if (formData.addonRestrictions) {
      totale += 3000;
      addonsInclusi.push('Transfer Restrictions (+€3K)');
    }
    if (formData.addonDividend) {
      totale += 4000;
      addonsInclusi.push('Dividend Distribution (+€4K)');
    }
    if (formData.addonGovernance) {
      totale += 5000;
      addonsInclusi.push('Governance On-Chain (+€5K)');
    }
    if (formData.addonAudit) {
      totale += 4000;
      addonsInclusi.push('Security Audit (+€4K)');
    }

    // Add-on Dashboard
    if (formData.addonGovernanceUI) {
      totale += 3000;
      addonsInclusi.push('Governance UI (+€3K)');
    }
    if (formData.addonAnalytics) {
      totale += 2500;
      addonsInclusi.push('Analytics Dashboard (+€2.5K)');
    }

    const subtotale = totale;

    // Timeline multiplier
    const timelineData = TIMELINE_OPTIONS.find(t => t.id === formData.timeline);
    const moltiplicatore = timelineData?.moltiplicatore || 1.0;
    const settimane = timelineData?.settimane || 12;

    totale = Math.round(totale * moltiplicatore);

    return {
      subtotale,
      totale,
      moltiplicatore,
      settimane,
      serviziInclusi,
      addonsInclusi,
      timelineSurcharge: timelineData?.surcharge
    };
  };

  const preventivo = calcolaPreventivo();

  const clearData = () => {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      localStorage.removeItem('configuratore-proptech-data');
      window.location.reload();
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const handleSubmit = async () => {
    // Validazioni
    if (!formData.servizioFattibilita && !formData.servizioSmartContract &&
        !formData.servizioDashboard && !formData.servizioArchitettura) {
      alert('Seleziona almeno un servizio base');
      scrollToSection(1);
      return;
    }

    if (!formData.tipologiaAsset) {
      alert('Seleziona la tipologia di asset');
      scrollToSection(2);
      return;
    }

    if (!formData.timeline) {
      alert('Seleziona la timeline del progetto');
      scrollToSection(3);
      return;
    }

    if (!formData.nomeCliente || !formData.emailCliente || !formData.telefonoCliente) {
      alert('Compila tutti i campi obbligatori dei dati cliente');
      scrollToSection(5);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/configuratore/proptech-blockchain/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, preventivo, files }),
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
              Ti contatteremo entro 24-48 ore per la <strong>consulenza online obbligatoria</strong> e conferma del preventivo definitivo.
            </p>
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                <Link href="/">Torna alla Home</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    servizioFattibilita: false,
                    servizioSmartContract: false,
                    servizioDashboard: false,
                    servizioArchitettura: false,
                    addonSpv: false,
                    addonTokenomics: false,
                    addonMarket: false,
                    addonRestrictions: false,
                    addonDividend: false,
                    addonGovernance: false,
                    addonAudit: false,
                    addonGovernanceUI: false,
                    addonAnalytics: false,
                    tipologiaAsset: '',
                    timeline: '',
                    nomeCliente: '',
                    emailCliente: '',
                    telefonoCliente: '',
                    azienda: '',
                    note: ''
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
    { number: 1, title: 'Servizi R&D', icon: Lightbulb, completed: formData.servizioFattibilita || formData.servizioSmartContract || formData.servizioDashboard || formData.servizioArchitettura },
    { number: 2, title: 'Tipologia Asset', icon: BarChart3, completed: formData.tipologiaAsset !== '' },
    { number: 3, title: 'Timeline', icon: Code, completed: formData.timeline !== '' },
    { number: 4, title: 'Documenti', icon: FileText, completed: files.length > 0 },
    { number: 5, title: 'Dati Cliente', icon: Users, completed: formData.nomeCliente !== '' && formData.emailCliente !== '' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
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
              <Link href="/bundle/BDL-PROPTECH-BLOCKCHAIN">
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
          <Link href="/bundle/BDL-PROPTECH-BLOCKCHAIN" className="hover:text-blue-600">
            Bundle PropTech/Blockchain
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Configuratore Preventivo</span>
        </div>
      </section>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white overflow-hidden print:py-4">
        <div className="absolute inset-0 opacity-10 print:hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="container mx-auto px-4 py-8 relative print:py-4">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center print:w-12 print:h-12">
                <Sparkles className="w-8 h-8 print:w-6 print:h-6" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2 print:hidden">
                  R&D Services • ATECO 72.19
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold print:text-3xl">
                  Configuratore PropTech/Blockchain
                </h1>
              </div>
            </div>
            <p className="text-xl text-teal-50 max-w-3xl print:text-base">
              Servizi di Ricerca & Sviluppo per tokenizzazione immobiliare, smart contract e architetture blockchain
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <Card className="max-w-5xl mx-auto border-3 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-3">⚠️ Informazioni Importanti - Leggere Attentamente</h3>
                <div className="space-y-2 text-sm text-amber-800">
                  <p>
                    <strong>📋 Preventivo Non Vincolante:</strong> Il preventivo calcolato è indicativo e soggetto a conferma durante la consulenza online obbligatoria. Il prezzo finale dipenderà dalla complessità specifica del progetto.
                  </p>
                  <p>
                    <strong>💼 Consulenza Obbligatoria:</strong> Prima di procedere è richiesta una consulenza tecnica online (inclusa nel servizio) per validare requirements e confermare fattibilità.
                  </p>
                  <p>
                    <strong>🧪 Servizi di R&D (ATECO 72.19):</strong> Questi sono servizi di Ricerca e Sviluppo, non produzione software. I deliverables sono prototipi, studi di fattibilità e proof-of-concept a scopo di validazione tecnica.
                  </p>
                  <p>
                    <strong>🧪 Testnet Only:</strong> Gli smart contract vengono deployati esclusivamente su reti test pubbliche (Sepolia/Goerli). Non è incluso deploy su mainnet né gestione fondi reali.
                  </p>
                  <p>
                    <strong>🔒 Sicurezza Informatica:</strong> Il security assessment incluso è preliminare (automated scanning + code review interno). Per produzione è fortemente raccomandato un audit esterno professionale (non incluso).
                  </p>
                  <p>
                    <strong>📱 Dashboard MVP:</strong> La dashboard è un'interfaccia prototipale essenziale per testing, non un'applicazione di produzione completa. Non include backend scalabile, monitoring, o supporto operativo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Indicator */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-teal-100 shadow-lg mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center max-w-4xl mx-auto overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1 min-w-fit">
                <button
                  onClick={() => scrollToSection(step.number)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-base font-bold
                    transition-all duration-500 transform
                    ${activeSection === step.number
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white scale-110 shadow-xl'
                      : step.completed && activeSection !== step.number
                      ? 'bg-teal-100 text-teal-600 group-hover:scale-105'
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:scale-105'
                    }
                  `}>
                    {step.completed && activeSection !== step.number ? (
                      <Check className="w-5 h-5" />
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

            {/* Sezione 1: Servizi Base + Add-on */}
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
                        Seleziona i servizi di ricerca e sviluppo necessari
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {SERVIZI_BASE.map((servizio) => {
                      const isSelected =
                        (servizio.id === 'fattibilita' && formData.servizioFattibilita) ||
                        (servizio.id === 'smartcontract' && formData.servizioSmartContract) ||
                        (servizio.id === 'dashboard' && formData.servizioDashboard) ||
                        (servizio.id === 'architettura' && formData.servizioArchitettura);

                      const isExpanded = expandedAddons.includes(servizio.id);

                      return (
                        <div key={servizio.id} className="space-y-3">
                          <button
                            onClick={() => {
                              if (servizio.id === 'fattibilita') {
                                setFormData({ ...formData, servizioFattibilita: !formData.servizioFattibilita });
                              } else if (servizio.id === 'smartcontract') {
                                setFormData({ ...formData, servizioSmartContract: !formData.servizioSmartContract });
                              } else if (servizio.id === 'dashboard') {
                                setFormData({ ...formData, servizioDashboard: !formData.servizioDashboard });
                              } else if (servizio.id === 'architettura') {
                                setFormData({ ...formData, servizioArchitettura: !formData.servizioArchitettura });
                              }
                            }}
                            className={`group relative w-full p-6 border-3 rounded-2xl text-left transition-all duration-500 ${
                              isSelected
                                ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-2xl'
                                : 'border-gray-200 hover:border-teal-300 hover:shadow-xl'
                            }`}
                          >
                            {servizio.popular && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                                ⭐ CONSIGLIATO
                              </div>
                            )}

                            <div className="flex items-start justify-between mb-4">
                              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 group-hover:from-teal-100 group-hover:to-cyan-100 group-hover:text-teal-600'
                              }`}>
                                <servizio.icon className="w-7 h-7" />
                              </div>

                              <div className={`w-7 h-7 rounded-full border-3 flex items-center justify-center transition-all duration-300 ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-500'
                                  : 'border-gray-300 group-hover:border-teal-400'
                              }`}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {servizio.nome}
                            </h3>
                            <p className="text-sm text-teal-600 font-semibold mb-2">
                              {servizio.sottotitolo}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              {servizio.descrizione}
                            </p>

                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-teal-600 border-teal-300 font-bold">
                                €{servizio.prezzo.toLocaleString()}
                              </Badge>
                              <Badge variant="outline" className="text-cyan-600 border-cyan-300 text-xs">
                                {servizio.durata}
                              </Badge>
                            </div>

                            <div className="bg-white/50 rounded-lg p-3 border border-teal-100">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Deliverables:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                {servizio.deliverables.slice(0, 3).map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {servizio.deliverables.length > 3 && (
                                  <li className="text-teal-600 text-xs">+{servizio.deliverables.length - 3} altri...</li>
                                )}
                              </ul>
                            </div>
                          </button>

                          {/* Add-on Section (condizionale) */}
                          {servizio.hasAddons && isSelected && (
                            <div className="border-3 border-teal-200 rounded-xl p-4 bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
                              <button
                                onClick={() => toggleAddonSection(servizio.id)}
                                className="w-full flex items-center justify-between text-left mb-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-5 h-5 text-teal-600" />
                                  <span className="font-semibold text-gray-900">Personalizza con Add-on</span>
                                </div>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-teal-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-teal-600" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="space-y-3 pt-2">
                                  {servizio.id === 'fattibilita' && ADDONS_FATTIBILITA.map(addon => (
                                    <label key={addon.id} className="flex items-start gap-3 p-3 rounded-lg border-2 border-teal-100 bg-white hover:border-teal-300 cursor-pointer transition-all">
                                      <input
                                        type="checkbox"
                                        checked={formData[`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof FormData] as boolean}
                                        onChange={(e) => setFormData({ ...formData, [`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}`]: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-teal-600"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="font-semibold text-sm text-gray-900">{addon.nome}</span>
                                          <Badge className="bg-teal-600 text-white">+€{addon.prezzo.toLocaleString()}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{addon.descrizione}</p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                          {addon.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-1">
                                              <span className="text-teal-500">•</span>
                                              <span>{detail}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </label>
                                  ))}

                                  {servizio.id === 'smartcontract' && ADDONS_SMARTCONTRACT.map(addon => (
                                    <label key={addon.id} className="flex items-start gap-3 p-3 rounded-lg border-2 border-teal-100 bg-white hover:border-teal-300 cursor-pointer transition-all">
                                      <input
                                        type="checkbox"
                                        checked={formData[`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof FormData] as boolean}
                                        onChange={(e) => setFormData({ ...formData, [`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}`]: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-teal-600"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="font-semibold text-sm text-gray-900">{addon.nome}</span>
                                          <Badge className="bg-teal-600 text-white">+€{addon.prezzo.toLocaleString()}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{addon.descrizione}</p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                          {addon.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-1">
                                              <span className="text-teal-500">•</span>
                                              <span>{detail}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </label>
                                  ))}

                                  {servizio.id === 'dashboard' && ADDONS_DASHBOARD.map(addon => (
                                    <label key={addon.id} className="flex items-start gap-3 p-3 rounded-lg border-2 border-teal-100 bg-white hover:border-teal-300 cursor-pointer transition-all">
                                      <input
                                        type="checkbox"
                                        checked={formData[`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}` as keyof FormData] as boolean}
                                        onChange={(e) => setFormData({ ...formData, [`addon${addon.id.charAt(0).toUpperCase() + addon.id.slice(1)}`]: e.target.checked })}
                                        className="mt-1 w-4 h-4 text-teal-600"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="font-semibold text-sm text-gray-900">{addon.nome}</span>
                                          <Badge className="bg-teal-600 text-white">+€{addon.prezzo.toLocaleString()}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{addon.descrizione}</p>
                                        <ul className="text-xs text-gray-500 space-y-1">
                                          {addon.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-1">
                                              <span className="text-teal-500">•</span>
                                              <span>{detail}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 2: Tipologia Asset */}
            <div ref={section2Ref} id="section-2">
              <Card className="border-3 border-cyan-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Tipologia Asset</CardTitle>
                      <CardDescription className="text-cyan-50 text-base mt-1">
                        Seleziona il tipo di asset immobiliare da tokenizzare
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {TIPOLOGIE_ASSET.map((tipo) => {
                      const isSelected = formData.tipologiaAsset === tipo.id;
                      return (
                        <button
                          key={tipo.id}
                          onClick={() => setFormData({ ...formData, tipologiaAsset: tipo.id })}
                          className={`p-6 border-3 rounded-xl text-center transition-all duration-300 ${
                            isSelected
                              ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-cyan-300 hover:shadow-md'
                          }`}
                        >
                          <div className="text-4xl mb-3">{tipo.icon}</div>
                          <div className="text-sm font-semibold text-gray-900">{tipo.nome}</div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 3: Timeline */}
            <div ref={section3Ref} id="section-3">
              <Card className="border-3 border-teal-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Code className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Timeline Progetto</CardTitle>
                      <CardDescription className="text-teal-50 text-base mt-1">
                        Scegli la timeline di consegna desiderata
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    {TIMELINE_OPTIONS.map((option) => {
                      const isSelected = formData.timeline === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setFormData({ ...formData, timeline: option.id as 'standard' | 'priority' | 'express' })}
                          className={`w-full p-6 border-3 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                            isSelected
                              ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-lg'
                              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                            isSelected ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white scale-110' : 'bg-gray-100'
                          }`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-gray-900">{option.nome}</h3>
                              {option.surcharge && (
                                <Badge className="bg-amber-500 text-white">{option.surcharge}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{option.descrizione}</p>
                            <p className="text-sm font-semibold text-teal-600">
                              Durata: ~{option.settimane} settimane
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-3 flex items-center justify-center transition-all ${
                            isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 4: Upload Documenti */}
            <div ref={section4Ref} id="section-4">
              <Card className="border-3 border-cyan-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Documenti Opzionali</CardTitle>
                      <CardDescription className="text-cyan-50 text-base mt-1">
                        Carica eventuali documenti utili per il progetto
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="border-2 border-dashed border-teal-300 rounded-xl p-8 bg-teal-50/30 hover:bg-teal-50/50 transition-colors">
                    <div className="text-center">
                      <Upload className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-teal-600 font-semibold hover:text-teal-700 text-lg">
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
                      <p className="text-sm text-gray-500 mt-3">
                        PDF, Word, Excel, Immagini<br />
                        Max 10MB per file • Max 5 files totali
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-6 space-y-3">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-teal-200 shadow-sm">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-teal-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sezione 5: Dati Cliente */}
            <div ref={section5Ref} id="section-5">
              <Card className="border-3 border-teal-100 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">Dati Cliente</CardTitle>
                      <CardDescription className="text-teal-50 text-base mt-1">
                        I tuoi dati di contatto per il preventivo
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
                        className="border-2 focus:border-teal-500 text-lg p-3"
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
                        className="border-2 focus:border-teal-500 text-lg p-3"
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
                        className="border-2 focus:border-teal-500 text-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Azienda/Ente (opzionale)
                      </label>
                      <Input
                        type="text"
                        placeholder="Nome azienda"
                        value={formData.azienda}
                        onChange={(e) => setFormData({ ...formData, azienda: e.target.value })}
                        className="border-2 focus:border-teal-500 text-lg p-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Note sul Progetto
                    </label>
                    <Textarea
                      placeholder="Descrivi brevemente il tuo progetto: obiettivi, tempistiche specifiche, requirements tecnici o legali particolari..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="border-2 focus:border-teal-500 min-h-[120px]"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-2">Privacy & Sicurezza</p>
                        <p className="text-xs leading-relaxed">
                          I tuoi dati saranno trattati in conformità al GDPR. Li utilizzeremo esclusivamente per contattarti
                          e preparare il preventivo personalizzato durante la consulenza online obbligatoria. Non verranno condivisi con terze parti.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final Disclaimer before Submit */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">Prima di inviare la richiesta</p>
                        <ul className="text-xs space-y-1 leading-relaxed">
                          <li>✓ Il preventivo mostrato è <strong>indicativo e non vincolante</strong></li>
                          <li>✓ È richiesta una <strong>consulenza online gratuita</strong> per conferma definitiva</li>
                          <li>✓ I servizi sono di <strong>Ricerca & Sviluppo</strong>, non produzione software</li>
                          <li>✓ Gli smart contract sono deployati solo su <strong>testnet</strong> (Sepolia/Goerli)</li>
                          <li>✓ La dashboard è un <strong>prototipo MVP</strong>, non applicazione di produzione</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Sidebar Preventivo Sticky */}
          <div className="lg:w-96">
            <div className="sticky top-32 space-y-6">
              <Card className="border-3 border-teal-200 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white p-6">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Coins className="w-6 h-6" />
                    Preventivo Immediato
                  </CardTitle>
                  <p className="text-xs text-teal-50 mt-2">Non vincolante - Soggetto a conferma</p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="mb-6">
                        <Lock className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Prezzi Riservati
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Effettua l&apos;accesso per visualizzare il preventivo personalizzato
                        </p>
                      </div>
                      <Button asChild className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
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
                      {preventivo.serviziInclusi.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Seleziona i servizi per vedere il preventivo</p>
                        </div>
                      ) : (
                        <>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Servizi Base:</p>
                        {preventivo.serviziInclusi.map((servizio, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{servizio}</span>
                          </div>
                        ))}
                      </div>

                      {preventivo.addonsInclusi.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700">Add-on:</p>
                          {preventivo.addonsInclusi.map((addon, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{addon}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t-2 border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Subtotale:</span>
                          <span className="text-lg font-bold text-gray-900">€{preventivo.subtotale.toLocaleString()}</span>
                        </div>

                        {formData.timeline && preventivo.moltiplicatore !== 1.0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Timeline {preventivo.timelineSurcharge}:</span>
                            <span className="text-sm font-semibold text-amber-600">
                              {preventivo.moltiplicatore > 1 ? '+' : ''}€{Math.round(preventivo.subtotale * (preventivo.moltiplicatore - 1)).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="border-t-2 border-teal-200 pt-3 mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-700">TOTALE:</span>
                          </div>
                          <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500">
                            €{preventivo.totale.toLocaleString()}
                          </div>
                        </div>

                        {formData.timeline && (
                          <p className="text-xs text-gray-500 mt-3">
                            ⏱️ Durata stimata: ~{preventivo.settimane} settimane
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 print:hidden">
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
                              <Send className="w-5 h-5 mr-2" />
                              Richiedi Preventivo
                            </>
                          )}
                        </Button>
                        <Button onClick={downloadPDF} variant="outline" className="w-full" size="lg">
                          <Download className="w-5 h-5 mr-2" />
                          Scarica PDF
                        </Button>
                      </div>

                      <p className="text-xs text-center text-gray-500 italic">
                        Preventivo non vincolante. Verrà confermato dopo consulenza online gratuita.
                      </p>
                        </>
                      )}
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
                        Ogni richiesta include una consulenza online gratuita per validare il progetto.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Code className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Testnet Only</p>
                      <p className="text-xs text-gray-600">
                        Smart contract deployati su reti test (Sepolia/Goerli), non mainnet.
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
