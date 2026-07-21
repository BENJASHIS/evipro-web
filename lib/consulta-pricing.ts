export type ModalidadConsulta = 'presencial' | 'virtual'

// [1ª, 2ª, 3ª+] por modalidad y condición de miembro. Números exactos de Carlos;
// el piso (3º) es dato, no cálculo, para no arrastrar redondeos (p.ej. virtual no
// miembro = 17, no 17.5).
export const PRECIOS_CONSULTA: Record<
  ModalidadConsulta,
  { noMiembro: [number, number, number]; miembro: [number, number, number] }
> = {
  presencial: { noMiembro: [100, 50, 25], miembro: [60, 30, 15] },
  virtual:    { noMiembro: [70, 35, 17],  miembro: [40, 20, 10] },
}

/** Precio de una consulta según modalidad, si es miembro EVIPro, y el nº de visita
 *  (1 = primera, 2 = reconsulta, 3+ = piso). `bonoRenovacion` = miembro que recién
 *  pagó/renovó: arranca un escalón más abajo (2º), una vez por pago. */
export function precioConsulta(
  modalidad: ModalidadConsulta,
  esMiembro: boolean,
  visita: number,
  bonoRenovacion = false,
): number {
  const fila = PRECIOS_CONSULTA[modalidad][esMiembro ? 'miembro' : 'noMiembro']
  const escalon = (bonoRenovacion && esMiembro) ? visita + 1 : visita
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

/** Precio nominal que guarda /reservar (referencia; el cobro real lo aplica el
 *  médico con la escalera). 1ª consulta no miembro para presencial/virtual;
 *  precio plano para domicilio (sin escalera). */
export function precioReferencia(modalidad: ModalidadReserva): number {
  return modalidad === 'domicilio' ? PRECIO_DOMICILIO : precioConsulta(modalidad, false, 1)
}

/** Texto de escalera que muestra la página pública (precios no miembro). */
export function escaleraReserva(modalidad: ModalidadReserva): string {
  if (modalidad === 'domicilio') return `Desde S/${PRECIO_DOMICILIO} (sin escalera)`
  const [p1, p2, p3] = PRECIOS_CONSULTA[modalidad].noMiembro
  return `1ª S/${p1} · reconsulta S/${p2} · desde 3ª S/${p3}`
}
