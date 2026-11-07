import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { validateBookingInput, proximosDias, slotValido, NAME_MAX, PHONE_MAX, NOTE_MAX } from '../../lib/booking-validation'
import { DOCTORS } from '../../lib/doctors'

// Las fechas de estas pruebas (martes 3-nov-2026) tienen que seguir en el futuro.
beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-11-01T12:00:00Z')) })
afterEach(() => { vi.useRealTimers() })

const ok = {
  doctor_slug: DOCTORS[0].slug,
  patient_name: 'Ana Pérez',
  patient_phone: '987654321',
  patient_note: 'dolor crónico', consent: true }

describe('validateBookingInput', () => {
  it.each([undefined, false, 'true'])('sin consentimiento expreso no hay reserva: %s', consent => {
    expect(validateBookingInput({ ...ok, consent: consent as boolean })).toBe('Falta autorizar el uso de tus datos.')
  })

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
    expect(validateBookingInput({ doctor_slug: ok.doctor_slug, patient_name: ok.patient_name, patient_phone: ok.patient_phone, consent: true })).toBeNull()
  })
})

// Horario de Carlos (2026-10-29): martes a viernes, 9–12 y 15–17, turnos de una hora.
describe('horario de atención', () => {
  const jara = { ...ok, doctor_slug: 'dr-jara', consent: true }

  it('rechaza un lunes', () => {
    expect(validateBookingInput({ ...jara, slot_date: '2026-11-02', slot_time: '09:00' })).toBe('Horario no disponible')
  })

  it('rechaza una hora fuera de turno', () => {
    expect(validateBookingInput({ ...jara, slot_date: '2026-11-03', slot_time: '14:00' })).toBe('Horario no disponible')
  })

  it('acepta martes a las 16:00', () => {
    expect(validateBookingInput({ ...jara, slot_date: '2026-11-03', slot_time: '16:00' })).toBeNull()
  })

  it('los próximos días reservables son solo martes a viernes, desde mañana', () => {
    const dias = proximosDias([2, 3, 4, 5], 5, new Date(2026, 10, 2)) // lunes 2-nov-2026
    expect(dias.map(d => d.getDate())).toEqual([3, 4, 5, 6, 10])
  })
})

describe('slotValido — un turno que ya empezó no vale', () => {
  const jara = DOCTORS.find(d => d.slug === 'dr-jara')!
  const ahora = new Date('2026-11-03T15:30:00Z') // martes 3-nov, 10:30 en Lima
  it('rechaza un día pasado y una hora de hoy que ya empezó; acepta la siguiente', () => {
    expect(slotValido(jara, '2026-10-30', '09:00', ahora)).toBe(false)
    expect(slotValido(jara, '2026-11-03', '09:00', ahora)).toBe(false)
    expect(slotValido(jara, '2026-11-03', '10:00', ahora)).toBe(false)
    expect(slotValido(jara, '2026-11-03', '11:00', ahora)).toBe(true)
  })
})
