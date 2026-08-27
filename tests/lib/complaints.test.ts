import { describe, expect, it } from 'vitest'
import { validateComplaint } from '../../lib/complaints'

const valid = {
  tipo: 'reclamo',
  full_name: 'Paciente Prueba',
  dni: '12345678',
  email: 'paciente@example.com',
  phone: '987654321',
  servicio: 'Membresía EVIPro',
  descripcion: 'No pude acceder al área de miembros.',
  pretension: 'Solicito revisión del acceso.',
}

describe('validateComplaint', () => {
  it('acepta reclamo completo y recorta espacios', () => {
    const result = validateComplaint({ ...valid, full_name: '  Paciente Prueba  ' })
    expect(result.ok && result.data.full_name).toBe('Paciente Prueba')
  })

  it('rechaza tipo inválido', () => {
    expect(validateComplaint({ ...valid, tipo: 'otro' }).ok).toBe(false)
  })

  it('rechaza correo inválido', () => {
    expect(validateComplaint({ ...valid, email: 'paciente-arroba-example' }).ok).toBe(false)
  })

  it('rechaza textos demasiado largos', () => {
    expect(validateComplaint({ ...valid, descripcion: 'x'.repeat(2001) }).ok).toBe(false)
  })
})
