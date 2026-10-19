// Cinética de descarboxilación del THCA → THC (Wang M et al. 2016, Cannabis Cannabinoid Res, PMID 28861498).
// Primer orden: fracción restante = exp(−k·t). k en s⁻¹, t en segundos.
// Solo 110 °C tiene k medida en Tabla 2; 130 y 145 °C se estiman por Arrhenius desde 110 °C (Ea 88 kJ/mol).

export const TEMPERATURAS = [80, 95, 110, 130, 145] as const
export type Temperatura = typeof TEMPERATURAS[number]

const K_MEDIDA: Partial<Record<Temperatura, number>> = { 80: 0.18e-3, 95: 0.66e-3, 110: 1.83e-3 }
const EA_J_MOL = 88000
const R_J_MOL_K = 8.314
const T_REF_K = 110 + 273.15

export function constanteTHCA(t: Temperatura): { k: number; origen: 'medido' | 'estimado' } {
  const medida = K_MEDIDA[t]
  if (medida !== undefined) return { k: medida, origen: 'medido' }
  const Tk = t + 273.15
  const k = K_MEDIDA[110]! * Math.exp(-(EA_J_MOL / R_J_MOL_K) * (1 / Tk - 1 / T_REF_K))
  return { k, origen: 'estimado' }
}

export function fraccionTHCARestante(t: Temperatura, minutos: number): number {
  const acotados = Math.min(Math.max(minutos, 0), 60)
  return Math.exp(-constanteTHCA(t).k * 60 * acotados)
}

// Minutos de casi cero (≈ 95 % convertido) reportados por Wang 2016.
export const CASI_CERO_MEDIDO: Partial<Record<Temperatura, number>> = { 110: 30, 130: 9, 145: 6 }

// Tabla 1 de Wang 2016: pérdida total de cannabinoides a 110 °C (%).
export const PERDIDA_TOTAL_110_PCT = 7.94

export const FUENTE_WANG = {
  cita: 'Wang M et al. Cannabis Cannabinoid Res 2016',
  pmid: '28861498',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5549281/',
}

// Intl emite U+00A0 o U+202F como separador en español; se normalizan a espacio regular.
export function formatoPorcentaje(valor: number, locale: 'es' | 'en', decimales = 0): string {
  const numero = new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor).replace(/[  ]/g, ' ')
  return locale === 'es' ? `${numero} %` : `${numero}%`
}
