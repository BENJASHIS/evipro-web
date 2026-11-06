import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { memberReturnPath } from '@/lib/member-return'

export async function GET(request: Request) {
  const limit = checkRateLimit(request, {namespace:'auth:callback',limit:20,windowMs:60_000})
  if (!limit.ok) return rateLimitResponse(limit)
  const url = new URL(request.url)
  const destination = memberReturnPath(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  try { if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(destination, url.origin),{headers:{'Cache-Control':'private, no-store'}})
  } } catch {}
  const login = new URL('/login', url.origin)
  login.searchParams.set('next', destination)
  login.searchParams.set('auth_error','callback')
  return NextResponse.redirect(login,{headers:{'Cache-Control':'private, no-store'}})
}
