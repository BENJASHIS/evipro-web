// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, expect, it, vi } from 'vitest'
vi.mock('@/app/miembros/contenido/explora-cbd-thc/VisorFrasco', () => ({ default: (p: { src?: string }) => <iframe data-src={p.src} /> }))
import GuiaFrascoPage, { metadata } from '@/app/guia-frasco/[token]/page'
import { firmarGuia } from '@/lib/guia-frasco'

const render = async (token: string) => renderToStaticMarkup(await GuiaFrascoPage({ params: Promise.resolve({ token }) }))
beforeAll(() => { vi.stubEnv('FRASCO_GUIDE_SECRET', 'secreto-de-prueba-con-mas-de-32-caracteres') })

it('muestra composición, visor, instrucciones de core y pie', async () => {
  const t = firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }); const html = await render(t)
  for (const s of ['THC 0.9 % : CBD 10 % (9 : 100 mg/ml)', '1:11 THC:CBD · CBD dominante', 'No comer ni beber por 15 minutos antes y después.',
                   'Con THC menor de 1 %: bajo riesgo', '/frasco/visor/index.html#thc=0.9&amp;cbd=10', 'Esta guía no reemplaza tu receta', '106 (SAMU)',
                   'escríbele a tu médico para que te indique qué hacer', 'Cuéntale a quien vive contigo', 'Si un niño toma el aceite por accidente'])
    expect(html).toContain(s)
  expect(html).not.toMatch(/Cannavital|S\/\s?\d|mayor de edad|ojos amarillos/)
  // Inicio sublingual: una sola fuente con la receta (core), opción A de Carlos (20-nov).
  expect(html).toContain('puede empezar a los 15-45 minutos, pero a veces tarda hasta 2 horas: no tomes más mientras esperas.')
  expect(html).not.toContain('30 minutos a 2 horas')
  expect(html.indexOf('Qué evitar')).toBeLessThan(html.indexOf('Altura'))   // orden del texto aprobado
  // Lo que exige estar consciente se le pide al paciente; desmayo, convulsión o no despertar, a quien lo acompaña.
  expect(html).not.toMatch(/Ve a emergencia[^.]*(desmay|convulsi|despertar)/)
  const orden = ['tu-frasco', 'visor', 'porcentajes', 'por-que', 'como-aplicar', 'cuidados', 'avisar'].map(id => html.indexOf(`id="${id}"`))
  expect(orden.every((p, i) => p > -1 && (i === 0 || p > orden[i - 1]))).toBe(true)
})
it('con THC sobre el umbral muestra la precaución de manejo', async () => {
  expect(await render(firmarGuia({ thc: 5, cbd: 5, dias: 30 }))).toContain('Producto con THC 5%: NO conducir')
})
it('frasco sin THC', async () => {
  expect(await render(firmarGuia({ thc: 0, cbd: 10, dias: 30 }))).toContain('CBD sin THC declarado')
})
it('enlace cortado o inválido no muestra instrucciones', async () => {
  const html = await render(firmarGuia({ thc: 0.9, cbd: 10, dias: 90 }).slice(0, -4))
  expect(html).toContain('Este enlace ya no es válido. Pide uno nuevo a tu médico.')
  expect(html).not.toContain('No comer ni beber')
})
it('no se indexa y su vista previa no muestra la descripción comercial del sitio', () => {
  expect(metadata.robots).toEqual({ index: false, follow: false })
  expect(metadata.description).toBe('Cómo usar tu frasco y qué cuidados tener. No reemplaza tu receta.')
})
