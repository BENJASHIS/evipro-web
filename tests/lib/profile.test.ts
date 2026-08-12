import { beforeEach, describe, expect, it } from 'vitest'
import {
  decryptDocument,
  encryptDocument,
  isEncryptedDocument,
  maskDocument,
  toPublicProfile,
  validateProfilePayload,
} from '@/lib/profile'

beforeEach(() => {
  process.env.PROFILE_ENCRYPTION_KEY = 'perfil-test-secret'
})

describe('documentos de perfil', () => {
  it('cifra y descifra el documento sin guardar el valor literal', () => {
    const encrypted = encryptDocument('12345678')

    expect(isEncryptedDocument(encrypted)).toBe(true)
    expect(encrypted).not.toContain('12345678')
    expect(decryptDocument(encrypted)).toBe('12345678')
  })

  it('mantiene compatibilidad de lectura con documentos antiguos en texto plano', () => {
    expect(isEncryptedDocument('12345678')).toBe(false)
    expect(decryptDocument('12345678')).toBe('12345678')
  })

  it('solo expone una pista enmascarada en el perfil público', () => {
    const profile = toPublicProfile({
      full_name: 'Ana Quispe',
      phone: '987654321',
      city: 'Cusco',
      doc_type: 'dni',
      dni_encrypted: encryptDocument('12345678'),
      country_origin: null,
    })

    expect(profile.doc_number_hint).toBe(maskDocument('12345678'))
    expect(profile.has_doc_number).toBe(true)
    expect(JSON.stringify(profile)).not.toContain('12345678')
  })
})

describe('validateProfilePayload', () => {
  it('acepta DNI válido y normaliza espacios', () => {
    const result = validateProfilePayload({
      full_name: '  Ana Quispe  ',
      phone: ' 987654321 ',
      city: ' Cusco ',
      doc_type: 'dni',
      doc_number: '12345678',
      country_origin: 'Perú',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.full_name).toBe('Ana Quispe')
      expect(result.data.country_origin).toBeNull()
    }
  })

  it('rechaza DNI que no tenga 8 dígitos', () => {
    const result = validateProfilePayload({
      full_name: 'Ana Quispe',
      doc_type: 'dni',
      doc_number: '1234567',
    })

    expect(result.ok).toBe(false)
  })

  it('exige país de origen para documento extranjero', () => {
    const result = validateProfilePayload({
      full_name: 'Juan Perez',
      doc_type: 'pasaporte',
      doc_number: 'AB123456',
    })

    expect(result.ok).toBe(false)
  })

  it('permite conservar el documento existente sin volver a enviarlo', () => {
    const result = validateProfilePayload(
      { full_name: 'Ana Quispe', doc_type: 'dni' },
      { existingHasDocument: true, existingDocType: 'dni' },
    )

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.doc_number).toBeNull()
  })

  it('si cambia el tipo de documento pide un nuevo número', () => {
    const result = validateProfilePayload(
      { full_name: 'Ana Quispe', doc_type: 'pasaporte', country_origin: 'Chile' },
      { existingHasDocument: true, existingDocType: 'dni' },
    )

    expect(result.ok).toBe(false)
  })
})
