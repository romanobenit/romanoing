/**
 * AGENTE 1 — Problem Discovery
 * Intervista guidata (max 7 scambi), produce BRIEF JSON strutturato.
 * Conforme ISO/IEC 42001 — ogni chiamata loggata via logAgente().
 */

import Anthropic from '@anthropic-ai/sdk';
import { logAgente } from './log-agente';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Brief {
  soggetto: 'PRIVATO' | 'AZIENDA' | 'CONDOMINIO' | 'ENTE_PUBBLICO';
  immobile_tipo?: string;      // residenziale | commerciale | industriale | infrastruttura
  comune?: string;
  zona_sismica?: string;       // 1 | 2 | 3 | 4
  azione?: string;             // verifica_sismica | ristrutturazione | certificazione | perizia | parere_tecnico | antincendio | energia | altro
  urgenza?: 'urgente' | 'normale' | 'nessuna';
  documenti_disponibili?: string[];
  superficie_mq?: number;
  anno_costruzione?: number;
  note_libere?: string;
  completezza: number;         // 0-100 — quante info fondamentali abbiamo
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Sei l'Assistente AI dello Studio Tecnico Ing. Romano.
Il tuo ruolo è raccogliere informazioni tecniche sul problema del visitatore
attraverso una conversazione guidata e naturale (massimo 7 scambi totali).

OBIETTIVO: produrre un BRIEF JSON strutturato con questi campi:
- soggetto: PRIVATO | AZIENDA | CONDOMINIO | ENTE_PUBBLICO
- immobile_tipo: residenziale | commerciale | industriale | infrastruttura
- comune: nome del comune italiano
- zona_sismica: 1 | 2 | 3 | 4 (se noto o deducibile dal comune)
- azione: verifica_sismica | ristrutturazione | certificazione | perizia | parere_tecnico | antincendio | energia | altro
- urgenza: urgente | normale | nessuna
- documenti_disponibili: array di string (planimetrie, relazione_geologica, visura, foto, ecc.)
- superficie_mq: numero (se menzionato)
- anno_costruzione: anno (se menzionato)
- note_libere: testo libero con dettagli importanti

REGOLE:
1. Fai UNA domanda per volta, in modo naturale e conversazionale in italiano.
2. Usa un tono professionale ma accessibile. Non usare termini tecnici senza spiegarli.
3. Non chiedere dati personali (nome completo, CF, email, telefono) — verranno raccolti dopo.
4. Quando hai abbastanza informazioni (minimo: soggetto, azione, comune),
   indica nella risposta il tag speciale: [BRIEF_PRONTO]
5. Al tag [BRIEF_PRONTO] includi immediatamente il JSON del brief in un blocco \`\`\`json ... \`\`\`
6. Il campo "completezza" va da 0 (nulla) a 100 (tutto). Diventa [BRIEF_PRONTO] appena superi 60.

IMPORTANTE — PRIVACY & ISO 42001:
- Non conservare dati personali nella conversazione
- Usa solo informazioni tecniche sull'immobile/progetto
- Ogni tua risposta viene loggata automaticamente per supervisione umana (POP-AI-01)`;

export async function processDiscovery(
  history: ChatTurn[],
  userMessage: string,
  sessioneId?: number
): Promise<{ reply: string; brief?: Brief; done: boolean }> {
  const messages: Anthropic.MessageParam[] = [
    ...history.map(t => ({ role: t.role as 'user' | 'assistant', content: t.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages,
  });

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';

  // Log POP-AI-01
  await logAgente({
    usoPrevisto: 'agente_1_discovery',
    prompt: `[storia:${history.length} scambi] ${userMessage}`,
    risposta: reply,
    sessioneId,
    rischioLivello: 'BASSO',
  });

  // Estrai BRIEF se presente
  let brief: Brief | undefined;
  const done = reply.includes('[BRIEF_PRONTO]');

  if (done) {
    const jsonMatch = reply.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        brief = JSON.parse(jsonMatch[1]) as Brief;
      } catch {
        console.error('[Agente1] JSON brief non valido:', jsonMatch[1]);
      }
    }
  }

  // Puliamo il tag dalla risposta finale
  const cleanReply = reply.replace('[BRIEF_PRONTO]', '').replace(/```json[\s\S]*?```/, '').trim();

  return { reply: cleanReply, brief, done };
}
