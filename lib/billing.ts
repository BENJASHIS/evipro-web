import type { PlanPeriod } from './types'

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
