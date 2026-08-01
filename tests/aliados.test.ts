import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { ALIADOS } from '@/lib/aliados'

describe('aliados', () => {
  it('cada logo existe en public/', () => {
    for (const a of ALIADOS) {
      const ruta = resolve(process.cwd(), 'public', a.logo.replace(/^\//, ''))
      expect(existsSync(ruta), `falta el logo de ${a.nombre}: ${a.logo}`).toBe(true)
    }
  })

  it('cada aliado tiene al menos un enlace y ninguno va vacío', () => {
    for (const a of ALIADOS) {
      expect(a.enlaces.length, `${a.nombre} sin enlace`).toBeGreaterThan(0)
      for (const e of a.enlaces) {
        expect(e.url).toMatch(/^https:\/\//)
        expect(e.etiqueta.trim()).not.toBe('')
      }
    }
  })

  it('los enlaces no llevan parámetros de seguimiento', () => {
    // El de ASCAMED llegó con fbclid y utm_*, y el de Maps con entry/g_ep:
    // reenviarlos publica en nuestra web los identificadores de la sesión o la
    // campaña con que ese enlace llegó a Carlos.
    for (const a of ALIADOS) {
      for (const e of a.enlaces) {
        expect(e.url, `${a.nombre}: ${e.url}`).not.toMatch(/fbclid|utm_|[?&](entry|g_ep)=/)
      }
    }
  })

  it('no hay slugs repetidos', () => {
    const slugs = ALIADOS.map(a => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
