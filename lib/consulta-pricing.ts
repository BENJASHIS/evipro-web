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

/** Precio de una consulta según modalidad, tarifa y nº de visita (1 = primera,
 *  2 = reconsulta, 3+ = piso). `bonoRenovacion` = miembro EVIPro que recién
 *  pagó/renovó: arranca un escalón más abajo (2º), una vez por pago. */
export function precioConsulta(
  modalidad: ModalidadConsulta,
  tarifa: TarifaConsulta,
  visita: number,
  bonoRenovacion = false,
): number {
  const fila = PRECIOS_CONSULTA[modalidad][tarifa]
  const escalon = (bonoRenovacion && tarifa === 'evipro') ? visita + 1 : visita
  const idx = Math.min(Math.max(escalon, 1), 3) - 1
  return fila[idx]
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
export function precioReferencia(modalidad: ModalidadReserva): number {
  return modalidad === 'domicilio' ? PRECIO_DOMICILIO : precioConsulta(modalidad, 'regular', 1)
}

/** Texto de escalera que muestra la página pública (tarifa regular). */
export function escaleraReserva(modalidad: ModalidadReserva): string {
  if (modalidad === 'domicilio') return `Desde S/${PRECIO_DOMICILIO}`
  const [p1, p2, p3] = PRECIOS_CONSULTA[modalidad].regular
  return `1ª S/${p1} · reconsulta S/${p2} · desde 3ª S/${p3}`
}
