'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Euro, Clock, Bot } from 'lucide-react';

interface Offerta {
  id: number;
  tipo_erogazione: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE';
  titolo_servizio: string;
  descrizione_deliverable: string;
  prezzo_finale_centesimi: number;
  sla_ore: number | null;
  avviso: string | null;
}

const TIPO_LABEL: Record<string, string> = {
  PLATFORM: 'Documento AI',
  IMMEDIATA: 'Analisi AI',
  INGEGNERE: 'Parere firmato Ing.',
};

const TIPO_COLOR: Record<string, string> = {
  PLATFORM: 'from-slate-700 to-slate-800',
  IMMEDIATA: 'from-blue-800 to-blue-900',
  INGEGNERE: 'from-violet-800 to-violet-900',
};

export default function AcquistaPage() {
  const { offertaId } = useParams<{ offertaId: string }>();
  const searchParams = useSearchParams();
  const esito = searchParams.get('esito');

  const [offerta, setOfferta] = useState<Offerta | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(`/api/sportello/checkout?offertaId=${offertaId}`, { method: 'GET' })
      .catch(() => null);

    // Carica i dettagli dell'offerta
    fetch(`/api/sportello/offerta/${offertaId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setOfferta(d.offerta);
        else setError('Offerta non trovata o scaduta.');
      })
      .catch(() => setError('Errore di connessione.'))
      .finally(() => setLoading(false));
  }, [offertaId]);

  async function avviaCheckout() {
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sportello/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offertaId: parseInt(offertaId), email: email || undefined }),
      }).then(r => r.json());

      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        setError(res.error || 'Impossibile avviare il pagamento.');
        setCheckoutLoading(false);
      }
    } catch {
      setError('Errore di connessione. Riprova.');
      setCheckoutLoading(false);
    }
  }

  // Vista successo pagamento
  if (esito === 'successo') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Pagamento confermato!</h1>
          <p className="text-slate-400 mb-6">
            Riceverai una email di conferma a breve. Il tuo servizio è in lavorazione.
            {offerta?.tipo_erogazione === 'INGEGNERE' && (
              <> L&apos;Ing. Romano ti contatterà per coordinare la consegna del parere firmato.</>
            )}
          </p>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs text-slate-500 mb-1">Servizio acquistato</p>
            <p className="text-sm font-semibold text-white">{offerta?.titolo_servizio}</p>
            {offerta?.sla_ore && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Consegna entro {offerta.sla_ore}h
              </p>
            )}
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:border-blue-500 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" /> Torna alla home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vista annullamento
  if (esito === 'annullato') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Pagamento annullato</h1>
          <p className="text-slate-400 mb-6">
            Non è stato addebitato nulla. Puoi riprovare quando vuoi.
          </p>
          <Button
            onClick={avviaCheckout}
            disabled={checkoutLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl mb-4"
          >
            {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Euro className="w-4 h-4 mr-2" />}
            Riprova pagamento
          </Button>
          <div className="block">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
              <ArrowLeft className="w-3 h-3 inline mr-1" /> Torna alla home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vista principale: dettaglio offerta + checkout
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* Header */}
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Studio Tecnico Ing. Romano
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 text-sm">{error}</p>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 mt-4 block">Torna alla home</Link>
          </div>
        )}

        {offerta && !loading && (
          <>
            {/* Card offerta */}
            <div className={`bg-gradient-to-br ${TIPO_COLOR[offerta.tipo_erogazione]} border border-white/10 rounded-2xl p-6 mb-6`}>
              <div className="flex items-start justify-between mb-4">
                <Badge className="bg-white/20 text-white border-0 text-xs">{TIPO_LABEL[offerta.tipo_erogazione]}</Badge>
                <div className="flex items-center gap-1 text-white">
                  <Bot className="w-4 h-4 opacity-60" />
                  <span className="text-xs opacity-60">AI · ISO 42001</span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-white mb-2">{offerta.titolo_servizio}</h1>
              <p className="text-white/70 text-sm leading-relaxed mb-4">{offerta.descrizione_deliverable}</p>
              <div className="flex items-end justify-between">
                <div>
                  {offerta.sla_ore && (
                    <p className="text-white/60 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Consegna entro {offerta.sla_ore}h
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">€{(offerta.prezzo_finale_centesimi / 100).toFixed(0)}</p>
                  <p className="text-white/50 text-xs">IVA inclusa</p>
                </div>
              </div>
            </div>

            {/* Avviso */}
            {offerta.avviso && (
              <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300 text-sm">{offerta.avviso}</p>
              </div>
            )}

            {/* Form checkout */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Completa l&apos;acquisto</h2>

              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1.5 block">Email per ricevere il servizio</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="la-tua-email@esempio.it"
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              <Button
                onClick={avviaCheckout}
                disabled={checkoutLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold"
              >
                {checkoutLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Reindirizzamento a Stripe...</>
                  : <><Euro className="w-4 h-4 mr-2" /> Paga €{(offerta.prezzo_finale_centesimi / 100).toFixed(0)} con carta</>
                }
              </Button>

              <p className="text-xs text-slate-600 text-center mt-3">
                Pagamento sicuro Stripe · Nessun dato carta salvato sul nostro server
              </p>
            </div>

            {/* Info garanzie */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: '🔒', text: 'Pagamento sicuro' },
                { icon: '📄', text: 'Ricevuta automatica' },
                { icon: '⚡', text: 'Accesso immediato' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                  <p className="text-lg mb-1">{item.icon}</p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
