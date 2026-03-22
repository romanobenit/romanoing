/**
 * AGENTE 5 — Pricer / Preventivatore
 * Calcolo prezzo dinamico e composizione del servizio su misura.
 * Produce fino a 3 opzioni (PLATFORM, IMMEDIATA, INGEGNERE) per percorsi immediati.
 * Per COMPLESSO produce forchetta orientativa e raccoglie lead.
 *
 * ISO 42001: ogni adeguamento è registrato in rationale_pricing per explainability audit.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Brief } from './agente-1-discovery';
import type { QuadroNormativo } from './agente-2-normativista';
import type { Percorso } from './agente-3-router';
import { logAgente } from './log-agente';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Adeguamento {
  motivo: string;
  moltiplicatore: number;
}

export interface Opzione {
  tipo_erogazione: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE';
  titolo_servizio: string;
  descrizione_deliverable: string;
  prezzo_base_centesimi: number;
  adeguamenti: Adeguamento[];
  prezzo_finale_centesimi: number;
  rationale_pricing: object;    // trail completo per ISO 42001
  sla_ore: number | null;
  avviso: string | null;
}

export interface PricerOutput {
  opzioni: Opzione[];
  forchetta_complesso?: { min_centesimi: number; max_centesimi: number };
}

// ─── Tabelle prezzi base ────────────────────────────────────────────────────

const FASCE: Record<'PLATFORM' | 'IMMEDIATA', { min: number; max: number; floor: number }> = {
  PLATFORM:  { min: 5000,  max: 14900,  floor: 5000  },   // €50–€149
  IMMEDIATA: { min: 15000, max: 40000,  floor: 15000 },   // €150–€400
};

const INGEGNERE_BASE = 15000;  // €150 (base IMMEDIATA per moltiplicatore)
const INGEGNERE_FLOOR = 30000; // €300

const POSIZIONE_FASCIA: Record<string, number> = {
  BASSA:     0.28,  // 20–35% della fascia
  MEDIA:     0.57,  // 50–65% della fascia
  ALTA:      0.82,  // 75–90% della fascia
  MOLTO_ALTA: 1.0,
};

const MOLTIPLICATORI_INGEGNERE: Record<string, number> = {
  BASSA:     1,     // floor €300
  MEDIA:     3,     // €150×3 = €450
  ALTA:      4,     // €150×4 = €600
  MOLTO_ALTA: 8.67, // base fissa €1300 — arrotondato a moltiplicatore
};

function calcolaBaseImmediata(complessita: string): number {
  const fascia = FASCE.IMMEDIATA;
  const pct = POSIZIONE_FASCIA[complessita] ?? 0.57;
  return Math.max(fascia.floor, Math.round(fascia.min + pct * (fascia.max - fascia.min)));
}

function calcolaBasePlatform(complessita: string): number {
  const fascia = FASCE.PLATFORM;
  const pct = POSIZIONE_FASCIA[complessita] ?? 0.57;
  return Math.max(fascia.floor, Math.round(fascia.min + pct * (fascia.max - fascia.min)));
}

function calcolaBaseIngegnere(complessita: string): number {
  const mult = MOLTIPLICATORI_INGEGNERE[complessita] ?? 3;
  return Math.max(INGEGNERE_FLOOR, Math.round(INGEGNERE_BASE * mult));
}

function applicaMoltiplicatori(
  base: number,
  brief: Brief,
  quadro: QuadroNormativo,
  isFirstTime: boolean
): { finale: number; adeguamenti: Adeguamento[] } {
  const adeguamenti: Adeguamento[] = [];
  let prezzo = base;

  const apply = (motivo: string, m: number) => {
    adeguamenti.push({ motivo, moltiplicatore: m });
    prezzo = Math.round(prezzo * m);
  };

  if (brief.urgenza === 'urgente') apply('Urgenza < 48h', 1.25);
  if (quadro.normative_applicabili.length >= 3) apply('3+ normative intersecanti', 1.15);
  if (['1', '2'].includes(brief.zona_sismica ?? '')) apply('Zona sismica 1 o 2', 1.10);
  if (['AZIENDA', 'ENTE_PUBBLICO'].includes(brief.soggetto)) apply('Committente azienda/ente pubblico', 1.10);
  if (isFirstTime) apply('Prima consulenza (sconto)', 0.90);

  return { finale: prezzo, adeguamenti };
}

// ─── Titoli e descrizioni su misura (Claude API) ───────────────────────────

async function generateServiceDescription(
  brief: Brief,
  quadro: QuadroNormativo,
  tipoErogazione: 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE',
  sessioneId?: number
): Promise<{ titolo: string; descrizione: string }> {
  const TIPO_LABEL: Record<string, string> = {
    PLATFORM: 'documento informativo AI (orientativo, non professionale)',
    IMMEDIATA: 'analisi tecnica AI approfondita (senza firma formale)',
    INGEGNERE: 'parere tecnico firmato digitalmente dall\'Ing. Romano (eIDAS)',
  };

  const prompt = `Dato questo BRIEF e QUADRO NORMATIVO, scrivi in italiano:
1. TITOLO: max 10 parole, specifico per il caso (es. "Parere sulla conformità della tettoia in legno a Palermo")
2. DESCRIZIONE DELIVERABLE: 2-3 frasi che descrivono ESATTAMENTE cosa verrà prodotto come "${TIPO_LABEL[tipoErogazione]}"

BRIEF: ${JSON.stringify(brief)}
QUADRO: ${JSON.stringify(quadro)}
TIPO: ${tipoErogazione}

Rispondi SOLO con JSON: {"titolo": "...", "descrizione": "..."}`;

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';

  await logAgente({
    usoPrevisto: `agente_5_pricer_desc_${tipoErogazione.toLowerCase()}`,
    prompt,
    risposta: raw,
    sessioneId,
    rischioLivello: 'BASSO',
  });

  try {
    const clean = raw.replace(/```(?:json)?/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      titolo: `Consulenza tecnica — ${brief.azione ?? 'parere'} a ${brief.comune ?? 'Italia'}`,
      descrizione: `Analisi del tuo caso specifico con riferimento alle normative applicabili.`,
    };
  }
}

// ─── Funzione principale ────────────────────────────────────────────────────

export async function calculatePricing(
  brief: Brief,
  quadro: QuadroNormativo,
  percorso: Percorso,
  isFirstTime: boolean = true,
  sessioneId?: number
): Promise<PricerOutput> {
  if (percorso === 'COMPLESSO') {
    return {
      opzioni: [],
      forchetta_complesso: { min_centesimi: 50000, max_centesimi: 500000 },
    };
  }

  const complessita = quadro.complessita;
  const tipiDaPresentare: ('PLATFORM' | 'IMMEDIATA' | 'INGEGNERE')[] = ['PLATFORM', 'IMMEDIATA', 'INGEGNERE'];

  const opzioni: Opzione[] = await Promise.all(
    tipiDaPresentare.map(async (tipo) => {
      const base =
        tipo === 'PLATFORM'  ? calcolaBasePlatform(complessita) :
        tipo === 'IMMEDIATA' ? calcolaBaseImmediata(complessita) :
                               calcolaBaseIngegnere(complessita);

      const { finale, adeguamenti } = applicaMoltiplicatori(base, brief, quadro, isFirstTime);

      const { titolo, descrizione } = await generateServiceDescription(brief, quadro, tipo, sessioneId);

      const rationale = {
        complessita,
        base_centesimi: base,
        adeguamenti,
        finale_centesimi: finale,
        is_first_time: isFirstTime,
        calcolato_at: new Date().toISOString(),
      };

      const AVVISI: Record<string, string | null> = {
        PLATFORM: 'Contenuto orientativo generato da AI. Non sostituisce parere professionale.',
        IMMEDIATA: 'Analisi tecnica AI approfondita. Non costituisce parere professionale firmato.',
        INGEGNERE: null,
      };

      const SLA: Record<string, number | null> = {
        PLATFORM: null,
        IMMEDIATA: null,
        INGEGNERE: complessita === 'BASSA' ? 24 : complessita === 'ALTA' ? 72 : 48,
      };

      return {
        tipo_erogazione: tipo,
        titolo_servizio: titolo,
        descrizione_deliverable: descrizione,
        prezzo_base_centesimi: base,
        adeguamenti,
        prezzo_finale_centesimi: finale,
        rationale_pricing: rationale,
        sla_ore: SLA[tipo],
        avviso: AVVISI[tipo],
      };
    })
  );

  return { opzioni };
}
