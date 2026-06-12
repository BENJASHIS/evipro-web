import Image from 'next/image'
import Link from 'next/link'
import type { Doctor } from '@/lib/doctors'

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/medicos/${doctor.slug}`}
      className="block border border-white/10 rounded-lg overflow-hidden hover:border-[#7bc96f]/50 transition-colors group"
    >
      <div className="relative h-48 bg-gradient-to-br from-[#0f2a0f] to-[#080a08]">
        <Image
          src={doctor.photo}
          alt={doctor.name}
          fill
          className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="p-6">
        <h2 className="text-lg font-light mb-1">{doctor.name}</h2>
        <p className="text-[#7bc96f] text-xs font-mono mb-3">CMP {doctor.cmp}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {doctor.specialties.map(s => (
            <span key={s} className="bg-[#7bc96f]/10 text-[#7bc96f] text-xs px-2 py-0.5 rounded">
              {s}
            </span>
          ))}
        </div>
        <p className="text-gray-500 text-xs font-mono mb-4">
          {doctor.location} · {doctor.modality}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[#7bc96f] text-xs font-mono group-hover:underline">
            Ver perfil completo →
          </span>
          {doctor.counseling?.available && (
            <span className="text-xs font-mono bg-[#7bc96f]/10 text-[#7bc96f] px-2 py-0.5 rounded">
              Consejería
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
