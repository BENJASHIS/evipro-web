import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { validarSolicitudFarmacia } from '@/lib/farmacia'

/** Crea una solicitud de coordinación de farmacia.
 *
 *  Antes esto lo escribía el navegador directo en Supabase, y lo que escribe
 *  son notas de la receta: dato médico. AGENTS.md lo prohíbe. Además el permiso
 *  se comprueba aquí, en el servidor, y **por la casilla del plan**
 *  (`includes_pharmacy_coord`), no por el nombre del plan: los nombres cambian
 *  y el candado se queda viejo, que es justo lo que había pasado. */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const validada = validarSolicitudFarmacia(body)
  if (!validada.ok) {
    return NextResponse.json({ error: validada.error }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Necesitas iniciar sesión.' }, { status: 401 })
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, membership_plans(includes_pharmacy_coord)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  const plan = Array.isArray(sub?.membership_plans) ? sub?.membership_plans[0] : sub?.membership_plans
  if (!sub || !plan?.includes_pharmacy_coord) {
    return NextResponse.json(
      { error: 'Tu membresía no incluye coordinación de farmacia.' },
      { status: 403 },
    )
  }

  const { error } = await createServiceClient()
    .from('pharmacy_requests')
    .insert({
      user_id: user.id,
      subscription_id: sub.id,
      ...validada.data,
    })

  if (error) {
    console.error('[farmacia] insert fallido:', error.message)
    return NextResponse.json(
      { error: 'No se pudo registrar la solicitud. Intenta de nuevo.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
