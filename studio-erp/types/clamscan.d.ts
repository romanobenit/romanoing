/**
 * Type definitions for clamscan npm package
 *
 * Package: clamscan
 * Version: ~2.x
 * Project: https://github.com/kylefarris/clamscan
 *
 * Note: Questo modulo non ha types ufficiali su @types/clamscan
 */

declare module 'clamscan' {
  export interface ClamScanOptions {
    removeInfected?: boolean
    quarantineInfected?: boolean | string
    scanLog?: string
    debugMode?: boolean
    preference?: 'clamdscan' | 'clamscan'

    clamdscan?: {
      socket?: string | boolean
      host?: string
      port?: number
      timeout?: number
      localFallback?: boolean
      path?: string
      configFile?: string
      multiscan?: boolean
      reloadDb?: boolean
      active?: boolean
      bypassTest?: boolean
    }

    clamscan?: {
      path?: string
      db?: string
      scanArchives?: boolean
      active?: boolean
    }
  }

  export interface ScanResult {
    isInfected: boolean
    file: string
    viruses: string[]
    timeout?: boolean
  }

  export default class NodeClam {
    constructor()

    /**
     * Initialize ClamAV scanner with configuration
     *
     * @param options - ClamAV configuration options
     * @returns Promise resolving to configured NodeClam instance
     */
    init(options: ClamScanOptions): Promise<NodeClam>

    /**
     * Scan a file for viruses
     *
     * @param filePath - Absolute path to file to scan
     * @param timeout - Optional timeout in ms (default from config)
     * @returns Promise resolving to scan result
     */
    isInfected(filePath: string, timeout?: number): Promise<ScanResult>

    /**
     * Scan multiple files in a directory
     *
     * @param dirPath - Path to directory
     * @param endCb - Callback fired when scan completes
     * @param fileCb - Callback fired for each file scanned
     * @returns Promise resolving to scan result
     */
    scanDir(
      dirPath: string,
      endCb?: (err: Error | null, goodFiles: string[], badFiles: string[], viruses: string[]) => void,
      fileCb?: (err: Error | null, file: string, isInfected: boolean, viruses?: string[]) => void
    ): Promise<ScanResult>

    /**
     * Scan a stream/buffer
     *
     * @param stream - Readable stream or Buffer
     * @param timeout - Optional timeout in ms
     * @returns Promise resolving to scan result
     */
    scanStream(stream: NodeJS.ReadableStream | Buffer, timeout?: number): Promise<ScanResult>

    /**
     * Get ClamAV version
     *
     * @returns Promise resolving to version string
     */
    getVersion(): Promise<string>

    /**
     * Pass through method (scanner passthrough when ClamAV unavailable)
     *
     * @param file - File path
     * @returns Promise resolving to clean result
     */
    passthrough(file?: string): Promise<ScanResult>
  }
}
