import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import Link from 'next/link'
import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'
import { MP_MIN_CHARGE } from '@/lib/counseling'

export const metadata: Metadata = {
  title: 'Consejería — EVIPro',
  description: 'Orientación médica especializada. Sesiones cortas con nuestros especialistas.',
}

export default function ConsejeriaPage() {
  const counselingDoctors = DOCTORS.filter(d => d.counseling?.available)

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Consejería</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">
          Orientación médica a tu medida
        </h1>
        <p className="text-muted mb-8 max-w-xl text-sm">
          Sesiones cortas con nuestros especialistas. Para dudas concretas, orientación antes de
          una consulta formal, o saber si tu situación requiere atención médica.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          {[
            'Video (15–20 min) · S/. 15',
            `WhatsApp · S/. ${MP_MIN_CHARGE}`,
          ].map(label => (
            <span
              key={label}
              className="text-xs bg-white/5 border border-subtle px-4 py-2 rounded-full text-gray-300 font-mono"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Cómo funciona */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            { n: '01', title: 'Elige tu especialista', desc: 'Selecciona el médico según tu necesidad: cannabis medicinal o salud del adulto mayor.' },
            { n: '02', title: 'Elige modalidad', desc: 'Video para una sesión en tiempo real, o por WhatsApp si prefieres escribir y recibir respuesta ese día.' },
            { n: '03', title: 'Recibe orientación', desc: 'El médico confirma tu sesión por WhatsApp en menos de 2 h.' },
          ].map(step => (
            <div key={step.n} className="border border-subtle rounded-lg p-5">
              <p className="text-brand font-mono text-xs mb-3">{step.n}</p>
              <p className="text-white text-sm font-light mb-1">{step.title}</p>
              <p className="text-faint text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {counselingDoctors.map(doctor => (
            <div
              key={doctor.slug}
              className="border border-subtle rounded-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-white/5">
                  <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-white font-light text-lg leading-tight">{doctor.name}</h2>
                  <p className="text-faint text-xs font-mono mt-0.5">CMP {doctor.cmp}</p>
                </div>
              </div>

              <p className="text-muted text-sm leading-relaxed">
                {doctor.counseling!.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {doctor.specialties.map(s => (
                  <span key={s} className="text-xs bg-white/5 px-3 py-1 rounded text-gray-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-subtle">
                <p className="text-xs text-faint font-mono">
                  {doctor.location} · {doctor.modality}
                </p>
                <Link
                  href={`/consejeria/${doctor.slug}`}
                  className="text-xs font-mono text-brand hover:underline"
                >
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Farmacia aliada */}
        <div className="mt-16 border border-subtle rounded-lg p-6 flex flex-col sm:flex-row items-center gap-5">
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
            <a
              href="https://cannavital.pe/farmacia-magistral/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-brand hover:underline"
            >
              Ver farmacia magistral →
            </a>
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
            <a
              href="https://www.facebook.com/fisioimperium"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-brand hover:underline"
            >
              Ver en Facebook →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
