import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { DOCTORS } from '@/lib/doctors'
import Nav from '@/app/components/Nav'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return DOCTORS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) return {}
  return {
    title: `${doctor.name} — EVIPro`,
    description: doctor.bio.slice(0, 160),
  }
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link
          href="/medicos"
          className="text-xs font-mono text-faint hover:text-white transition-colors mb-10 block"
        >
          ← Equipo médico
        </Link>

        {/* Header */}
        <div className="flex gap-6 items-start mb-10 pb-10 border-b border-subtle">
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand/30">
            <Image
              src={doctor.photo}
              alt={doctor.name}
              fill
              className="object-cover object-top"
            />
          </div>
          <div>
            <h1 className="text-3xl font-light mb-1">{doctor.name}</h1>
            <p className="text-brand text-sm font-mono mb-4">
              CMP {doctor.cmp}{doctor.rna ? ` · RNA ${doctor.rna}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map(s => (
                <span key={s} className="bg-brand/10 text-brand text-xs px-3 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-4">
                Sobre el Dr.
              </h2>
              <p className="text-gray-300 leading-relaxed text-sm">{doctor.bio}</p>
            </section>

            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-4">
                Formación
              </h2>
              <ul className="space-y-2">
                {doctor.formation.map((f, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-white">{f.title}</span>
                    {' — '}
                    <span className="text-faint">
                      {f.institution}{f.year ? ` (${f.year})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-3">
                Idiomas
              </h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map(lang => (
                  <span key={lang.name} className="text-xs bg-white/5 px-3 py-1 rounded text-gray-300">
                    {lang.name}{' '}
                    <span className={lang.level === 'Nativo' ? 'text-brand' : 'text-faint'}>
                      · {lang.level}
                    </span>
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-subtle rounded-lg p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">
                Disponibilidad
              </p>
              <p className="text-gray-300 text-sm">{doctor.availability}</p>
              <p className="text-faint text-xs mt-1">
                {doctor.modality} · {doctor.location}
              </p>
            </div>

            <div className="border border-subtle rounded-lg p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3">
                Planes que atiende
              </p>
              <ul className="space-y-1">
                {doctor.plans.map(plan => (
                  <li key={plan} className="text-gray-300 text-sm">{plan}</li>
                ))}
              </ul>
            </div>

            <Link
              href={`/medicos/${doctor.slug}/agendar`}
              className="block w-full text-center bg-brand text-black py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
            >
              Agendar cita →
            </Link>

            <Link
              href="/planes"
              className="block w-full text-center border border-strong text-white py-3 rounded font-mono text-sm hover:border-white/40 transition-colors"
            >
              Ver planes →
            </Link>

            <a
              href={`https://wa.me/${doctor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border border-brand/40 text-brand py-3 rounded font-mono text-sm hover:border-brand transition-colors"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
