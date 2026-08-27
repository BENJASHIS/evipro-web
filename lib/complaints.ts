export type ComplaintInput = {
  tipo: 'reclamo' | 'queja'
  full_name: string
  dni: string
  email: string
  phone: string | null
  servicio: string
  descripcion: string
  pretension: string
}

export type ComplaintValidation =
  | { ok: true; data: ComplaintInput }
  | { ok: false; error: string }

const LIMITS = {
  full_name: 120,
  dni: 40,
  email: 120,
  phone: 30,
  servicio: 120,
  descripcion: 2000,
  pretension: 2000,
} as const

function readString(input: Record<string, unknown>, key: keyof typeof LIMITS, required: boolean): string | null {
  const raw = input[key]
  if (raw == null) return required ? '' : null
  if (typeof raw !== 'string') return ''
  const value = raw.trim()
  if (!value) return required ? '' : null
  if (value.length > LIMITS[key]) return null
  return value
}

export function validateComplaint(input: unknown): ComplaintValidation {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Solicitud inválida.' }
  }

  const obj = input as Record<string, unknown>
  const tipo = obj.tipo
  if (tipo !== 'reclamo' && tipo !== 'queja') {
    return { ok: false, error: 'Tipo inválido.' }
  }

  const fullName = readString(obj, 'full_name', true)
  const dni = readString(obj, 'dni', true)
  const email = readString(obj, 'email', true)
  const phone = readString(obj, 'phone', false)
  const servicio = readString(obj, 'servicio', true)
  const descripcion = readString(obj, 'descripcion', true)
  const pretension = readString(obj, 'pretension', true)

  if (!fullName) return { ok: false, error: 'Nombre inválido.' }
  if (!dni) return { ok: false, error: 'Documento inválido.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Correo inválido.' }
  }
  if (phone && !/^[+()\d\s-]{6,30}$/.test(phone)) return { ok: false, error: 'Teléfono inválido.' }
  if (!servicio) return { ok: false, error: 'Servicio inválido.' }
  if (!descripcion) return { ok: false, error: 'Descripción inválida.' }
  if (!pretension) return { ok: false, error: 'Pretensión inválida.' }

  return {
    ok: true,
    data: { tipo, full_name: fullName, dni, email, phone, servicio, descripcion, pretension },
  }
}
