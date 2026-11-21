import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'

// Regla de Carlos (20-nov): toda página nueva de la web va en español e inglés. Esta prueba falla si una
// página pública o de miembros deja texto visible sin <T> o t(). La otra prueba (i18n-catalogue) exige que lo
// marcado tenga su entrada en lib/locales/en.json; juntas cubren el olvido completo y el a medias.

// Zonas internas, solo en español: el panel de admin, el portal de los médicos y la guía de estilo.
const INTERNAS = [/^app\/admin\//, /^app\/api\//, /^app\/medicos\/\[slug\]\/reservas\//, /^app\/styleguide\//]

// Pendientes con nombre: se traducen aparte. Al traducir uno, se borra de aquí.
const PENDIENTES: Record<string, string> = {
  'app/miembros/herramientas/habitos/HabitTracker.tsx': 'Bitácora de hábitos: toda la interfaz, con etiquetas y resúmenes.',
  'app/g/[token]/page.tsx': 'Guía del paciente: texto clínico; la versión en inglés pasa por la revisión de Carlos.',
}

// Iguales en los dos idiomas, nombres propios y siglas.
const IGUALES = new Set(['EVIPro', 'EVI', 'Pro', 'Regen', 'Legal', 'Total', 'min', 'Español', 'English', 'Mercado Pago',
  'Damian Orchowski', 'Bianca Luna Parmigiani', 'José Carlos Benjamín Jara Ovalle', 'EVIPro · RUC 10439904572'])

const traducible = (texto: string) =>
  /\p{L}{2}/u.test(texto)
  && !IGUALES.has(texto)
  && !texto.startsWith('«') // citas textuales: se publican como las dijo su autor
  && !/@|\b[\w-]+\.(pe|com|org)\b/.test(texto) // correos, cuentas y dominios
  && !/^[\p{Lu}\d\s.,:·/()%+\-–—Δ→←]+$/u.test(texto) // siglas y cifras: CMP, RUC, Δ9-THC

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? archivos(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : [])
}

function sinMarcar(archivo: string): string[] {
  const fuente = ts.createSourceFile(archivo, readFileSync(archivo, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const hallados: string[] = []
  const visitar = (nodo: ts.Node, dentroDeT: boolean) => {
    if (ts.isJsxElement(nodo) && nodo.openingElement.tagName.getText(fuente) === 'T') dentroDeT = true
    if (ts.isJsxText(nodo) && !dentroDeT) {
      const texto = nodo.text.replace(/\s+/g, ' ').trim()
      if (traducible(texto)) hallados.push(texto)
    }
    ts.forEachChild(nodo, hijo => visitar(hijo, dentroDeT))
  }
  visitar(fuente, false)
  return hallados
}

it('las páginas públicas y de miembros no dejan texto sin traducir', () => {
  const faltan = archivos('app')
    .filter(a => !INTERNAS.some(zona => zona.test(a)) && !Object.hasOwn(PENDIENTES, a))
    .flatMap(a => sinMarcar(a).map(texto => `${a}: ${texto}`))
  expect(faltan).toEqual([])
})

it('los pendientes siguen existiendo y siguen sin traducir (si ya se tradujo, se borra de la lista)', () => {
  for (const archivo of Object.keys(PENDIENTES)) expect(sinMarcar(archivo).length, archivo).toBeGreaterThan(0)
})

it('detecta un texto nuevo sin marcar y deja pasar lo que no se traduce', () => {
  expect(traducible('Guía de uso de tu frasco')).toBe(true)
  expect(traducible('← Volver')).toBe(true)
  for (const texto of ['CMP', 'Δ9-THC', 'consulta@evipro.pe', '«Recomiendo esta clínica»', 'EVIPro', '52 / 52']) expect(traducible(texto), texto).toBe(false)
})
