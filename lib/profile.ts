import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { DocType } from './types'

const DOC_TYPES: DocType[] = ['dni', 'pasaporte', 'carnet_extranjeria', 'cedula_identidad']

const TEXT_LIMITS = {
  full_name: 120,
  phone: 30,
  city: 80,
  country_origin: 80,
  doc_number: 40,
}

export interface StoredProfile {
  full_name: string | null
  phone: string | null
  city: string | null
  doc_type: DocType | null
  dni_encrypted: string | null
  country_origin: string | null
}

export interface PublicProfile {
  full_name: string
  phone: string
  city: string
  doc_type: DocType
  doc_number_hint: string | null
  has_doc_number: boolean
  country_origin: string
}

interface ProfilePayload {
  full_name: string
  phone: string | null
  city: string | null
  doc_type: DocType
  doc_number: string | null
  country_origin: string | null
}

type ValidationResult =
  | { ok: true; data: ProfilePayload }
  | { ok: false; error: string }

function readString(input: Record<string, unknown>, key: keyof typeof TEXT_LIMITS, required: boolean): string | null {
  const value = input[key]
  if (value == null) return required ? '' : null
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return required ? '' : null
  return trimmed.slice(0, TEXT_LIMITS[key])
}

export function validateProfilePayload(
  input: unknown,
  opts: { existingHasDocument?: boolean; existingDocType?: DocType | null } = {},
): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Solicitud inválida.' }
  }

  const obj = input as Record<string, unknown>
  const fullName = readString(obj, 'full_name', true)
  const phone = readString(obj, 'phone', false)
  const city = readString(obj, 'city', false)
  const countryOrigin = readString(obj, 'country_origin', false)
  const docNumber = readString(obj, 'doc_number', false)
  const docTypeRaw = obj.doc_type

  if (!fullName) return { ok: false, error: 'Nombre inválido.' }
  if (phone && !/^[+()\d\s-]{6,30}$/.test(phone)) return { ok: false, error: 'Teléfono inválido.' }
  if (!DOC_TYPES.includes(docTypeRaw as DocType)) return { ok: false, error: 'Tipo de documento inválido.' }

  const docType = docTypeRaw as DocType
  const docTypeChanged = opts.existingDocType != null && opts.existingDocType !== docType
  const needsDocument = !opts.existingHasDocument || docTypeChanged

  if (needsDocument && !docNumber) {
    return { ok: false, error: 'Número de documento requerido.' }
  }

  if (docNumber) {
    if (docType === 'dni' && !/^\d{8}$/.test(docNumber)) {
      return { ok: false, error: 'El DNI debe tener 8 dígitos.' }
    }
    if (docType !== 'dni' && !/^[A-Za-z0-9][A-Za-z0-9 ._-]{3,39}$/.test(docNumber)) {
      return { ok: false, error: 'Número de documento inválido.' }
    }
  }

  if (docType !== 'dni' && !countryOrigin) {
    return { ok: false, error: 'País de origen requerido.' }
  }

  return {
    ok: true,
    data: {
      full_name: fullName,
      phone,
      city,
      doc_type: docType,
      doc_number: docNumber,
      country_origin: docType === 'dni' ? null : countryOrigin,
    },
  }
}

function encryptionKey(): Buffer {
  const secret = process.env.PROFILE_ENCRYPTION_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('PROFILE_ENCRYPTION_KEY no configurado')
  return createHash('sha256').update(secret).digest()
}

export function isEncryptedDocument(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith('v1:')
}

export function encryptDocument(value: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

export function decryptDocument(value: string): string | null {
  if (!isEncryptedDocument(value)) return value
  const [, iv64, tag64, data64] = value.split(':')
  if (!iv64 || !tag64 || !data64) return null
  try {
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv64, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag64, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(data64, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    return null
  }
}

export function maskDocument(value: string): string {
  const clean = value.replace(/\s+/g, '')
  if (!clean) return ''
  const last = clean.slice(-4)
  return `•••• ${last}`
}

export function toPublicProfile(profile: StoredProfile): PublicProfile {
  const doc = profile.dni_encrypted ? decryptDocument(profile.dni_encrypted) : null
  return {
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    city: profile.city ?? '',
    doc_type: profile.doc_type ?? 'dni',
    doc_number_hint: doc ? maskDocument(doc) : null,
    has_doc_number: Boolean(doc),
    country_origin: profile.country_origin ?? '',
  }
}
