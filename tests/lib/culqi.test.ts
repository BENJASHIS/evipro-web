import { describe, it, expect } from 'vitest'
import { verifyWebhookSignature, buildCulqiHeaders } from '../../lib/culqi'

describe('verifyWebhookSignature', () => {
  it('retorna true con firma válida', async () => {
    const secret = 'test_webhook_secret'
    const body = JSON.stringify({ type: 'cargo.exitoso', data: { id: 'chr_123' } })
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const hexSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

    const result = await verifyWebhookSignature(body, hexSig, secret)
    expect(result).toBe(true)
  })

  it('retorna false con firma inválida', async () => {
    const result = await verifyWebhookSignature('body', 'firma_falsa', 'secret')
    expect(result).toBe(false)
  })
})

describe('buildCulqiHeaders', () => {
  it('incluye Authorization y Content-Type', () => {
    const headers = buildCulqiHeaders('sk_test_abc')
    expect(headers['Authorization']).toBe('Bearer sk_test_abc')
    expect(headers['Content-Type']).toBe('application/json')
  })
})
