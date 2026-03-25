/**
 * PII Detector — ISO 42001 POP-AI-01
 * Rileva dati personali nei prompt prima del logging.
 */

const PII_PATTERNS = [
  // Codice Fiscale italiano (6 lettere, 2 cifre, 1 lettera, 2 cifre, 1 lettera, 3 cifre, 1 lettera)
  /\b[A-Z]{6}\d{2}[A-EHLMPR-T]\d{2}[A-Z]\d{3}[A-Z]\b/i,
  // Partita IVA: deve avere prefisso IT o essere preceduta da parola chiave per ridurre falsi positivi
  /\b(?:P\.?\s*IVA|partita\s+iva|VAT)[:\s]*\d{11}\b/i,
  // Email
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  // Cellulare IT (inizia con 3)
  /\b(?:\+39|0039)?[\s-]?3\d{2}[\s-]?\d{3}[\s-]?\d{3,4}\b/,
  // Fisso IT (inizia con 0)
  /\b(?:\+39|0039)?[\s-]?0\d{1,4}[\s-]?\d{5,8}\b/,
  // IBAN IT (IT + 2 cifre + 1 lettera + 22 caratteri alfanumerici)
  /\bIT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}\b/,
  // Numero carta di credito (16 cifre in gruppi o continuo, non preceduto da altro numero)
  /\b(?:\d{4}[\s-]?){3}\d{4}\b/,
];

export function detectPii(text: string): boolean {
  return PII_PATTERNS.some(p => p.test(text));
}
