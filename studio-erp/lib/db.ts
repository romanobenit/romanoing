import { Pool, QueryResult, QueryResultRow } from 'pg';

// Singleton connection pool
let pool: Pool | null = null;

/**
 * Get or create PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

/**
 * Execute a SQL query
 * @param text SQL query text
 * @param params Query parameters (strongly typed)
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log query in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Close the connection pool (useful for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Database utility functions for common queries
 */
export const db = {
  /**
   * Get all active bundles
   */
  async getBundles(faseMvp?: number) {
    const text = faseMvp
      ? `SELECT * FROM bundle WHERE attivo = true AND fase_mvp = $1 ORDER BY prezzo_min ASC`
      : `SELECT * FROM bundle WHERE attivo = true ORDER BY prezzo_min ASC`;

    const params = faseMvp ? [faseMvp] : [];
    const result = await query(text, params);
    return result.rows;
  },

  /**
   * Get bundle by code
   */
  async getBundleByCode(codice: string) {
    const text = `SELECT * FROM bundle WHERE codice = $1 LIMIT 1`;
    const result = await query(text, [codice]);
    return result.rows[0] || null;
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const text = `
      SELECT u.*, r.codice as ruolo_codice, r.nome as ruolo_nome, r.livello as ruolo_livello
      FROM utenti u
      JOIN ruoli r ON u.ruolo_id = r.id
      WHERE u.email = $1 AND u.attivo = true
      LIMIT 1
    `;
    const result = await query(text, [email]);
    return result.rows[0] || null;
  },

  /**
   * Get client by ID
   */
  async getClientById(id: number) {
    const text = `SELECT * FROM clienti WHERE id = $1 LIMIT 1`;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create a new client
   */
  async createClient(data: {
    codice: string;
    tipo: string;
    email: string;
    nome?: string;
    cognome?: string;
    ragioneSociale?: string;
    codiceFiscale?: string;
    partitaIva?: string;
    telefono?: string;
    indirizzo?: string;
    citta?: string;
    provincia?: string;
    cap?: string;
    note?: string;
  }) {
    const text = `
      INSERT INTO clienti (
        codice, tipo, email, nome, cognome, ragione_sociale,
        codice_fiscale, partita_iva, telefono, indirizzo,
        citta, provincia, cap, note, stato_accesso_portale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'disabilitato')
      RETURNING *
    `;
    const params = [
      data.codice,
      data.tipo,
      data.email,
      data.nome || null,
      data.cognome || null,
      data.ragioneSociale || null,
      data.codiceFiscale || null,
      data.partitaIva || null,
      data.telefono || null,
      data.indirizzo || null,
      data.citta || null,
      data.provincia || null,
      data.cap || null,
      data.note || null,
    ];
    const result = await query(text, params);
    return result.rows[0];
  },

  /**
   * Create a new incarico
   */
  async createIncarico(data: {
    codice: string;
    clienteId: number;
    bundleId?: number;
    responsabileId: number;
    oggetto: string;
    descrizione?: string;
    importoTotale: number;
    stato?: string;
    priorita?: string;
    note?: string;
  }) {
    const text = `
      INSERT INTO incarichi (
        codice, cliente_id, bundle_id, responsabile_id,
        oggetto, descrizione, importo_totale, stato, priorita, note
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      data.codice,
      data.clienteId,
      data.bundleId || null,
      data.responsabileId,
      data.oggetto,
      data.descrizione || null,
      data.importoTotale,
      data.stato || 'BOZZA',
      data.priorita || 'normale',
      data.note || null,
    ];
    const result = await query(text, params);
    return result.rows[0];
  },
};

export default db;
