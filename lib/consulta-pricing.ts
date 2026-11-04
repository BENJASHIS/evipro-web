export type ModalidadConsulta = 'presencial' | 'virtual'

/** Qué paga cada quien: sin membresía, con la Básica (S/9.90) o con EVIPro. */
export type TarifaConsulta = 'regular' | 'basica' | 'evipro'

// [1ª, 2ª, 3ª, …] por modalidad y tarifa; el último escalón vale para las siguientes.
// Números exactos de Carlos (virtual reajustada el 2026-11-03): son dato, no cálculo.
// La Básica queda a medio camino entre el regular y EVIPro; en virtual, los miembros
// no pagan desde la 5ª (0). Presencial sin cambios.
export const PRECIOS_CONSULTA: Record<ModalidadConsulta, Record<TarifaConsulta, number[]>> = {
  presencial: { regular: [100, 50, 25], basica: [80, 40, 20], evipro: [60, 30, 15] },
  virtual:    { regular: [80, 40, 20, 10], basica: [60, 30, 15, 10, 0], evipro: [40, 20, 10, 10, 0] },
}

/** Visita más alta que el paciente puede declarar («Quinta o más»). */
export const VISITA_MAX = 5

/** Aliados que mandan pacientes con su enlace `/medicos/dr-jara/agendar?convenio=<slug de lib/aliados.ts>`.
 *  Números de Carlos; el 3º (S/10) es para quien viene seguido. Modalidad sin fila = precio regular. */
export const CONVENIOS: Record<string, Partial<Record<ModalidadConsulta, number[]>>> = {
  ascamed: { virtual: [40, 20, 10] },
  'cannabis-libre-club': { virtual: [40, 20, 10] },
}

export function esConvenio(slug: unknown): slug is string {
  return typeof slug === 'string' && Object.hasOwn(CONVENIOS, slug)
}

/** Qué tarifa de consulta le toca a un plan de membresía. */
export function tarifaDe(planType: string | undefined): TarifaConsulta {
  if (planType === 'evipro' || planType === 'cannabis' || planType === 'integral') return 'evipro'
  if (planType === 'basica' || planType === 'acceso') return 'basica'
  return 'regular'
}

/** Precio de una consulta según modalidad, tarifa y nº de visita (1 = primera,
 *  2 = reconsulta…; pasado el último escalón, se queda en él). `bonoRenovacion` =
 *  miembro EVIPro que recién pagó/renovó: arranca un escalón más abajo, una vez por pago. */
export function precioConsulta(
  modalidad: ModalidadConsulta,
  tarifa: TarifaConsulta,
  visita: number,
  bonoRenovacion = false,
  convenio?: string,
): number {
  const fila = PRECIOS_CONSULTA[modalidad][tarifa]
  const escalon = (bonoRenovacion && tarifa === 'evipro') ? visita + 1 : visita
  const en = (f: number[]) => f[Math.min(Math.max(escalon, 1), f.length) - 1]
  const conv = esConvenio(convenio) ? CONVENIOS[convenio][modalidad] : undefined
  // El convenio nunca encarece: si la membresía o el regular cobran menos, gana el menor.
  return conv ? Math.min(en(fila), en(conv)) : en(fila)
}

export type ModalidadReserva = ModalidadConsulta | 'domicilio'

export const PRECIO_DOMICILIO = 150

export const CONSULTA_MODALITY_LABELS: Record<ModalidadReserva, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual (teleconsulta)',
  domicilio: 'A domicilio',
}

/** Precio nominal que guarda el agendado de consulta (referencia; el cobro real lo aplica el
 *  médico con la escalera). 1ª consulta a tarifa regular para presencial/virtual;
 *  precio plano para domicilio (sin escalera). */
export function precioReferencia(modalidad: ModalidadReserva, convenio?: string): number {
  return modalidad === 'domicilio' ? PRECIO_DOMICILIO : precioConsulta(modalidad, 'regular', 1, false, convenio)
}

/** Texto de escalera que muestran las páginas públicas: «1ª S/80 · reconsulta S/40 · 3ª S/20 · desde 4ª S/10». */
export function escaleraReserva(
  modalidad: ModalidadReserva, locale: 'es' | 'en' = 'es', convenio?: string, tarifa: TarifaConsulta = 'regular',
): string {
  const en = locale === 'en'
  if (modalidad === 'domicilio') return `${en ? 'From' : 'Desde'} S/${PRECIO_DOMICILIO}`
  const p = Array.from({ length: VISITA_MAX }, (_, i) => precioConsulta(modalidad, tarifa, i + 1, false, convenio))
  while (p.length > 1 && p[p.length - 1] === p[p.length - 2]) p.pop()
  return p.map((precio, i) => {
    const orden = en ? `${i + 1}${['st', 'nd', 'rd'][i] ?? 'th'}` : `${i + 1}ª`
    const etiqueta = i > 0 && i === p.length - 1 ? (en ? `${orden} onwards` : `desde ${orden}`)
      : i === 1 ? (en ? 'follow-up' : 'reconsulta') : orden
    return `${etiqueta} ${precio === 0 ? (en ? 'free' : 'gratis') : `S/${precio}`}`
  }).join(' · ')
}
