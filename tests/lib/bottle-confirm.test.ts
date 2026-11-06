// @vitest-environment node
import { expect, it, vi } from 'vitest'
const exchange = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase-server', () => ({createServerSupabaseClient: async () => ({auth:{exchangeCodeForSession:exchange}})}))
import { GET } from '@/app/auth/confirm/route'
import { BOTTLE_PATH } from '@/lib/member-return'
it('confirma y vuelve al visor; un destino externo se descarta',async()=>{
  exchange.mockResolvedValue({error:null})
  for(const [next,expected] of [[BOTTLE_PATH,BOTTLE_PATH],['https://otro.example','/miembros']]) {
    const result=await GET(new Request(`https://www.evipro.pe/auth/confirm?code=test&next=${encodeURIComponent(next)}`))
    expect(result.headers.get('location')).toBe(`https://www.evipro.pe${expected}`)
  }
})
it('sin código o con código inválido vuelve al login del visor',async()=>{
  exchange.mockResolvedValue({error:new Error('invalid')})
  for(const suffix of ['', '&code=invalid']) {
    const result=await GET(new Request(`https://www.evipro.pe/auth/confirm?next=${encodeURIComponent(BOTTLE_PATH)}${suffix}`))
    const url=new URL(result.headers.get('location')!)
    expect(url.pathname).toBe('/login')
    expect(url.searchParams.get('next')).toBe(BOTTLE_PATH)
  }
})
