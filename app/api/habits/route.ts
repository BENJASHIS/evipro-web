import { NextRequest, NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'
import { buildHabitAlerts, buildHabitSummary, validateHabitPayload, type HabitLogRecord, type HabitSymptoms, type MedicationStatus } from '@/lib/habits'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { checkRateLimitForKey, rateLimitResponse } from '@/lib/rate-limit'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'

const HABIT_COLUMNS = 'id, version, log_date, sleep_hours, sleep_quality, sleepiness, water_ml, alcohol_units, medication_status, meals_regular, symptoms, created_at, updated_at'

async function requireMember() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Necesitas iniciar sesión.' }, { status: 401 }) }

  const access = await getMemberAccess(supabase, user)
  if (!canUseMemberTools(access) && !isAdminUser(user)) {
    return { error: NextResponse.json({ error: 'Necesitas una membresía activa.' }, { status: 403 }) }
  }

  return { user, adminPreview: access.adminPreview }
}

function numberOrNull(value: unknown): number | null {
  if (value === null || typeof value === 'undefined') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSymptoms(raw: unknown): HabitSymptoms {
  const symptoms = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Partial<Record<keyof HabitSymptoms, unknown>>
    : {}

  return {
    pain: Number(symptoms.pain ?? 0) || 0,
    anxiety: Number(symptoms.anxiety ?? 0) || 0,
    nausea: Number(symptoms.nausea ?? 0) || 0,
    dizziness: Number(symptoms.dizziness ?? 0) || 0,
    appetite: Number(symptoms.appetite ?? 0) || 0,
  }
}

function normalizeLog(row: Record<string, unknown>): HabitLogRecord {
  const medicationStatus = typeof row.medication_status === 'string'
    ? row.medication_status as MedicationStatus
    : 'not_applicable'

  return {
    id: String(row.id),
    version: String(row.version),
    log_date: String(row.log_date),
    sleep_hours: numberOrNull(row.sleep_hours),
    sleep_quality: numberOrNull(row.sleep_quality),
    sleepiness: numberOrNull(row.sleepiness),
    water_ml: numberOrNull(row.water_ml),
    alcohol_units: Number(row.alcohol_units ?? 0) || 0,
    medication_status: medicationStatus,
    meals_regular: typeof row.meals_regular === 'boolean' ? row.meals_regular : null,
    symptoms: normalizeSymptoms(row.symptoms),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireMember()
  if (auth.error) return auth.error

  const requestedLimit = Number(req.nextUrl.searchParams.get('limit') ?? 14)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 30)
    : 14

  const { data, error } = await createServiceClient()
    .from('habit_logs')
    .select(HABIT_COLUMNS)
    .eq('user_id', auth.user.id)
    .order('log_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[habits] select fallido:', error.message)
    return NextResponse.json({ error: 'No se pudo cargar la bitácora.' }, { status: 500 })
  }

  const logs = (data ?? []).map(row => normalizeLog(row as Record<string, unknown>))
  return NextResponse.json({
    logs,
    summary: buildHabitSummary(logs),
    adminPreview: auth.adminPreview,
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireMember()
  if (auth.error) return auth.error

  const rate = checkRateLimitForKey(auth.user.id, {
    namespace: 'habit_logs_write',
    limit: 40,
    windowMs: 10 * 60 * 1000,
  })
  if (!rate.ok) return rateLimitResponse(rate)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const valid = validateHabitPayload(body)
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

  const now = new Date().toISOString()
  const { data, error } = await createServiceClient()
    .from('habit_logs')
    .upsert({
      user_id: auth.user.id,
      ...valid.data,
      updated_at: now,
    }, { onConflict: 'user_id,log_date' })
    .select(HABIT_COLUMNS)
    .single()

  if (error || !data) {
    console.error('[habits] upsert fallido:', error?.message)
    return NextResponse.json({ error: 'No se pudo guardar la bitácora.' }, { status: 500 })
  }

  const log = normalizeLog(data as Record<string, unknown>)
  return NextResponse.json({
    log,
    alerts: buildHabitAlerts(log),
  })
}
