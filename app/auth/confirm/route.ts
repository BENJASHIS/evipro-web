import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { memberReturnPath } from '@/lib/member-return'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const destination = memberReturnPath(url.searchParams.get('next'))
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(destination, url.origin))
  }
  const login = new URL('/login', url.origin)
  login.searchParams.set('next', destination)
  return NextResponse.redirect(login)
}
