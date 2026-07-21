import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Nav from '@/app/components/Nav'
import { DOCTORS } from '@/lib/doctors'
import AgendarForm from './AgendarForm'

export function generateStaticParams() {
  return DOCTORS.map(d => ({ slug: d.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) return {}
  return { title: `Agendar cita con ${doctor.name} — EVIPro` }
}

export default async function AgendarPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) notFound()

  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-white/5">
            <Image src={doctor.photo} alt={doctor.name} fill className="object-cover object-top" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand mb-0.5">Agendar cita</p>
            <h1 className="text-2xl font-light">{doctor.name}</h1>
            <p className="text-faint text-xs font-mono">CMP {doctor.cmp}</p>
          </div>
        </div>
        <AgendarForm doctor={doctor} />
      </div>
    </main>
  )
}
