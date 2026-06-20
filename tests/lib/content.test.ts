import { describe, it, expect } from 'vitest'
import { validateContentFile, buildStoragePath, MEMBER_CONTENT_BUCKET, attachSignedUrls, type ContentRow } from '../../lib/content'

describe('validateContentFile', () => {
  it('acepta PNG bajo el límite', () => {
    expect(validateContentFile({ mimeType: 'image/png', size: 1_000_000 }))
      .toEqual({ ok: true, fileKind: 'image' })
  })
  it('acepta JPG bajo el límite', () => {
    expect(validateContentFile({ mimeType: 'image/jpeg', size: 500_000 }))
      .toEqual({ ok: true, fileKind: 'image' })
  })
  it('rechaza imagen sobre 2 MB', () => {
    const r = validateContentFile({ mimeType: 'image/png', size: 3_000_000 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/2 MB/)
  })
  it('acepta PDF bajo el límite', () => {
    expect(validateContentFile({ mimeType: 'application/pdf', size: 5_000_000 }))
      .toEqual({ ok: true, fileKind: 'pdf' })
  })
  it('rechaza PDF sobre 10 MB', () => {
    const r = validateContentFile({ mimeType: 'application/pdf', size: 11_000_000 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/10 MB/)
  })
  it('rechaza tipo no permitido', () => {
    const r = validateContentFile({ mimeType: 'application/zip', size: 100 })
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/PNG, JPG o PDF/)
  })
})

describe('buildStoragePath', () => {
  it('genera ruta bajo content/{id}/', () => {
    expect(buildStoragePath('abc-123', 'Mi Infografía.png'))
      .toBe('content/abc-123/mi-infografia.png')
  })
  it('normaliza caracteres raros', () => {
    expect(buildStoragePath('id1', '  Guía & Sueño!.pdf '))
      .toBe('content/id1/guia-sueno-.pdf')
  })
})

describe('MEMBER_CONTENT_BUCKET', () => {
  it('es el bucket privado', () => {
    expect(MEMBER_CONTENT_BUCKET).toBe('member-content')
  })
})

describe('attachSignedUrls', () => {
  const base: ContentRow = {
    id: '1', title: 'T', body: null, content_type: 'infographic',
    file_path: null, file_kind: null, category: null, published_at: null,
  }
  it('firma solo filas con file_path', async () => {
    const rows: ContentRow[] = [
      { ...base, id: 'a', file_path: 'content/a/x.png', file_kind: 'image' },
      { ...base, id: 'b', file_path: null },
    ]
    const sign = async (p: string) => `signed://${p}`
    const out = await attachSignedUrls(rows, sign)
    expect(out[0].file_url).toBe('signed://content/a/x.png')
    expect(out[1].file_url).toBeNull()
  })
  it('propaga null si el firmador falla', async () => {
    const rows: ContentRow[] = [{ ...base, file_path: 'content/a/x.png' }]
    const out = await attachSignedUrls(rows, async () => null)
    expect(out[0].file_url).toBeNull()
  })
})
