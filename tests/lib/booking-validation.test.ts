import { describe, it, expect } from 'vitest'
import { validateBookingInput, NAME_MAX, PHONE_MAX, NOTE_MAX } from '../../lib/booking-validation'
import { DOCTORS } from '../../lib/doctors'

const ok = {
  doctor_slug: DOCTORS[0].slug,
  patient_name: 'Ana Pérez',
  patient_phone: '987654321',
  patient_note: 'dolor crónico',
}

describe('validateBookingInput', () => {
  it('acepta input válido', () => {
    expect(validateBookingInput(ok)).toBeNull()
  })

  it('rechaza médico desconocido', () => {
    expect(validateBookingInput({ ...ok, doctor_slug: 'dr-inexistente' })).toBe('Médico no encontrado')
  })

  it('rechaza doctor_slug vacío', () => {
    expect(validateBookingInput({ ...ok, doctor_slug: '' })).toBe('Médico no encontrado')
  })

  it('rechaza nombre vacío o solo espacios', () => {
    expect(validateBookingInput({ ...ok, patient_name: '   ' })).toBe('Nombre inválido')
  })

  it('rechaza nombre demasiado largo', () => {
    expect(validateBookingInput({ ...ok, patient_name: 'a'.repeat(NAME_MAX + 1) })).toBe('Nombre inválido')
  })

  it('rechaza teléfono vacío', () => {
    expect(validateBookingInput({ ...ok, patient_phone: '' })).toBe('Teléfono inválido')
  })

  it('rechaza teléfono demasiado largo', () => {
    expect(validateBookingInput({ ...ok, patient_phone: '9'.repeat(PHONE_MAX + 1) })).toBe('Teléfono inválido')
  })

  it('rechaza nota demasiado larga', () => {
    expect(validateBookingInput({ ...ok, patient_note: 'x'.repeat(NOTE_MAX + 1) })).toBe('Nota demasiado larga')
  })

  it('acepta nota nula o ausente', () => {
    expect(validateBookingInput({ ...ok, patient_note: null })).toBeNull()
    expect(validateBookingInput({ doctor_slug: ok.doctor_slug, patient_name: ok.patient_name, patient_phone: ok.patient_phone })).toBeNull()
  })
})
