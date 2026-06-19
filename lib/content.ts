export const MEMBER_CONTENT_BUCKET = 'member-content'

export type ContentFileKind = 'image' | 'pdf'

const IMAGE_MIMES = ['image/png', 'image/jpeg']
const PDF_MIME = 'application/pdf'
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_PDF_BYTES = 10 * 1024 * 1024

export interface ContentFileValidation {
  ok: boolean
  fileKind?: ContentFileKind
  error?: string
}

export function validateContentFile(input: { mimeType: string; size: number }): ContentFileValidation {
  const { mimeType, size } = input
  if (IMAGE_MIMES.includes(mimeType)) {
    if (size > MAX_IMAGE_BYTES) return { ok: false, error: 'La imagen supera el máximo de 2 MB.' }
    return { ok: true, fileKind: 'image' }
  }
  if (mimeType === PDF_MIME) {
    if (size > MAX_PDF_BYTES) return { ok: false, error: 'El PDF supera el máximo de 10 MB.' }
    return { ok: true, fileKind: 'pdf' }
  }
  return { ok: false, error: 'Formato no permitido. Usa PNG, JPG o PDF.' }
}

export function buildStoragePath(contentId: string, filename: string): string {
  const safe = filename
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quitar acentos
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `content/${contentId}/${safe}`
}
