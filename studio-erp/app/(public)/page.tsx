'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, CheckCircle2, Shield, Award, Cpu } from "lucide-react";

// ─── ISO Standards ────────────────────────────────────────────────────────────
const ISO_STANDARDS = [
  {
    code: "ISO 9001",
    title: "Qualità dei Processi",
    color: "from-blue-600 to-blue-800",
    icon: <Award className="w-8 h-8" />,
    practices: [
      "Approccio per processi documentati e misurabili",
      "Revisione periodica della soddisfazione del cliente",
      "Gestione non conformità con azioni correttive",
      "Obiettivi di qualità tracciati con KPI definiti",
      "Audit interni e riesame della direzione",
      "Miglioramento continuo basato su evidenze",
    ],
  },
  {
    code: "ISO 27001",
    title: "Sicurezza delle Informazioni",
    color: "from-slate-700 to-slate-900",
    icon: <Shield className="w-8 h-8" />,
    practices: [
      "Classificazione e inventario degli asset informativi",
      "Controllo degli accessi basato su ruoli (RBAC)",
      "Crittografia AES-256 a riposo e in transito",
      "Gestione degli incidenti di sicurezza con escalation",
      "Backup 3-2-1 su infrastruttura Hetzner Cloud",
      "Valutazione del rischio e trattamento documentato",
    ],
  },
  {
    code: "ISO 42001",
    title: "Governance dell'Intelligenza Artificiale",
    color: "from-violet-600 to-violet-900",
    icon: <Cpu className="w-8 h-8" />,
    practices: [
      "Trasparenza sull'utilizzo di sistemi AI (log POP-AI-01)",
      "Supervisione umana su ogni output dell'AI",
      "Valutazione dei rischi specifici per sistemi AI",
      "Non discriminazione e equità algoritmica verificata",
      "Documentazione delle decisioni assistite da AI",
      "Revisione continua dell'impatto e delle prestazioni AI",
    ],
  },
];

// ─── Risposte AI predefinite ──────────────────────────────────────────────────
const AI_RESPONSES: Record<string, string> = {
  default:
    "Benvenuto nello Studio Tecnico Romano. Sono l'assistente AI che prepara la tua consulenza con l'Ingegnere. Dimmi: su quale immobile o progetto posso aiutarti oggi?",
  sismica:
    "Per una valutazione della vulnerabilità sismica ho bisogno di: anno di costruzione, comune, tipologia strutturale (muratura/cemento armato/acciaio) e superficie. Vuoi che l'Ing. Romano ti contatti per fissare un sopralluogo?",
  ristrutturazione:
    "Per un preventivo di ristrutturazione: mi indica la superficie (mq), il tipo di intervento (ordinaria/straordinaria/integrale) e se prevede accesso a bonus fiscali? Posso calcolare un range di complessità immediato.",
  energia:
    "Per l'efficientamento energetico valuto: classe energetica attuale (se nota), tipo di impianto termico, anno costruzione e presenza di isolamento. Con questi dati posso indicare gli incentivi applicabili.",
  costo:
    "Il nostro sistema di tariffazione è trasparente e milestone-based: paghi solo al completamento di fasi verificabili. Vuoi che ti invii una stima personalizzata via email, o preferisci parlare direttamente con l'Ingegnere?",
  contatto:
    "Posso organizzare una chiamata preliminare gratuita di 15 minuti con l'Ing. Romano. Quando sei disponibile? Oppure scrivi direttamente su WhatsApp: +39 347 633 6545",
};

function getAIResponse(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("sismic") || m.includes("terremoto") || m.includes("struttur"))
    return AI_RESPONSES.sismica;
  if (m.includes("ristrutt") || m.includes("bonus") || m.includes("110"))
    return AI_RESPONSES.ristrutturazione;
  if (m.includes("energ") || m.includes("efficien") || m.includes("ecobonus"))
    return AI_RESPONSES.energia;
  if (m.includes("cost") || m.includes("prezzo") || m.includes("quanto") || m.includes("tariff"))
    return AI_RESPONSES.costo;
  if (m.includes("contatt") || m.includes("appuntament") || m.includes("chiamat") || m.includes("telefon"))
    return AI_RESPONSES.contatto;
  return "Ho capito. Per darti la risposta più precisa, preferisci che passi direttamente la tua richiesta all'Ing. Romano, o vuoi approfondire qui con me prima?";
}

// ─── Componente Chat AI ───────────────────────────────────────────────────────
interface ChatMessage { role: "ai" | "user"; text: string; }

function AIChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: AI_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: getAIResponse(trimmed) },
      ]);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${
                m.role === "ai" ? "bg-violet-600" : "bg-blue-600"
              }`}
            >
              {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "ai"
                  ? "bg-slate-800 text-slate-100 rounded-tl-sm"
                  : "bg-blue-600 text-white rounded-tr-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Descrivi il tuo immobile o progetto..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || thinking}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          L&apos;AI prepara la consulenza · L&apos;Ingegnere la firma
        </p>
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
              SR
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-white leading-tight text-sm">Ing. Domenico Romano</p>
              <p className="text-xs text-slate-500">Technical Advisory Studio</p>
            </div>
          </Link>

          <Link href="/login">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white text-xs">
              Accedi
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 container mx-auto">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

          {/* Testo hero */}
          <div>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              Lo studio opera in linea con le best practices ISO 9001 · ISO 27001 · ISO 42001.
              Il tuo progetto è gestito con rigore, trasparenza e sicurezza delle informazioni.
            </p>

            <a
              href={`https://wa.me/393476336545?text=${encodeURIComponent("Ciao, vorrei una consulenza tecnica.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:border-green-500 hover:text-green-400 gap-2 text-sm rounded-xl">
                💬 Contattaci su WhatsApp
              </Button>
            </a>
          </div>

          {/* Chat AI */}
          <div id="chat" className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/20">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-900">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Assistente AI — Studio Romano</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online · Prepara la tua consulenza
                </p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-violet-900/50 text-violet-300 text-xs border border-violet-700">
                  ISO 42001
                </Badge>
              </div>
            </div>
            <AIChatWidget />
          </div>

        </div>
      </section>

      {/* ── ISO Standards ── */}
      <section className="py-20 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-blue-900/40 text-blue-300 border border-blue-800 mb-4">
              Best Practices Internazionali
            </Badge>
            <h2 className="text-3xl font-bold mb-3">
              Standard internazionali,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                applicati ogni giorno
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Ogni incarico segue processi rigorosi basati sulle norme ISO più rilevanti per
              la consulenza tecnica, la sicurezza dei dati e l&apos;uso etico dell&apos;AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ISO_STANDARDS.map((std, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-colors group"
              >
                {/* Header card */}
                <div className={`bg-gradient-to-br ${std.color} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-white/80">{std.icon}</div>
                    <span className="text-xs font-mono font-bold bg-white/20 text-white px-3 py-1 rounded-full">
                      {std.code}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{std.title}</h3>
                </div>

                {/* Best practices */}
                <div className="p-5 space-y-3">
                  {std.practices.map((p, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300 leading-snug">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">SR</div>
            <span>© 2025 Studio Ing. Romano — Technical Advisory</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-slate-400 transition-colors">Termini</Link>
            <Link href="/legal/garanzia-consulenza" className="hover:text-slate-400 transition-colors">Garanzia</Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-900 border border-slate-700 text-slate-500 text-xs">ISO 9001</Badge>
            <Badge className="bg-slate-900 border border-slate-700 text-slate-500 text-xs">ISO 27001</Badge>
            <Badge className="bg-slate-900 border border-slate-700 text-slate-500 text-xs">ISO 42001</Badge>
          </div>
        </div>
      </footer>

    </div>
  );
}
