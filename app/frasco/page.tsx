import Nav from '@/app/components/Nav'
import { notFound } from 'next/navigation'
import VisorFrasco from '@/app/miembros/contenido/explora-cbd-thc/VisorFrasco'
import { FRASCO_TEXTO as T } from '@/lib/frasco-texto'
import AvisoEdad from './AvisoEdad'
import ListaFarmacias from './ListaFarmacias'

export const metadata = {
  title: 'Cómo reconocer un preparado de cannabis medicinal · EVIPro',
  description: 'Frasco 3D con una etiqueta de ejemplo, qué debe decir y la lista oficial de farmacias autorizadas por DIGEMID.',
  robots: { index: false, follow: false },
}

const Parrafos = ({ items }: { items: string[] }) => <>{items.map(i => <p key={i} className="mb-3">{i}</p>)}</>
const Lista = ({ items }: { items: string[] }) => <ul className="list-disc pl-5 space-y-2">{items.map(i => <li key={i}>{i}</li>)}</ul>
const seccion = 'mt-10 leading-relaxed max-w-3xl'
const titulo = 'font-serif text-2xl mb-4'

// Pública, sin indexar y con aviso de edad (Carlos, 19-nov). Solo español: sin <T>.
// Interruptor (Carlos, 20-nov): la página existe solo con FRASCO_PUBLICO=1 en Vercel, que Carlos activa
// cuando la declaración de conflicto de interés sea cierta. Cambiar la variable pide un nuevo despliegue.
export default function FrascoPage() {
  if (process.env.FRASCO_PUBLICO !== '1') notFound()
  return <main className="public-page min-h-screen text-white pb-20">
    <Nav />
    <div className="max-w-5xl mx-auto px-6 pt-12">
      <AvisoEdad>
        <h1 className="font-serif text-4xl md:text-5xl mb-6">Cómo reconocer un preparado de cannabis medicinal</h1>
        <div className="max-w-3xl text-lg leading-relaxed"><Parrafos items={T.intro} /></div>
        <section className="mt-8" aria-label="Frasco de ejemplo en 3D"><VisorFrasco /></section>
        <section id="etiqueta" className={seccion}>
          <h2 className={titulo}>Qué debe decir la etiqueta</h2>
          <p className="mb-3">{T.etiquetaIntro}</p>
          <ol className="list-decimal pl-5 space-y-2">{T.etiqueta.map(i => <li key={i}>{i}</li>)}</ol>
        </section>
        <section id="senales" className={seccion}><h2 className={titulo}>Señales de que algo no está en regla</h2><Lista items={T.senales} /></section>
        <section id="si-falta" className={seccion}><h2 className={titulo}>Si algo falta o no te convence</h2><Parrafos items={T.siFalta} /></section>
        <section id="limite" className={seccion}><h2 className={titulo}>Lo que la etiqueta no puede decirte</h2><Parrafos items={T.limite} /></section>
        <section id="farmacias" className={seccion}><h2 className={titulo}>Dónde se vende legalmente</h2><Parrafos items={T.lista} /><ListaFarmacias /></section>
        <section id="seguridad" className={`${seccion} public-panel rounded-lg p-6`}><h2 className={titulo}>Antes de usarlo</h2><Lista items={T.seguridad} /></section>
        <section id="conflicto" className={`${seccion} text-sm text-muted`}><h2 className="font-semibold mb-2">Conflicto de interés</h2><p>{T.conflicto}</p></section>
      </AvisoEdad>
    </div>
  </main>
}
