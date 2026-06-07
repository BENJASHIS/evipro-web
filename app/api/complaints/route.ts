import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function generateCode(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 90000) + 10000
  return `LR-${year}-${rand}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tipo, full_name, dni, email, phone, servicio, descripcion, pretension } = body

  if (!tipo || !full_name || !dni || !email || !servicio || !descripcion || !pretension) {
    return NextResponse.json({ error: 'Todos los campos obligatorios son requeridos.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const code = generateCode()

  const { error } = await supabase.from('complaints').insert({
    code,
    tipo,
    full_name,
    dni,
    email,
    phone: phone || null,
    servicio,
    descripcion,
    pretension,
  })

  if (error) {
    return NextResponse.json({ error: 'Error al registrar. Intenta de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({ code })
}
