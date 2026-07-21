import { describe, it, expect } from 'vitest'
import { precioConsulta } from '../../lib/consulta-pricing'

describe('precioConsulta — no miembro', () => {
  it('presencial escalera 100/50/25 con piso', () => {
    expect(precioConsulta('presencial', false, 1)).toBe(100)
    expect(precioConsulta('presencial', false, 2)).toBe(50)
    expect(precioConsulta('presencial', false, 3)).toBe(25)
    expect(precioConsulta('presencial', false, 9)).toBe(25)
  })
  it('virtual escalera 70/35/17', () => {
    expect(precioConsulta('virtual', false, 1)).toBe(70)
    expect(precioConsulta('virtual', false, 2)).toBe(35)
    expect(precioConsulta('virtual', false, 3)).toBe(17)
  })
})

describe('precioConsulta — miembro EVIPro', () => {
  it('presencial 60/30/15', () => {
    expect(precioConsulta('presencial', true, 1)).toBe(60)
    expect(precioConsulta('presencial', true, 2)).toBe(30)
    expect(precioConsulta('presencial', true, 3)).toBe(15)
  })
  it('virtual 40/20/10', () => {
    expect(precioConsulta('virtual', true, 1)).toBe(40)
    expect(precioConsulta('virtual', true, 2)).toBe(20)
    expect(precioConsulta('virtual', true, 3)).toBe(10)
  })
})

describe('precioConsulta — bono de renovación', () => {
  it('miembro recién pagó arranca en el 2º escalón', () => {
    expect(precioConsulta('presencial', true, 1, true)).toBe(30)
    expect(precioConsulta('virtual', true, 1, true)).toBe(20)
  })
  it('el bono no aplica a no-miembro', () => {
    expect(precioConsulta('presencial', false, 1, true)).toBe(100)
  })
})

describe('precioConsulta — guardas de rango', () => {
  it('visita 0 o negativa se trata como 1ª', () => {
    expect(precioConsulta('presencial', false, 0)).toBe(100)
    expect(precioConsulta('presencial', false, -3)).toBe(100)
  })
})
