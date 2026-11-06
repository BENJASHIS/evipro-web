import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { BOTTLE_PATH, memberReturnPath } from './lib/member-return'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/miembros') || pathname.startsWith('/admin')) {
    if (!user) {
      const login = new URL('/login', request.url)
      if (pathname === BOTTLE_PATH || pathname.startsWith(`${BOTTLE_PATH}/visor/`)) login.searchParams.set('next',BOTTLE_PATH)
      return NextResponse.redirect(login)
    }
  }

  if (pathname.startsWith('/admin')) {
    const ADMIN_EMAILS = ['drecs2003@gmail.com', 'consulta@evipro.pe']
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/miembros', request.url))
    }
  }

  if ((pathname === '/login' || pathname === '/registro') && user) {
    const destination = pathname === '/login' ? memberReturnPath(request.nextUrl.searchParams.get('next')) : '/miembros'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/miembros/:path*', '/admin/:path*', '/login', '/registro'],
}
