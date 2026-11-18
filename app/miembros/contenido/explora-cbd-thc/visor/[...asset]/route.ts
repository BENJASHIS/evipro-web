import { getLocale } from '@/lib/locale-server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { canUseMemberTools, getMemberAccess } from '@/lib/member-access'
import { cabecerasPrivadas, servirArchivoVisor } from '@/lib/visor-frasco'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Inicia sesión para abrir este recurso.',{ status:401,headers:cabecerasPrivadas })
  const access = await getMemberAccess(supabase,user)
  const { asset } = await params
  let key = asset.join('/')
  if (!canUseMemberTools(access)) {
    if (key === 'assets/thc.json' || key === 'assets/thc-reference.svg') return new Response('THC y mezclas requieren membresía activa.',{ status:403,headers:cabecerasPrivadas })
    if (key === 'index.html' || key === 'index-en.html') key = key.endsWith('-en.html') ? 'cbd-en.html' : 'cbd.html'
  }
  if ((key === 'index.html' || key === 'cbd.html') && await getLocale() === 'en') key = key.replace('.html','-en.html')
  return servirArchivoVisor(key)
}
