import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Link from 'next/link'
import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'

export const metadata: Metadata = {
  title: 'Consejería — EVIPro',
  description: 'Orientación médica especializada. Sesiones cortas con nuestros especialistas.',
}

export default function ConsejeriaPage() {
  const counselingDoctors = DOCTORS.filter(d => d.counseling?.available)

  return (
    <main className="min-h-screen bg-[#080a08] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <p className="text-xs tracking-widest text-[#7bc96f] uppercase mb-4 font-mono">Consejería</p>
        <h1 className="text-4xl font-light font-serif italic mb-4">
          Orientación médica a tu medida
        </h1>
        <p className="text-gray-400 mb-8 max-w-xl text-sm">
          Sesiones cortas con nuestros especialistas. Para dudas concretas, orientación antes de
          una consulta formal, o saber si tu situación requiere atención médica.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          {[
            'Video (15–20 min) · S/. 15',
            'Mensajería · Gratis 1ra vez, luego S/. 3',
            'WhatsApp · Gratis 1ra vez, luego S/. 3',
          ].map(label => (
            <span
              key={label}
              className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-full text-gray-300 font-mono"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Cómo funciona */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            { n: '01', title: 'Elige tu especialista', desc: 'Selecciona el médico según tu necesidad: cannabis medicinal o salud del adulto mayor.' },
            { n: '02', title: 'Elige modalidad', desc: 'Video para una sesión en tiempo real, o mensajería/WhatsApp si prefieres escribir y recibir respuesta ese día.' },
            { n: '03', title: 'Recibe orientación', desc: 'El médico confirma tu sesión por WhatsApp en menos de 2 h. Primera sesión de mensajería: gratis.' },
          ].map(step => (
            <div key={step.n} className="border border-white/10 rounded-lg p-5">
              <p className="text-[#7bc96f] font-mono text-xs mb-3">{step.n}</p>
              <p className="text-white text-sm font-light mb-1">{step.title}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {counselingDoctors.map(doctor => (
            <div
              key={doctor.slug}
              className="border border-white/10 rounded-lg p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-white/5">
                  <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-white font-light text-lg leading-tight">{doctor.name}</h2>
                  <p className="text-gray-500 text-xs font-mono mt-0.5">CMP {doctor.cmp}</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed">
                {doctor.counseling!.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {doctor.specialties.map(s => (
                  <span key={s} className="text-xs bg-white/5 px-3 py-1 rounded text-gray-300">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 font-mono">
                  {doctor.location} · {doctor.modality}
                </p>
                <Link
                  href={`/consejeria/${doctor.slug}`}
                  className="text-xs font-mono text-[#7bc96f] hover:underline"
                >
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
