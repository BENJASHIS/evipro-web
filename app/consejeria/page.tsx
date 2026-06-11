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

        <div className="flex flex-wrap gap-3 mb-16">
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
