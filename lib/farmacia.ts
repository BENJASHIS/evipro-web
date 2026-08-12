export type SolicitudFarmacia = {
  product_notes: string
  shalom_address: string
}

export type SolicitudValida = { ok: true; data: SolicitudFarmacia }
export type SolicitudInvalida = { ok: false; error: string }

const MAX_NOTAS = 1000
const MAX_DIRECCION = 200

/** Valida una solicitud de coordinación de farmacia. Puro: sin Supabase ni HTTP.
 *  Las notas llevan datos de la receta, así que el límite no es cosmético —
 *  evita que un envío infle la tabla con texto arbitrario. */
export function validarSolicitudFarmacia(input: unknown): SolicitudValida | SolicitudInvalida {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Faltan datos de la solicitud.' }
  }
  const crudo = input as Record<string, unknown>
  const notas = typeof crudo.product_notes === 'string' ? crudo.product_notes.trim() : ''
  const direccion = typeof crudo.shalom_address === 'string' ? crudo.shalom_address.trim() : ''

  if (!notas) return { ok: false, error: 'Faltan las notas de la receta.' }
  if (notas.length > MAX_NOTAS) {
    return { ok: false, error: `Las notas son demasiado largas (máximo ${MAX_NOTAS}).` }
  }
  if (!direccion) return { ok: false, error: 'Falta la agencia Shalom de destino.' }
  if (direccion.length > MAX_DIRECCION) {
    return { ok: false, error: `La dirección es demasiado larga (máximo ${MAX_DIRECCION}).` }
  }

  return { ok: true, data: { product_notes: notas, shalom_address: direccion } }
}
