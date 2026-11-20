// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const esAdmin = vi.hoisted(() => vi.fn())
vi.mock('@/lib/auth', () => ({ isAdminUser: esAdmin }))
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'admin' } } }) } }),
}))
import { crearEnlaceGuia } from '@/app/admin/guia-frasco/actions'
import { verificarGuia } from '@/lib/guia-frasco'

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f }
beforeEach(() => { esAdmin.mockReturnValue(true) })
afterEach(() => { vi.unstubAllEnvs() })

it('rechaza a quien no es admin', async () => {
  esAdmin.mockReturnValue(false)
  await expect(crearEnlaceGuia(null, fd({ thc: '1', cbd: '1', dias: '90' }))).rejects.toThrow('No autorizado')
})
it('acepta coma decimal y devuelve enlace verificable', async () => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', 'secreto-de-prueba-con-mas-de-32-caracteres')
  const r = await crearEnlaceGuia(null, fd({ thc: '0,9', cbd: '10', dias: '90' }))
  if (!r.ok) throw new Error(r.error)
  expect(r.url.startsWith('https://www.evipro.pe/guia-frasco/')).toBe(true)
  expect(verificarGuia(r.url.split('/guia-frasco/')[1])).toMatchObject({ thc: 0.9, cbd: 10 })
  expect(r.linea).toBe('THC 0.9 % : CBD 10 % (9 : 100 mg/ml)')
  expect(r.proporcion).toBe('1:11 THC:CBD · CBD dominante')
  expect(r.whatsapp.startsWith('https://wa.me/?text=')).toBe(true)
  expect(decodeURIComponent(r.whatsapp)).toContain(r.url)
})
it('una vigencia que no está en la lista pasa a 90 días', async () => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', 'secreto-de-prueba-con-mas-de-32-caracteres')
  const antes = Date.now()
  const r = await crearEnlaceGuia(null, fd({ thc: '1', cbd: '1', dias: '7' }))
  if (!r.ok) throw new Error(r.error)
  const g = verificarGuia(r.url.split('/guia-frasco/')[1])!
  // Vence al final del día 90 en Lima (UTC-5).
  const diaLima = (ms: number) => new Date(ms).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
  expect(diaLima(g.exp * 1000)).toBe(diaLima(antes + 90 * 86_400_000))
  expect(diaLima(g.exp * 1000 + 1000)).not.toBe(diaLima(g.exp * 1000))
})
it('sin secreto avisa en vez de romperse', async () => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', '')
  expect(await crearEnlaceGuia(null, fd({ thc: '1', cbd: '1', dias: '90' }))).toEqual({ ok: false, error: 'Falta configurar FRASCO_GUIDE_SECRET en Vercel, con al menos 32 caracteres.' })
})
it('porcentajes que suman más de 100', async () => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', 'secreto-de-prueba-con-mas-de-32-caracteres')
  expect(await crearEnlaceGuia(null, fd({ thc: '60', cbd: '60', dias: '90' }))).toEqual({ ok: false, error: 'Revisa los porcentajes: entre 0 y 100, al menos uno mayor que 0 y que no sumen más de 100.' })
})

it('acepta el signo % que se escribe junto al número', async () => {
  vi.stubEnv('FRASCO_GUIDE_SECRET', 'secreto-de-prueba-con-mas-de-32-caracteres')
  const r = await crearEnlaceGuia(null, fd({ thc: '0,9 %', cbd: '10%', dias: '90' }))
  if (!r.ok) throw new Error(r.error)
  expect(r.linea).toBe('THC 0.9 % : CBD 10 % (9 : 100 mg/ml)')
})
