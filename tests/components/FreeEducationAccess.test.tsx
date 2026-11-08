vi.mock('@/lib/locale-server',()=>({getLocale:async()=> 'es'}))
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({from:vi.fn(),service:vi.fn()}))
vi.mock('@/lib/supabase-server',()=>({
  createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'free'}}})},from:mocks.from}),
  createServiceClient:mocks.service,
}))
vi.mock('@/lib/member-access',async(original)=>({...await original<typeof import('@/lib/member-access')>(),getMemberAccess:async()=>({hasActiveMembership:false,adminPreview:false})}))
import Library from '@/app/miembros/contenido/page'
import Calculator from '@/app/miembros/herramientas/calculadora-cannabinoide/page'
afterEach(cleanup)
it('una cuenta gratuita descubre CBD sin consultar ni firmar contenido de pago',async()=>{
  render(await Library())
  expect(screen.getByRole('link',{name:/Explora CBD · acceso gratuito/})).toBeInTheDocument()
  expect(mocks.from).not.toHaveBeenCalled()
  expect(mocks.service).not.toHaveBeenCalled()
})
it('la misma cuenta no recibe la calculadora',async()=>{
  render(await Calculator())
  expect(screen.getByText(/La calculadora está disponible para miembros/)).toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/aceite/i})).toBeNull()
})
