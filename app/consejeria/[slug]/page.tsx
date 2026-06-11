import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Image from 'next/image'
import { DOCTORS } from '@/lib/doctors'
import BookingForm from './BookingForm'

export function generateStaticParams() {
  return DOCTORS
    .filter(d => d.counseling?.available)
    .map(d => ({ slug: d.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug)
  if (!doctor) return {}
  return { title: `Consejería con ${doctor.name} — EVIPro` }
}

export default async function ConsejeriaSlugPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const doctor = DOCTORS.find(d => d.slug === slug && d.counseling?.available)
  if (!doctor) notFound()

  return (
    <main className="min-h-screen bg-[#080a08] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-white/5">
            <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-0.5">
              Consejería
            </p>
            <h1 className="text-2xl font-light">{doctor.name}</h1>
            <p className="text-gray-500 text-xs font-mono">CMP {doctor.cmp}</p>
          </div>
        </div>

        <BookingForm doctor={doctor} />
      </div>
    </main>
  )
}
