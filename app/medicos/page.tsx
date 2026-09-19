import { localizedMetadata } from '@/lib/localized-metadata'
import { T } from '@/app/components/Language'
import { DOCTORS } from '@/lib/doctors'
import DoctorCard from '@/app/components/DoctorCard'
import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'

export const generateMetadata = () => localizedMetadata('/medicos', 'Equipo médico y reservas · EVIPro',
  'Conoce al equipo médico de EVIPro, su formación y modalidades de atención. Consulta presencial en Cusco y teleconsulta en Perú.')

export default function MedicosPage() {
  return (
    <main className="public-page min-h-screen bg-ink text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Badge className="mb-4"><T>{"Equipo Médico"}</T></Badge>
        <h1 className="text-4xl font-light font-serif italic mb-4"><T>{"Especialistas a tu lado"}</T></h1>
        <p className="text-muted mb-16 max-w-xl text-sm"><T>{"Atención médica especializada, basada en evidencia científica y enfocada en la realidad andina peruana."}</T></p>
        <div className="grid md:grid-cols-2 gap-8">
          {DOCTORS.map(doctor => (
            <DoctorCard key={doctor.slug} doctor={doctor} />
          ))}
        </div>
      </div>
    </main>
  )
}
