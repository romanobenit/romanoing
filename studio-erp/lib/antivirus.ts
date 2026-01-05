/**
 * ClamAV Antivirus Integration
 *
 * Questo modulo fornisce funzioni per la scansione antivirus dei file caricati
 * utilizzando ClamAV tramite la libreria clamscan.
 *
 * Requisiti:
 * - ClamAV installato sul sistema (clamdscan)
 * - Daemon clamd in esecuzione
 * - npm install clamscan
 *
 * Setup ClamAV:
 * Ubuntu/Debian: sudo apt-get install clamav clamav-daemon
 * macOS: brew install clamav
 *
 * Avvia daemon: sudo systemctl start clamav-daemon
 *
 * Test file EICAR: https://www.eicar.org/download-anti-malware-testfile/
 */

import NodeClam from 'clamscan'

/**
 * Configurazione ClamAV
 *
 * Fallback modes:
 * 1. clamdscan (daemon) - Veloce, raccomandato per produzione
 * 2. clamscan (CLI) - Lento, fallback se daemon non disponibile
 * 3. Passthrough - Solo sviluppo locale, NON usare in produzione
 */
const CLAMAV_CONFIG = {
  removeInfected: true, // Rimuove automaticamente file infetti
  quarantineInfected: false, // Non spostare in quarantena (già rimosso)
  scanLog: process.env.CLAMAV_SCAN_LOG || '/var/log/clamav/scan.log',
  debugMode: process.env.NODE_ENV === 'development',

  // Preferenza: usa daemon (clamdscan) se disponibile
  preference: 'clamdscan' as const,

  // Configurazione daemon
  clamdscan: {
    socket: process.env.CLAMAV_SOCKET || '/var/run/clamav/clamd.ctl', // Unix socket (Linux)
    host: process.env.CLAMAV_HOST || 'localhost', // Fallback TCP
    port: parseInt(process.env.CLAMAV_PORT || '3310'), // Porta daemon
    timeout: 60000, // 60 secondi timeout
    localFallback: true, // Fallback a clamscan se daemon non disponibile
    path: '/usr/bin/clamdscan', // Path comando clamdscan
    configFile: process.env.CLAMAV_CONFIG || '/etc/clamav/clamd.conf',
    multiscan: true, // Usa --multiscan per directory
    reloadDb: false, // Non ricaricare DB ad ogni scan (performance)
    active: true,
    bypassTest: false,
  },

  // Configurazione CLI (fallback)
  clamscan: {
    path: '/usr/bin/clamscan', // Path comando clamscan
    db: process.env.CLAMAV_DB || '/var/lib/clamav', // Database virus
    scanArchives: true, // Scansiona ZIP, RAR, etc.
    active: true,
  },
}

/**
 * Risultato scansione antivirus
 */
export interface ScanResult {
  /** File è pulito (true) o infetto (false) */
  isClean: boolean

  /** Nome virus se infetto, null se pulito */
  virus: string | null

  /** Path file scansionato */
  file: string

  /** Risultato raw da ClamAV */
  rawResult?: string

  /** Errore se scansione fallita */
  error?: string

  /** Tempo scansione in ms */
  scanTimeMs?: number
}

/**
 * Status servizio ClamAV
 */
export interface ClamAVStatus {
  /** ClamAV è disponibile */
  available: boolean

  /** Versione ClamAV */
  version?: string

  /** Daemon attivo */
  daemonActive: boolean

  /** Ultima update database */
  lastDbUpdate?: Date

  /** Modalità attiva (daemon/cli/passthrough) */
  mode: 'daemon' | 'cli' | 'passthrough' | 'unavailable'

  /** Errore se non disponibile */
  error?: string
}

// Singleton instance ClamAV
let clamScanInstance: NodeClam | null = null
let initializationPromise: Promise<NodeClam> | null = null

/**
 * Inizializza scanner ClamAV
 *
 * @returns Istanza NodeClam configurata
 * @throws Error se ClamAV non disponibile e NODE_ENV === 'production'
 */
async function getScanner(): Promise<NodeClam> {
  // Ritorna istanza esistente se già inizializzata
  if (clamScanInstance) {
    return clamScanInstance
  }

  // Se c'è già un'inizializzazione in corso, attendi
  if (initializationPromise) {
    return initializationPromise
  }

  // Inizializza ClamAV
  initializationPromise = (async () => {
    try {
      const clamscan = await new NodeClam().init(CLAMAV_CONFIG)
      clamScanInstance = clamscan

      console.log('[ClamAV] Scanner initialized successfully')

      // Log versione e modalità
      const version = await clamscan.getVersion()
      console.log(`[ClamAV] Version: ${version}`)

      return clamscan
    } catch (error: any) {
      console.error('[ClamAV] Initialization failed:', error.message)

      // In produzione, ClamAV è obbligatorio
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `ClamAV non disponibile in produzione. ` +
          `Installare ClamAV e avviare daemon: sudo systemctl start clamav-daemon`
        )
      }

      // In sviluppo, permetti passthrough (warning)
      console.warn(
        '[ClamAV] ⚠️  WARNING: ClamAV non disponibile, file NON saranno scansionati! ' +
        'Usa solo in sviluppo locale.'
      )

      throw error
    } finally {
      initializationPromise = null
    }
  })()

  return initializationPromise
}

/**
 * Scansiona un file per virus utilizzando ClamAV
 *
 * @param filePath Path assoluto al file da scansionare
 * @returns Risultato scansione
 *
 * @example
 * ```ts
 * const result = await scanFile('/uploads/documento.pdf')
 * if (!result.isClean) {
 *   console.error(`Virus detected: ${result.virus}`)
 *   // File viene automaticamente rimosso se removeInfected=true
 * }
 * ```
 */
export async function scanFile(filePath: string): Promise<ScanResult> {
  const startTime = Date.now()

  try {
    // Ottieni scanner ClamAV
    const scanner = await getScanner()

    // Scansiona file
    const { isInfected, file, viruses } = await scanner.isInfected(filePath)

    const scanTimeMs = Date.now() - startTime

    const result: ScanResult = {
      isClean: !isInfected,
      virus: viruses && viruses.length > 0 ? viruses.join(', ') : null,
      file: filePath,
      scanTimeMs,
    }

    if (isInfected) {
      console.error(
        `[ClamAV] 🦠 VIRUS DETECTED in ${filePath}: ${result.virus}` +
        ` (scan time: ${scanTimeMs}ms)`
      )
    } else {
      console.log(
        `[ClamAV] ✓ File clean: ${filePath} (scan time: ${scanTimeMs}ms)`
      )
    }

    return result
  } catch (error: any) {
    console.error(`[ClamAV] Scan error for ${filePath}:`, error.message)

    // In produzione, errore di scansione = RIFIUTA file (fail-safe)
    if (process.env.NODE_ENV === 'production') {
      return {
        isClean: false,
        virus: null,
        file: filePath,
        error: `Scan failed: ${error.message}`,
        scanTimeMs: Date.now() - startTime,
      }
    }

    // In sviluppo, permetti passthrough con warning
    console.warn(
      `[ClamAV] ⚠️  File NOT scanned (development mode): ${filePath}`
    )

    return {
      isClean: true, // SOLO in development!
      virus: null,
      file: filePath,
      error: error.message,
      rawResult: 'PASSTHROUGH (development)',
      scanTimeMs: Date.now() - startTime,
    }
  }
}

/**
 * Scansiona più file in parallelo
 *
 * @param filePaths Array di path assoluti
 * @returns Array di risultati scansione
 *
 * @example
 * ```ts
 * const results = await scanFiles([
 *   '/uploads/doc1.pdf',
 *   '/uploads/doc2.docx'
 * ])
 *
 * const infected = results.filter(r => !r.isClean)
 * ```
 */
export async function scanFiles(filePaths: string[]): Promise<ScanResult[]> {
  return Promise.all(filePaths.map((path) => scanFile(path)))
}

/**
 * Verifica status del servizio ClamAV
 *
 * @returns Status ClamAV (disponibile, versione, daemon attivo)
 *
 * @example
 * ```ts
 * const status = await getClamAVStatus()
 * if (!status.available) {
 *   console.error('ClamAV non disponibile:', status.error)
 * }
 * ```
 */
export async function getClamAVStatus(): Promise<ClamAVStatus> {
  try {
    const scanner = await getScanner()

    // Verifica versione
    const version = await scanner.getVersion()

    // Determina modalità
    let mode: ClamAVStatus['mode'] = 'cli'
    if (version.includes('clamdscan')) {
      mode = 'daemon'
    }

    return {
      available: true,
      version,
      daemonActive: mode === 'daemon',
      mode,
    }
  } catch (error: any) {
    return {
      available: false,
      daemonActive: false,
      mode: process.env.NODE_ENV === 'production' ? 'unavailable' : 'passthrough',
      error: error.message,
    }
  }
}

/**
 * Test scansione con file EICAR
 *
 * Il file EICAR è un file di test standard non dannoso che tutti gli antivirus
 * rilevano come virus di test.
 *
 * @returns true se ClamAV rileva correttamente il file EICAR
 *
 * @example
 * ```ts
 * const works = await testEICAR()
 * console.log('ClamAV funziona:', works)
 * ```
 */
export async function testEICAR(): Promise<boolean> {
  const EICAR_STRING =
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'

  try {
    const scanner = await getScanner()
    const { isInfected, viruses } = await scanner.scanStream(
      Buffer.from(EICAR_STRING)
    )

    if (isInfected) {
      console.log(`[ClamAV] ✓ EICAR test passed: ${viruses?.join(', ')}`)
      return true
    } else {
      console.error('[ClamAV] ✗ EICAR test failed: virus not detected!')
      return false
    }
  } catch (error: any) {
    console.error('[ClamAV] EICAR test error:', error.message)
    return false
  }
}

/**
 * Health check per monitoring
 *
 * @returns true se ClamAV è operativo
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const status = await getClamAVStatus()
    return status.available
  } catch {
    return false
  }
}
