import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { MEDICO, HERO } from '@/lib/home-content'

// El CMP reserva «especialista» para quien consta en el Registro Nacional de
// Especialistas (RNE). Anunciarlo sin ese registro es una infracción, y en la
// portada iba en la línea de credenciales, que es justo la que da confianza.
describe('título profesional', () => {
  it('la portada no se arroga una especialidad', () => {
    const texto = `${MEDICO.especialidades} ${MEDICO.credenciales} ${HERO.credenciales}`.toLowerCase()
    expect(texto).not.toContain('especialista')
    expect(texto).not.toContain('cannabinolog')
  })

  it('sigue diciendo lo que sí acredita', () => {
    expect(MEDICO.especialidades.toLowerCase()).toContain('médico cirujano')
    expect(MEDICO.credenciales).toContain('CMP')
  })

  it('ningún texto de la portada usa el término', () => {
    const fuente = readFileSync(resolve(process.cwd(), 'lib/home-content.ts'), 'utf-8')
    const sinComentarios = fuente.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(sinComentarios.toLowerCase()).not.toContain('especialista en')
  })
})
