// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(()=>({ user:vi.fn(), access:vi.fn() }))
vi.mock('@/lib/supabase-server',()=>({createServerSupabaseClient:async()=>({auth:{getUser:mocks.user}})}))
vi.mock('@/lib/member-access',async(importOriginal)=>({ ...await importOriginal<typeof import('@/lib/member-access')>(),getMemberAccess:mocks.access }))
import { GET } from '@/app/miembros/contenido/explora-cbd-thc/visor/[...asset]/route'
const request = (asset:string[],search='')=>GET(new Request(`http://localhost/miembros/contenido/explora-cbd-thc/visor/${asset.join('/')}${search}`),{params:Promise.resolve({asset})})
beforeEach(()=>{
  mocks.user.mockResolvedValue({data:{user:{id:'member'}}})
  mocks.access.mockResolvedValue({hasActiveMembership:true,adminPreview:false})
})
describe('archivos privados del visor',()=>{
  it('no entrega HTML ni JS al anónimo',async()=>{
    mocks.user.mockResolvedValue({data:{user:null}})
    for(const file of ['index.html','app.js','learning.js'])expect((await request([file])).status).toBe(401)
  })
  it('no entrega modelos a una cuenta sin membresía',async()=>{
    mocks.access.mockResolvedValue({hasActiveMembership:false,adminPreview:false})
    expect((await request(['assets','thc.json'])).status).toBe(403)
  })
  it('sirve HTML con políticas privadas y solo scripts de la propia web',async()=>{
    const result = await request(['index.html'])
    expect(result.status).toBe(200)
    expect(result.headers.get('cache-control')).toBe('private, no-store')
    expect(result.headers.get('content-security-policy')).toContain("frame-ancestors 'self'")
    expect(result.headers.get('content-security-policy')).toContain("'sha256-")
    expect(result.headers.get('x-content-type-options')).toBe('nosniff')
    expect(await result.text()).toContain('CBD y THC')
  })
  it('permite la vista previa admin',async()=>{
    mocks.access.mockResolvedValue({hasActiveMembership:false,adminPreview:true})
    expect((await request(['assets','cbd-reference.svg'])).status).toBe(200)
  })
  it('rechaza archivos fuera de la lista y traversal',async()=>{
    for(const file of [['..','.env'],['assets','..','index.html'],['manifest.json'],['assets','other.json']])expect((await request(file)).status).toBe(404)
  })
})

it('todos los recursos del paquete coinciden con su manifiesto y se sirven protegidos',async()=>{
  const { default: manifest } = await import('@/private/frasco/manifest.json')
  const { createHash } = await import('node:crypto')
  for(const [file,entry] of Object.entries(manifest.files)) {
    const response = await request(file.split('/'))
    expect(response.status,file).toBe(200)
    expect(response.headers.get('content-type')).toBe(entry.type)
    expect(createHash('sha256').update(new Uint8Array(await response.arrayBuffer())).digest('hex')).toBe(entry.sha256)
  }
  const html = await (await request(['index.html'])).text()
  const importMap = html.match(/<script type="importmap">([^<]*)<\/script>/)![1]
  expect(createHash('sha256').update(importMap).digest('base64')).toBe(manifest.importMapHash)
})

it('una cuenta gratuita recibe solo CBD, aunque pida el modo completo por URL',async()=>{
  mocks.access.mockResolvedValue({hasActiveMembership:false,adminPreview:false})
  const html=await (await request(['index.html'],'?mode=full&cbdOnly=false')).text()
  expect(html).toContain('data-cbd-only="true"')
  expect(html).toContain('id="start-game"')
  expect((await request(['learning.js'])).status).toBe(200)
  expect(html).not.toContain('data-part="thc"')
  expect(html).not.toContain('assets/thc')
  expect(html).not.toContain('id="composition-controls"')
  expect((await request(['assets','cbd.json'])).status).toBe(200)
  expect((await request(['assets','cbd-reference.svg'])).status).toBe(200)
  for(const key of [['assets','thc.json'],['assets','thc-reference.svg']])expect((await request(key)).status).toBe(403)
})
