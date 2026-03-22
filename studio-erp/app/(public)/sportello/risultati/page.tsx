'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2, FileText, Zap, UserCheck, ChevronDown, ChevronUp,
  AlertTriangle, Clock, Euro, ArrowRight, Loader2, Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Brief {
  soggetto: string;
  azione?: string;
  comune?: string;
  zona_sismica?: string;
  urgenza?: string;
  completezza: number;
}

interface QuadroNormativo {
  normative_applicabili: string[];
  titolo_abilitativo?: string;
  ente_competente?: string;
  complessita: 'BASSA' | 'MEDIA' | 'ALTA' | 'MOLTO_ALTA';
  richiede_sopralluogo: boolean;
  richiede_calcoli_strutturali: boolean;
  risultato_atteso?: string;
}

interface Offerta {
  id: number;
  tipo_erogazione: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE';
  titolo_servizio: string;
  descrizione_deliverable: string;
  prezzo_finale_centesimi: number;
  sla_ore: number | null;
  avviso: string | null;
}

interface Sessione {
  brief: Brief;
  quadro_normativo: QuadroNormativo;
  routing: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE' | 'COMPLESSO';
  routing_motivo: string;
}

const TIPO_CONFIG = {
  PLATFORM: {
    label: 'Documento AI',
    icon: <Bot className="h-5 w-5" />,
    color: 'from-slate-700 to-slate-800',
    badge: 'bg-slate-600 text-slate-200',
    desc: 'Risposta informativa generata dall\'AI. Ideale per orientarsi.',
  },
  IMMEDIATA: {
    label: 'Analisi AI',
    icon: <Zap className="h-5 w-5" />,
    color: 'from-blue-800 to-blue-900',
    badge: 'bg-blue-700 text-blue-100',
    desc: 'Analisi tecnica approfondita. Risposta entro SLA garantito.',
  },
  INGEGNERE: {
    label: 'Parere Firmato',
    icon: <UserCheck className="h-5 w-5" />,
    color: 'from-violet-800 to-violet-900',
    badge: 'bg-violet-700 text-violet-100',
    desc: 'Parere professionale firmato digitalmente (eIDAS) dall\'Ing. Romano.',
  },
} as const;

function formatEuro(centesimi: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(centesimi / 100);
}

function RisultatiPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [sessione, setSessione] = useState<Sessione | null>(null);
  const [offerte, setOfferte] = useState<Offerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [quadroOpen, setQuadroOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Sessione non valida.');
      setLoading(false);
      return;
    }

    // Carica sessione + offerte in parallelo
    Promise.all([
      fetch(`/api/sportello/sessione?token=${token}`).then(r => r.json()),
      fetch(`/api/sportello/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).then(r => r.json()),
    ])
      .then(([sessRes, pricingRes]) => {
        if (!sessRes.success) {
          setError('Sessione non trovata. Torna allo sportello.');
          return;
        }
        setSessione(sessRes.data as Sessione);

        if (pricingRes.success && pricingRes.opzioni) {
          setOfferte(pricingRes.opzioni as Offerta[]);
        }
      })
      .catch(() => setError('Errore di connessione.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col gap-4">
        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        <p className="text-slate-400 text-sm">Elaborazione risultati…</p>
      </div>
    );
  }

  if (error || !sessione) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col gap-4">
        <p className="text-red-400">{error || 'Dati non disponibili.'}</p>
        <Button onClick={() => router.push('/sportello')} variant="outline">
          Torna allo sportello
        </Button>
      </div>
    );
  }

  const { brief, quadro_normativo: quadro, routing, routing_motivo } = sessione;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Building2 className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Studio Ing. Romano</span>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-500">Risultati analisi</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Riepilogo caso */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Riepilogo del tuo caso
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Soggetto', value: brief.soggetto },
              { label: 'Azione richiesta', value: brief.azione?.replace(/_/g, ' ') },
              { label: 'Comune', value: brief.comune },
              { label: 'Zona sismica', value: brief.zona_sismica ? `Zona ${brief.zona_sismica}` : undefined },
              { label: 'Urgenza', value: brief.urgenza },
            ]
              .filter(f => f.value)
              .map(f => (
                <div key={f.label} className="flex gap-2">
                  <span className="text-slate-500 min-w-[120px]">{f.label}:</span>
                  <span className="text-slate-200 capitalize">{f.value}</span>
                </div>
              ))}
          </div>

          {/* Quadro normativo collassabile */}
          <button
            onClick={() => setQuadroOpen(o => !o)}
            className="mt-4 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {quadroOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {quadroOpen ? 'Nascondi' : 'Mostra'} analisi normativa
          </button>

          {quadroOpen && (
            <div className="mt-4 border-t border-slate-700 pt-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {quadro.titolo_abilitativo && (
                  <div className="flex gap-2">
                    <span className="text-slate-500 min-w-[150px]">Titolo abilitativo:</span>
                    <span className="text-slate-200 uppercase">{quadro.titolo_abilitativo.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {quadro.ente_competente && (
                  <div className="flex gap-2">
                    <span className="text-slate-500 min-w-[150px]">Ente competente:</span>
                    <span className="text-slate-200">{quadro.ente_competente}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-slate-500 min-w-[150px]">Complessità:</span>
                  <span className="text-slate-200">{quadro.complessita}</span>
                </div>
              </div>
              {quadro.normative_applicabili.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Normative applicabili:</p>
                  <div className="flex flex-wrap gap-2">
                    {quadro.normative_applicabili.map(n => (
                      <span key={n} className="bg-slate-700 text-slate-300 text-xs rounded-full px-3 py-1">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {quadro.risultato_atteso && (
                <p className="text-sm text-slate-400 italic">
                  Risultato atteso: {quadro.risultato_atteso}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Percorso consigliato */}
        <div className="bg-blue-950/40 border border-blue-700/30 rounded-2xl p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Percorso consigliato: {routing}</p>
            <p className="text-xs text-slate-400 mt-1">{routing_motivo}</p>
          </div>
        </div>

        {/* Percorso COMPLESSO */}
        {routing === 'COMPLESSO' && (
          <div className="bg-amber-950/30 border border-amber-700/40 rounded-2xl p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
            <h3 className="font-semibold text-amber-300 mb-2">Caso complesso — Preventivo personalizzato</h3>
            <p className="text-slate-400 text-sm mb-4">
              Il tuo caso richiede una valutazione diretta dell&apos;ingegnere.
              Lasciaci i tuoi contatti e sarai richiamato entro 24 ore lavorative.
            </p>
            <Link href={`/sportello/lead?token=${token}`}>
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                Richiedi preventivo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* Offerte */}
        {offerte.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-5">Scegli il tuo servizio</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {offerte.map(offerta => {
                const config = TIPO_CONFIG[offerta.tipo_erogazione];
                const isConsigliata = offerta.tipo_erogazione === routing;
                return (
                  <div
                    key={offerta.id}
                    className={`relative bg-gradient-to-b ${config.color} border rounded-2xl p-5 flex flex-col gap-4
                      ${isConsigliata ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700/50'}`}
                  >
                    {isConsigliata && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Consigliata
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{config.icon}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-white text-sm leading-tight mb-1">
                        {offerta.titolo_servizio}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {offerta.descrizione_deliverable}
                      </p>
                    </div>

                    <div className="mt-auto space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-white">
                          {formatEuro(offerta.prezzo_finale_centesimi)}
                        </span>
                        {offerta.sla_ore && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3.5 w-3.5" />
                            entro {offerta.sla_ore}h
                          </span>
                        )}
                      </div>

                      {offerta.avviso && (
                        <p className="text-xs text-amber-400/80 leading-tight">
                          ⚠ {offerta.avviso}
                        </p>
                      )}

                      <Link href={`/sportello/acquista/${offerta.id}`} className="block">
                        <Button
                          className={`w-full text-sm ${isConsigliata ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'} text-white`}
                        >
                          Acquista <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-slate-600 text-center pb-4">
          Le analisi AI sono supervisionate dall&apos;Ing. Romano e conformi ISO/IEC 42001:2023 (POP-AI-01).
          I documenti PLATFORM e IMMEDIATA non costituiscono parere professionale firmato.
        </p>
      </div>
    </div>
  );
}

export default function RisultatiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>}>
      <RisultatiPageInner />
    </Suspense>
  );
}
