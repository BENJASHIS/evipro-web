// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { composicionTexto, firmarGuia, verificarGuia } from '@/lib/guia-frasco'

const S = 'secreto-de-prueba-con-mas-de-32-caracteres', T0 = Date.UTC(2026, 10, 15)

describe('guia-frasco', () => {
  it('firma y verifica', () => {
    const g = verificarGuia(firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }, T0, S), T0, S)
    // Vence al final del día de Lima (UTC-5): T0 + 90 días es el 12-feb-2027 a las 19:00 en Lima.
  expect(g).toMatchObject({ thc: 0.9, cbd: 10, exp: Date.UTC(2027, 1, 13, 4, 59, 59) / 1000 })
  })
  // Enlace compacto (Carlos, 20-nov): firma de 22 caracteres y después «thc-cbd-vencimiento en base 36».
  it('el enlace es corto y solo usa caracteres seguros en una URL', () => {
    const t = firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }, T0, S)
    expect(t.length).toBeLessThanOrEqual(40)
    expect(t).toMatch(/^[A-Za-z0-9_-]{22}[0-9.]+-[0-9.]+-[0-9a-z]+$/)
    expect(t.slice(22)).toBe('0.9-10-' + (Date.UTC(2027, 1, 13, 4, 59, 59) / 1000).toString(36))
  })
  it('rechaza datos alterados, firma alterada, token cortado y basura', () => {
    const t = firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }, T0, S)
    const firma = t.slice(0, 22), datos = t.slice(22)
    for (const malo of [firma + datos.replace('0.9-', '20-'), firma.slice(0, -2) + 'AA' + datos, t.slice(0, -2), '', 'abc', firma, firma + '1e1-10-zz'])
      expect(verificarGuia(malo, T0, S)).toBeNull()
  })
  it('redondea a 3 decimales, sin notación exponencial', () => {
    const t = firmarGuia({ thc: 0.0004, cbd: 2.12345, dias: 30 }, T0, S)
    expect(t.slice(22).startsWith('0-2.123-')).toBe(true)
    expect(verificarGuia(t, T0, S)).toMatchObject({ thc: 0, cbd: 2.123 })
  })
  it('rechaza vencido', () => {
    const t = firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, S)
    const fin = Date.UTC(2026, 11, 15, 4, 59, 59)   // 14-dic, 23:59:59 en Lima
  expect(verificarGuia(t, T0 + 30 * 86400_000 + 3600_000, S)).not.toBeNull()   // el último día vale entero
  expect(verificarGuia(t, fin + 1000, S)).toBeNull()
  })
  it('sin secreto no firma ni verifica', () => {
    expect(() => firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, '')).toThrow('FRASCO_GUIDE_SECRET')
    expect(verificarGuia(firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, S), T0, '')).toBeNull()
  })
  it('rechaza valores fuera de rango', () => {
    for (const [thc, cbd] of [[-1, 10], [101, 0], [0, 0], [60, 60], [NaN, 10]])
      expect(() => firmarGuia({ thc, cbd, dias: 90 }, T0, S)).toThrow(RangeError)
  })
  it('rechaza vigencia no entera positiva', () => {
    for (const dias of [0, -1, 1.5, NaN])
      expect(() => firmarGuia({ thc: 1, cbd: 1, dias }, T0, S)).toThrow(RangeError)
  })
  it('compone con THC primero', () => {
    expect(composicionTexto(0.9, 10)).toEqual({ linea: 'THC 0.9 % : CBD 10 % (9 : 100 mg/ml)', proporcion: '1:11 THC:CBD · CBD dominante' })
    expect(composicionTexto(0, 10).proporcion).toBe('CBD sin THC declarado')
  })
})

it('exige un secreto de al menos 32 caracteres', () => {
  expect(() => firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, 'corto')).toThrow('FRASCO_GUIDE_SECRET')
  expect(verificarGuia(firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, S), T0, S.slice(0, 31))).toBeNull()
})
