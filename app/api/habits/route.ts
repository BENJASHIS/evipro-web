import { NextRequest, NextResponse } from 'next/server'
import { isAdminUser } from '@/lib/auth'
import { buildHabitAlerts, buildHabitSummary, habitDate, habitToday, validateHabitPayload, type HabitLogRecord, type HabitSymptoms, type MedicationStatus } from '@/lib/habits'
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
    pain: numberOrNull(symptoms.pain),
    anxiety: numberOrNull(symptoms.anxiety),
    nausea: numberOrNull(symptoms.nausea),
    dizziness: numberOrNull(symptoms.dizziness),
    appetite: numberOrNull(symptoms.appetite),
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
    alcohol_units: numberOrNull(row.alcohol_units),
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

  const now = new Date()
  const today = habitToday(now)
  const selectedDate = habitDate(req.nextUrl.searchParams.get('date') ?? today)
  if (!selectedDate) return NextResponse.json({ error: 'Fecha inválida.' }, { status: 400 })

  const requestedLimit = Number(req.nextUrl.searchParams.get('limit') ?? 14)
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 30)
    : 14

  const service = createServiceClient()
  const [history, selected] = await Promise.all([
    service
    .from('habit_logs')
    .select(HABIT_COLUMNS)
    .eq('user_id', auth.user.id)
    .lte('log_date', today)
    .order('log_date', { ascending: false })
    .limit(Math.max(limit, 7)),
    service.from('habit_logs')
      .select(HABIT_COLUMNS)
      .eq('user_id', auth.user.id)
      .eq('log_date', selectedDate)
      .limit(1)
      .maybeSingle(),
  ])

  const error = history.error ?? selected.error
  if (error) {
    console.error('[habits] select fallido:', error.message)
    return NextResponse.json({ error: 'No se pudo cargar la bitácora.' }, { status: 500 })
  }

  const logs = (history.data ?? []).map(row => normalizeLog(row as Record<string, unknown>))
  return NextResponse.json({
    logs: logs.slice(0, limit),
    log: selected.data ? normalizeLog(selected.data as Record<string, unknown>) : null,
    summary: buildHabitSummary(logs, now),
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

  const expected = (body as Record<string, unknown>).expected_updated_at
  if (expected !== null && (typeof expected !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(expected) || !Number.isFinite(Date.parse(expected)))) {
    return NextResponse.json({ error: 'Carga el registro antes de guardar.' }, { status: 400 })
  }

  const service = createServiceClient()
  const updated_at = new Date(Math.max(Date.now(), typeof expected === 'string' ? Date.parse(expected) + 1 : 0)).toISOString()
  const row = { ...valid.data, updated_at }
  // La unicidad protege las altas; el filtro de versión hace atómica la edición.
  const { data, error } = expected === null
    ? await service.from('habit_logs').insert({ user_id: auth.user.id, ...row }).select(HABIT_COLUMNS).single()
    : await service.from('habit_logs').update(row)
      .eq('user_id', auth.user.id)
      .eq('log_date', valid.data.log_date)
      .eq('updated_at', expected)
      .select(HABIT_COLUMNS)
      .maybeSingle()

  if (error?.code === '23505' || (!error && !data)) {
    return NextResponse.json({ error: 'El registro cambió. Vuelve a cargarlo antes de guardar.' }, { status: 409 })
  }

  if (error || !data) {
    console.error('[habits] guardado fallido:', error?.message)
    return NextResponse.json({ error: 'No se pudo guardar la bitácora.' }, { status: 500 })
  }

  const log = normalizeLog(data as Record<string, unknown>)
  return NextResponse.json({
    log,
    alerts: buildHabitAlerts(log),
  })
}
