import type { Metadata } from 'next'
import { DOCTORS } from '@/lib/doctors'
import DoctorCard from '@/app/components/DoctorCard'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Equipo Médico — EVIPro',
  description: 'Conoce a los especialistas de EVIPro en Cannabis Medicinal, Medicina de Altura, Gerontología y más.',
}

export default function MedicosPage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4">Equipo Médico</Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4">Especialistas a tu lado</h1>
        <p className="text-muted mb-16 max-w-xl text-sm">
          Atención médica especializada, basada en evidencia científica y enfocada en la realidad andina peruana.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {DOCTORS.map(doctor => (
            <DoctorCard key={doctor.slug} doctor={doctor} />
          ))}
        </div>
      </div>
    </main>
  )
}
