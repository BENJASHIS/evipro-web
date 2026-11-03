export type ModalidadConsulta = 'presencial' | 'virtual'

/** Qué paga cada quien: sin membresía, con la Básica (S/9.90) o con EVIPro. */
export type TarifaConsulta = 'regular' | 'basica' | 'evipro'

// [1ª, 2ª, 3ª+] por modalidad y tarifa. Números exactos de Carlos; el piso (3º)
// es dato, no cálculo, para no arrastrar redondeos (p.ej. virtual regular = 17,
// no 17.5). La Básica queda a medio camino: descuento real, pero con distancia
// suficiente para que EVIPro siga teniendo sentido.
export const PRECIOS_CONSULTA: Record<
  ModalidadConsulta,
  Record<TarifaConsulta, [number, number, number]>
> = {
  presencial: { regular: [100, 50, 25], basica: [80, 40, 20], evipro: [60, 30, 15] },
  virtual:    { regular: [70, 35, 17],  basica: [55, 28, 14], evipro: [40, 20, 10] },
}

/** Aliados que mandan pacientes con su enlace `/medicos/dr-jara/agendar?convenio=<slug de lib/aliados.ts>`.
 *  Números de Carlos; el 3º (S/10) es para quien viene seguido. Modalidad sin fila = precio regular. */
export const CONVENIOS: Record<string, Partial<Record<ModalidadConsulta, [number, number, number]>>> = {
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
 *  2 = reconsulta, 3+ = piso). `bonoRenovacion` = miembro EVIPro que recién
 *  pagó/renovó: arranca un escalón más abajo (2º), una vez por pago. */
export function precioConsulta(
  modalidad: ModalidadConsulta,
  tarifa: TarifaConsulta,
  visita: number,
  bonoRenovacion = false,
  convenio?: string,
): number {
  const fila = PRECIOS_CONSULTA[modalidad][tarifa]
  const escalon = (bonoRenovacion && tarifa === 'evipro') ? visita + 1 : visita
  const idx = Math.min(Math.max(escalon, 1), 3) - 1
  const conv = esConvenio(convenio) ? CONVENIOS[convenio][modalidad] : undefined
  // El convenio nunca encarece: si la membresía o el regular cobran menos, gana el menor.
  return conv ? Math.min(fila[idx], conv[idx]) : fila[idx]
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

/** Texto de escalera que muestra la página pública (tarifa regular). */
export function escaleraReserva(modalidad: ModalidadReserva, locale: 'es' | 'en' = 'es', convenio?: string): string {
  if (modalidad === 'domicilio') return `${locale === 'en' ? 'From' : 'Desde'} S/${PRECIO_DOMICILIO}`
  const [p1, p2, p3] = [1, 2, 3].map(v => precioConsulta(modalidad, 'regular', v, false, convenio))
  if (locale === 'en') return `1st S/${p1} · follow-up S/${p2} · 3rd onwards S/${p3}`
  return `1ª S/${p1} · reconsulta S/${p2} · desde 3ª S/${p3}`
}
