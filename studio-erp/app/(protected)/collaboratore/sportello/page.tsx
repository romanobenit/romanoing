import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { query } from '@/lib/db';
import Link from 'next/link';
import {
  Users, ShoppingBag, TrendingUp, Clock, Euro, AlertCircle,
  CheckCircle2, Loader2, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ─── Tipi ───────────────────────────────────────────────────────────────────

interface KpiData {
  sessioni_totali: number;
  sessioni_oggi: number;
  lead_nuovi: number;
  lead_totali: number;
  consulenze_vendute: number;
  fatturato_centesimi: number;
}

interface Lead {
  id: number;
  nome: string;
  email: string;
  telefono: string | null;
  stato: string;
  brief: Record<string, unknown> | null;
  created_at: string;
}

interface Consulenza {
  id: number;
  tipo_erogazione: string;
  titolo_servizio: string;
  prezzo_finale_centesimi: number;
  sla_ore: number | null;
  created_at: string;
  cliente_email: string;
  incarico_codice: string | null;
  incarico_stato: string | null;
  incarico_id: number | null;
}

// ─── Fetch dati (server-side) ────────────────────────────────────────────────

async function getKpi(): Promise<KpiData> {
  const [sessioni, lead, consulenze] = await Promise.all([
    query(`SELECT COUNT(*) as total,
            SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as oggi
           FROM sessioni_quiz`),
    query(`SELECT COUNT(*) as total,
            SUM(CASE WHEN stato = 'nuovo' THEN 1 ELSE 0 END) as nuovi
           FROM lead_preventivi`),
    query(`SELECT COUNT(*) as total,
            COALESCE(SUM(prezzo_finale_centesimi), 0) as totale_centesimi
           FROM offerte_calcolate WHERE accettata = TRUE`),
  ]);
  return {
    sessioni_totali: parseInt(sessioni.rows[0].total),
    sessioni_oggi: parseInt(sessioni.rows[0].oggi),
    lead_totali: parseInt(lead.rows[0].total),
    lead_nuovi: parseInt(lead.rows[0].nuovi),
    consulenze_vendute: parseInt(consulenze.rows[0].total),
    fatturato_centesimi: parseInt(consulenze.rows[0].totale_centesimi),
  };
}

async function getLead(): Promise<Lead[]> {
  const result = await query(
    `SELECT id, nome, email, telefono, stato, brief, created_at
     FROM lead_preventivi
     ORDER BY created_at DESC
     LIMIT 50`
  );
  return result.rows;
}

async function getConsulenze(): Promise<Consulenza[]> {
  const result = await query(
    `SELECT o.id, o.tipo_erogazione, o.titolo_servizio, o.prezzo_finale_centesimi,
            o.sla_ore, o.created_at,
            s.email as cliente_email,
            i.codice as incarico_codice, i.stato as incarico_stato, i.id as incarico_id
     FROM offerte_calcolate o
     JOIN sessioni_quiz s ON o.sessione_id = s.id
     LEFT JOIN incarichi i ON i.offerta_id = o.id
     WHERE o.accettata = TRUE
     ORDER BY o.created_at DESC
     LIMIT 50`
  );
  return result.rows;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatEuro(centesimi: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(centesimi / 100);
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATO_LEAD_COLOR: Record<string, string> = {
  nuovo:               'bg-blue-900/40 text-blue-300 border-blue-700/40',
  in_lavorazione:      'bg-amber-900/40 text-amber-300 border-amber-700/40',
  preventivo_inviato:  'bg-violet-900/40 text-violet-300 border-violet-700/40',
  convertito:          'bg-green-900/40 text-green-300 border-green-700/40',
  perso:               'bg-red-900/40 text-red-300 border-red-700/40',
};

const TIPO_LABEL: Record<string, string> = {
  PLATFORM: 'Doc AI',
  IMMEDIATA: 'Analisi AI',
  INGEGNERE: 'Parere Firmato',
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default async function SportelloDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).ruolo !== 'TITOLARE') {
    redirect('/collaboratore/dashboard');
  }

  const [kpi, lead, consulenze] = await Promise.all([getKpi(), getLead(), getConsulenze()]);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Sportello Virtuale</h1>
        <p className="text-slate-400 text-sm mt-1">Gestione lead e consulenze vendute</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
            label: 'Sessioni oggi',
            value: kpi.sessioni_oggi,
            sub: `${kpi.sessioni_totali} totali`,
          },
          {
            icon: <AlertCircle className="h-5 w-5 text-amber-400" />,
            label: 'Lead nuovi',
            value: kpi.lead_nuovi,
            sub: `${kpi.lead_totali} totali`,
          },
          {
            icon: <ShoppingBag className="h-5 w-5 text-green-400" />,
            label: 'Consulenze vendute',
            value: kpi.consulenze_vendute,
            sub: formatEuro(kpi.fatturato_centesimi),
          },
        ].map(kpiItem => (
          <div
            key={kpiItem.label}
            className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              {kpiItem.icon}
              <span className="text-xs text-slate-400">{kpiItem.label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">{kpiItem.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpiItem.sub}</p>
          </div>
        ))}
      </div>

      {/* Lead preventivi */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-200 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            Lead preventivi
          </h2>
          {kpi.lead_nuovi > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold rounded-full px-2 py-0.5">
              {kpi.lead_nuovi} nuovi
            </span>
          )}
        </div>

        {lead.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-8 text-center text-slate-500 text-sm">
            Nessun lead ancora
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Telefono</th>
                    <th className="px-4 py-3 text-left">Stato</th>
                    <th className="px-4 py-3 text-left">Richiesto</th>
                    <th className="px-4 py-3 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {lead.map(l => (
                    <tr key={l.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 text-slate-200 font-medium">{l.nome}</td>
                      <td className="px-4 py-3 text-slate-400">
                        <a href={`mailto:${l.email}`} className="hover:text-blue-400">{l.email}</a>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{l.telefono || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs border rounded-full px-2 py-0.5 capitalize ${
                            STATO_LEAD_COLOR[l.stato] ?? 'bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          {l.stato.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {l.brief ? (l.brief as any).azione?.replace(/_/g, ' ') ?? '—' : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Consulenze vendute */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-green-400" />
          <h2 className="font-semibold text-slate-200">Consulenze vendute</h2>
        </div>

        {consulenze.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-8 text-center text-slate-500 text-sm">
            Nessuna consulenza venduta ancora
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Servizio</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Importo</th>
                    <th className="px-4 py-3 text-left">SLA</th>
                    <th className="px-4 py-3 text-left">Incarico</th>
                    <th className="px-4 py-3 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {consulenze.map(c => (
                    <tr key={c.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-700 text-slate-300 rounded-full px-2 py-0.5">
                          {TIPO_LABEL[c.tipo_erogazione] ?? c.tipo_erogazione}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200 text-xs max-w-[200px] truncate">
                        {c.titolo_servizio}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.cliente_email}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">
                        {formatEuro(c.prezzo_finale_centesimi)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {c.sla_ore ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {c.sla_ore}h
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.incarico_codice ? (
                          <Link
                            href={`/collaboratore/incarichi/${c.incarico_id}`}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                          >
                            {c.incarico_codice}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-slate-500 text-xs">Non creato</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(c.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
