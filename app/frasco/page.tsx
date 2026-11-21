import Nav from '@/app/components/Nav'
import { T } from '@/app/components/Language'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import VisorFrasco from '@/app/miembros/contenido/explora-cbd-thc/VisorFrasco'
import { FRASCO_TEXTO as TX } from '@/lib/frasco-texto'
import { translate } from '@/lib/i18n'
import { getLocale } from '@/lib/locale-server'
import AvisoEdad from './AvisoEdad'
import ListaFarmacias from './ListaFarmacias'

export async function generateMetadata() {
  const locale = await getLocale()
  return {
    title: `${translate(locale, 'Cómo reconocer un preparado de cannabis medicinal')} · EVIPro`,
    description: translate(locale, 'Frasco 3D con una etiqueta de ejemplo, qué debe decir y la lista oficial de farmacias autorizadas por DIGEMID.'),
    robots: { index: false, follow: false },
  }
}

const Parrafos = ({ items }: { items: string[] }) => <>{items.map(i => <p key={i} className="mb-3 last:mb-0"><T>{i}</T></p>)}</>
const Marca = ({ children }: { children: ReactNode }) => children === '•'
  ? <span aria-hidden="true" className="mt-2.5 size-2 shrink-0 rounded-full bg-brand" />
  : <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-brand/60 text-xs font-semibold text-brand">{children}</span>
// Cada sección con su marcador: números en la etiqueta, «!» en las señales, flechas en lo que hacer.
const Lista = ({ items, marca, ordenada }: { items: string[]; marca: (n: number) => string; ordenada?: boolean }) => {
  const Tag = ordenada ? 'ol' : 'ul'
  return <Tag className="space-y-3">{items.map((i, n) => <li key={i} className="flex gap-3"><Marca>{marca(n)}</Marca><span><T>{i}</T></span></li>)}</Tag>
}
const Tarjeta = ({ id, icono, titulo, children }: { id: string; icono: string; titulo: string; children: ReactNode }) =>
  <section id={id} className="rounded-xl border border-subtle bg-surface p-5 leading-relaxed sm:p-7">
    <h2 className="mb-4 flex items-center gap-3 font-serif text-2xl">
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 font-sans text-base font-semibold text-brand">{icono}</span>
      <T>{titulo}</T>
    </h2>
    <div className="text-gray-300">{children}</div>
  </section>

// Pública, sin indexar y con aviso de edad (Carlos, 19-nov). En inglés, el texto sale de lib/locales/en.json.
// Ancho (Carlos, 20-nov): la página y el menú usan el ancho del visor (hasta 1400 px); el texto corrido no pasa de
// unos 75 caracteres por línea, por eso las secciones cortas van en tarjetas de a dos. En celular, una columna.
// Interruptor (Carlos, 20-nov): la página existe solo con FRASCO_PUBLICO=1 en Vercel, que Carlos activa.
// Cambiar la variable pide un nuevo despliegue.
export default function FrascoPage() {
  if (process.env.FRASCO_PUBLICO !== '1') notFound()
  return <main className="public-page frasco-page min-h-screen text-white pb-20">
    <Nav />
    <div className="mx-auto max-w-[1400px] px-6 pt-12">
      <AvisoEdad>
        <h1 className="mb-6 max-w-4xl font-serif text-4xl md:text-5xl"><T>Cómo reconocer un preparado de cannabis medicinal</T></h1>
        <div className="max-w-3xl text-lg leading-relaxed text-gray-300"><Parrafos items={TX.intro} /></div>
        <section className="mt-8" aria-labelledby="visor-titulo">
          <h2 id="visor-titulo" className="sr-only"><T>Frasco de ejemplo en 3D</T></h2><VisorFrasco />
        </section>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Tarjeta id="etiqueta" icono="✓" titulo="Qué debe decir la etiqueta">
            <p className="mb-4"><T>{TX.etiquetaIntro}</T></p>
            <Lista items={TX.etiqueta} marca={n => String(n + 1)} ordenada />
          </Tarjeta>
          <Tarjeta id="senales" icono="!" titulo="Señales de que algo no está en regla"><Lista items={TX.senales} marca={() => '!'} /></Tarjeta>
          <Tarjeta id="si-falta" icono="?" titulo="Si algo falta o no te convence"><Lista items={TX.siFalta} marca={() => '→'} /></Tarjeta>
          <Tarjeta id="limite" icono="i" titulo="Lo que la etiqueta no puede decirte"><Parrafos items={TX.limite} /></Tarjeta>
        </div>
        <section id="farmacias" className="mt-14 leading-relaxed">
          <h2 className="mb-4 font-serif text-3xl"><T>Dónde se vende legalmente</T></h2>
          <div className="mb-6 max-w-3xl text-gray-300"><Parrafos items={TX.lista} /></div>
          <ListaFarmacias />
        </section>
        <section id="seguridad" className="public-panel mt-14 rounded-xl p-6 leading-relaxed sm:p-8">
          <h2 className="mb-4 font-serif text-2xl"><T>Antes de usarlo</T></h2>
          <div className="max-w-4xl"><Lista items={TX.seguridad} marca={() => '•'} /></div>
        </section>
      </AvisoEdad>
    </div>
  </main>
}
