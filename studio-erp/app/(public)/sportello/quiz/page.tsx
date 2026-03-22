'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Send, Bot, User, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefPronto, setBriefPronto] = useState(false);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Messaggio di benvenuto dall'assistente
  useEffect(() => {
    if (!token) {
      setError('Sessione non valida. Torna alla pagina principale.');
      return;
    }
    setMessages([
      {
        role: 'assistant',
        content:
          'Ciao! Sono l\'assistente tecnico dello Studio Ing. Romano. Sono qui per capire la tua situazione e aiutarti a trovare il servizio più adatto.\n\nDicci: di cosa hai bisogno? Puoi descrivermi brevemente il problema o il lavoro che stai valutando sul tuo immobile.',
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function inviaMessaggio() {
    if (!input.trim() || loading || briefPronto) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sportello/analisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: userMessage, history: messages }),
      }).then(r => r.json());

      if (!res.success) {
        setError(res.error || 'Errore durante l\'analisi.');
        setLoading(false);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);

      if (res.discovery_done) {
        setBriefPronto(true);
        // Avvia automaticamente routing e pricing in background
        avviaRoutingEPricing();
      }
    } catch {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  async function avviaRoutingEPricing() {
    setRouting(true);
    try {
      // Agente 2+3: analisi normativa + routing
      const routingRes = await fetch('/api/sportello/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).then(r => r.json());

      if (!routingRes.success) {
        setError('Errore nel calcolo del percorso. Ricarica la pagina.');
        setRouting(false);
        return;
      }

      // Agente 5: calcolo prezzi
      const pricingRes = await fetch('/api/sportello/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).then(r => r.json());

      if (!pricingRes.success) {
        setError('Errore nel calcolo del preventivo. Ricarica la pagina.');
        setRouting(false);
        return;
      }

      // Redirect alla pagina risultati
      router.push(`/sportello/risultati?token=${token}`);
    } catch {
      setError('Errore di connessione. Riprova.');
      setRouting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inviaMessaggio();
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Sessione non valida.</p>
          <Button onClick={() => router.push('/sportello')} variant="outline">
            Torna allo sportello
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700 px-6 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Studio Ing. Romano</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Assistente attivo
          </div>
        </div>
      </div>

      {/* Routing overlay */}
      {routing && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
          <p className="text-white font-semibold">Elaborazione in corso…</p>
          <p className="text-slate-400 text-sm text-center max-w-xs">
            Stiamo analizzando le normative applicabili e calcolando il preventivo su misura.
          </p>
        </div>
      )}

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${msg.role === 'assistant'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-slate-200'}`}
              >
                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Bolla */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'assistant'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-none'
                    : 'bg-blue-600 text-white rounded-tr-none'}`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* Brief pronto — attesa routing */}
          {briefPronto && !routing && (
            <div className="bg-blue-950/50 border border-blue-700/40 rounded-2xl px-4 py-3 text-sm text-blue-300 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              Analisi normativa e calcolo preventivo in corso…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Errore */}
      {error && (
        <div className="px-4 py-2 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-700 px-4 py-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || briefPronto}
            placeholder={briefPronto ? 'Analisi completata…' : 'Descrivi il tuo caso…'}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500
              rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <Button
            onClick={inviaMessaggio}
            disabled={loading || briefPronto || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 rounded-xl px-4"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="max-w-3xl mx-auto text-xs text-slate-600 mt-2 px-1">
          La conversazione è loggata e supervisionata dall&apos;ingegnere (POP-AI-01 / ISO 42001)
        </p>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>}>
      <QuizPageInner />
    </Suspense>
  );
}
