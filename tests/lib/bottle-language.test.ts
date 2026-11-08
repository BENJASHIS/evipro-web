// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({locale:vi.fn(),access:vi.fn()}))
vi.mock('@/lib/locale-server',()=>({getLocale:mocks.locale}))
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'u'}}})}})}))
vi.mock('@/lib/member-access',async(original)=>({...await original<typeof import('@/lib/member-access')>(),getMemberAccess:mocks.access}))
import {GET} from '@/app/miembros/contenido/explora-cbd-thc/visor/[...asset]/route'
const request=(file:string)=>GET(new Request(`http://localhost/${file}`),{params:Promise.resolve({asset:[file]})})
beforeEach(()=>{mocks.locale.mockResolvedValue('en');mocks.access.mockResolvedValue({hasActiveMembership:true,adminPreview:false})})
it('selects English HTML and packaged English controls from the cookie',async()=>{
 const response=await request('index.html'); const html=await response.text()
 expect(html).toContain('lang="en"');expect(html).toContain('How to explore');expect(html).toContain('app-en.js')
 expect(response.headers.get('content-security-policy')).toContain("default-src 'none'")
 expect(await (await request('learning-en.js')).text()).toContain('Molecular detective')
})
it('direct English HTML cannot bypass free CBD restrictions',async()=>{
 mocks.access.mockResolvedValue({hasActiveMembership:false,adminPreview:false})
 for(const file of ['index.html','index-en.html']){
  const html=await (await request(file)).text()
  expect(html).toContain('data-cbd-only="true"');expect(html).not.toContain('assets/thc');expect(html).not.toContain('id="composition-controls"')
 }
})
it('keeps Spanish when selected',async()=>{
 mocks.locale.mockResolvedValue('es');expect(await (await request('index.html')).text()).toContain('Cómo explorar')
})
