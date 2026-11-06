// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const oauth=vi.hoisted(()=>vi.fn())
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{signInWithOAuth:oauth}})}))
import { GET } from '@/app/auth/google/route'
import { resetRateLimitForTests } from '@/lib/rate-limit'
import { BOTTLE_PATH } from '@/lib/member-return'
beforeEach(()=>{resetRateLimitForTests();oauth.mockReset()})
it('inicia OAuth PKCE con callback propio y retorno permitido',async()=>{
  oauth.mockResolvedValue({data:{url:'https://project.supabase.co/auth/v1/authorize?provider=google'},error:null})
  const response=await GET(new Request(`https://www.evipro.pe/auth/google?next=${encodeURIComponent(BOTTLE_PATH)}`))
  const options=oauth.mock.calls[0][0]
  expect(options.provider).toBe('google')
  expect(options.options.skipBrowserRedirect).toBe(true)
  expect(options.options.redirectTo).toBe(`https://www.evipro.pe/auth/confirm?next=${encodeURIComponent(BOTTLE_PATH)}`)
  expect(response.headers.get('location')).toMatch(/^https:\/\/project.supabase.co/)
  expect(response.headers.get('cache-control')).toBe('private, no-store')
})
it('descarta retornos externos y ofrece correo cuando Google falla',async()=>{
  oauth.mockResolvedValue({data:{url:null},error:{message:'provider not enabled'}})
  const result=await GET(new Request('https://www.evipro.pe/auth/google?next=https://malicioso.example'))
  const target=new URL(result.headers.get('location')!)
  expect(target.pathname).toBe('/login')
  expect(target.searchParams.get('next')).toBe('/miembros')
  expect(target.searchParams.get('auth_error')).toBe('google')
})
it('limita intentos antes de llamar a Supabase',async()=>{
  oauth.mockResolvedValue({data:{url:null},error:{message:'unavailable'}})
  for(let i=0;i<10;i++) await GET(new Request('https://www.evipro.pe/auth/google'))
  expect((await GET(new Request('https://www.evipro.pe/auth/google'))).status).toBe(429)
  expect(oauth).toHaveBeenCalledTimes(10)
})
