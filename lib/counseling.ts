export type Modality = 'video' | 'messaging' | 'whatsapp'

export interface DoctorCounseling {
  available: boolean
  description: string
  modalities: Modality[]
  schedule: string[]
}

export const MODALITY_PRICES: Record<Modality, { first: number; recurring: number }> = {
  video:     { first: 15, recurring: 15 },
  messaging: { first: 0,  recurring: 3  },
  whatsapp:  { first: 0,  recurring: 3  },
}

export const MODALITY_LABELS: Record<Modality, string> = {
  video:     'Video (15–20 min)',
  messaging: 'Mensajería',
  whatsapp:  'WhatsApp',
}

export const MODALITY_DURATION: Record<Modality, string> = {
  video:     '15–20 minutos',
  messaging: 'Respuesta en el día',
  whatsapp:  'Respuesta en el día',
}

export function getPrice(modality: Modality, isFirst: boolean): number {
  const { first, recurring } = MODALITY_PRICES[modality]
  return isFirst ? first : recurring
}

export function getPaymentMethod(price: number): 'culqi' | 'free' {
  return price === 0 ? 'free' : 'culqi'
}
