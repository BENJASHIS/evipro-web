'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { parseRespuestas, evaluate, REGEN_VERSION, type Resultado } from '@/lib/regen'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { checkRateLimitForKey } from '@/lib/rate-limit'

type SaveResult = { ok: true; resultado: Resultado; saved: boolean } | { ok: false; error: string }

export async function saveRegenEvaluacion(raw: unknown): Promise<SaveResult> {
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }
  const access = await getMemberAccess(authClient, user)
  if (!canUseMemberTools(access)) {
    return { ok: false, error: 'Necesitas una membresía activa para guardar esta evaluación.' }
  }
  const rate = checkRateLimitForKey(user.id, { namespace: 'regen_write', limit: 20, windowMs: 10 * 60 * 1000 })
  if (!rate.ok) return { ok: false, error: 'Has enviado varias evaluaciones. Espera unos minutos antes de repetir.' }

  // Frontera de confianza: validar y RE-CALCULAR en el servidor. Nunca puntuar con
  // números que manda el cliente.
  const parsed = parseRespuestas(raw)
  if (!parsed.ok) return { ok: false, error: parsed.error }
  const resultado = evaluate(parsed.respuestas)

  // Persistir el historial es best-effort y secundario: la red de seguridad
  // (mostrar el resultado, incluida la pantalla de red flags) nunca puede
  // depender de que el insert en Supabase tenga éxito.
  try {
    const { error } = await createServiceClient().from('regen_evaluaciones').insert({
      user_id: user.id, version: REGEN_VERSION, scores: resultado.scores,
      flags: resultado.supportFlags, safety_triggered: resultado.safetyTriggered,
    })
    if (error) return { ok: true, resultado, saved: false }
    revalidatePath('/miembros/regen')
    return { ok: true, resultado, saved: true }
  } catch {
    // La orientación de apoyo sigue disponible aunque falle el historial.
    return { ok: true, resultado, saved: false }
  }
}
