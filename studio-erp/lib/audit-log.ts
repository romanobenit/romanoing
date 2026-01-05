import {query} from './db'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'APPROVE'
  | 'REJECT'
  | 'PAYMENT'
  | 'EXPORT'

export type AuditEntity =
  | 'Auth'
  | 'Utente'
  | 'Cliente'
  | 'Incarico'
  | 'Documento'
  | 'Milestone'
  | 'Pagamento'
  | 'Messaggio'
  | 'Bundle'

export interface AuditLogOptions {
  utenteId: number
  azione: AuditAction
  entita: AuditEntity
  entitaId: number
  dettagli?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Crea un record di audit log
 */
export async function createAuditLog(options: AuditLogOptions): Promise<void> {
  try {
    const {utenteId, azione, entita, entitaId, dettagli, ipAddress, userAgent} = options

    const sql = `
      INSERT INTO audit_log (
        utente_id,
        azione,
        entita,
        entita_id,
        dettagli,
        ip_address,
        user_agent,
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `

    await query(sql, [
      utenteId,
      azione,
      entita,
      entitaId,
      dettagli ? JSON.stringify(dettagli) : null,
      ipAddress || null,
      userAgent || null,
    ])
  } catch (error) {
    // Log ma non bloccare l'operazione principale
    console.error('[Audit Log] Errore creazione log:', error)
  }
}

/**
 * Estrae IP e User-Agent dalla richiesta
 */
export function getRequestMetadata(request: Request): {
  ipAddress: string
  userAgent: string
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return {ipAddress, userAgent}
}

/**
 * Helper per loggare autenticazione
 */
export async function logAuth(
  utenteId: number,
  azione: 'LOGIN' | 'LOGOUT',
  request: Request,
  dettagli?: Record<string, unknown>
): Promise<void> {
  const {ipAddress, userAgent} = getRequestMetadata(request)

  await createAuditLog({
    utenteId,
    azione,
    entita: 'Auth',
    entitaId: utenteId,
    dettagli,
    ipAddress,
    userAgent,
  })
}

/**
 * Helper per loggare operazioni su documenti
 */
export async function logDocumento(
  utenteId: number,
  azione: AuditAction,
  documentoId: number,
  request: Request,
  dettagli?: Record<string, unknown>
): Promise<void> {
  const {ipAddress, userAgent} = getRequestMetadata(request)

  await createAuditLog({
    utenteId,
    azione,
    entita: 'Documento',
    entitaId: documentoId,
    dettagli,
    ipAddress,
    userAgent,
  })
}

/**
 * Helper per loggare operazioni su incarichi
 */
export async function logIncarico(
  utenteId: number,
  azione: AuditAction,
  incaricoId: number,
  request: Request,
  dettagli?: Record<string, unknown>
): Promise<void> {
  const {ipAddress, userAgent} = getRequestMetadata(request)

  await createAuditLog({
    utenteId,
    azione,
    entita: 'Incarico',
    entitaId: incaricoId,
    dettagli,
    ipAddress,
    userAgent,
  })
}

/**
 * Helper per loggare pagamenti
 */
export async function logPagamento(
  utenteId: number,
  azione: AuditAction,
  milestoneId: number,
  request: Request,
  dettagli?: Record<string, unknown>
): Promise<void> {
  const {ipAddress, userAgent} = getRequestMetadata(request)

  await createAuditLog({
    utenteId,
    azione,
    entita: 'Pagamento',
    entitaId: milestoneId,
    dettagli,
    ipAddress,
    userAgent,
  })
}

/**
 * Helper per loggare modifiche a clienti
 */
export async function logCliente(
  utenteId: number,
  azione: AuditAction,
  clienteId: number,
  request: Request,
  dettagli?: Record<string, unknown>
): Promise<void> {
  const {ipAddress, userAgent} = getRequestMetadata(request)

  await createAuditLog({
    utenteId,
    azione,
    entita: 'Cliente',
    entitaId: clienteId,
    dettagli,
    ipAddress,
    userAgent,
  })
}

/**
 * Recupera audit log per entità
 */
export async function getAuditLogsByEntity(
  entita: AuditEntity,
  entitaId: number,
  limit: number = 50
) {
  const sql = `
    SELECT
      a.id,
      a.azione,
      a.dettagli,
      a.ip_address as "ipAddress",
      a.user_agent as "userAgent",
      a."createdAt",
      u.nome as "utenteNome",
      u.cognome as "utenteCognome",
      u.email as "utenteEmail"
    FROM audit_log a
    INNER JOIN utenti u ON a.utente_id = u.id
    WHERE a.entita = $1 AND a.entita_id = $2
    ORDER BY a."createdAt" DESC
    LIMIT $3
  `

  const result = await query(sql, [entita, entitaId, limit])
  return result.rows
}

/**
 * Recupera audit log per utente
 */
export async function getAuditLogsByUser(utenteId: number, limit: number = 50) {
  const sql = `
    SELECT
      a.id,
      a.azione,
      a.entita,
      a.entita_id as "entitaId",
      a.dettagli,
      a.ip_address as "ipAddress",
      a.user_agent as "userAgent",
      a."createdAt"
    FROM audit_log a
    WHERE a.utente_id = $1
    ORDER BY a."createdAt" DESC
    LIMIT $2
  `

  const result = await query(sql, [utenteId, limit])
  return result.rows
}
