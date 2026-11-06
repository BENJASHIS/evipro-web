// @vitest-environment node
import { expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks=vi.hoisted(()=>({user:vi.fn()}))
vi.mock('@supabase/ssr',()=>({createServerClient:()=>({auth:{getUser:mocks.user}})}))
import { proxy } from '@/proxy'
import { BOTTLE_PATH } from '@/lib/member-return'
it('un enlace privado conserva el destino de biblioteca al pedir login',async()=>{
  mocks.user.mockResolvedValue({data:{user:null}})
  for(const pathname of [BOTTLE_PATH,`${BOTTLE_PATH}/visor/app.js`]) {
    const response=await proxy(new NextRequest(`http://localhost${pathname}`))
    const target=new URL(response.headers.get('location')!)
    expect(target.pathname).toBe('/login')
    expect(target.searchParams.get('next')).toBe(BOTTLE_PATH)
  }
})
it('una sesión existente vuelve al visor',async()=>{
  mocks.user.mockResolvedValue({data:{user:{id:'member'}}})
  const response=await proxy(new NextRequest(`http://localhost/login?next=${encodeURIComponent(BOTTLE_PATH)}`))
  expect(new URL(response.headers.get('location')!).pathname).toBe(BOTTLE_PATH)
})
it('no redirige una sesión a un dominio externo',async()=>{
  mocks.user.mockResolvedValue({data:{user:{id:'member'}}})
  const response=await proxy(new NextRequest('http://localhost/login?next=https://otro.example'))
  expect(response.headers.get('location')).toBe('http://localhost/miembros')
})
