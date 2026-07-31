import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Las páginas legales enumeran lo que se vende. Cuando un plan se retira y el
// texto legal se queda, el sitio ofrece por escrito algo que ya no existe —
// que es exactamente el riesgo INDECOPI que ya nos mordió con el precio de la
// portada. Este test falla si un nombre muerto reaparece.
const PAGINAS = [
  'app/terminos/page.tsx',
  'app/libro-reclamaciones/page.tsx',
  'app/politica-devoluciones/page.tsx',
]

const RETIRADOS = [
  'Plan Axs',
  'Plan Express',
  'Plan Esencial',
  'Plan Cannabis',
  'Plan Integral',
  'Plan Especialistas',
  'Consejería',
  'consejería',
]

describe('páginas legales al día', () => {
  for (const pagina of PAGINAS) {
    it(`${pagina} no ofrece servicios retirados`, () => {
      const texto = readFileSync(resolve(process.cwd(), pagina), 'utf-8')
      for (const muerto of RETIRADOS) {
        expect(texto, `"${muerto}" sigue en ${pagina}`).not.toContain(muerto)
      }
    })
  }

  it('los términos nombran lo que sí se vende hoy', () => {
    const texto = readFileSync(resolve(process.cwd(), 'app/terminos/page.tsx'), 'utf-8')
    for (const vivo of ['Membresía Básica', 'Membresía EVIPro', 'Plan Turista Inicio']) {
      expect(texto).toContain(vivo)
    }
  })
})
