import VisorFrasco from '@/app/miembros/contenido/explora-cbd-thc/VisorFrasco'
import core from '@/lib/guia-frasco-core.json'
import { composicionTexto, formatearPct, verificarGuia } from '@/lib/guia-frasco'
import { GUIA_TEXTO } from '@/lib/guia-frasco-texto'

// Sin referente: la dirección lleva el token y no debe viajar a la página siguiente ni a su analítica.
export const metadata = {
  title: 'Guía de uso de tu frasco · EVIPro',
  // Propia, para que la vista previa de WhatsApp no muestre la descripción comercial del sitio.
  description: 'Cómo usar tu frasco y qué cuidados tener. No reemplaza tu receta.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer' as const,
}

const Lista = ({ items }: { items: string[] }) => <ul className="list-disc pl-5 space-y-2">{items.map(i => <li key={i}>{i}</li>)}</ul>
const Parrafos = ({ items }: { items: string[] }) => <>{items.map(i => <p key={i} className="mb-3">{i}</p>)}</>
const seccion = 'mt-10 leading-relaxed'
const titulo = 'font-serif text-2xl mb-4'

// Sin aviso de edad: la puede abrir el apoderado de un niño recetado (diseño del 18-nov).
export default async function GuiaFrascoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const guia = verificarGuia(token)
  if (!guia) return <main className="public-page min-h-screen text-white px-6 py-16">
    <p className="max-w-xl mx-auto text-lg">Este enlace ya no es válido. Pide uno nuevo a tu médico.</p>
  </main>
  const { thc, cbd, exp } = guia
  const { linea, proporcion } = composicionTexto(thc, cbd)
  const manejo = thc >= core.umbral_thc_pct ? core.con_thc.map(l => l.replace('{thc_pct}', formatearPct(thc))) : [core.sin_thc]
  const vence = new Date(exp * 1000).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
  return <main className="public-page min-h-screen text-white pb-20">
    <div className="max-w-3xl mx-auto px-6 pt-12">
      <h1 className="font-serif text-4xl mb-8">Guía de uso de tu frasco</h1>
      <section id="tu-frasco" className="public-panel rounded-lg p-6">
        <p className="text-2xl font-semibold">{linea}</p>
        <p className="text-muted mt-1">{proporcion}</p>
        <p className="mt-4">Cuántas gotas y cada cuánto: lo dice tu receta.</p>
      </section>
      <section id="visor" className="mt-8"><VisorFrasco src={`/frasco/visor/index.html#thc=${thc}&cbd=${cbd}`} /></section>
      <section id="porcentajes" className={seccion}><h2 className={titulo}>Qué significan los porcentajes</h2><Parrafos items={GUIA_TEXTO.porcentajes} /></section>
      <section id="por-que" className={seccion}><h2 className={titulo}>Por qué tu porcentaje es este</h2><Parrafos items={[...GUIA_TEXTO.porQue, core.inicio]} /></section>
      <section id="como-aplicar" className={seccion}><h2 className={titulo}>Cómo aplicarlo bajo la lengua</h2><Lista items={core.sublingual} /></section>
      <section id="cuidados" className={seccion}>
        <h2 className={titulo}>Cuidados</h2>
        <h3 className="font-semibold mb-2">Conservación</h3><Lista items={core.almacenamiento} />
        <h3 className="font-semibold mt-6 mb-2">THC y manejo</h3><Lista items={manejo} />
        <h3 className="font-semibold mt-6 mb-2">Qué evitar</h3><Lista items={core.evitar} />
        <h3 className="font-semibold mt-6 mb-2">Altura</h3><p>{`Si vives a ${core.umbral_altura_msnm} msnm o más: ${core.aviso_altura}`}</p>
      </section>
      <section id="avisar" className={seccion}>
        <h2 className={titulo}>Cuándo avisar a tu médico</h2><Parrafos items={GUIA_TEXTO.avisar} />
        <h3 className="font-semibold mt-6 mb-2">Efectos intensos y urgencias</h3><Parrafos items={GUIA_TEXTO.urgente} />
      </section>
      <footer className="mt-12 border-t border-subtle pt-6 text-sm text-muted">
        <p>Esta guía no reemplaza tu receta.</p>
        <p>Enlace válido hasta el {vence}</p>
      </footer>
    </div>
  </main>
}
