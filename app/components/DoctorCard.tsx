import Image from 'next/image'
import Link from 'next/link'
import type { Doctor } from '@/lib/doctors'

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/medicos/${doctor.slug}`}
      className="block border border-subtle rounded-lg overflow-hidden hover:border-brand/50 transition-colors group"
    >
      <div className="relative h-48 bg-gradient-to-br from-surface to-ink">
        <Image
          src={doctor.photo}
          alt={doctor.name}
          fill
          className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="p-6">
        <h2 className="text-lg font-light mb-1">{doctor.name}</h2>
        <p className="text-brand text-xs font-mono mb-3">CMP {doctor.cmp}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {doctor.specialties.map(s => (
            <span key={s} className="bg-brand/10 text-brand text-xs px-2 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
        <p className="text-faint text-xs font-mono mb-4">
          {doctor.location} · {doctor.modality}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-brand text-xs font-mono group-hover:underline">
            Ver perfil completo →
          </span>
          {doctor.counseling?.available && (
            <span className="text-xs font-mono bg-brand/10 text-brand px-2 py-0.5 rounded">
              Consejería
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
