import { randomBytes } from 'node:crypto'

// Crédito de consulta gratis (perk de fidelidad EVIPro). Lo acuña el médico a
// mano desde el portal para un miembro. Cuesta el tiempo del médico, NO es un
// perk de Cannavital. El miembro lo canjea al reservar, o comparte el código.
export type CreditStatus = 'active' | 'redeemed' | 'donated'

export const CREDIT_VALID_DAYS = 90 // ponytail: solo informativo; el vencimiento automático se agrega si hace falta

// Código legible y compartible: 8 chars sin ambigüedades (sin 0/O/1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generateCreditCode(): string {
  const bytes = randomBytes(8)
  let code = ''
  for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length]
  return `EVI-${code}`
}

export const CREDIT_STATUS_LABEL: Record<CreditStatus, { text: string; color: string }> = {
  active:   { text: 'Activo',            color: 'text-brand' },
  redeemed: { text: 'Canjeado',          color: 'text-faint' },
  donated:  { text: 'Enviado a sorteo',  color: 'text-yellow-400' },
}

// Solo un crédito activo se puede canjear o donar.
export function canActOnCredit(status: CreditStatus): boolean {
  return status === 'active'
}
