// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

// Vista previa al compartir (Carlos, 20-nov): Facebook y WhatsApp muestran la imagen de og:image.
const tamano = (ruta: string) => { const b = readFileSync(ruta); return [b.readUInt32BE(16), b.readUInt32BE(20)] }

it('/frasco y la guía tienen imagen de vista previa de 1200×630 con texto alternativo', () => {
  for (const carpeta of ['app/frasco', 'app/g/[token]']) {
    expect(tamano(`${carpeta}/opengraph-image.png`), carpeta).toEqual([1200, 630])
    expect(readFileSync(`${carpeta}/opengraph-image.alt.txt`, 'utf8').trim().length, carpeta).toBeGreaterThan(20)
  }
  expect(readFileSync('app/g/[token]/opengraph-image.alt.txt', 'utf8')).not.toMatch(/THC \d|CBD \d/)   // nada de una composición concreta
})
