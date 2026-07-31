import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { META_PORTADA } from '@/lib/home-content'
import {
  Hero, ParaQueSi, ParaQueNo, Preguntas, QuienTeAtiende,
  PrimeraConsulta, OtrasEspecialidades, Membresia,
} from '@/app/components/home/secciones'

/** Solo para «/». El layout mantiene su título para el resto del sitio: cambiarlo
 *  ahí afectaría a páginas que no se rediseñaron en este trabajo. */
export const metadata: Metadata = {
  title: META_PORTADA.titulo,
  description: META_PORTADA.descripcion,
}

/** Precio de entrada a la membresía EVIPro, leído de la tabla en vez de
 *  escrito aquí. Filtra por type='evipro' a propósito: la frase que acompaña
 *  este número (en MEMBRESIA.texto) dice que la membresía abarata cada
 *  consulta, y esa es la EVIPro — la Básica tiene descuento 0% y no
 *  incluye nada, así que su precio (más barato) nunca debe salir aquí. */
async function precioDesde(): Promise<number | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('membership_plans')
    .select('price_soles')
    .eq('type', 'evipro')
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
