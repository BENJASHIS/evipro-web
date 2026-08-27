import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { validateComplaint } from '@/lib/complaints'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

function generateCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `LR-${year}-${rand}`
}

export async function POST(req: Request) {
  const limit = checkRateLimit(req, { namespace: 'api:complaints', limit: 5, windowMs: 60 * 60 * 1000 })
  if (!limit.ok) return rateLimitResponse(limit)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const trampa = (body as Record<string, unknown> | null)?.website
  if (typeof trampa === 'string' && trampa.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const validada = validateComplaint(body)
  if (!validada.ok) {
    return NextResponse.json({ error: validada.error }, { status: 400 })
  }

  const supabase = createServiceClient()
  const code = generateCode()

  const { error } = await supabase.from('complaints').insert({
    code,
    ...validada.data,
  })

  if (error) {
    return NextResponse.json({ error: 'Error al registrar. Intenta de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
