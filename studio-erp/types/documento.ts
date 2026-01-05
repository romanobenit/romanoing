/**
 * Tipi condivisi per Documenti
 */

export interface Documento {
  id: number
  nomeFile: string
  categoria: string
  versione: number
  stato: string
  dimensione: number
  visibileCliente: boolean
  pathStorage: string
  createdAt: string
  uploadedByNome?: string
  uploadedByCognome?: string
}

export interface Incarico {
  id: number
  codice: string
  oggetto: string
  descrizione?: string
  stato: string
  importoTotale?: number
  dataInizio?: string
  dataFine?: string
  dataScadenza?: string
  priorita?: string
  createdAt: string
  bundleNome?: string
  bundleCodice?: string
  milestone?: Milestone[]
  documentiCount?: number
}

export interface Milestone {
  id: number
  codice: string
  nome: string
  descrizione?: string
  percentuale: number
  importo: number
  stato: string
  dataScadenza?: string
  dataPagamento?: string
}

export interface Cliente {
  id: number
  nome: string
  cognome?: string
  ragioneSociale?: string
  codiceFiscale?: string
  partitaIva?: string
  email: string
  telefono?: string
  indirizzo?: string
  citta?: string
  cap?: string
  provincia?: string
  createdAt: string
}

export interface Collaboratore {
  id: number
  nome: string
  cognome: string
  email: string
  ruolo: string
  ruoloNome?: string
  attivo: boolean
  createdAt: string
}
