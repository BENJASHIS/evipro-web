import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import Image from 'next/image'
import PropuestaForm from './PropuestaForm'

export const metadata: Metadata = {
  title: 'Aliados · EVIPro',
  description: 'Farmacia magistral y centro de rehabilitación aliados de EVIPro en Cusco.',
}

export default function AliadosPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Aliados</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">
          Con quiénes trabajamos
        </h1>
        <p className="text-muted mb-12 max-w-xl text-sm">
          Lugares de confianza para preparar lo que tu médico indica y para acompañar tu
          tratamiento. Cada uno es independiente de EVIPro: tú eliges dónde atenderte.
        </p>

        {/* Farmacia aliada */}
        <div className="border border-subtle rounded-lg p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-white rounded-lg p-4 shrink-0">
            <Image
              src="/images/aliados/cannavital.png"
              alt="Cannavital Farmacia"
              width={120}
              height={120}
              className="w-28 h-auto object-contain"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">Farmacia aliada</p>
            <h2 className="text-white text-lg font-light mb-1">Cannavital · Farmacia magistral</h2>
            <p className="text-muted text-sm mb-3">
              Farmacia magistral aliada para preparar las fórmulas indicadas por tu médico.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start">
              <a
                href="https://cannavital.pe/farmacia-magistral/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand hover:underline"
              >
                Ver farmacia magistral →
              </a>
              <a
                href="https://www.instagram.com/cannavital.farmacia/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand hover:underline"
              >
                Instagram →
              </a>
            </div>
          </div>
        </div>

        {/* Centro aliado */}
        <div className="mt-6 border border-subtle rounded-lg p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="bg-white rounded-lg p-4 shrink-0">
            <Image
              src="/images/aliados/fisioimperium.png"
              alt="FisioImperium"
              width={120}
              height={120}
              className="w-28 h-auto object-contain"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-1">Centro aliado</p>
            <h2 className="text-white text-lg font-light mb-1">FisioImperium · Centro médico integral</h2>
            <p className="text-muted text-sm mb-3">
              Centro aliado de fisioterapia y rehabilitación para complementar tu tratamiento.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start">
              <a
                href="https://www.facebook.com/fisioimperium"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand hover:underline"
              >
                Ver en Facebook →
              </a>
              <a
                href="https://www.google.com/maps/place/FisioImperium/@-13.5252192,-71.9712776,17z/data=!3m1!4b1!4m6!3m5!1s0x916dd5e3b6d1316f:0xee13937c3020a575!8m2!3d-13.5252192!4d-71.9687027!16s%2Fg%2F11qh0zx6gd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-brand hover:underline"
              >
                Cómo llegar →
              </a>
            </div>
          </div>
        </div>

        {/* Puerta de propuestas */}
        <section id="propuesta" className="mt-16 border-t border-subtle pt-12 scroll-mt-8">
          <h2 className="text-2xl font-light font-serif italic mb-3">¿Quieres trabajar con nosotros?</h2>
          <p className="text-muted text-sm mb-8 max-w-xl">
            No hace falta ser médico ni tener consultorio: si haces algo que se cruza con lo que
            hacemos y quieres proponer un trabajo conjunto, cuéntalo aquí. Tres preguntas concretas,
            porque una idea sin qué aporta cada uno no se puede evaluar.
          </p>
          <PropuestaForm />
        </section>
      </div>
    </main>
  )
}
