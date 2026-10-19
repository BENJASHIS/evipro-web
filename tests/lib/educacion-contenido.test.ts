import { SECCIONES, PREGUNTAS, REVISION, seccionesPara, preguntasPara, fuentesDe } from '@/lib/educacion/contenido-planta'

const todas = SECCIONES.flatMap(s => s.afirmaciones)
it('ids únicos', () => expect(new Set(todas.map(a => a.id)).size).toBe(todas.length))
it('paridad español e inglés', () => todas.forEach(a => { expect(a.es.trim()).not.toBe(''); expect(a.en.trim()).not.toBe('') }))
it('evidencia con fuente; orientación con motivo', () => todas.forEach(a =>
  a.tipo === 'orientacion' ? expect(a.motivo?.trim()).toBeTruthy() : expect(a.fuente && (a.fuente.pmid || a.fuente.doi || a.fuente.url)).toBeTruthy()))
it('sin dosis ni instrucciones de calentar', () => todas.forEach(a => {
  expect(`${a.es} ${a.en}`).not.toMatch(/\b\d+\s?(mg|ml)\b|\bgotas?\b|\bdrops?\b/i)
  expect(`${a.es} ${a.en}`).not.toMatch(/\b(calienta|hornea|precalienta|heat it|bake)\b/i)
}))
it('la seguridad la ve todo nivel con acceso', () => {
  expect(SECCIONES.find(s => s.id === 'seguridad')!.parte).toBe('todos')
  expect(seccionesPara('parcial').map(s => s.id)).toEqual(expect.arrayContaining(['seguridad', 'terpenos', 'flavonoides']))
  expect(seccionesPara('parcial').some(s => s.parte === 'evipro')).toBe(false)
  expect(seccionesPara('sin_acceso')).toEqual([])
})
it('repaso por nivel', () => {
  expect(preguntasPara('parcial').map(p => p.parte).sort()).toEqual(['abierta', 'todos'])
  expect(preguntasPara('completo')).toHaveLength(3)
  PREGUNTAS.forEach(p => expect(p.correcta).toBeLessThan(p.opciones.length))
})
it('fuentes sin duplicados', () => {
  const f = fuentesDe(SECCIONES)
  expect(new Set(f.map(x => x.pmid ?? x.doi ?? x.url)).size).toBe(f.length)
})
it('nace sin publicar', () => expect(REVISION.version).toBeNull())
