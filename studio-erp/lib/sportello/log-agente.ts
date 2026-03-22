/**
 * Logger POP-AI-01 per gli agenti del Sportello Virtuale.
 * Ogni chiamata Claude API DEVE essere loggata tramite questa funzione.
 * Conforme ISO/IEC 42001 clausola 8 + A.6.2.8.
 */

import { query } from '@/lib/db';
import { detectPii } from '@/lib/aims/pii-detector';

// ID di Claude API nel registro ai_systems (inserito dalla migration)
const CLAUDE_API_SYSTEM_ID = 1;
const CLAUDE_MODEL_VERSION = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

export interface LogAgenteOptions {
  usoPrevisto: string;        // es. "agente_1_discovery"
  prompt: string;
  risposta: string;
  sessioneId?: number;
  rischioLivello?: 'BASSO' | 'MEDIO' | 'ALTO';
}

export async function logAgente(opts: LogAgenteOptions): Promise<void> {
  const piiRilevata = detectPii(opts.prompt) || detectPii(opts.risposta);
  const rischio = opts.rischioLivello ?? (piiRilevata ? 'MEDIO' : 'BASSO');
  const revisioneUrgente = rischio === 'ALTO';

  try {
    // Log interno: cerca TITOLARE per assegnare utilizzato_da
    const titolareResult = await query(
      `SELECT id FROM utenti u JOIN ruoli r ON u.ruolo_id = r.id WHERE r.codice = 'TITOLARE' LIMIT 1`
    );
    const titolareId = titolareResult.rows[0]?.id ?? 1;

    await query(
      `INSERT INTO log_ai (
        strumento, modello, modello_versione, prompt, risposta,
        utilizzato_da, verificato, contesto, uso_previsto,
        ai_system_id, rischio_livello, pii_rilevata, revisione_urgente
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        'Claude API',
        CLAUDE_MODEL_VERSION,
        CLAUDE_MODEL_VERSION,
        opts.prompt,
        opts.risposta,
        titolareId,
        false,
        opts.sessioneId ? `sessione_quiz:${opts.sessioneId}` : 'sportello_virtuale',
        opts.usoPrevisto,
        CLAUDE_API_SYSTEM_ID,
        rischio,
        piiRilevata,
        revisioneUrgente,
      ]
    );
  } catch (err) {
    // Il log non deve mai bloccare il flusso principale
    console.error('[POP-AI-01] Errore logging agente:', err);
  }
}
