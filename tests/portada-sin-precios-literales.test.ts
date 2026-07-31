import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FUENTES = [
  'app/page.tsx',
  'app/components/home/secciones.tsx',
  'lib/home-content.ts',
]

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

  // El copy de MEMBRESIA dice que la membresía "abarata cada consulta". Eso es
  // cierto de EVIPro (discount_virtual_pct=30, discount_presencial_pct=20) pero
  // falso de la Básica (0% en ambos, sin receta ni RENPUC — ver migración
  // 020_planes_base_addons.sql). precioDesde() debe filtrar por el tipo de
  // plan del que habla el copy: si vuelve a incluir 'basica' en el filtro, el
  // "desde" que se imprime en pantalla vuelve a ser el de un plan que no
  // abarata nada, con el signo invertido del bug original de esta rama.
  it('precioDesde() consulta el plan evipro, no la básica', () => {
    const fuente = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8')
    expect(fuente).toContain("'evipro'")
    expect(fuente).not.toContain("'basica'")
  })

  // El spec exige UNA sola accion principal: el visitante frio no tiene que
  // elegir entre botones. "Ver planes" es secundario y va con borde, no primario.
  it('hay exactamente un CTA primario en toda la portada', () => {
    const fuente = readFileSync(
      resolve(process.cwd(), 'app/components/home/secciones.tsx'), 'utf8',
    )
    const primarios = fuente.match(/variant="primary"/g) ?? []
    expect(primarios).toHaveLength(1)
  })
})
