import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    const ADMIN_EMAILS = ['drecs2003@gmail.com', 'consulta@evipro.pe']
    if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/miembros', request.url))
    }
  }

  if ((pathname === '/login' || pathname === '/registro') && user) {
    return NextResponse.redirect(new URL('/miembros', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/miembros/:path*', '/admin/:path*', '/login', '/registro'],
}
