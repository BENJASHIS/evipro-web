export type PropuestaInput = {
  full_name: string
  phone: string
  email: string
  occupation: string
  license?: string | null
  city: string
  proposal: string
  contribution: string
  needs: string
}

export type PropuestaValida = { ok: true; data: PropuestaInput }
export type PropuestaInvalida = { ok: false; error: string }

// [clave, etiqueta que ve el usuario, largo maximo, obligatorio]
const CAMPOS: [keyof PropuestaInput, string, number, boolean][] = [
  ['full_name',    'nombre',                     120,  true],
  ['phone',        'telefono',                    20,  true],
  ['email',        'correo',                     120,  true],
  ['occupation',   'profesion u oficio',         120,  true],
  ['license',      'colegiatura o registro',      60, false],
  ['city',         'ciudad',                      80,  true],
  ['proposal',     'que propones',              1500,  true],
  ['contribution', 'que pones tu',              1000,  true],
  ['needs',        'que necesitas de EVIPro',   1000,  true],
]

/** Valida y normaliza una propuesta. No conoce Supabase ni HTTP: se prueba
 *  llamándola. El mensaje de error nombra el campo para que el formulario
 *  pueda mostrarlo tal cual. */
export function validarPropuesta(input: unknown): PropuestaValida | PropuestaInvalida {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Faltan datos de la propuesta.' }
  }
  const crudo = input as Record<string, unknown>
  const data = {} as PropuestaInput

  for (const [clave, etiqueta, maximo, obligatorio] of CAMPOS) {
    const valor = typeof crudo[clave] === 'string' ? (crudo[clave] as string).trim() : ''
    if (!valor) {
      if (obligatorio) return { ok: false, error: `Falta ${etiqueta}.` }
      data[clave] = null as never
      continue
    }
    if (valor.length > maximo) {
      return { ok: false, error: `El campo ${etiqueta} es demasiado largo (máximo ${maximo}).` }
    }
    data[clave] = valor as never
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, error: 'El correo no parece válido.' }
  }

  return { ok: true, data }
}
