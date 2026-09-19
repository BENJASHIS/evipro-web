import { T } from '@/app/components/Language'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { DOCTORS } from '@/lib/doctors'
import Nav from '@/app/components/Nav'
import { localizedMetadata } from '@/lib/localized-metadata'
import { getLocale } from '@/lib/locale-server'
import { translate } from '@/lib/i18n'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return DOCTORS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) return {}
  const locale = await getLocale()
  return localizedMetadata(`/medicos/${doctor.slug}`, `${doctor.name} · EVIPro`, translate(locale, doctor.bio).slice(0, 160))
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  return (
    <main className="public-page min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link
          href="/medicos"
          className="text-xs font-mono text-faint hover:text-white transition-colors mb-10 block"
        ><T>{"← Equipo médico"}</T></Link>

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
                  <T>{s}</T>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-4"><T>{"Sobre el Dr."}</T></h2>
              <p className="text-gray-300 leading-relaxed text-sm"><T>{doctor.bio}</T></p>
            </section>

            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-4"><T>{"Formación"}</T></h2>
              <ul className="space-y-2">
                {doctor.formation.map((f, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-white"><T>{f.title}</T></span>
                    {' · '}
                    <span className="text-faint">
                      <T>{f.institution}</T>{f.year ? ` (${f.year})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>{"Idiomas"}</T></h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map(lang => (
                  <span key={lang.name} className="text-xs bg-white/5 px-3 py-1 rounded text-gray-300">
                    <T>{lang.name}</T>{' '}
                    <span className={lang.level === 'Nativo' ? 'text-brand' : 'text-faint'}>
                      · <T>{lang.level}</T>
                    </span>
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="public-panel border border-subtle rounded-lg p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>{"Disponibilidad"}</T></p>
              <p className="text-gray-300 text-sm"><T>{doctor.availability}</T></p>
              <p className="text-faint text-xs mt-1">
                <T>{doctor.modality}</T> · <T>{doctor.location}</T>
              </p>
            </div>

            <div className="public-panel border border-subtle rounded-lg p-5">
              <p className="text-xs font-mono uppercase tracking-widest text-brand mb-3"><T>{"Planes que atiende"}</T></p>
              <ul className="space-y-1">
                {doctor.plans.map(plan => (
                  <li key={plan} className="text-gray-300 text-sm"><T>{plan}</T></li>
                ))}
              </ul>
            </div>

            <Link
              href={`/medicos/${doctor.slug}/agendar`}
              className="block w-full text-center bg-brand text-black py-3 rounded font-mono text-sm hover:bg-brand-hover transition-colors"
            ><T>{"Agendar cita →"}</T></Link>

            <Link
              href="/planes"
              className="block w-full text-center border border-strong text-white py-3 rounded font-mono text-sm hover:border-white/40 transition-colors"
            ><T>{"Ver planes →"}</T></Link>

            <a
              href={`https://wa.me/${doctor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border border-brand/40 text-brand py-3 rounded font-mono text-sm hover:border-brand transition-colors"
            ><T>{"Consultar por WhatsApp"}</T></a>
          </div>
        </div>
      </div>
    </main>
  )
}
