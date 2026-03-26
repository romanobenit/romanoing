/**
 * Mock Agente 1 — solo per sviluppo locale (NODE_ENV=development).
 * Simula la discovery conversazionale senza chiamare Anthropic.
 */
import type { Brief, ChatTurn } from './agente-1-discovery';

const DOMANDE = [
  'Capito! Per prima cosa: stai parlando di un immobile residenziale, commerciale o industriale?',
  'Ottimo. In quale comune si trova l\'immobile?',
  'Perfetto. Sai indicarmi approssimativamente la superficie in metri quadri e l\'anno di costruzione?',
  'Grazie. Hai già della documentazione disponibile (planimetrie, relazione geologica, visura catastale)?',
];

export function mockDiscovery(
  history: ChatTurn[],
  userMessage: string
): { reply: string; brief?: Brief; done: boolean } {
  const turnIndex = history.filter(t => t.role === 'assistant').length;
  const all = [
    ...history.map(t => t.content),
    userMessage,
  ].join(' ').toLowerCase();

  // Dopo 4 scambi o se abbiamo dati sufficienti → produci BRIEF
  if (turnIndex >= 3) {
    const brief: Brief = {
      soggetto: 'PRIVATO',
      immobile_tipo: all.includes('commerci') ? 'commerciale' : all.includes('industri') ? 'industriale' : 'residenziale',
      comune: estraiComune(all) ?? 'Non specificato',
      azione: estraiAzione(all),
      urgenza: 'normale',
      superficie_mq: estraiSuperficie(all),
      anno_costruzione: estraiAnno(all),
      note_libere: `[MOCK DEV] Dati estratti dalla conversazione: "${userMessage}"`,
      completezza: 70,
    };

    return {
      reply: `Perfetto, ho raccolto tutte le informazioni necessarie. Ho preparato il brief tecnico del tuo caso.\n\n⚠️ *Modalità sviluppo: risposta simulata, Anthropic AI non configurata.*`,
      brief,
      done: true,
    };
  }

  const domanda = DOMANDE[turnIndex] ?? 'Hai altri dettagli da aggiungere sul progetto?';

  return {
    reply: domanda + '\n\n*[Dev mock — turno ' + (turnIndex + 1) + '/4]*',
    done: false,
  };
}

function estraiComune(testo: string): string | undefined {
  const m = testo.match(/\b(?:a|in|di|comune di)\s+([a-zàèéìòù][a-zàèéìòù\s]{2,20}?)(?:\s*[,.]|\s+(?:in|con|ho|è|e|la|il|lo|del|della)|\s*$)/i);
  if (m) return m[1].trim();
  return undefined;
}

function estraiAzione(testo: string): Brief['azione'] {
  if (testo.includes('sismic') || testo.includes('terremoto') || testo.includes('vulnerab')) return 'verifica_sismica';
  if (testo.includes('ristrutt')) return 'ristrutturazione';
  if (testo.includes('energ') || testo.includes('efficien')) return 'energia';
  if (testo.includes('antincend') || testo.includes('incend')) return 'antincendio';
  if (testo.includes('collaudo')) return 'certificazione';
  if (testo.includes('perizia') || testo.includes('due diligence')) return 'perizia';
  if (testo.includes('consulenz')) return 'parere_tecnico';
  return 'altro';
}

function estraiSuperficie(testo: string): number | undefined {
  const m = testo.match(/(\d{2,4})\s*(?:mq|m²|m2|metri quadri)/i);
  return m ? parseInt(m[1]) : undefined;
}

function estraiAnno(testo: string): number | undefined {
  const m = testo.match(/\b(19[0-9]{2}|200[0-9]|201[0-9]|202[0-4])\b/);
  return m ? parseInt(m[1]) : undefined;
}
