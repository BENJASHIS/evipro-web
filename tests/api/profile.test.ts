// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const m = vi.hoisted(() => ({ user: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn(), single: vi.fn() }))
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: m.user } }),
  createServiceClient: () => ({ from: () => ({ select: m.select, upsert: m.upsert }) }),
}))
import { GET, PUT } from '@/app/api/profile/route'
import { resetRateLimitForTests } from '@/lib/rate-limit'
beforeEach(() => {
  vi.clearAllMocks(); resetRateLimitForTests()
  m.user.mockResolvedValue({ data: { user: { id: 'u', email: 'cuenta@example.com', user_metadata: { full_name: 'Nombre Google' } } } })
  m.select.mockReturnValue({ eq: m.eq, single: m.single })
  m.eq.mockReturnValue({ maybeSingle: m.maybeSingle })
  m.maybeSingle.mockResolvedValue({ data: null, error: null })
  m.upsert.mockReturnValue({ select: m.select })
  m.single.mockResolvedValue({ data: { full_name: 'Nombre' }, error: null })
})
it('sin perfil devuelve nombre Google y correo sin pedir documentos', async () => {
  const r = await GET(new NextRequest('https://example.com/api/profile'))
  expect(r.status).toBe(200)
  expect(await r.json()).toEqual({ full_name: 'Nombre Google', email: 'cuenta@example.com' })
  expect(m.select).toHaveBeenCalledWith('full_name')
})
it('guardar nombre no escribe ni borra documento, teléfono o ciudad existentes', async () => {
  const r = await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify({ full_name: ' Nombre ', doc_number: '12345678', phone: '999999999' }) }))
  expect(r.status).toBe(200)
  expect(m.upsert).toHaveBeenCalledWith({ id: 'u', full_name: 'Nombre' })
  expect(await r.json()).toEqual({ full_name: 'Nombre', email: 'cuenta@example.com' })
})
it.each(['', '   '])('el nombre es opcional: %j', async full_name => {
  const r = await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify({ full_name }) }))
  expect(r.status).toBe(200)
  expect(m.upsert).toHaveBeenCalledWith({ id: 'u', full_name: '' })
})
it.each([null, [], { full_name: 7 }, { full_name: 'x'.repeat(121) }])('rechaza entrada inválida %j', async body => {
  expect((await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify(body) }))).status).toBe(400)
  expect(m.upsert).not.toHaveBeenCalled()
})
it('sin sesión no expone el perfil', async () => {
  m.user.mockResolvedValue({ data: { user: null } })
  expect((await GET(new NextRequest('https://example.com/api/profile'))).status).toBe(401)
})
it('un fallo de lectura no parece un perfil vacío', async () => {
  m.maybeSingle.mockResolvedValue({ data: null, error: { message: 'privado' } })
  const r = await GET(new NextRequest('https://example.com/api/profile'))
  expect(r.status).toBe(500)
  expect(JSON.stringify(await r.json())).not.toContain('privado')
})
it('un perfil existente solo devuelve nombre y correo, sin sus datos de servicios', async () => {
  m.maybeSingle.mockResolvedValue({ data: { full_name: 'Nombre guardado' }, error: null })
  const r = await GET(new NextRequest('https://example.com/api/profile'))
  expect(await r.json()).toEqual({ full_name: 'Nombre guardado', email: 'cuenta@example.com' })
  expect(r.headers.get('cache-control')).toBe('private, no-store')
})
it('un error de guardado devuelve fallo sin divulgar detalles', async () => {
  m.single.mockResolvedValue({ data: null, error: { message: 'privado' } })
  const r = await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify({ full_name: '' }) }))
  expect(r.status).toBe(500)
  expect(JSON.stringify(await r.json())).not.toContain('privado')
})
it('limita escrituras del perfil autenticado', async () => {
  for (let i = 0; i < 20; i++) await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify({ full_name: '' }) }))
  expect((await PUT(new NextRequest('https://example.com/api/profile', { method: 'PUT', body: JSON.stringify({ full_name: '' }) }))).status).toBe(429)
  expect(m.upsert).toHaveBeenCalledTimes(20)
})
