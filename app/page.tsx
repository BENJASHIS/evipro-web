import Nav from '@/app/components/Nav'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  Hero, ParaQueSi, ParaQueNo, Preguntas, QuienTeAtiende,
  PrimeraConsulta, OtrasEspecialidades, Membresia,
} from '@/app/components/home/secciones'

/** Precio de entrada a la membresía, leído de la tabla en vez de escrito aquí.
 *  Si mañana cambia en Supabase, la portada cambia sola — que es justo lo que
 *  no pasaba cuando el precio en pantalla venía tecleado a mano y se
 *  desincronizaba del que cobraba la Básica en la tabla real. */
async function precioDesde(): Promise<number | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('membership_plans')
    .select('price_soles')
    .in('type', ['basica', 'evipro'])
    .order('price_soles', { ascending: true })
    .limit(1)
  return data?.[0]?.price_soles ?? null
}

export default async function Home() {
  const desde = await precioDesde()
  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <Hero />
      <ParaQueSi />
      <ParaQueNo />
      <Preguntas />
      <QuienTeAtiende />
      <PrimeraConsulta />
      <OtrasEspecialidades />
      <Membresia desde={desde} />
    </main>
  )
}
