/**
 * /api/sportello/contenuto
 * POST — Agente 4: genera analisi tecnica per percorso IMMEDIATA
 * Body: { token }
 * Auth: TITOLARE (generazione manuale dopo pagamento avvenuto)
 *
 * Il Titolare richiama questo endpoint dopo che il webhook Stripe ha
 * confermato il pagamento e creato l'Incarico.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import { generateContenutoTecnico } from '@/lib/sportello/agente-4-content';
import type { Brief } from '@/lib/sportello/agente-1-discovery';
import type { QuadroNormativo } from '@/lib/sportello/agente-2-normativista';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).ruolo !== 'TITOLARE') {
    return NextResponse.json({ success: false, error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'token richiesto' }, { status: 400 });
    }

    const sessResult = await query(
      `SELECT id, brief, quadro_normativo, routing, stato
       FROM sessioni_quiz
       WHERE session_token = $1 LIMIT 1`,
      [token]
    );

    const sessione = sessResult.rows[0];
    if (!sessione) {
      return NextResponse.json({ success: false, error: 'Sessione non trovata' }, { status: 404 });
    }
    if (!sessione.brief || !sessione.quadro_normativo) {
      return NextResponse.json(
        { success: false, error: 'Sessione incompleta — brief o quadro normativo mancante' },
        { status: 400 }
      );
    }
    if (sessione.routing !== 'IMMEDIATA') {
      return NextResponse.json(
        { success: false, error: `Agente 4 è solo per percorso IMMEDIATA (questa sessione: ${sessione.routing})` },
        { status: 400 }
      );
    }

    const brief = sessione.brief as Brief;
    const quadro = sessione.quadro_normativo as QuadroNormativo;

    const contenuto = await generateContenutoTecnico(brief, quadro, sessione.id);

    return NextResponse.json({ success: true, contenuto });
  } catch (err: any) {
    console.error('[/api/sportello/contenuto POST]', err);
    return NextResponse.json({ success: false, error: 'Errore server' }, { status: 500 });
  }
}
