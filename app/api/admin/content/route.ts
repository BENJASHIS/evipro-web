import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/auth'
import { validateContentFile, buildStoragePath, MEMBER_CONTENT_BUCKET } from '@/lib/content'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const form = await req.formData()
  const file = form.get('file')
  const title = (form.get('title') as string | null)?.trim()
  const body = (form.get('body') as string | null)?.trim() || null
  const content_type = (form.get('content_type') as string | null) || 'infographic'
  const category = (form.get('category') as string | null)?.trim() || null
  const min_plan = (form.get('min_plan') as string | null) || null
  const publish = form.get('publish') === 'true'

  if (!title) return NextResponse.json({ error: 'Falta el título' }, { status: 400 })
  if (!(file instanceof File)) return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 })

  const validation = validateContentFile({ mimeType: file.type, size: file.size })
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 })

  const service = createServiceClient()
  const id = crypto.randomUUID()
  const path = buildStoragePath(id, file.name)

  const { error: upErr } = await service.storage
    .from(MEMBER_CONTENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (upErr) {
    console.error('[admin/content] upload error:', upErr.message)
    return NextResponse.json({ error: 'Error subiendo el archivo' }, { status: 500 })
  }

  const { error: insErr } = await service.from('content').insert({
    id, title, body, content_type,
    file_path: path, file_kind: validation.fileKind, category, min_plan,
    published_at: publish ? new Date().toISOString() : null,
  })
  if (insErr) {
    await service.storage.from(MEMBER_CONTENT_BUCKET).remove([path])
    console.error('[admin/content] insert error:', insErr.message)
    return NextResponse.json({ error: 'Error guardando el contenido' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id })
}
