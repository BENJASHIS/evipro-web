import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { memberReturnPath } from '@/lib/member-return'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const limit = checkRateLimit(request, { namespace:'auth:google',limit:10,windowMs:60_000 })
  if (!limit.ok) {
    const response = rateLimitResponse(limit)
    response.headers.set('Cache-Control','private, no-store')
    return response
  }
  const url = new URL(request.url)
  const next = memberReturnPath(url.searchParams.get('next'))
  const callback = new URL('/auth/confirm',url.origin)
  callback.searchParams.set('next',next)
  try {
    const supabase = await createServerSupabaseClient()
    const { data,error } = await supabase.auth.signInWithOAuth({
      provider:'google',options:{redirectTo:callback.toString(),skipBrowserRedirect:true},
    })
    if (!error && data.url) return NextResponse.redirect(data.url,{headers:{'Cache-Control':'private, no-store'}})
  } catch {}
  const login = new URL('/login',url.origin)
  login.searchParams.set('next',next)
  login.searchParams.set('auth_error','google')
  return NextResponse.redirect(login,{headers:{'Cache-Control':'private, no-store'}})
}
