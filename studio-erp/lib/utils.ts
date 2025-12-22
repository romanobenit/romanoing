import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera codice univoco per entità (es. INC25001, CLI25001)
 */
export function generateCodice(prefisso: string, numero: number, anno?: number): string {
  const annoCorrente = anno || new Date().getFullYear().toString().slice(-2)
  const numeroFormattato = numero.toString().padStart(3, '0')
  return `${prefisso}${annoCorrente}${numeroFormattato}`
}

/**
 * Formatta importo in Euro
 */
export function formatEuro(importo: number | string): string {
  const num = typeof importo === 'string' ? parseFloat(importo) : importo
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(num)
}

/**
 * Formatta data in formato italiano
 */
export function formatData(data: Date | string): string {
  const date = typeof data === 'string' ? new Date(data) : data
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/**
 * Formatta data e ora in formato italiano
 */
export function formatDataOra(data: Date | string): string {
  const date = typeof data === 'string' ? new Date(data) : data
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
