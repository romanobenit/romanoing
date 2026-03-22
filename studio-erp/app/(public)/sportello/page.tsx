'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Zap, FileCheck, ArrowRight, Shield, Clock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SportelloPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function avviaConsulenza() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sportello/sessione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).then(r => r.json());

      if (res.success && res.data?.session_token) {
        router.push(`/sportello/quiz?token=${res.data.session_token}`);
      } else {
        setError('Impossibile avviare la sessione. Riprova.');
        setLoading(false);
      }
    } catch {
      setError('Errore di connessione. Riprova.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-400" />
            <span className="font-semibold text-slate-200">Studio Ing. Romano</span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">Sportello Tecnico Virtuale</span>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-700/40 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Bot className="h-4 w-4" />
          Analisi AI + Supervisione professionale
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          Scopri cosa ti serve<br />
          <span className="text-blue-400">per il tuo immobile</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Raccontaci il tuo caso attraverso una breve conversazione guidata.
          Riceverai un'analisi normativa personalizzata e un preventivo trasparente
          in pochi minuti.
        </p>

        {error && (
          <p className="text-red-400 text-sm mb-6 bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2 inline-block">
            {error}
          </p>
        )}

        <Button
          onClick={avviaConsulenza}
          disabled={loading}
          size="lg"
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg shadow-blue-900/30"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Avvio in corso...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Inizia consulenza gratuita
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        <p className="text-xs text-slate-600 mt-4">
          Nessun dato personale richiesto nella fase iniziale
        </p>
      </div>

      {/* Come funziona */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-10">
          Come funziona
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="h-6 w-6 text-blue-400" />,
              step: '01',
              title: 'Descrivi il tuo caso',
              desc: 'Il nostro assistente AI ti farà 5–7 domande tecniche per capire la tua situazione. Nessun dato personale richiesto.',
            },
            {
              icon: <FileCheck className="h-6 w-6 text-violet-400" />,
              step: '02',
              title: 'Analisi normativa',
              desc: 'Identifichiamo le normative applicabili al tuo caso (NTC 2018, DPR 380/2001, D.Lgs 139/2006…) e il percorso ottimale.',
            },
            {
              icon: <Zap className="h-6 w-6 text-amber-400" />,
              step: '03',
              title: 'Preventivo trasparente',
              desc: 'Ricevi 3 opzioni di servizio con prezzi chiari e SLA garantiti. Scegli quella che fa per te e paga online.',
            },
          ].map(item => (
            <div
              key={item.step}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-slate-700/60 rounded-xl">{item.icon}</div>
                <span className="text-3xl font-bold text-slate-700">{item.step}</span>
              </div>
              <h3 className="font-semibold text-slate-200 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Garanzie */}
      <div className="border-t border-slate-800 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            {[
              { icon: <Shield className="h-4 w-4 text-green-500" />, label: 'ISO/IEC 42001:2023 — AI conforme' },
              { icon: <Clock className="h-4 w-4 text-blue-400" />, label: 'Risposta garantita entro SLA' },
              { icon: <FileCheck className="h-4 w-4 text-violet-400" />, label: 'Ogni output revisionato da ingegnere' },
            ].map(g => (
              <div key={g.label} className="flex items-center gap-2">
                {g.icon}
                <span>{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
