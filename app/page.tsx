import { localizedMetadata } from '@/lib/localized-metadata'
import Nav from '@/app/components/Nav'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { META_PORTADA } from '@/lib/home-content'
import {
  Modalidades, CierreConsulta, Hero, Participar, QuienTeAtiende,
  OtrasEspecialidades, Membresia,
} from '@/app/components/home/secciones'

/** Solo para «/». El layout mantiene su título para el resto del sitio: cambiarlo
 *  ahí afectaría a páginas que no se rediseñaron en este trabajo. */
export const generateMetadata = () => localizedMetadata('/', META_PORTADA.titulo, META_PORTADA.descripcion)

/** Los precios de cada membresía se leen por separado del catálogo público. */
async function preciosMembresia(): Promise<{ evipro: number | null; basica: number | null }> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('membership_plans')
    .select('type, price_soles')
    .in('type', ['evipro', 'basica'])
    .order('price_soles', { ascending: true })
    .limit(50)
  return {
    evipro: data?.find(p => p.type === 'evipro')?.price_soles ?? null,
    basica: data?.find(p => p.type === 'basica')?.price_soles ?? null,
  }
}

export default async function Home() {
  const precios = await preciosMembresia()
  return (
    <main className="public-page home-page min-h-screen bg-ink text-white">
      <Nav />
      <Hero />
      <Membresia desde={precios.evipro} basica={precios.basica} />
      <Modalidades />
      <QuienTeAtiende />
      <OtrasEspecialidades />
      <Participar />
      <CierreConsulta />
    </main>
  )
}
