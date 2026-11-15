// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { composicionTexto, firmarGuia, verificarGuia } from '@/lib/guia-frasco'

const S = 'secreto-de-prueba', T0 = Date.UTC(2026, 10, 15)

describe('guia-frasco', () => {
  it('firma y verifica', () => {
    const g = verificarGuia(firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }, T0, S), T0, S)
    expect(g).toMatchObject({ thc: 0.9, cbd: 10, exp: T0 / 1000 + 90 * 86400 })
  })
  it('rechaza datos alterados, firma alterada, token cortado y basura', () => {
    const t = firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }, T0, S)
    const [d, f] = t.split('.')
    const otro = Buffer.from(JSON.stringify({ v: 1, thc: 20, cbd: 10, exp: T0 / 1000 + 1e6 })).toString('base64url')
    for (const malo of [`${otro}.${f}`, `${d}.${f.slice(0, -2)}AA`, t.slice(0, -5), '', 'abc', 'a.b.c'])
      expect(verificarGuia(malo, T0, S)).toBeNull()
  })
  it('rechaza vencido', () => {
    const t = firmarGuia({ thc: 1, cbd: 1, dias: 30 }, T0, S)
    expect(verificarGuia(t, T0 + 30 * 86400_000 + 1000, S)).toBeNull()
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
