import { describe, it, expect } from 'vitest'
import { DOCTORS } from '../../lib/doctors'

describe('DOCTORS data', () => {
  it('contiene exactamente 2 médicos', () => {
    expect(DOCTORS).toHaveLength(2)
  })

  it('todos los médicos tienen campos requeridos', () => {
    for (const doctor of DOCTORS) {
      expect(doctor.slug).toBeTruthy()
      expect(doctor.name).toBeTruthy()
      expect(doctor.cmp).toBeTruthy()
      expect(doctor.specialties.length).toBeGreaterThan(0)
      expect(doctor.bio).toBeTruthy()
      expect(doctor.formation.length).toBeGreaterThan(0)
      expect(doctor.languages.length).toBeGreaterThan(0)
      expect(doctor.whatsapp).toBeTruthy()
      expect(doctor.photo).toBeTruthy()
    }
  })

  it('slugs son únicos', () => {
    const slugs = DOCTORS.map(d => d.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('Dr. Jara tiene CMP 82817', () => {
    const jara = DOCTORS.find(d => d.slug === 'dr-jara')
    expect(jara?.cmp).toBe('82817')
  })

  it('Dr. Vera tiene CMP 099649', () => {
    const vera = DOCTORS.find(d => d.slug === 'dr-vera')
    expect(vera?.cmp).toBe('099649')
  })

  it('Dr. Vera no atiende Plan Cannabis', () => {
    const vera = DOCTORS.find(d => d.slug === 'dr-vera')
    expect(vera?.plans.some(p => p.toLowerCase().includes('cannabis'))).toBe(false)
  })

  it('WhatsApp de ambos médicos es el de EVIPro', () => {
    for (const doctor of DOCTORS) {
      expect(doctor.whatsapp).toBe('51942185939')
    }
  })
})
