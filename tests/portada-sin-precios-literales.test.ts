import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { META_PORTADA } from '@/lib/home-content'

const FUENTES = [
  'app/page.tsx',
  'app/components/home/secciones.tsx',
  'lib/home-content.ts',
]

describe('lo que ve Google', () => {
  // El layout traia "EVIPro — Medicina Integral y Cannabis Medicinal" y
  // "Plataforma de membresias medicas": las dos cosas que esta portada existe
  // para dejar de decir. Nadie teclea "medicina integral", y liderar con
  // membresias pone el precio delante de "¿esto es para mi?". Como el snippet
  // se lee ANTES que el hero, una regresion ahi deshace el trabajo entero sin
  // que nada en pantalla se vea mal.
  it('el titulo de la portada no vuelve al posicionamiento viejo', () => {
    const meta = `${META_PORTADA.titulo} ${META_PORTADA.descripcion}`.toLowerCase()
    expect(meta).not.toContain('medicina integral')
    expect(meta).not.toContain('membresía')
    expect(meta).not.toContain('membresias')
    expect(META_PORTADA.titulo.toLowerCase()).toContain('cannabis medicinal')
    expect(META_PORTADA.titulo.toLowerCase()).toContain('cusco')
  })

  it('el titulo y la descripcion caben en el snippet de Google', () => {
    // Google corta alrededor de 60 y 160 caracteres.
    expect(META_PORTADA.titulo.length).toBeLessThanOrEqual(60)
    expect(META_PORTADA.descripcion.length).toBeLessThanOrEqual(160)
  })

  it('la portada declara su propio metadata, no hereda el del layout', () => {
    const fuente = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')
    expect(fuente).toContain('export const generateMetadata')
  })
})

describe('la portada no tiene precios escritos a mano', () => {
  // La portada decia "membresias desde S/. 59/mes" cuando la entrada real era
  // S/9.90: un numero tecleado que se quedo viejo. Los precios que la pagina
  // muestra salen de consulta-pricing.ts y de la tabla membership_plans.
  it.each(FUENTES)('%s no contiene un literal tipo S/59', archivo => {
    const fuente = readFileSync(resolve(process.cwd(), archivo), 'utf8')
    const literales = fuente.match(/S\/\.?\s?\d/g) ?? []
    expect(literales, `precios escritos a mano: ${literales.join(', ')}`).toEqual([])
  })

  it('app/page.tsx consulta el precio de membresía en vez de escribirlo', () => {
    const fuente = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')
    expect(fuente).toContain('membership_plans')
    expect(fuente).toContain('price_soles')
  })

  it('mantiene separados los precios de Básica y EVIPro', () => {
    const fuente = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')
    expect(fuente).toContain("find(p => p.type === 'evipro')")
    expect(fuente).toContain("find(p => p.type === 'basica')")
    expect(fuente).toContain('desde={precios.evipro} basica={precios.basica}')
  })

  // El spec exige UNA sola accion principal: el visitante frio no tiene que
  // elegir entre acciones del mismo peso. La membresía es ahora la prioridad.
  it('hay exactamente un CTA primario en toda la portada', () => {
    const fuente = readFileSync(
      resolve(process.cwd(), 'app/components/home/secciones.tsx'), 'utf8',
    )
    const primarios = fuente.match(/variant="primary"/g) ?? []
    expect(primarios).toHaveLength(1)
  })
})
