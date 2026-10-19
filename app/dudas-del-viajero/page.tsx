import Link from 'next/link'
import Nav from '@/app/components/Nav'
import { T } from '@/app/components/Language'
import { localizedMetadata } from '@/lib/localized-metadata'
import DudaForm from './DudaForm'

export const generateMetadata = () => localizedMetadata('/dudas-del-viajero',
  'Dudas del viajero en Cusco y los Andes | EVIPro',
  'Preguntas frecuentes y un canal para enviar dudas generales antes de viajar a Cusco y los Andes. Sin registro.')

export default function DudasDelViajero() {
  return <main className="public-page min-h-screen text-white pb-20">
    <Nav />
    <div className="max-w-5xl mx-auto px-6 pt-16">
      <p className="text-brand text-xs font-mono uppercase tracking-widest mb-5"><T>Cusco y los Andes</T></p>
      <h1 className="font-serif text-4xl md:text-6xl mb-6"><T>Dudas del viajero</T></h1>
      <p className="text-muted text-lg max-w-2xl leading-relaxed"><T>Un lugar para empezar a preparar tu viaje, encontrar información y compartir las preguntas que pueden ayudar a otros viajeros.</T></p>
      <a href="#preguntar" className="inline-block text-brand underline mt-6"><T>Quiero hacer una pregunta →</T></a>

      <aside className="public-panel rounded-lg p-6 my-12">
        <h2 className="font-serif text-xl mb-2"><T>Si necesitas atención ahora</T></h2>
        <p className="text-sm leading-relaxed"><T>Este buzón no se vigila en tiempo real. Ante una urgencia, acude al servicio de emergencia más cercano; no esperes una respuesta por correo.</T></p>
      </aside>

      <section aria-labelledby="faq-viajero" className="max-w-3xl">
        <h2 id="faq-viajero" className="font-serif text-3xl mb-7"><T>Antes de preguntar</T></h2>
        <details className="border-t border-subtle py-5">
          <summary className="cursor-pointer text-lg"><T>¿Dónde encuentro información sobre viajar a la altura?</T></summary>
          <p className="text-muted text-sm leading-relaxed mt-4"><T>Puedes empezar por la información de los CDC para viajeros. Es una fuente general: no determina si tu itinerario es adecuado para tu salud ni sustituye una evaluación individual.</T></p>
          <a href="https://wwwnc.cdc.gov/travel/page/travel-to-high-altitudes" target="_blank" rel="noopener noreferrer" className="inline-block text-brand underline text-sm mt-3"><T>CDC: viajes a gran altura (en inglés) ↗</T></a>
        </details>
        <details className="border-t border-subtle py-5">
          <summary className="cursor-pointer text-lg"><T>¿Necesito ser miembro para enviar una pregunta?</T></summary>
          <p className="text-muted text-sm leading-relaxed mt-4"><T>No necesitas registro ni membresía para enviar una duda general. Esta página no incluye una consulta médica ni una reserva.</T></p>
        </details>
        <details className="border-t border-subtle py-5">
          <summary className="cursor-pointer text-lg"><T>¿Puedo preguntar por mi tratamiento o mis síntomas?</T></summary>
          <p className="text-muted text-sm leading-relaxed mt-4"><T>Las dudas sobre tu salud requieren un canal de atención individual. Usa la reserva para conocer las modalidades, los precios y la disponibilidad del equipo; no envíes tu historia clínica por este buzón.</T></p>
          <Link href="/medicos" className="inline-block text-brand underline text-sm mt-3"><T>Ver equipo y opciones de consulta →</T></Link>
        </details>
        <details className="border-y border-subtle py-5">
          <summary className="cursor-pointer text-lg"><T>¿Se publicará mi pregunta? ¿Cuándo recibiré respuesta?</T></summary>
          <p className="text-muted text-sm leading-relaxed mt-4"><T>No hay publicación automática ni plazo de respuesta garantizado. Revisaremos las dudas recibidas y podremos preparar respuestas generales, sin datos personales, para esta página. No publicaremos tu correo ni el mensaje original.</T></p>
        </details>
      </section>

      <section id="preguntar" className="border-t border-subtle mt-14 pt-10 scroll-mt-8">
        <h2 className="font-serif text-3xl mb-4"><T>Tu pregunta puede ayudar a otros</T></h2>
        <p className="text-muted text-sm max-w-2xl leading-relaxed mb-8"><T>Estamos empezando este espacio. El formulario prepara un correo para EVIPro; tú lo revisas y lo envías desde tu aplicación. Podemos recibir preguntas en español o inglés.</T></p>
        <DudaForm />
      </section>
    </div>
  </main>
}
