/**
 * AGENTE 2 — Normativista
 * Analisi normativa automatica basata sul BRIEF.
 * Knowledge base interna statica (aggiornabile manualmente).
 * Output: QUADRO NORMATIVO JSON.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Brief } from './agente-1-discovery';
import { logAgente } from './log-agente';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface QuadroNormativo {
  normative_applicabili: string[];
  titolo_abilitativo?: string;      // non_necessario | CILA | SCIA | permesso_costruire | altro
  ente_competente?: string;
  deposito_obbligatorio?: boolean;
  risultato_atteso?: string;
  complessita: 'BASSA' | 'MEDIA' | 'ALTA' | 'MOLTO_ALTA';
  richiede_sopralluogo: boolean;
  richiede_calcoli_strutturali: boolean;
  livello_urgenza_normativa?: string;
  note_normative?: string;
}

const SYSTEM_PROMPT = `Sei un esperto di normativa tecnica edilizia italiana.
Dato un BRIEF tecnico di un immobile/progetto, analizza le normative applicabili e
produci un QUADRO NORMATIVO JSON strutturato.

KNOWLEDGE BASE NORMATIVA (usala come riferimento primario):

| Ambito | Normativa principale |
|--------|---------------------|
| Strutture/Sismica | NTC 2018 (D.M. 17/01/2018), Circ. Min. 7/2019 |
| Edilizia generale | DPR 380/2001 (T.U. Edilizia), L.R. Sicilia 16/2016 |
| Prevenzione Incendi | D.Lgs 139/2006, D.M. 3/8/2015, Codice Prevenzione Incendi |
| Sicurezza Cantiere | D.Lgs 81/2008 Titolo IV |
| Energia | D.Lgs 192/2005, DM 26/06/2015 |
| Accessibilità | DM 236/1989, DPR 503/1996 |
| Agibilità/Abitabilità | DPR 380/2001 art. 24-25 |
| Catasto | R.D. 1572/1931, Circ. 2/2016 Agenzia Entrate |
| Bonus fiscali | L. 77/2020 (110%), L. 234/2021, Decreto Aiuti |

OUTPUT richiesto (solo JSON, nessun testo aggiuntivo):
{
  "normative_applicabili": ["NTC 2018", "..."],
  "titolo_abilitativo": "non_necessario|CILA|SCIA|permesso_costruire|altro",
  "ente_competente": "Comune|Genio Civile|VVF|INAIL|...",
  "deposito_obbligatorio": true|false,
  "risultato_atteso": "descrizione breve del documento/parere da produrre",
  "complessita": "BASSA|MEDIA|ALTA|MOLTO_ALTA",
  "richiede_sopralluogo": true|false,
  "richiede_calcoli_strutturali": true|false,
  "livello_urgenza_normativa": "scadenza_imminente|nessuna_scadenza|obbligo_pregresso",
  "note_normative": "eventuali note rilevanti"
}

Rispondi SOLO con il JSON, senza markdown code block.`;

export async function analyzeNormativa(
  brief: Brief,
  sessioneId?: number
): Promise<QuadroNormativo> {
  const briefStr = JSON.stringify(brief, null, 2);

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Analizza questo BRIEF e produci il QUADRO NORMATIVO:\n\n${briefStr}` }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';

  await logAgente({
    usoPrevisto: 'agente_2_normativista',
    prompt: briefStr,
    risposta: raw,
    sessioneId,
    rischioLivello: 'BASSO',
  });

  try {
    // Rimuovi eventuale code block rimasto
    const clean = raw.replace(/```(?:json)?/g, '').trim();
    return JSON.parse(clean) as QuadroNormativo;
  } catch {
    console.error('[Agente2] JSON non valido:', raw);
    return {
      normative_applicabili: [],
      complessita: 'MEDIA',
      richiede_sopralluogo: false,
      richiede_calcoli_strutturali: false,
    };
  }
}
