/**
 * AGENTE 3 — Router / Classifier
 * Decision matrix: determina il percorso PLATFORM | IMMEDIATA | INGEGNERE | COMPLESSO.
 * Non definisce il prezzo — quello spetta ad Agente 5.
 */

import type { Brief } from './agente-1-discovery';
import type { QuadroNormativo } from './agente-2-normativista';

export type Percorso = 'PLATFORM' | 'IMMEDIATA' | 'INGEGNERE' | 'COMPLESSO';

export interface RouterOutput {
  percorso_primario: Percorso;
  motivo: string;
}

export function routeCase(brief: Brief, quadro: QuadroNormativo): RouterOutput {
  // ── Blocchi duri → COMPLESSO ────────────────────────────────
  if (quadro.richiede_sopralluogo) {
    return { percorso_primario: 'COMPLESSO', motivo: 'Richiede sopralluogo fisico' };
  }
  if (quadro.richiede_calcoli_strutturali) {
    return { percorso_primario: 'COMPLESSO', motivo: 'Richiede calcoli strutturali completi o modello FEM' };
  }
  if (quadro.complessita === 'MOLTO_ALTA') {
    return { percorso_primario: 'COMPLESSO', motivo: 'Complessità sistemica molto alta — richiede valutazione personalizzata' };
  }

  // ── Percorsi immediati ──────────────────────────────────────
  const azione = brief.azione ?? '';

  // Azioni risolvibili con parere formale firmato (INGEGNERE)
  const azioniIngegnere = ['verifica_sismica', 'certificazione', 'perizia', 'antincendio'];
  if (azioniIngegnere.includes(azione) && quadro.complessita !== 'BASSA') {
    return { percorso_primario: 'INGEGNERE', motivo: 'Richiede documento con valore professionale e firma digitale' };
  }

  // Azioni puramente informative o di screening (PLATFORM)
  const azioniPlatform = ['parere_tecnico'];
  if (azioniPlatform.includes(azione) && quadro.complessita === 'BASSA') {
    return { percorso_primario: 'PLATFORM', motivo: 'Domanda informativa — risposta AI orientativa adeguata' };
  }

  // Urgenza alta senza necessità di firma → IMMEDIATA
  if (brief.urgenza === 'urgente') {
    return { percorso_primario: 'IMMEDIATA', motivo: 'Urgenza elevata — analisi tecnica AI approfondita immediata' };
  }

  // Default: analisi tecnica AI approfondita
  return { percorso_primario: 'IMMEDIATA', motivo: 'Analisi tecnica risolvibile da remoto — risposta AI approfondita' };
}
