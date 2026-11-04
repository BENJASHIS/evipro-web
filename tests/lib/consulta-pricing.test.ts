import { describe, it, expect } from 'vitest'
import { precioConsulta } from '../../lib/consulta-pricing'

describe('precioConsulta — sin membresía', () => {
  it('presencial escalera 100/50/25 con piso', () => {
    expect(precioConsulta('presencial', 'regular', 1)).toBe(100)
    expect(precioConsulta('presencial', 'regular', 2)).toBe(50)
    expect(precioConsulta('presencial', 'regular', 3)).toBe(25)
    expect(precioConsulta('presencial', 'regular', 9)).toBe(25)
  })
  it('virtual escalera 80/40/20/10, sin gratis', () => {
    expect([1, 2, 3, 4, 5, 9].map(v => precioConsulta('virtual', 'regular', v))).toEqual([80, 40, 20, 10, 10, 10])
  })
})

describe('precioConsulta — miembro EVIPro', () => {
  it('presencial 60/30/15', () => {
    expect(precioConsulta('presencial', 'evipro', 1)).toBe(60)
    expect(precioConsulta('presencial', 'evipro', 2)).toBe(30)
    expect(precioConsulta('presencial', 'evipro', 3)).toBe(15)
  })
  it('virtual 40/20/10/10 y gratis desde la 5ª', () => {
    expect([1, 2, 3, 4, 5, 9].map(v => precioConsulta('virtual', 'evipro', v))).toEqual([40, 20, 10, 10, 0, 0])
  })
})

describe('precioConsulta — miembro Básica', () => {
  it('presencial 80/40/20', () => {
    expect(precioConsulta('presencial', 'basica', 1)).toBe(80)
    expect(precioConsulta('presencial', 'basica', 2)).toBe(40)
    expect(precioConsulta('presencial', 'basica', 3)).toBe(20)
  })
  it('virtual 60/30/15/10 y gratis desde la 5ª', () => {
    expect([1, 2, 3, 4, 5, 9].map(v => precioConsulta('virtual', 'basica', v))).toEqual([60, 30, 15, 10, 0, 0])
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
    expect(precioReferencia('virtual')).toBe(80)
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
  it('virtual baja hasta la 4ª', () => {
    expect(escaleraReserva('virtual')).toBe('1ª S/80 · reconsulta S/40 · 3ª S/20 · desde 4ª S/10')
    expect(escaleraReserva('virtual', 'en')).toBe('1st S/80 · follow-up S/40 · 3rd S/20 · 4th onwards S/10')
  })
  it('miembros en virtual: gratis desde la 5ª', () => {
    expect(escaleraReserva('virtual', 'es', undefined, 'basica')).toBe('1ª S/60 · reconsulta S/30 · 3ª S/15 · 4ª S/10 · desde 5ª gratis')
    expect(escaleraReserva('virtual', 'en', undefined, 'evipro')).toBe('1st S/40 · follow-up S/20 · 3rd S/10 · 4th S/10 · 5th onwards free')
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

import { tarifaDe } from '../../lib/consulta-pricing'

describe('tarifaDe — tarifa de consulta según el plan', () => {
  it('planes EVIPro, Básica y sin plan', () => {
    expect(tarifaDe('cannabis')).toBe('evipro')
    expect(tarifaDe('acceso')).toBe('basica')
    expect(tarifaDe(undefined)).toBe('regular')
  })
})

import { CONVENIOS } from '../../lib/consulta-pricing'
import { ALIADOS } from '../../lib/aliados'

describe('convenios con aliados — enlace ?convenio=', () => {
  it('ASCAMED virtual 40/20/10; presencial sin fila queda regular', () => {
    expect([1, 2, 3, 9].map(v => precioConsulta('virtual', 'regular', v, false, 'ascamed'))).toEqual([40, 20, 10, 10])
    expect(precioConsulta('presencial', 'regular', 1, false, 'ascamed')).toBe(100)
    expect(escaleraReserva('virtual', 'es', 'cannabis-libre-club')).toBe('1ª S/40 · reconsulta S/20 · desde 3ª S/10')
  })
  it('un convenio desconocido o de prototipo no cambia el precio', () => {
    for (const c of ['inventado', '__proto__', 'constructor']) expect(precioConsulta('virtual', 'regular', 1, false, c)).toBe(80)
  })
  it('el convenio no toca a los demás ni quita el gratis del miembro', () => {
    expect([1, 2, 3, 4].map(v => precioConsulta('virtual', 'regular', v))).toEqual([80, 40, 20, 10])
    expect(precioConsulta('virtual', 'evipro', 5, false, 'ascamed')).toBe(0)
    expect(precioConsulta('virtual', 'regular', 5, false, 'ascamed')).toBe(10)
    expect(precioConsulta('presencial', 'evipro', 1, false, 'ascamed')).toBe(60)
  })
  it('cada convenio es un aliado de /aliados (si no, el aviso no muestra su nombre)', () => {
    for (const slug of Object.keys(CONVENIOS)) expect(ALIADOS.map(a => a.slug)).toContain(slug)
  })
})
