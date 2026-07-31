import { describe, it, expect } from 'vitest'
import { validarPropuesta } from '../../lib/propuestas'

const valida = {
  full_name: 'Ana Quispe',
  phone: '987654321',
  email: 'ana@fisio.pe',
  occupation: 'Fisioterapeuta',
  license: 'CTP 1234',
  city: 'Cusco',
  proposal: 'Derivar pacientes con dolor cronico y coordinar seguimiento conjunto.',
  contribution: 'Consultorio en Wanchaq y dos terapeutas con turno libre por la tarde.',
  needs: 'Criterios de derivacion y una via directa para dudas de dosis.',
}

describe('validarPropuesta', () => {
  it('acepta una propuesta completa y devuelve los datos', () => {
    const r = validarPropuesta(valida)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.full_name).toBe('Ana Quispe')
  })

  it('la colegiatura es opcional', () => {
    const { license: _omitida, ...sinLicencia } = valida
    expect(validarPropuesta(sinLicencia).ok).toBe(true)
  })

  it('recorta los espacios de los bordes', () => {
    const r = validarPropuesta({ ...valida, full_name: '  Ana Quispe  ' })
    expect(r.ok && r.data.full_name).toBe('Ana Quispe')
  })

  it.each([
    'full_name', 'phone', 'email', 'occupation', 'city',
    'proposal', 'contribution', 'needs',
  ])('rechaza si falta %s', campo => {
    const r = validarPropuesta({ ...valida, [campo]: '   ' })
    expect(r.ok).toBe(false)
  })

  it('rechaza un correo sin forma de correo', () => {
    expect(validarPropuesta({ ...valida, email: 'ana-arroba-fisio' }).ok).toBe(false)
  })

  it('rechaza un campo pasado de largo', () => {
    expect(validarPropuesta({ ...valida, proposal: 'x'.repeat(1501) }).ok).toBe(false)
    expect(validarPropuesta({ ...valida, full_name: 'x'.repeat(121) }).ok).toBe(false)
  })

  it('rechaza un cuerpo que no es objeto', () => {
    expect(validarPropuesta(null).ok).toBe(false)
    expect(validarPropuesta('hola').ok).toBe(false)
  })

  it('el mensaje de error nombra el campo, para poder corregirlo', () => {
    const r = validarPropuesta({ ...valida, city: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.toLowerCase()).toContain('ciudad')
  })
})
