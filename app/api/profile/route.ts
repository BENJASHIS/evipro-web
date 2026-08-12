import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import {
  encryptDocument,
  isEncryptedDocument,
  toPublicProfile,
  validateProfilePayload,
  type StoredProfile,
} from '@/lib/profile'

const PROFILE_COLUMNS = 'full_name, phone, city, doc_type, dni_encrypted, country_origin'

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

async function loadProfile(userId: string): Promise<StoredProfile | null> {
  const { data } = await createServiceClient()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  return (data ?? null) as StoredProfile | null
}

async function encryptLegacyDocument(userId: string, profile: StoredProfile): Promise<StoredProfile> {
  if (!profile.dni_encrypted || isEncryptedDocument(profile.dni_encrypted)) return profile
  const encrypted = encryptDocument(profile.dni_encrypted)
  await createServiceClient()
    .from('profiles')
    .update({ dni_encrypted: encrypted })
    .eq('id', userId)
  return { ...profile, dni_encrypted: encrypted }
}

export async function GET(req: NextRequest) {
  const user = await currentUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const profile = await loadProfile(user.id)
  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado.' }, { status: 404 })

  const safeProfile = await encryptLegacyDocument(user.id, profile)
  return NextResponse.json({ ...toPublicProfile(safeProfile), email: user.email ?? '' })
}

export async function PUT(req: NextRequest) {
  const user = await currentUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
  }

  const current = await loadProfile(user.id)
  const valid = validateProfilePayload(body, {
    existingHasDocument: Boolean(current?.dni_encrypted),
    existingDocType: current?.doc_type ?? null,
  })
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 400 })

  const row: Record<string, unknown> = {
    id: user.id,
    full_name: valid.data.full_name,
    phone: valid.data.phone,
    city: valid.data.city,
    doc_type: valid.data.doc_type,
    country_origin: valid.data.country_origin,
  }
  if (valid.data.doc_number) {
    row.dni_encrypted = encryptDocument(valid.data.doc_number)
  }

  const { data, error } = await createServiceClient()
    .from('profiles')
    .upsert(row)
    .select(PROFILE_COLUMNS)
    .single()

  if (error || !data) {
    console.error('[profile] upsert fallido:', error?.message)
    return NextResponse.json({ error: 'No se pudo guardar el perfil.' }, { status: 500 })
  }

  return NextResponse.json({ ...toPublicProfile(data as StoredProfile), email: user.email ?? '' })
}
