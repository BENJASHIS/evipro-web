// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import manifest from '@/private/frasco/manifest.json'
import { NOINDEX_ROUTES } from '@/lib/seo'
vi.mock('@/lib/locale-server',()=>({getLocale:async()=> 'es'}))
import { GET } from '@/app/frasco/visor/[...asset]/route'
const request = (asset:string[])=>GET(new Request(`http://localhost/frasco/visor/${asset.join('/')}`),{params:Promise.resolve({asset})})

describe('visor público del frasco',()=>{
  it('sirve el visor completo sin sesión',async()=>{
    const result = await request(['index.html'])
    expect(result.status).toBe(200)
    expect(result.headers.get('cache-control')).toBe('private, no-store')
    expect(result.headers.get('content-security-policy')).toContain("frame-ancestors 'self'")
    expect(result.headers.get('content-security-policy')).toContain("'sha256-")
    expect(result.headers.get('x-content-type-options')).toBe('nosniff')
    const html = await result.text()
    expect(html).toContain('data-part="thc"')
    expect(html).toContain('id="composition-controls"')
    expect(html).not.toContain('data-cbd-only')
    for(const key of [['assets','thc.json'],['assets','thc-reference.svg'],['assets','cbd.json']])expect((await request(key)).status,key.join('/')).toBe(200)
  })
  it('ya no hay variante solo CBD',()=>{
    expect(Object.keys(manifest.files).filter(file=>file.startsWith('cbd'))).toEqual([])
  })
  it('rechaza archivos fuera de la lista y traversal',async()=>{
    for(const file of [['..','.env'],['assets','..','index.html'],['manifest.json'],['assets','other.json']])expect((await request(file)).status).toBe(404)
  })
  it('los enlaces viejos del visor de miembros llevan al público y /frasco no se indexa',async()=>{
    const { default: config } = await import('@/next.config')
    expect(await config.redirects!()).toContainEqual({ source:'/miembros/contenido/explora-cbd-thc/visor/:path*', destination:'/frasco/visor/:path*', permanent:false })
    expect(NOINDEX_ROUTES).toContain('/frasco/:path*')
  })
})

it('todos los recursos del paquete coinciden con su manifiesto',async()=>{
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

it('sirve los dibujos originales de Wikipedia fijados por versión',async()=>{
  const { createHash } = await import('node:crypto')
  for(const [name,hash] of Object.entries({
    cbd:'3b2d0c811585279139f41b2ccda7866d36511ec480e7a8e6c6026aa3e25fc4ef',
    thc:'131f76d470e08be8bddbf0cf2c657930fedac8da014d6d6ceb43c7bd7cd4fbe8',
  })) {
    const response=await request(['assets',`${name}-reference.svg`])
    expect(createHash('sha256').update(new Uint8Array(await response.arrayBuffer())).digest('hex')).toBe(hash)
  }
  const html=await (await request(['index.html'])).text()
  expect(html).toContain('File:Cannabidiol_Structural_formula_V1.svg')
  expect(html).toContain('File:Tetrahydrocannabinol.svg')
})
