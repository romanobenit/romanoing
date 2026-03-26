/**
 * Mock Agente 5 — solo per sviluppo locale (NODE_ENV=development).
 * Produce opzioni di prezzo rule-based senza chiamare Anthropic.
 */
import type { Brief } from './agente-1-discovery';
import type { QuadroNormativo } from './agente-2-normativista';
import type { Percorso } from './agente-3-router';
import type { Opzione, PricerOutput } from './agente-5-pricer';

const PREZZI_BASE: Record<string, { platform: number; immediata: number; ingegnere: number }> = {
  verifica_sismica: { platform: 14900,  immediata: 29900,  ingegnere: 59900  },
  ristrutturazione: { platform: 9900,   immediata: 19900,  ingegnere: 49900  },
  energia:          { platform: 5900,   immediata: 14900,  ingegnere: 29900  },
  antincendio:      { platform: 7900,   immediata: 19900,  ingegnere: 39900  },
  certificazione:   { platform: 8900,   immediata: 19900,  ingegnere: 44900  },
  perizia:          { platform: 9900,   immediata: 24900,  ingegnere: 49900  },
  parere_tecnico:   { platform: 4900,   immediata: 9900,   ingegnere: 19900  },
};

export function mockPricing(
  brief: Brief,
  _quadro: QuadroNormativo,
  percorso: Percorso,
): PricerOutput {
  if (percorso === 'COMPLESSO') {
    return {
      opzioni: [],
      forchetta_complesso: { min_centesimi: 50000, max_centesimi: 500000 },
    };
  }

  const azione = brief.azione ?? 'parere_tecnico';
  const prezzi = PREZZI_BASE[azione] ?? PREZZI_BASE['parere_tecnico'];
  const mock_note = '[Dev mock — prezzi simulati]';

  const opzioni: Opzione[] = [];

  if (percorso === 'PLATFORM' || percorso === 'INGEGNERE') {
    opzioni.push({
      tipo_erogazione: 'PLATFORM',
      titolo_servizio: `Report AI — ${azione.replace(/_/g, ' ')}`,
      descrizione_deliverable: 'Documento PDF generato dall\'AI con analisi normativa, riferimenti legislativi e indicazioni operative. Consegna immediata.',
      prezzo_base_centesimi: prezzi.platform,
      adeguamenti: [],
      prezzo_finale_centesimi: prezzi.platform,
      rationale_pricing: { mock: true, note: mock_note },
      sla_ore: 1,
      avviso: mock_note,
    });
  }

  if (percorso === 'IMMEDIATA' || percorso === 'INGEGNERE') {
    opzioni.push({
      tipo_erogazione: 'IMMEDIATA',
      titolo_servizio: `Analisi AI — ${azione.replace(/_/g, ' ')}`,
      descrizione_deliverable: 'Analisi approfondita con revisione tecnica dell\'ingegnere. Risposta entro 24 ore.',
      prezzo_base_centesimi: prezzi.immediata,
      adeguamenti: [],
      prezzo_finale_centesimi: prezzi.immediata,
      rationale_pricing: { mock: true, note: mock_note },
      sla_ore: 24,
      avviso: mock_note,
    });
  }

  opzioni.push({
    tipo_erogazione: 'INGEGNERE',
    titolo_servizio: `Parere firmato — ${azione.replace(/_/g, ' ')}`,
    descrizione_deliverable: 'Relazione tecnica firmata e asseverata dall\'Ing. Romano. Include timbro professionale e validità legale.',
    prezzo_base_centesimi: prezzi.ingegnere,
    adeguamenti: [],
    prezzo_finale_centesimi: prezzi.ingegnere,
    rationale_pricing: { mock: true, note: mock_note },
    sla_ore: 72,
    avviso: mock_note,
  });

  return { opzioni };
}
