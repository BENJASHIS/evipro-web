// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mocks=vi.hoisted(()=>({locale:vi.fn()}))
vi.mock('@/lib/locale-server',()=>({getLocale:mocks.locale}))
import {GET} from '@/app/frasco/visor/[...asset]/route'
const request=(file:string)=>GET(new Request(`http://localhost/frasco/visor/${file}`),{params:Promise.resolve({asset:[file]})})
beforeEach(()=>{mocks.locale.mockResolvedValue('en')})
it('selects English HTML and packaged English controls from the cookie',async()=>{
 const response=await request('index.html'); const html=await response.text()
 expect(html).toContain('lang="en"');expect(html).toContain('How to explore');expect(html).toContain('app-en.js')
 expect(response.headers.get('content-security-policy')).toContain("default-src 'none'")
 expect(await (await request('learning-en.js')).text()).toContain('Molecular detective')
})
it('keeps Spanish when selected',async()=>{
 mocks.locale.mockResolvedValue('es');expect(await (await request('index.html')).text()).toContain('Cómo explorar')
})
