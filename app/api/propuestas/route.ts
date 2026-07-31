import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { validarPropuesta } from '@/lib/propuestas'

export async function POST(req: Request) {
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
