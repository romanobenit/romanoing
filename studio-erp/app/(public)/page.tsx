'use client';

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, CheckCircle2, Shield, Award, Cpu, FileText, MapPin, Calendar, Layers, Maximize2, BarChart3, AlertCircle, Loader2, PhoneCall, Euro } from "lucide-react";

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

// ─── Tipi per il sistema agentico ────────────────────────────────────────────
type Phase = 'discovery' | 'analisi' | 'pricing' | 'offerte' | 'lead' | 'lead_inviato';

interface Opzione {
  id: number;
  tipo_erogazione: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE';
  titolo_servizio: string;
  descrizione_deliverable: string;
  prezzo_finale_centesimi: number;
  sla_ore: number | null;
  avviso: string | null;
}

// ─── Profilo tecnico estratto dalla chat ─────────────────────────────────────
interface TechProfile {
  tipoIntervento?: string;
  ubicazione?: string;
  annoCostruzione?: string;
  tipologiaStrutturale?: string;
  superficie?: string;
  complessita?: string;
}

function extractProfile(userMessages: string[]): TechProfile {
  const all = userMessages.join(" ").toLowerCase();
  const profile: TechProfile = {};

  // Tipo intervento
  if (all.includes("sismic") || all.includes("terremoto"))
    profile.tipoIntervento = "Vulnerabilità sismica";
  else if (all.includes("ristrutt"))
    profile.tipoIntervento = "Ristrutturazione";
  else if (all.includes("energ") || all.includes("efficien") || all.includes("ecobonus"))
    profile.tipoIntervento = "Efficientamento energetico";
  else if (all.includes("antincend") || all.includes("incend"))
    profile.tipoIntervento = "Prevenzione incendi";
  else if (all.includes("collaudo"))
    profile.tipoIntervento = "Collaudo statico";
  else if (all.includes("ampliament"))
    profile.tipoIntervento = "Ampliamento";
  else if (all.includes("due diligence") || all.includes("perizia"))
    profile.tipoIntervento = "Due diligence tecnica";
  else if (all.includes("consulenz"))
    profile.tipoIntervento = "Consulenza tecnica";

  // Anno costruzione (4 cifre 1900–2024)
  const annoMatch = all.match(/\b(19[0-9]{2}|200[0-9]|201[0-9]|202[0-4])\b/);
  if (annoMatch) profile.annoCostruzione = annoMatch[1];

  // Tipologia strutturale
  if (all.includes("muratura")) profile.tipologiaStrutturale = "Muratura portante";
  else if (all.includes("cemento armato") || all.includes("c.a.") || all.includes("ca "))
    profile.tipologiaStrutturale = "Cemento armato";
  else if (all.includes("acciaio")) profile.tipologiaStrutturale = "Struttura in acciaio";
  else if (all.includes("legno")) profile.tipologiaStrutturale = "Struttura in legno";
  else if (all.includes("mista")) profile.tipologiaStrutturale = "Struttura mista";

  // Superficie (numero + mq / m²)
  const supMatch = all.match(/(\d{2,4})\s*(?:mq|m²|metri quadri|m2)/);
  if (supMatch) profile.superficie = `${supMatch[1]} m²`;

  // Ubicazione (cerca "a [Città]" o nomi comuni italiani noti)
  const cittaMatch = all.match(/\b(?:a|in|di|comune di)\s+([a-zàèéìòùA-Z][a-zàèéìòùA-Z\s]{2,20}?)(?:\s*[,.]|\s+(?:in|con|ho|è|e|la|il|lo|del|della))/);
  if (cittaMatch) {
    const cand = cittaMatch[1].trim();
    if (cand.length > 2 && cand.length < 25) profile.ubicazione = cand.charAt(0).toUpperCase() + cand.slice(1);
  }

  // Complessità stimata
  if (profile.tipoIntervento) {
    const alta = ["Vulnerabilità sismica", "Due diligence tecnica", "Ristrutturazione"];
    const media = ["Efficientamento energetico", "Collaudo statico", "Ampliamento", "Prevenzione incendi"];
    if (alta.includes(profile.tipoIntervento)) profile.complessita = "Alta";
    else if (media.includes(profile.tipoIntervento)) profile.complessita = "Media";
    else profile.complessita = "Bassa";
  }

  return profile;
}

// ─── Scheda tecnica ───────────────────────────────────────────────────────────
function SchedaTecnica({ profile, msgCount }: { profile: TechProfile; msgCount: number }) {
  const hasData = Object.keys(profile).length > 0;
  const complessitaColor: Record<string, string> = {
    Alta: "text-amber-400 bg-amber-400/10 border-amber-500/30",
    Media: "text-blue-400 bg-blue-400/10 border-blue-500/30",
    Bassa: "text-green-400 bg-green-400/10 border-green-500/30",
  };

  const rows: { icon: React.ReactNode; label: string; value?: string }[] = [
    { icon: <FileText className="w-3.5 h-3.5" />,  label: "Tipo intervento",     value: profile.tipoIntervento },
    { icon: <MapPin className="w-3.5 h-3.5" />,    label: "Ubicazione",          value: profile.ubicazione },
    { icon: <Calendar className="w-3.5 h-3.5" />,  label: "Anno costruzione",    value: profile.annoCostruzione },
    { icon: <Layers className="w-3.5 h-3.5" />,    label: "Tipologia struttura", value: profile.tipologiaStrutturale },
    { icon: <Maximize2 className="w-3.5 h-3.5" />, label: "Superficie",          value: profile.superficie },
  ];

  const filled = rows.filter(r => r.value).length;
  const progressPct = msgCount === 0 ? 0 : Math.min(100, Math.round((filled / 5) * 100));

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Scheda tecnica</span>
        </div>
        <span className="text-xs text-slate-500">
          {hasData ? `${filled}/5 campi rilevati` : "In attesa di dati"}
        </span>
      </div>

      {/* Barra progresso */}
      <div className="px-4 pt-3">
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Campi */}
      <div className="p-4 space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`text-slate-500 flex-shrink-0 ${row.value ? "text-blue-400" : ""}`}>
              {row.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 leading-none mb-0.5">{row.label}</p>
              {row.value ? (
                <p className="text-sm text-slate-200 font-medium truncate">{row.value}</p>
              ) : (
                <p className="text-sm text-slate-700 italic">non rilevato</p>
              )}
            </div>
          </div>
        ))}

        {/* Complessità */}
        {profile.complessita && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Complessità stimata</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${complessitaColor[profile.complessita] ?? "text-slate-400"}`}>
                {profile.complessita}
              </span>
            </div>
          </div>
        )}

        {/* Stato */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-center text-slate-600">
            {!hasData
              ? "Inizia la chat per compilare la scheda"
              : filled < 3
              ? "Fornisci altri dettagli per una stima accurata"
              : "Scheda pronta — l'Ingegnere può prendere in carico"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Converte Brief (da Agente 1) in TechProfile per la Scheda Tecnica
function briefToProfile(brief: Record<string, unknown>): TechProfile {
  const p: TechProfile = {};
  if (typeof brief.azione === 'string') p.tipoIntervento = brief.azione;
  if (typeof brief.comune === 'string') p.ubicazione = brief.comune;
  if (typeof brief.anno_costruzione === 'number') p.annoCostruzione = String(brief.anno_costruzione);
  if (typeof brief.superficie_mq === 'number') p.superficie = `${brief.superficie_mq} m²`;
  const comp = brief.complessita as string | undefined;
  if (comp === 'BASSA') p.complessita = 'Bassa';
  else if (comp === 'MEDIA') p.complessita = 'Media';
  else if (comp === 'ALTA' || comp === 'MOLTO_ALTA') p.complessita = 'Alta';
  return p;
}

// ─── Chat Agentica ────────────────────────────────────────────────────────────
interface ChatMessage { role: "ai" | "user"; text: string; }

const TIPO_LABEL: Record<string, string> = {
  PLATFORM: 'Documento AI',
  IMMEDIATA: 'Analisi AI',
  INGEGNERE: 'Parere firmato',
};
const TIPO_COLOR: Record<string, string> = {
  PLATFORM: 'bg-slate-700 border-slate-600',
  IMMEDIATA: 'bg-blue-900/40 border-blue-700',
  INGEGNERE: 'bg-violet-900/40 border-violet-700',
};
const TIPO_BADGE: Record<string, string> = {
  PLATFORM: 'bg-slate-800 text-slate-300 border-slate-600',
  IMMEDIATA: 'bg-blue-900/50 text-blue-300 border-blue-700',
  INGEGNERE: 'bg-violet-900/50 text-violet-300 border-violet-700',
};

interface ChatAgenticaProps {
  onProfileUpdate: (p: TechProfile) => void;
  onMsgCountUpdate: (n: number) => void;
  onPhaseChange: (phase: Phase, opzioni?: Opzione[]) => void;
}

function ChatAgentica({ onProfileUpdate, onMsgCountUpdate, onPhaseChange }: ChatAgenticaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", text: "Benvenuto allo Studio Tecnico Ing. Romano. Sono qui per aiutarti a capire di cosa hai bisogno. Dimmi: su quale immobile o progetto posso assisterti oggi?" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [phase, setPhase] = useState<Phase>('discovery');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [opzioni, setOpzioni] = useState<Opzione[]>([]);
  const [forchettaComplesso, setForchettaComplesso] = useState<{ min: number; max: number } | null>(null);
  const [leadNome, setLeadNome] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadTelefono, setLeadTelefono] = useState("");
  const [leadNote, setLeadNote] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, phase]);

  // Crea sessione al primo render
  useEffect(() => {
    const stored = localStorage.getItem('sportello_token');
    if (stored) { setSessionToken(stored); return; }

    fetch('/api/sportello/sessione', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          localStorage.setItem('sportello_token', d.data.session_token);
          setSessionToken(d.data.session_token);
        }
      })
      .catch(console.error);
  }, []);

  async function runAnalisiEPricing(token: string) {
    // Agente 2 + 3: routing
    setPhase('analisi');
    onPhaseChange('analisi');
    const routingRes = await fetch('/api/sportello/routing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(r => r.json());

    if (!routingRes.success) {
      setMessages(p => [...p, { role: 'ai', text: 'Si è verificato un errore nell\'analisi normativa. Puoi contattarci direttamente su WhatsApp.' }]);
      setPhase('discovery');
      return;
    }

    if (routingRes.routing === 'COMPLESSO') {
      const forchetta = { min: 50000, max: 500000 };
      setForchettaComplesso(forchetta);
      setPhase('lead');
      onPhaseChange('lead');
      setMessages(p => [...p, {
        role: 'ai',
        text: `Il tuo caso richiede una valutazione personalizzata con sopralluogo o calcoli specifici. Posso passare la tua richiesta direttamente all'Ing. Romano, che ti contatterà per un preventivo su misura. Lasciami i tuoi contatti.`,
      }]);
      return;
    }

    // Agente 5: pricing
    setPhase('pricing');
    onPhaseChange('pricing');
    const pricingRes = await fetch('/api/sportello/pricing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(r => r.json());

    if (!pricingRes.success || !pricingRes.opzioni?.length) {
      setMessages(p => [...p, { role: 'ai', text: 'Non sono riuscito a calcolare un\'offerta automatica. Ti metto in contatto con l\'Ingegnere.' }]);
      setPhase('lead');
      onPhaseChange('lead');
      return;
    }

    setOpzioni(pricingRes.opzioni);
    setPhase('offerte');
    onPhaseChange('offerte', pricingRes.opzioni);
    setMessages(p => [...p, {
      role: 'ai',
      text: `Ho analizzato il tuo caso. Ecco cosa posso offrirti: tre opzioni con diversi livelli di approfondimento. Scegli quella più adatta alle tue esigenze.`,
    }]);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || thinking || !sessionToken) return;

    const nextMsgs: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMsgs);
    setInput("");
    setThinking(true);

    const userTexts = nextMsgs.filter(m => m.role === "user").map(m => m.text);
    onProfileUpdate(extractProfile(userTexts));
    onMsgCountUpdate(userTexts.length);

    historyRef.current.push({ role: 'user', content: trimmed });

    try {
      const res = await fetch('/api/sportello/analisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          message: trimmed,
          history: historyRef.current.slice(0, -1),
        }),
      }).then(r => r.json());

      setThinking(false);

      if (!res.success) {
        setMessages(p => [...p, { role: 'ai', text: 'Si è verificato un errore. Riprova o contattaci su WhatsApp.' }]);
        return;
      }

      setMessages(p => [...p, { role: 'ai', text: res.reply }]);
      historyRef.current.push({ role: 'assistant', content: res.reply });

      if (res.discovery_done && res.brief) {
        onProfileUpdate({ ...extractProfile(userTexts), ...briefToProfile(res.brief) });
        await runAnalisiEPricing(sessionToken);
      }
    } catch {
      setThinking(false);
      setMessages(p => [...p, { role: 'ai', text: 'Errore di connessione. Controlla la rete e riprova.' }]);
    }
  }

  async function inviaLead() {
    if (!leadNome || !leadEmail) return;
    setLeadLoading(true);
    try {
      const res = await fetch('/api/sportello/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken, nome: leadNome, email: leadEmail, telefono: leadTelefono, note_aggiuntive: leadNote }),
      }).then(r => r.json());
      if (res.success) {
        setPhase('lead_inviato');
        onPhaseChange('lead_inviato');
        setMessages(p => [...p, { role: 'ai', text: `Perfetto ${leadNome}! Ho inoltrato la tua richiesta all'Ing. Romano. Riceverai un contatto entro 24 ore lavorative.` }]);
        localStorage.removeItem('sportello_token');
      }
    } finally {
      setLeadLoading(false);
    }
  }

  // Vista offerte
  if (phase === 'offerte' && opzioni.length > 0) {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-3" style={{ maxHeight: 420 }}>
        {opzioni.map((op) => (
          <div key={op.id} className={`border rounded-2xl p-4 ${TIPO_COLOR[op.tipo_erogazione]}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge className={`text-xs border ${TIPO_BADGE[op.tipo_erogazione]}`}>{TIPO_LABEL[op.tipo_erogazione]}</Badge>
              <span className="text-lg font-bold text-white">€{(op.prezzo_finale_centesimi / 100).toFixed(0)}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">{op.titolo_servizio}</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{op.descrizione_deliverable}</p>
            {op.sla_ore && <p className="text-xs text-slate-500 mb-2">Pronto in {op.sla_ore}h</p>}
            {op.avviso && (
              <div className="flex items-start gap-1.5 mb-3">
                <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500/80">{op.avviso}</p>
              </div>
            )}
            <a href={`/sportello/acquista/${op.id}`}>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl">
                <Euro className="w-3 h-3 mr-1" /> Acquista
              </Button>
            </a>
          </div>
        ))}
        <button
          onClick={() => { setPhase('lead'); onPhaseChange('lead'); }}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 pt-2"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Preferisco parlare con il tecnico
        </button>
        <div ref={bottomRef} />
      </div>
    );
  }

  // Vista lead form
  if (phase === 'lead' || phase === 'lead_inviato') {
    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-3" style={{ maxHeight: 420 }}>
        {messages.slice(-2).map((m, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${m.role === "ai" ? "bg-violet-600" : "bg-blue-600"}`}>
              {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "ai" ? "bg-slate-800 text-slate-100 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {forchettaComplesso && (
          <div className="bg-slate-800 rounded-xl p-3 text-xs text-slate-400">
            Forchetta orientativa: <span className="text-white font-semibold">€{(forchettaComplesso.min / 100).toFixed(0)}–€{(forchettaComplesso.max / 100).toFixed(0)}</span> (da definire con sopralluogo)
          </div>
        )}
        {phase !== 'lead_inviato' && (
          <div className="space-y-2">
            <input value={leadNome} onChange={e => setLeadNome(e.target.value)} placeholder="Nome e cognome *" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            <input value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="Email *" type="email" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            <input value={leadTelefono} onChange={e => setLeadTelefono(e.target.value)} placeholder="Telefono (opzionale)" className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
            <textarea value={leadNote} onChange={e => setLeadNote(e.target.value)} placeholder="Note aggiuntive (opzionale)" rows={2} className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none" />
            <Button onClick={inviaLead} disabled={!leadNome || !leadEmail || leadLoading} className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm">
              {leadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia richiesta preventivo'}
            </Button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    );
  }

  // Vista chat discovery/analisi/pricing
  return (
    <div className="flex flex-col h-full">
      {/* Indicatore fase */}
      {(phase === 'analisi' || phase === 'pricing') && (
        <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
          <span className="text-xs text-slate-400">
            {phase === 'analisi' ? 'Analisi normativa in corso...' : 'Calcolo offerte personalizzate...'}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: 280 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${m.role === "ai" ? "bg-violet-600" : "bg-blue-600"}`}>
              {m.role === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "ai" ? "bg-slate-800 text-slate-100 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
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

      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Descrivi il tuo immobile o progetto..."
            disabled={thinking || phase !== 'discovery'}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || thinking || phase !== 'discovery'}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-600">AI tracciata · ISO 42001 · POP-AI-01</p>
          <button
            onClick={() => { setPhase('lead'); onPhaseChange('lead'); }}
            className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3" /> Parla col tecnico
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mappa immobile ───────────────────────────────────────────────────────────
function MapPanel({ ubicazione }: { ubicazione?: string }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    if (!ubicazione) { setEmbedUrl(null); setLabel(""); return; }
    setLoading(true);
    setLabel(ubicazione);
    const query = encodeURIComponent(`${ubicazione}, Italia`);
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { "Accept-Language": "it" },
    })
      .then(r => r.json())
      .then((data: { lat: string; lon: string }[]) => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const delta = 0.03;
          const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
          setEmbedUrl(
            `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
          );
        } else {
          setEmbedUrl(null);
        }
      })
      .catch(() => setEmbedUrl(null))
      .finally(() => setLoading(false));
  }, [ubicazione]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">Localizzazione immobile</span>
        </div>
        {label && (
          <span className="text-xs text-slate-400 truncate max-w-[120px]">{label}</span>
        )}
      </div>

      <div className="relative" style={{ height: 220 }}>
        {!ubicazione && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-600">
            <MapPin className="w-8 h-8 opacity-30" />
            <p className="text-xs">L&apos;ubicazione apparirà qui</p>
            <p className="text-xs opacity-60">Menziona una città in chat</p>
          </div>
        )}
        {ubicazione && loading && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        {embedUrl && !loading && (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            title="Localizzazione immobile"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
        {ubicazione && !loading && !embedUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
            Posizione non trovata per &quot;{ubicazione}&quot;
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">
          Mappa © <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">OpenStreetMap</a> contributors
        </p>
      </div>
    </div>
  );
}

// ─── Pagina principale ────────────────────────────────────────────────────────
export default function HomePage() {
  const [profile, setProfile] = useState<TechProfile>({});
  const [msgCount, setMsgCount] = useState(0);

  const handleProfileUpdate = useCallback((p: TechProfile) => setProfile(p), []);
  const handleMsgCountUpdate = useCallback((n: number) => setMsgCount(n), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">SR</div>
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6 items-start">

          {/* Colonna sinistra */}
          <div className="lg:col-span-1 lg:pt-4">
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
          <div id="chat" className="lg:col-span-1 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/20">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
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
                <Badge className="bg-violet-900/50 text-violet-300 text-xs border border-violet-700">ISO 42001</Badge>
              </div>
            </div>
            <ChatAgentica onProfileUpdate={handleProfileUpdate} onMsgCountUpdate={handleMsgCountUpdate} onPhaseChange={() => {}} />
          </div>

          {/* Scheda tecnica + mappa */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <SchedaTecnica profile={profile} msgCount={msgCount} />
            <MapPanel ubicazione={profile.ubicazione} />
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
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-colors">
                <div className={`bg-gradient-to-br ${std.color} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-white/80">{std.icon}</div>
                    <span className="text-xs font-mono font-bold bg-white/20 text-white px-3 py-1 rounded-full">{std.code}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{std.title}</h3>
                </div>
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

      {/* ── Contatti ── */}
      <section className="py-20 px-4 border-t border-slate-800" id="contatti">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 mb-4">Contatti</Badge>
            <h2 className="text-3xl font-bold mb-3">Scrivici o chiamaci</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Per una prima consulenza preliminare gratuita contattaci direttamente.
              Nessun impegno, nessun preventivo automatico: parlerai con l&apos;Ingegnere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* WhatsApp */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center text-xl">💬</div>
              <div>
                <p className="font-semibold text-white mb-1">WhatsApp</p>
                <p className="text-sm text-slate-400 mb-4">Risposta entro poche ore in orario lavorativo (lun–ven 9:00–18:00).</p>
                <a
                  href={`https://wa.me/393476336545?text=${encodeURIComponent("Ciao, vorrei una consulenza tecnica.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm">
                    💬 Apri chat WhatsApp
                  </Button>
                </a>
              </div>
              <p className="text-xs text-slate-600">+39 347 633 6545 · Ing. Domenico Romano</p>
            </div>

            {/* Dati studio */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-xl">🏛️</div>
              <p className="font-semibold text-white">Studio Tecnico Romano</p>
              <div className="space-y-1.5 text-sm text-slate-400">
                <p>Ing. Domenico Romano</p>
                <p>P.IVA / C.F.: <span className="text-slate-300">— (inserire)</span></p>
                <p>Albo Ingegneri: <span className="text-slate-300">— (inserire n. iscrizione)</span></p>
                <p>Sede: <span className="text-slate-300">— (inserire indirizzo)</span></p>
                <p>PEC: <span className="text-slate-300">— (inserire)</span></p>
              </div>
            </div>
          </div>

          {/* Informativa privacy sintetica */}
          <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Informativa sintetica sul trattamento dei dati personali — Art. 13 GDPR (Reg. UE 2016/679)
            </p>
            <div className="space-y-3 text-xs text-slate-500 leading-relaxed">
              <p>
                <span className="text-slate-300 font-medium">Titolare del trattamento:</span>{" "}
                Ing. Domenico Romano, Studio Tecnico Romano — contatto: vedere sezione sopra.
              </p>
              <p>
                <span className="text-slate-300 font-medium">Finalità e base giuridica:</span>{" "}
                I dati forniti tramite questa chat o tramite WhatsApp sono trattati esclusivamente per
                l&apos;erogazione del servizio di consulenza tecnica richiesto (art. 6, par. 1, lett. b GDPR —
                esecuzione di un contratto o misure precontrattuali) e, previo consenso, per comunicazioni
                informative sullo studio (art. 6, par. 1, lett. a GDPR).
              </p>
              <p>
                <span className="text-slate-300 font-medium">Dati trattati:</span>{" "}
                Dati identificativi, recapiti, informazioni tecniche sull&apos;immobile o sul progetto fornite
                spontaneamente dall&apos;utente nel corso della conversazione.
              </p>
              <p>
                <span className="text-slate-300 font-medium">Conservazione:</span>{" "}
                I dati sono conservati per il tempo strettamente necessario all&apos;erogazione del servizio e
                comunque non oltre 10 anni dall&apos;ultimo contatto, salvo obblighi di legge.
              </p>
              <p>
                <span className="text-slate-300 font-medium">Comunicazione a terzi:</span>{" "}
                I dati non sono ceduti a terzi. Possono essere comunicati a collaboratori dello studio
                (nominati responsabili del trattamento ex art. 28 GDPR) esclusivamente per le finalità
                sopra indicate. L&apos;infrastruttura cloud utilizza Hetzner Cloud GmbH (UE).
              </p>
              <p>
                <span className="text-slate-300 font-medium">Diritti dell&apos;interessato:</span>{" "}
                L&apos;utente ha diritto di accesso, rettifica, cancellazione, limitazione, portabilità e
                opposizione al trattamento (artt. 15–22 GDPR), nonché di proporre reclamo al Garante per
                la protezione dei dati personali (www.garanteprivacy.it). Le richieste possono essere
                inviate al titolare tramite i recapiti indicati.
              </p>
              <p>
                <span className="text-slate-300 font-medium">Uso dell&apos;AI:</span>{" "}
                Questo sito utilizza un assistente AI per la raccolta preliminare dei dati tecnici. Ogni
                interazione è registrata (log POP-AI-01 — ISO 42001) e supervisionata dall&apos;Ingegnere.
                Nessuna decisione automatizzata con effetti giuridici è adottata senza intervento umano.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-800">
              <Link href="/legal/privacy" className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                Privacy Policy completa
              </Link>
              <span className="text-slate-700">·</span>
              <Link href="/legal/terms" className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                Termini e condizioni
              </Link>
              <span className="text-slate-700">·</span>
              <Link href="/legal/garanzia-consulenza" className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                Garanzia consulenza
              </Link>
              <span className="text-slate-700">·</span>
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
                Garante Privacy ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-6 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">SR</div>
            <span>© 2025 Studio Ing. Romano — Technical Advisory</span>
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
