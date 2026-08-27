import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { validarPropuesta } from '@/lib/propuestas'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { readTurnstileToken, verifyTurnstileToken } from '@/lib/turnstile'

export async function POST(req: Request) {
  const limit = checkRateLimit(req, { namespace: 'api:propuestas', limit: 12, windowMs: 10 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  // Trampa para bots: un humano nunca ve ni llena este campo. Se responde 200
  // a propósito, para que el bot no aprenda que fue detectado.
  const trampa = (body as Record<string, unknown> | null)?.website
  if (typeof trampa === 'string' && trampa.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const turnstile = await verifyTurnstileToken(readTurnstileToken(body), req)
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 })
  }

  const validada = validarPropuesta(body)
  if (!validada.ok) {
    return NextResponse.json({ error: validada.error }, { status: 400 })
  }

  // Se inserta solo lo validado: el estado lo pone el default de la tabla,
  // nunca el cliente.
  const { error } = await createServiceClient()
    .from('partnership_proposals')
    .insert(validada.data)

  if (error) {
    console.error('[propuestas] insert fallido:', error.message)
    return NextResponse.json(
      { error: 'No se pudo registrar la propuesta. Intenta de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
