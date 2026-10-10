import { T } from '@/app/components/Language'
import Image from 'next/image'
import Link from 'next/link'
import type { Doctor } from '@/lib/doctors'

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link
      href={`/medicos/${doctor.slug}`}
      className="public-panel flex h-full flex-col border border-subtle rounded-xl overflow-hidden hover:border-brand/50 transition-colors group"
    >
      <div>
        <Image
          src={doctor.photo}
          alt={doctor.name}
          width={doctor.photoWidth}
          height={doctor.photoHeight}
          sizes="(min-width: 768px) 368px, (min-width: 416px) 384px, calc(100vw - 32px)"
          className="block w-full h-auto"
        />
      </div>
      <div className="p-6 flex flex-1 flex-col">
        <h2 className="text-lg font-light mb-1">{doctor.name}</h2>
        <p className="text-brand text-xs font-mono mb-3">CMP {doctor.cmp}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {doctor.specialties.map(s => (
            <span key={s} className="bg-brand/10 text-brand text-xs px-2 py-0.5 rounded">
              <T>{s}</T>
            </span>
          ))}
        </div>
        <p className="text-faint text-xs font-mono mb-4">
          <T>{doctor.location}</T> · <T>{doctor.modality}</T>
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-brand text-xs font-mono group-hover:underline"><T>{"Ver perfil completo →"}</T></span>
          {doctor.counseling?.available && (
            <span className="text-xs font-mono bg-brand/10 text-brand px-2 py-0.5 rounded"><T>{"Consejería"}</T></span>
          )}
        </div>
      </div>
    </Link>
  )
}
