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
  ArrowLeft,
  Euro,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Trash2,
  Home,
  Building,
  Castle,
  Wrench,
  HardHat,
  Gift,
  Landmark,
  Palette,
  Clock,
  MapPin
} from 'lucide-react';

const STORAGE_KEY = 'configuratore-ristrutturazione-data';

// Regioni Italia
const REGIONI_ITALIA = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

// Dimensioni immobile
const DIMENSIONI = [
  {
    id: 'fino-100',
    nome: 'MINI',
    icon: Home,
    range: 'Fino a 100 mq',
    esempi: 'Monolocale, Bilocale',
    prezzoBase: 1500
  },
  {
    id: '100-200',
    nome: 'STANDARD',
    icon: Building2,
    range: '100-200 mq',
    esempi: 'Trilocale, Quadrilocale',
    prezzoBase: 2500,
    badge: '⭐ PIÙ RICHIESTO'
  },
  {
    id: '200-400',
    nome: 'GRANDE',
    icon: Building,
    range: '200-400 mq',
    esempi: 'Villa, Attico',
    prezzoBase: 4000
  },
  {
    id: 'oltre-400',
    nome: 'EXTRA',
    icon: Castle,
    range: 'Oltre 400 mq',
    esempi: 'Villa di pregio, Loft',
    prezzoBase: 5000,
    badge: '🏆 PREMIUM'
  }
];

// Tipi intervento
const TIPI_INTERVENTO = [
  {
    id: 'standard',
    nome: 'STANDARD',
    icon: Wrench,
    descrizione: 'Manutenzione Straordinaria',
    include: [
      'Rifacimento bagno/cucina',
      'Impianti nuovi',
      'Pavimenti e rivestimenti',
      'Infissi e serramenti'
    ],
    pratica: 'CILA',
    tempi: '30-60 giorni',
    moltiplicatore: 1.0,
    badge: '💚 VELOCE'
  },
  {
    id: 'importante',
    nome: 'IMPORTANTE',
    icon: Building2,
    descrizione: 'Ristrutturazione Importante',
    include: [
      'Modifiche strutturali',
      'Apertura/chiusura vani',
      'Cambio layout completo',
      'Ampliamenti volumetrici'
    ],
    pratica: 'SCIA / Permesso',
    tempi: '60-90 giorni',
    moltiplicatore: 1.5,
    badge: '🏆 COMPLETO'
  }
];

// Servizi aggiuntivi
const SERVIZI = [
  {
    id: 'direzione-lavori',
    nome: 'Direzione Lavori',
    descrizione: 'Supervisione professionale durante i lavori',
    costo: 500,
    icon: HardHat,
    tooltip: 'Visite mensili, verbali, controllo qualità'
  },
  {
    id: 'bonus-50',
    nome: 'Gestione Bonus 50%',
    descrizione: 'Gestione pratiche bonus ristrutturazione',
    costo: 500,
    icon: Gift,
    tooltip: 'Pratiche ENEA, asseverazioni, comunicazioni'
  },
  {
    id: 'progetto-strutturale',
    nome: 'Progetto Strutturale',
    descrizione: 'Se hai opere su elementi portanti',
    costoPerc: 0.40,
    icon: Landmark,
    tooltip: 'Calcoli strutturali, tavole esecutive'
  },
  {
    id: 'render-3d',
    nome: 'Render 3D',
    descrizione: 'Visualizzazione fotorealistica',
    costo: 300,
    icon: Palette,
    tooltip: 'Immagini 3D del progetto finito'
  }
];

interface ConfiguratoreRistrutturazioneData {
  // Sezione 1
  dimensione: string;

  // Sezione 2
  tipoIntervento: string;

  // Sezione 3
  serviziAggiuntivi: string[];
  comune: string;
  regione: string;
  centroStorico: boolean;
  condominio: boolean;

  // Sezione 4
  nomeCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  descrizioneProgetto: string;
  privacyAccettata: boolean;
}

const initialData: ConfiguratoreRistrutturazioneData = {
  dimensione: '',
  tipoIntervento: '',
  serviziAggiuntivi: [],
  comune: '',
  regione: '',
  centroStorico: false,
  condominio: false,
  nomeCliente: '',
  emailCliente: '',
  telefonoCliente: '',
  descrizioneProgetto: '',
  privacyAccettata: false,
};

interface Preventivo {
  prezzoBase: number;
  moltiplicatoreVincoli: number;
  prezzoConVincoli: number;
  costoDirezioneLavori: number;
  costoBonus: number;
  costoProgettoStrutturale: number;
  costoRender: number;
  costoServiziAggiuntivi: number;
  totale: number;
  dimensioneNome: string;
  tipoInterventoNome: string;
  pratica: string;
  tempi: string;
}

export default function ConfiguratoreRistrutturazione() {
  const [currentSection, setCurrentSection] = useState(1);
  const [data, setData] = useState<ConfiguratoreRistrutturazioneData>(initialData);
  const [preventivo, setPreventivo] = useState<Preventivo | null>(null);
  const [emailSending, setEmailSending] = useState(false);

  const updateData = (field: keyof ConfiguratoreRistrutturazioneData, value: any) => {
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

  // Calcola preventivo
  useEffect(() => {
    const prev = calcolaPreventivo(data);
    setPreventivo(prev);
  }, [data]);

  const calcolaPreventivo = (data: ConfiguratoreRistrutturazioneData): Preventivo => {
    // 1. Trova dimensione e tipo intervento
    const dimensioneObj = DIMENSIONI.find(d => d.id === data.dimensione);
    const tipoObj = TIPI_INTERVENTO.find(t => t.id === data.tipoIntervento);

    if (!dimensioneObj || !tipoObj) {
      return {
        prezzoBase: 0,
        moltiplicatoreVincoli: 1.0,
        prezzoConVincoli: 0,
        costoDirezioneLavori: 0,
        costoBonus: 0,
        costoProgettoStrutturale: 0,
        costoRender: 0,
        costoServiziAggiuntivi: 0,
        totale: 0,
        dimensioneNome: '',
        tipoInterventoNome: '',
        pratica: '',
        tempi: ''
      };
    }

    // 2. Prezzo base
    const prezzoBase = Math.round(dimensioneObj.prezzoBase * tipoObj.moltiplicatore);

    // 3. Moltiplicatore vincoli
    let moltiplicatoreVincoli = 1.0;
    if (data.centroStorico) moltiplicatoreVincoli += 0.30;
    if (data.condominio) moltiplicatoreVincoli += 0.15;

    const prezzoConVincoli = Math.round(prezzoBase * moltiplicatoreVincoli);

    // 4. Servizi aggiuntivi
    let costoDirezioneLavori = 0;
    let costoBonus = 0;
    let costoProgettoStrutturale = 0;
    let costoRender = 0;

    if (data.serviziAggiuntivi.includes('direzione-lavori')) {
      costoDirezioneLavori = 500;
    }
    if (data.serviziAggiuntivi.includes('bonus-50')) {
      costoBonus = 500;
    }
    if (data.serviziAggiuntivi.includes('progetto-strutturale')) {
      costoProgettoStrutturale = Math.round(prezzoBase * 0.40);
    }
    if (data.serviziAggiuntivi.includes('render-3d')) {
      costoRender = 300;
    }

    const costoServiziAggiuntivi = costoDirezioneLavori + costoBonus + costoProgettoStrutturale + costoRender;

    // 5. Totale
    const totale = prezzoConVincoli + costoServiziAggiuntivi;

    return {
      prezzoBase,
      moltiplicatoreVincoli,
      prezzoConVincoli,
      costoDirezioneLavori,
      costoBonus,
      costoProgettoStrutturale,
      costoRender,
      costoServiziAggiuntivi,
      totale,
      dimensioneNome: dimensioneObj.nome,
      tipoInterventoNome: tipoObj.nome,
      pratica: tipoObj.pratica,
      tempi: tipoObj.tempi
    };
  };

  const getProgress = () => {
    if (!data.dimensione) return 0;
    if (!data.tipoIntervento) return 33;
    if (!data.comune || !data.regione) return 66;
    if (!data.nomeCliente || !data.emailCliente) return 90;
    return 100;
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
    if (!data.nomeCliente || !data.emailCliente || !data.privacyAccettata) {
      alert('Compila tutti i campi obbligatori e accetta Privacy Policy');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/configuratore/ristrutturazione/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, preventivo }),
      });

      if (response.ok) {
        alert('Richiesta inviata con successo! Ti contatteremo entro 48 ore.');
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

  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna alla home
          </Link>
          <h1 className="text-4xl font-bold mb-3">Configuratore Ristrutturazione</h1>
          <p className="text-xl text-orange-50">
            Scopri subito quanto costa il tuo progetto
          </p>
          <p className="text-sm text-orange-100 mt-2">
            Bastano 3 minuti per il tuo preventivo personalizzato
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Completa il configuratore
            </span>
            <span className="text-sm font-bold text-orange-600">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
              style={{width: `${progress}%`}}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sezione 1: Dimensione */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">1. Quanto è grande il tuo immobile?</CardTitle>
                    <p className="text-sm text-orange-50">Seleziona la superficie</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DIMENSIONI.map((dim) => {
                    const IconComponent = dim.icon;
                    const isSelected = data.dimensione === dim.id;

                    return (
                      <div
                        key={dim.id}
                        onClick={() => updateData('dimensione', dim.id)}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer
                          transition-all duration-300 hover:scale-105 hover:shadow-xl
                          ${isSelected
                            ? 'border-orange-500 bg-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-orange-300'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            ✓
                          </div>
                        )}

                        {dim.badge && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                            {dim.badge}
                          </div>
                        )}

                        <div className="text-center">
                          <IconComponent className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                          <h3 className="font-bold text-sm mb-1">{dim.nome}</h3>
                          <p className="text-xs text-gray-600 mb-2">{dim.range}</p>
                          <p className="text-xs text-gray-500 mb-3">{dim.esempi}</p>
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg py-1.5 px-2">
                            <div className="text-xs">da</div>
                            <div className="text-lg font-bold">€{dim.prezzoBase.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  💡 Indica la superficie netta calpestabile (esclusi muri e balconi)
                </p>
              </CardContent>
            </Card>

            {/* Sezione 2: Tipo Intervento */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">2. Che tipo di intervento vuoi fare?</CardTitle>
                    <p className="text-sm text-orange-50">Scegli il livello di ristrutturazione</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {TIPI_INTERVENTO.map((tipo) => {
                    const IconComponent = tipo.icon;
                    const isSelected = data.tipoIntervento === tipo.id;

                    return (
                      <div
                        key={tipo.id}
                        onClick={() => updateData('tipoIntervento', tipo.id)}
                        className={`
                          relative p-6 rounded-xl border-2 cursor-pointer
                          transition-all duration-300 hover:scale-102 hover:shadow-xl
                          ${isSelected
                            ? 'border-orange-500 bg-orange-50 shadow-lg'
                            : 'border-gray-200 hover:border-orange-300'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            ✓
                          </div>
                        )}

                        <div className="absolute -top-2 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {tipo.badge}
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="w-8 h-8 text-orange-600" />
                            <h3 className="font-bold text-lg">{tipo.nome}</h3>
                          </div>

                          <p className="text-sm font-medium text-gray-700 mb-3">{tipo.descrizione}</p>

                          <div className="space-y-1.5 mb-4">
                            {tipo.include.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                <CheckCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Pratica:</span>
                              <Badge variant="outline" className="text-orange-700 border-orange-300">
                                {tipo.pratica}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Tempi:</span>
                              <span className="font-medium text-gray-700">{tipo.tempi}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sezione 3: Personalizzazione */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">3. Personalizza il tuo progetto</CardTitle>
                    <p className="text-sm text-orange-50">Servizi aggiuntivi e ubicazione</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Servizi Aggiuntivi */}
                <div>
                  <Label className="mb-3 block font-semibold text-base">⚙️ Servizi Aggiuntivi</Label>
                  <p className="text-sm text-gray-600 mb-4">Seleziona i servizi extra che ti servono:</p>

                  <div className="space-y-3">
                    {SERVIZI.map((servizio) => {
                      const IconComponent = servizio.icon;
                      const isSelected = data.serviziAggiuntivi.includes(servizio.id);
                      const prezzoDisplay = servizio.costo
                        ? `+€${servizio.costo}`
                        : `+${(servizio.costoPerc! * 100)}% base`;

                      return (
                        <label
                          key={servizio.id}
                          className={`
                            flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer
                            transition-all duration-200 hover:bg-orange-50
                            ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleServizio(servizio.id)}
                            className="w-5 h-5 text-orange-600 rounded mt-0.5"
                          />
                          <IconComponent className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-medium text-sm">{servizio.nome}</div>
                                <p className="text-xs text-gray-600 mt-0.5">{servizio.descrizione}</p>
                                <p className="text-xs text-gray-500 mt-1 italic">{servizio.tooltip}</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 whitespace-nowrap">
                                {prezzoDisplay}
                              </Badge>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Ubicazione */}
                <div className="pt-4 border-t">
                  <Label className="mb-3 block font-semibold text-base">📍 Ubicazione</Label>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="comune" className="text-sm">Comune *</Label>
                      <Input
                        id="comune"
                        value={data.comune}
                        onChange={(e) => updateData('comune', e.target.value)}
                        placeholder="Es: Napoli"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="regione" className="text-sm">Regione *</Label>
                      <select
                        id="regione"
                        value={data.regione}
                        onChange={(e) => updateData('regione', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-1"
                      >
                        <option value="">Seleziona regione</option>
                        {REGIONI_ITALIA.map((reg) => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block text-sm">🏛️ Il tuo immobile si trova in:</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      <label className={`
                        flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer
                        transition-all hover:bg-orange-50
                        ${data.centroStorico ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                      `}>
                        <input
                          type="checkbox"
                          checked={data.centroStorico}
                          onChange={(e) => updateData('centroStorico', e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">🏛️ Centro Storico</div>
                          <p className="text-xs text-gray-600">Vincoli e autorizzazioni</p>
                          <Badge variant="outline" className="mt-1 text-xs text-orange-700">
                            +30% complessità
                          </Badge>
                        </div>
                      </label>

                      <label className={`
                        flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer
                        transition-all hover:bg-orange-50
                        ${data.condominio ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}
                      `}>
                        <input
                          type="checkbox"
                          checked={data.condominio}
                          onChange={(e) => updateData('condominio', e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">🏢 Condominio</div>
                          <p className="text-xs text-gray-600">Assemblee e autorizzazioni</p>
                          <Badge variant="outline" className="mt-1 text-xs text-orange-700">
                            +15% complessità
                          </Badge>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sezione 4: Dati Cliente */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">4. I tuoi dati</CardTitle>
                    <p className="text-sm text-orange-50">Per inviarti il preventivo</p>
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
                  <Label htmlFor="descrizioneProgetto">Descrivi brevemente il tuo progetto</Label>
                  <textarea
                    id="descrizioneProgetto"
                    value={data.descrizioneProgetto}
                    onChange={(e) => updateData('descrizioneProgetto', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
                    rows={4}
                    placeholder="Esempio: Rifacimento completo bagno e cucina, spostamento tramezzi, nuovi impianti..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.privacyAccettata}
                      onChange={(e) => updateData('privacyAccettata', e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded mt-0.5"
                    />
                    <span className="text-sm text-gray-700">
                      Accetto la{' '}
                      <Link href="/legal/privacy" className="text-orange-600 underline">
                        Privacy Policy
                      </Link>{' '}
                      e i{' '}
                      <Link href="/legal/terms" className="text-orange-600 underline">
                        Termini e Condizioni
                      </Link>
                    </span>
                  </label>
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
                      className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                      disabled={emailSending || !data.privacyAccettata || !data.nomeCliente || !data.emailCliente}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {emailSending ? 'Invio...' : 'Richiedi Preventivo'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preventivo column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5" />
                    Il Tuo Preventivo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {preventivo && preventivo.totale > 0 ? (
                    <>
                      {/* Totale */}
                      <div className="text-center py-6 border-b">
                        <div className="text-sm text-gray-600 mb-2">Totale Stimato</div>
                        <div className="text-4xl font-bold text-orange-600 mb-1">
                          €{preventivo.totale.toLocaleString('it-IT')}
                        </div>
                        <div className="text-xs text-gray-500">IVA esclusa</div>
                      </div>

                      {/* Breakdown */}
                      <div className="pt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Progetto base</span>
                          <span className="font-medium">€{preventivo.prezzoBase.toLocaleString()}</span>
                        </div>

                        {preventivo.moltiplicatoreVincoli > 1.0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Complessità contesto</span>
                            <span>+{((preventivo.moltiplicatoreVincoli - 1) * 100).toFixed(0)}%</span>
                          </div>
                        )}

                        {preventivo.costoDirezioneLavori > 0 && (
                          <div className="flex justify-between">
                            <span>Direzione Lavori</span>
                            <span>+€{preventivo.costoDirezioneLavori.toLocaleString()}</span>
                          </div>
                        )}

                        {preventivo.costoBonus > 0 && (
                          <div className="flex justify-between">
                            <span>Gestione Bonus 50%</span>
                            <span>+€{preventivo.costoBonus.toLocaleString()}</span>
                          </div>
                        )}

                        {preventivo.costoProgettoStrutturale > 0 && (
                          <div className="flex justify-between">
                            <span>Progetto Strutturale</span>
                            <span>+€{preventivo.costoProgettoStrutturale.toLocaleString()}</span>
                          </div>
                        )}

                        {preventivo.costoRender > 0 && (
                          <div className="flex justify-between">
                            <span>Render 3D</span>
                            <span>+€{preventivo.costoRender.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Cosa include */}
                      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                        <div className="text-sm font-bold text-orange-900 mb-3">
                          📋 COSA INCLUDE
                        </div>
                        <ul className="text-xs text-gray-700 space-y-1.5">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Progetto architettonico completo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Pratiche edilizie ({preventivo.pratica})</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Computo metrico indicativo</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span>Assistenza deposito pratiche</span>
                          </li>
                          {preventivo.costoDirezioneLavori > 0 && (
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span>Direzione Lavori (visite, verbali)</span>
                            </li>
                          )}
                          {preventivo.costoBonus > 0 && (
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                              <span>Pratiche Bonus Fiscale 50%</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Tempi */}
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          TEMPI STIMATI
                        </div>
                        <div className="text-xs text-gray-700">
                          <div className="flex justify-between mb-1">
                            <span>Progettazione:</span>
                            <span className="font-medium">30-45 giorni</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pratiche edilizie:</span>
                            <span className="font-medium">{preventivo.tempi}</span>
                          </div>
                        </div>
                      </div>

                      {/* Alert */}
                      <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-800">
                            <p className="font-medium mb-1">Preventivo Indicativo</p>
                            <p>
                              Il preventivo sarà confermato dopo valutazione
                              della documentazione fornita.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">Seleziona dimensione e tipo intervento per vedere il preventivo</p>
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
