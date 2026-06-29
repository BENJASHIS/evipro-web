export type Modality = 'video' | 'messaging' | 'whatsapp'

export interface DoctorCounseling {
  available: boolean
  description: string
  modalities: Modality[]
  schedule: string[]
}

// ponytail: piso de cobro de Mercado Pago. Cobros por debajo de este monto los
// rechaza MP ("monto inferior al mínimo"). Verifica el mínimo real de tu cuenta
// (MP → Actividad, código del rechazo) y ajusta aquí si hace falta.
export const MP_MIN_CHARGE = 5

export const MODALITY_PRICES: Record<Modality, { first: number; recurring: number }> = {
  video:     { first: 15,            recurring: 15            },
  messaging: { first: 0,             recurring: MP_MIN_CHARGE }, // legado: ya no se ofrece
  whatsapp:  { first: MP_MIN_CHARGE, recurring: MP_MIN_CHARGE }, // S/5 plano, sin 1ra gratis
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

export function getPaymentMethod(price: number): 'mercadopago' | 'free' {
  return price === 0 ? 'free' : 'mercadopago'
}
