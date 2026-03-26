/**
 * Mock Agente 2 — solo per sviluppo locale (NODE_ENV=development).
 * Produce un QuadroNormativo rule-based senza chiamare Anthropic.
 */
import type { Brief } from './agente-1-discovery';
import type { QuadroNormativo } from './agente-2-normativista';

export function mockNormativa(brief: Brief): QuadroNormativo {
  const azione = brief.azione ?? 'altro';
  const comp = brief.complessita ?? 'MEDIA';

  const MAP: Record<string, Partial<QuadroNormativo>> = {
    verifica_sismica: {
      normative_applicabili: ['NTC 2018 (D.M. 17/01/2018)', 'Circ. Min. 7/2019'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'Genio Civile',
      deposito_obbligatorio: true,
      risultato_atteso: 'Relazione di valutazione vulnerabilità sismica',
      richiede_calcoli_strutturali: false,  // true solo per edifici strategici (mock semplificato)
    },
    ristrutturazione: {
      normative_applicabili: ['DPR 380/2001', 'NTC 2018'],
      titolo_abilitativo: 'SCIA',
      ente_competente: 'Comune',
      deposito_obbligatorio: false,
      risultato_atteso: 'Progetto esecutivo e direzione lavori',
    },
    energia: {
      normative_applicabili: ['D.Lgs 192/2005', 'DM 26/06/2015'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'ENEA',
      deposito_obbligatorio: false,
      risultato_atteso: 'APE e relazione tecnica ex L.10/91',
    },
    antincendio: {
      normative_applicabili: ['D.Lgs 139/2006', 'D.M. 3/8/2015'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'VVF',
      deposito_obbligatorio: true,
      risultato_atteso: 'Valutazione del rischio incendio (DVR-I)',
    },
    certificazione: {
      normative_applicabili: ['DPR 380/2001 art. 67', 'NTC 2018'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'Genio Civile',
      deposito_obbligatorio: true,
      risultato_atteso: 'Certificato di collaudo statico',
    },
    perizia: {
      normative_applicabili: ['DPR 380/2001', 'R.D. 1572/1931'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'Tribunale/Privato',
      deposito_obbligatorio: false,
      risultato_atteso: 'Perizia tecnica asseverata',
    },
    parere_tecnico: {
      normative_applicabili: ['DPR 380/2001'],
      titolo_abilitativo: 'non_necessario',
      ente_competente: 'Ordine Ingegneri',
      deposito_obbligatorio: false,
      risultato_atteso: 'Parere tecnico scritto',
    },
  };

  const base = MAP[azione] ?? {
    normative_applicabili: ['DPR 380/2001'],
    titolo_abilitativo: 'non_necessario',
    ente_competente: 'Comune',
    deposito_obbligatorio: false,
    risultato_atteso: 'Documento tecnico su misura',
  };

  return {
    normative_applicabili: base.normative_applicabili ?? [],
    titolo_abilitativo: base.titolo_abilitativo,
    ente_competente: base.ente_competente,
    deposito_obbligatorio: base.deposito_obbligatorio ?? false,
    risultato_atteso: base.risultato_atteso,
    complessita: (comp?.toUpperCase() as QuadroNormativo['complessita']) ?? 'MEDIA',
    richiede_sopralluogo: false,
    richiede_calcoli_strutturali: base.richiede_calcoli_strutturali ?? false,
    livello_urgenza_normativa: 'nessuna_scadenza',
    note_normative: '[Dev mock — analisi normativa simulata]',
  };
}
