/**
 * PII Detector — ISO 42001 POP-AI-01
 * Rileva dati personali nei prompt prima del logging.
 */

const PII_PATTERNS = [
  /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/,           // Codice Fiscale
  /\b\d{11}\b/,                                               // Partita IVA (11 cifre)
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,             // Email
  /\b(?:\+39|0039)?[\s-]?3\d{2}[\s-]?\d{6,7}\b/,            // Cellulare IT
  /\b(?:\+39|0039)?[\s-]?0\d{1,4}[\s-]?\d{5,8}\b/,          // Fisso IT
  /\bIT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}\b/,                 // IBAN IT
  /\b\d{16}\b/,                                               // Carta di credito
];

export function detectPii(text: string): boolean {
  return PII_PATTERNS.some(p => p.test(text));
}
