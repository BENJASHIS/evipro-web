import Link from 'next/link'
import { T } from '@/app/components/Language'

export function OpinionGoogle() {
  return <section className="home-section border-t border-subtle px-6 py-16" aria-labelledby="opinion-google">
    <figure className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 md:gap-12">
      <figcaption>
        <h2 id="opinion-google" className="text-xs font-mono uppercase tracking-widest mb-4"><T>Opiniones en Google</T></h2>
        <p className="text-brand tracking-widest" aria-label="5 / 5">★★★★★</p>
        <p className="text-sm mt-3">Damian Orchowski</p>
        <p className="text-xs text-muted mt-2"><T>Una reseña individual · Google Maps</T></p>
      </figcaption>
      <div className="md:col-span-2">
        <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed">
          <p lang="es">«Recomiendo esta clínica, gente muy servicial…»</p>
        </blockquote>
        <p className="text-muted text-xs mt-4"><T>Extracto de la versión en español mostrada por Google Maps.</T></p>
        <a href="https://maps.app.goo.gl/XbQYN9aeSS42sJ5B6" target="_blank" rel="noopener noreferrer" className="inline-block text-brand underline text-sm mt-5"><T>Leer reseña completa en Google ↗</T></a>
      </div>
    </figure>
  </section>
}

export function DudasViajero() {
  return <section className="home-section border-t border-subtle px-6 py-16" aria-labelledby="viajero-titulo">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12">
      <div>
        <p className="text-brand text-xs font-mono uppercase tracking-widest mb-4"><T>Cusco y los Andes</T></p>
        <h2 id="viajero-titulo" className="font-serif text-3xl md:text-4xl"><T>¿Preparando tu viaje?</T></h2>
      </div>
      <div>
        <p className="text-muted leading-relaxed"><T>Lee las preguntas frecuentes y envíanos una duda general. Estamos construyendo un espacio útil para quienes visitan Cusco y los Andes, sin necesidad de registrarse.</T></p>
        <Link href="/dudas-del-viajero" className="inline-block text-brand underline mt-5"><T>Explorar Dudas del viajero →</T></Link>
      </div>
    </div>
  </section>
}
