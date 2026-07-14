'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, createServerSupabaseClient } from '@/lib/supabase-server'
import { parseRespuestas, evaluate, REGEN_VERSION, type Resultado } from '@/lib/regen'

type SaveResult = { ok: true; resultado: Resultado } | { ok: false; error: string }

export async function saveRegenEvaluacion(raw: unknown): Promise<SaveResult> {
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  // Frontera de confianza: validar y RE-CALCULAR en el servidor. Nunca puntuar con
  // números que manda el cliente.
  const parsed = parseRespuestas(raw)
  if (!parsed.ok) return { ok: false, error: parsed.error }
  const resultado = evaluate(parsed.respuestas)

  // Persistir el historial es best-effort y secundario: la red de seguridad
  // (mostrar el resultado, incluida la pantalla de red flags) nunca puede
  // depender de que el insert en Supabase tenga éxito.
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('regen_evaluaciones')
    .insert({
      user_id: user.id,
      version: REGEN_VERSION,
      scores: resultado.scores,
      flags: resultado.redFlags,
      safety_triggered: resultado.safetyTriggered,
    })
  if (error) console.error('saveRegenEvaluacion: fallo al guardar historial', error)

  revalidatePath('/miembros/regen')
  return { ok: true, resultado }
}
