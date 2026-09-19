import { NextRequest, NextResponse } from 'next/server'
import { isLocale, LOCALE_COOKIE } from '@/lib/i18n'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const expectedHost = request.headers.get('host') ?? request.nextUrl.host
  let sameOrigin = false
  try {
    const parsed = new URL(origin ?? '')
    sameOrigin = parsed.host === expectedHost && parsed.protocol === request.nextUrl.protocol
  } catch { /* Missing or malformed origins cannot write the preference. */ }
  if (!sameOrigin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const body = await request.json().catch(() => null)
  if (!isLocale(body?.locale)) return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
  const response = NextResponse.json({ locale: body.locale })
  response.cookies.set(LOCALE_COOKIE, body.locale, {
    httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:',
    path: '/', maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
