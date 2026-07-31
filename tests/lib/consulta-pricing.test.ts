import { describe, it, expect } from 'vitest'
import { precioConsulta } from '../../lib/consulta-pricing'

describe('precioConsulta — sin membresía', () => {
  it('presencial escalera 100/50/25 con piso', () => {
    expect(precioConsulta('presencial', 'regular', 1)).toBe(100)
    expect(precioConsulta('presencial', 'regular', 2)).toBe(50)
    expect(precioConsulta('presencial', 'regular', 3)).toBe(25)
    expect(precioConsulta('presencial', 'regular', 9)).toBe(25)
  })
  it('virtual escalera 70/35/17', () => {
    expect(precioConsulta('virtual', 'regular', 1)).toBe(70)
    expect(precioConsulta('virtual', 'regular', 2)).toBe(35)
    expect(precioConsulta('virtual', 'regular', 3)).toBe(17)
  })
})

describe('precioConsulta — miembro EVIPro', () => {
  it('presencial 60/30/15', () => {
    expect(precioConsulta('presencial', 'evipro', 1)).toBe(60)
    expect(precioConsulta('presencial', 'evipro', 2)).toBe(30)
    expect(precioConsulta('presencial', 'evipro', 3)).toBe(15)
  })
  it('virtual 40/20/10', () => {
    expect(precioConsulta('virtual', 'evipro', 1)).toBe(40)
    expect(precioConsulta('virtual', 'evipro', 2)).toBe(20)
    expect(precioConsulta('virtual', 'evipro', 3)).toBe(10)
  })
})

describe('precioConsulta — miembro Básica', () => {
  it('presencial 80/40/20', () => {
    expect(precioConsulta('presencial', 'basica', 1)).toBe(80)
    expect(precioConsulta('presencial', 'basica', 2)).toBe(40)
    expect(precioConsulta('presencial', 'basica', 3)).toBe(20)
  })
  it('virtual 55/28/14', () => {
    expect(precioConsulta('virtual', 'basica', 1)).toBe(55)
    expect(precioConsulta('virtual', 'basica', 2)).toBe(28)
    expect(precioConsulta('virtual', 'basica', 3)).toBe(14)
  })
  it('queda entre la tarifa regular y la de EVIPro', () => {
    for (const m of ['presencial', 'virtual'] as const) {
      expect(precioConsulta(m, 'basica', 1)).toBeLessThan(precioConsulta(m, 'regular', 1))
      expect(precioConsulta(m, 'basica', 1)).toBeGreaterThan(precioConsulta(m, 'evipro', 1))
    }
  })
  it('el bono de renovación es solo de EVIPro', () => {
    expect(precioConsulta('presencial', 'basica', 1, true)).toBe(80)
  })
})

describe('precioConsulta — bono de renovación', () => {
  it('miembro recién pagó arranca en el 2º escalón', () => {
    expect(precioConsulta('presencial', 'evipro', 1, true)).toBe(30)
    expect(precioConsulta('virtual', 'evipro', 1, true)).toBe(20)
  })
  it('el bono no aplica sin membresía', () => {
    expect(precioConsulta('presencial', 'regular', 1, true)).toBe(100)
  })
})

describe('precioConsulta — guardas de rango', () => {
  it('visita 0 o negativa se trata como 1ª', () => {
    expect(precioConsulta('presencial', 'regular', 0)).toBe(100)
    expect(precioConsulta('presencial', 'regular', -3)).toBe(100)
  })
})

import {
  precioReferencia,
  escaleraReserva,
  CONSULTA_MODALITY_LABELS,
  PRECIO_DOMICILIO,
} from '../../lib/consulta-pricing'

describe('precioReferencia — precio nominal que guarda /reservar', () => {
  it('presencial y virtual = 1ª consulta a tarifa regular', () => {
    expect(precioReferencia('presencial')).toBe(100)
    expect(precioReferencia('virtual')).toBe(70)
  })
  it('domicilio = precio plano', () => {
    expect(precioReferencia('domicilio')).toBe(PRECIO_DOMICILIO)
    expect(precioReferencia('domicilio')).toBe(150)
  })
})

describe('escaleraReserva — texto informativo de la página', () => {
  it('presencial muestra los tres escalones', () => {
    expect(escaleraReserva('presencial')).toBe('1ª S/100 · reconsulta S/50 · desde 3ª S/25')
  })
  it('virtual muestra los tres escalones', () => {
    expect(escaleraReserva('virtual')).toBe('1ª S/70 · reconsulta S/35 · desde 3ª S/17')
  })
  it('domicilio no tiene escalera', () => {
    expect(escaleraReserva('domicilio')).toBe('Desde S/150')
  })
})

describe('CONSULTA_MODALITY_LABELS', () => {
  it('nombra las tres modalidades', () => {
    expect(CONSULTA_MODALITY_LABELS.presencial).toBe('Presencial')
    expect(CONSULTA_MODALITY_LABELS.virtual).toBe('Virtual (teleconsulta)')
    expect(CONSULTA_MODALITY_LABELS.domicilio).toBe('A domicilio')
  })
})
