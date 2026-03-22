/**
 * AGENTE 4 — Content Generator
 * Genera la risposta tecnica dettagliata per il percorso IMMEDIATA.
 * Richiede BRIEF + QUADRO NORMATIVO già elaborati dagli agenti 1 e 2.
 * Output: documento tecnico strutturato in JSON.
 *
 * ISO 42001: loggato via POP-AI-01, uso_previsto = "agente_4_content".
 * AVVERTENZA: output non costituisce parere professionale firmato.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Brief } from './agente-1-discovery';
import type { QuadroNormativo } from './agente-2-normativista';
import { logAgente } from './log-agente';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ContenutoTecnico {
  executive_summary: string;           // 2-3 frasi sintetiche per il cliente
  iter_procedurale: string[];          // array di step ordinati
  rischi_principali: string[];         // rischi tecnici/normativi da considerare
  documenti_necessari: string[];       // documenti da predisporre
  tempistiche_stimate: string;         // es. "2-4 settimane per il CILA"
  avvertenze_professionali: string;    // disclaimer obbligatorio ISO 42001 A.9
  note_tecniche?: string;              // dettagli aggiuntivi per il tecnico
}

const SYSTEM_PROMPT = `Sei un tecnico specializzato dello Studio Ing. Romano.
Devi produrre un'analisi tecnica approfondita per un cliente che ha acquistato
una consulenza IMMEDIATA (risposta AI entro SLA, senza firma professionale).

Il tuo output DEVE essere un JSON valido con questa struttura:
{
  "executive_summary": "2-3 frasi per il cliente non tecnico che spiegano il caso e la risposta",
  "iter_procedurale": ["Step 1: ...", "Step 2: ...", "Step N: ..."],
  "rischi_principali": ["Rischio 1: ...", "Rischio 2: ..."],
  "documenti_necessari": ["Documento 1", "Documento 2"],
  "tempistiche_stimate": "X-Y settimane/giorni per [procedura principale]",
  "avvertenze_professionali": "Questa analisi è generata da AI e ha carattere informativo. Non sostituisce un parere tecnico firmato da un professionista abilitato.",
  "note_tecniche": "Eventuali dettagli tecnici aggiuntivi, riferimenti normativi specifici, calcoli orientativi"
}

REGOLE:
1. Usa linguaggio tecnico preciso ma comprensibile al cliente
2. Cita sempre le normative applicabili per ogni affermazione tecnica
3. Ogni rischio deve avere una contromisura suggerita
4. Le tempistiche devono essere realistiche per l'Italia (non ottimistiche)
5. Il disclaimer in avvertenze_professionali è obbligatorio e non va modificato
6. Rispondi SOLO con il JSON valido, senza markdown o testo aggiuntivo`;

export async function generateContenutoTecnico(
  brief: Brief,
  quadro: QuadroNormativo,
  sessioneId?: number
): Promise<ContenutoTecnico> {
  const inputStr = JSON.stringify({ brief, quadro_normativo: quadro }, null, 2);

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Genera l'analisi tecnica per questo caso:\n\n${inputStr}`,
      },
    ],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';

  // Log POP-AI-01 — rischio MEDIO perché il brief può contenere info sull'immobile
  await logAgente({
    usoPrevisto: 'agente_4_content',
    prompt: inputStr,
    risposta: raw,
    sessioneId,
    rischioLivello: 'MEDIO',
  });

  try {
    const clean = raw.replace(/```(?:json)?/g, '').trim();
    return JSON.parse(clean) as ContenutoTecnico;
  } catch {
    console.error('[Agente4] JSON non valido:', raw);
    return {
      executive_summary: 'Analisi tecnica del caso in elaborazione. Ti contatteremo entro breve.',
      iter_procedurale: ['Verifica della documentazione disponibile', 'Analisi normativa specifica', 'Predisposizione della risposta tecnica'],
      rischi_principali: ['Verifica la completezza della documentazione'],
      documenti_necessari: ['Documentazione planimetrica', 'Relazione tecnica esistente'],
      tempistiche_stimate: 'Dipendente dalla complessità del caso',
      avvertenze_professionali: 'Questa analisi è generata da AI e ha carattere informativo. Non sostituisce un parere tecnico firmato da un professionista abilitato.',
    };
  }
}
