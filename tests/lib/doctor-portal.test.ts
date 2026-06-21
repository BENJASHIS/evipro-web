import { describe, it, expect } from 'vitest'
import { doctorPortalToken, verifyDoctorPortalToken } from '../../lib/doctor-portal'

const SECRET = 'test-secret-123'

describe('doctorPortalToken', () => {
  it('es determinista para el mismo slug y secreto', () => {
    expect(doctorPortalToken('dr-jara', SECRET)).toBe(doctorPortalToken('dr-jara', SECRET))
  })
  it('difiere entre médicos', () => {
    expect(doctorPortalToken('dr-jara', SECRET)).not.toBe(doctorPortalToken('dr-vera', SECRET))
  })
  it('difiere si cambia el secreto', () => {
    expect(doctorPortalToken('dr-jara', SECRET)).not.toBe(doctorPortalToken('dr-jara', 'otro'))
  })
})

describe('verifyDoctorPortalToken', () => {
  it('acepta el token correcto', () => {
    const t = doctorPortalToken('dr-jara', SECRET)
    expect(verifyDoctorPortalToken('dr-jara', t, SECRET)).toBe(true)
  })
  it('rechaza el token de otro médico', () => {
    const t = doctorPortalToken('dr-vera', SECRET)
    expect(verifyDoctorPortalToken('dr-jara', t, SECRET)).toBe(false)
  })
  it('rechaza token vacío o ausente', () => {
    expect(verifyDoctorPortalToken('dr-jara', '', SECRET)).toBe(false)
    expect(verifyDoctorPortalToken('dr-jara', undefined, SECRET)).toBe(false)
  })
  it('rechaza si no hay secreto configurado', () => {
    const t = doctorPortalToken('dr-jara', SECRET)
    expect(verifyDoctorPortalToken('dr-jara', t, '')).toBe(false)
  })
  it('rechaza token de longitud distinta sin lanzar', () => {
    expect(verifyDoctorPortalToken('dr-jara', 'abc', SECRET)).toBe(false)
  })
})
