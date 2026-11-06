// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'
import { GET } from '@/app/api/auth/providers/route'
afterEach(()=>vi.unstubAllGlobals())
it('expone solo si Google está habilitado, sin devolver otros ajustes',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({external:{google:true,email:true},other:'no divulgar'})}))
  const result=await GET()
  expect(await result.json()).toEqual({google:true})
  expect(result.headers.get('cache-control')).toContain('max-age=60')
})
it.each([false,undefined])('Google deshabilitado o ausente: %s',async(google)=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({external:{google}})}))
  expect(await (await GET()).json()).toEqual({google:false})
})
it('un fallo del proveedor no habilita Google ni filtra el error',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('sensitive detail')))
  const result=await GET()
  expect(result.status).toBe(503)
  expect(await result.json()).toEqual({google:false})
})
