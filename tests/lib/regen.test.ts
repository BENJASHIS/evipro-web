import { describe, it, expect } from 'vitest'
import {
  AMBITOS, ESCALA, REGEN_VERSION,
  UMBRAL_AMARILLO, UMBRAL_ROJO, RED_FLAG_NIVEL,
  colorFor, scoreAmbito, evaluate, parseRespuestas,
  type Respuesta,
} from '../../lib/regen'

// Helper: build a full answer set giving every question the same value.
function allValores(valor: number): Respuesta[] {
  return AMBITOS.flatMap(a => a.preguntas.map(p => ({ preguntaId: p.id, valor })))
}

describe('estructura de contenido', () => {
  it('hay exactamente 4 ámbitos con ids esperados', () => {
    expect(AMBITOS.map(a => a.id).sort()).toEqual(['familia', 'hogar', 'social', 'trabajo'])
  })
  it('cada ámbito tiene al menos 4 preguntas', () => {
    for (const a of AMBITOS) expect(a.preguntas.length).toBeGreaterThanOrEqual(4)
  })
  it('el instrumento tiene al menos una pregunta bandera roja', () => {
    // Social ya no tiene flag (era aislamiento, no peligro); las de peligro
    // real (hogar/trabajo/familia) sí disparan la red de seguridad.
    expect(AMBITOS.flatMap(a => a.preguntas).some(p => p.redFlag)).toBe(true)
  })
  it('los ids de pregunta son únicos en todo el instrumento', () => {
    const ids = AMBITOS.flatMap(a => a.preguntas.map(p => p.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('la escala Likert tiene 5 niveles (0..4)', () => {
    expect(ESCALA.length).toBe(5)
  })
  it('la versión usa formato YYYY.MM.DD', () => {
    expect(REGEN_VERSION).toMatch(/^\d{4}\.\d{2}\.\d{2}$/)
  })
})

describe('colorFor (umbrales)', () => {
  it('verde por debajo del umbral amarillo', () => {
    expect(colorFor(0)).toBe('verde')
    expect(colorFor(UMBRAL_AMARILLO - 1)).toBe('verde')
  })
  it('amarillo entre umbral amarillo y rojo', () => {
    expect(colorFor(UMBRAL_AMARILLO)).toBe('amarillo')
    expect(colorFor(UMBRAL_ROJO - 1)).toBe('amarillo')
  })
  it('rojo desde el umbral rojo', () => {
    expect(colorFor(UMBRAL_ROJO)).toBe('rojo')
    expect(colorFor(100)).toBe('rojo')
  })
})

describe('scoreAmbito (0..100 normalizado)', () => {
  const hogar = AMBITOS.find(a => a.id === 'hogar')!
  it('todo en 0 → 0', () => {
    const valores = Object.fromEntries(hogar.preguntas.map(p => [p.id, 0]))
    expect(scoreAmbito(hogar, valores)).toBe(0)
  })
  it('todo en el máximo → 100', () => {
    const valores = Object.fromEntries(hogar.preguntas.map(p => [p.id, 4]))
    expect(scoreAmbito(hogar, valores)).toBe(100)
  })
})

describe('evaluate', () => {
  it('todo en 0: todos verdes, sin banderas', () => {
    const r = evaluate(allValores(0))
    expect(Object.values(r.colores).every(c => c === 'verde')).toBe(true)
    expect(r.redFlags).toEqual([])
    expect(r.safetyTriggered).toBe(false)
    // ámbitos verdes no reciben consejos
    expect(Object.values(r.consejos).every(list => list.length === 0)).toBe(true)
  })
  it('todo en el máximo: todos rojos y se dispara la red de seguridad', () => {
    const r = evaluate(allValores(4))
    expect(Object.values(r.colores).every(c => c === 'rojo')).toBe(true)
    expect(r.safetyTriggered).toBe(true)
    expect(r.redFlags.length).toBeGreaterThan(0)
    // ámbitos rojos sí reciben consejos
    expect(Object.values(r.consejos).every(list => list.length > 0)).toBe(true)
  })
  it('bandera roja en el nivel de riesgo dispara seguridad aunque el resto esté sano', () => {
    const flagPregunta = AMBITOS.flatMap(a => a.preguntas).find(p => p.redFlag)!
    const resp = allValores(0).map(x =>
      x.preguntaId === flagPregunta.id ? { ...x, valor: RED_FLAG_NIVEL } : x)
    const r = evaluate(resp)
    expect(r.safetyTriggered).toBe(true)
    expect(r.redFlags).toContain(flagPregunta.id)
  })
  it('bandera roja por debajo del nivel de riesgo NO dispara seguridad', () => {
    const flagPregunta = AMBITOS.flatMap(a => a.preguntas).find(p => p.redFlag)!
    const resp = allValores(0).map(x =>
      x.preguntaId === flagPregunta.id ? { ...x, valor: RED_FLAG_NIVEL - 1 } : x)
    const r = evaluate(resp)
    expect(r.safetyTriggered).toBe(false)
    expect(r.redFlags).toEqual([])
  })
})

describe('parseRespuestas (frontera de confianza)', () => {
  it('acepta un set completo y válido', () => {
    const res = parseRespuestas(allValores(2))
    expect(res.ok).toBe(true)
  })
  it('rechaza si no es arreglo', () => {
    expect(parseRespuestas({}).ok).toBe(false)
  })
  it('rechaza un id de pregunta desconocido', () => {
    const bad = [...allValores(0)]
    bad[0] = { preguntaId: 'no_existe', valor: 0 }
    expect(parseRespuestas(bad).ok).toBe(false)
  })
  it('rechaza un valor fuera de rango', () => {
    const bad = allValores(0).map((x, i) => i === 0 ? { ...x, valor: 9 } : x)
    expect(parseRespuestas(bad).ok).toBe(false)
  })
  it('rechaza un valor no entero', () => {
    const bad = allValores(0).map((x, i) => i === 0 ? { ...x, valor: 1.5 } : x)
    expect(parseRespuestas(bad).ok).toBe(false)
  })
  it('rechaza si falta responder alguna pregunta', () => {
    const incompleto = allValores(0).slice(1)
    expect(parseRespuestas(incompleto).ok).toBe(false)
  })
})
