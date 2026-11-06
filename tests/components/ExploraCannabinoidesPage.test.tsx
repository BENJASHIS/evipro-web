import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({user:vi.fn(),access:vi.fn()}))
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:mocks.user}})}))
vi.mock('@/lib/member-access',async(importOriginal)=>({...await importOriginal<typeof import('@/lib/member-access')>(),getMemberAccess:mocks.access}))
vi.mock('next/navigation',()=>({redirect:(url:string)=>{throw new Error(`redirect:${url}`)}}))
import Page from '@/app/miembros/contenido/explora-cbd-thc/page'
afterEach(cleanup)
it('exige iniciar sesión',async()=>{
  mocks.user.mockResolvedValue({data:{user:null}})
  await expect(Page()).rejects.toThrow('redirect:/login')
})
it('no monta el visor si falta membresía',async()=>{
  mocks.user.mockResolvedValue({data:{user:{id:'u'}}})
  mocks.access.mockResolvedValue({hasActiveMembership:false,adminPreview:false})
  render(await Page())
  expect(screen.queryByTitle('Explora CBD y THC: visor didáctico')).toBeNull()
  expect(screen.getByRole('link',{name:'Ver membresías'})).toBeInTheDocument()
})
it.each([{hasActiveMembership:true,adminPreview:false},{hasActiveMembership:false,adminPreview:true}])('integra el visor con acceso permitido %j',async(access)=>{
  mocks.user.mockResolvedValue({data:{user:{id:'u'}}})
  mocks.access.mockResolvedValue(access)
  render(await Page())
  expect(screen.getByTitle('Explora CBD y THC: visor didáctico')).toHaveAttribute('src','/miembros/contenido/explora-cbd-thc/visor/index.html')
  expect(screen.getByRole('link',{name:'Ir a la calculadora cannabinoide →'})).toBeInTheDocument()
})
