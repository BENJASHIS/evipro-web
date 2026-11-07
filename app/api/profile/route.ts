import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { checkRateLimitForKey, rateLimitResponse } from '@/lib/rate-limit'

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' }

async function currentUser(req: NextRequest) {
  const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (bearer) {
    const { data: { user } } = await createServiceClient().auth.getUser(bearer)
    if (user) return user
  }
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest) {
  const user = await currentUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const { data, error } = await createServiceClient().from('profiles')
    .select('full_name').eq('id', user.id).maybeSingle()
  if (error) return NextResponse.json({ error: 'No se pudo cargar el perfil.' }, { status: 500 })
  const googleName = user.user_metadata?.full_name ?? user.user_metadata?.name
  return NextResponse.json({
    full_name: data?.full_name ?? (typeof googleName === 'string' ? googleName.slice(0, 120) : ''),
    email: user.email ?? '',
  }, { headers: PRIVATE_HEADERS })
}

export async function PUT(req: NextRequest) {
  const user = await currentUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const limit = checkRateLimitForKey(user.id, { namespace: 'api:profile', limit: 20, windowMs: 60_000 })
  if (!limit.ok) return rateLimitResponse(limit)
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)
    || !('full_name' in body) || typeof body.full_name !== 'string' || body.full_name.length > 120) {
    return NextResponse.json({ error: 'Nombre inválido.' }, { status: 400 })
  }
  // El perfil básico solo modifica el nombre; conserva los datos de servicios ya guardados.
  const { data, error } = await createServiceClient().from('profiles')
    .upsert({ id: user.id, full_name: body.full_name.trim() })
    .select('full_name').single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo guardar el perfil.' }, { status: 500 })
  return NextResponse.json({ full_name: data.full_name, email: user.email ?? '' }, { headers: PRIVATE_HEADERS })
}
