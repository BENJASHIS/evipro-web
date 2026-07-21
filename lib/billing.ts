import type { PlanPeriod } from './types'
import type { MPPreferenceItem } from './mercadopago'

/** Fin de período según la duración del plan. Pago único: define hasta cuándo
 *  dura el acceso comprado. No muta `from`. */
export function computePeriodEnd(period: PlanPeriod, from: Date): Date {
  const end = new Date(from)
  switch (period) {
    case 'quincenal':  end.setDate(end.getDate() + 15); break
    case 'mensual':    end.setMonth(end.getMonth() + 1); break
    case 'trimestral': end.setMonth(end.getMonth() + 3); break
    case 'semestral':  end.setMonth(end.getMonth() + 6); break
    case 'anual':      end.setMonth(end.getMonth() + 12); break
  }
  return end
}

/** Total del carrito = base + suma de add-ons. El servidor lo recalcula
 *  siempre desde BD; nunca se confía en el precio del cliente. */
export function computeCartTotal(basePrice: number, addonPrices: number[]): number {
  return addonPrices.reduce((acc, p) => acc + p, basePrice)
}

/** Un MPPreferenceItem por la base y uno por cada add-on elegido. */
export function buildCartItems(
  base: { title: string; price: number },
  addons: { title: string; price: number }[],
): MPPreferenceItem[] {
  return [
    { title: base.title, unit_price: base.price, quantity: 1 },
    ...addons.map(a => ({ title: a.title, unit_price: a.price, quantity: 1 })),
  ]
}
