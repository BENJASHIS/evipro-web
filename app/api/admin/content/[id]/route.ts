import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { MEMBER_CONTENT_BUCKET } from '@/lib/content'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return isAdminUser(user)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await params
  const { publish } = await req.json()
  const service = createServiceClient()
  const { error } = await service
    .from('content')
    .update({ published_at: publish ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await params
  const service = createServiceClient()

  const { data: row } = await service
    .from('content')
    .select('file_path')
    .eq('id', id)
    .single()

  if (row?.file_path) {
    await service.storage.from(MEMBER_CONTENT_BUCKET).remove([row.file_path])
  }
  const { error } = await service.from('content').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Error eliminando' }, { status: 500 })
  return NextResponse.json({ success: true })
}
