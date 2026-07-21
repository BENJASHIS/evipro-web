import { PRECIOS_CONSULTA } from '@/lib/consulta-pricing'

/** Línea compacta de precios de consulta para una tarjeta de plan (escalera 1ª→2ª→3ª+). */
export default function LineaConsultas({ esMiembro }: { esMiembro: boolean }) {
  const key = esMiembro ? 'miembro' : 'noMiembro'
  const p = PRECIOS_CONSULTA.presencial[key]
  const v = PRECIOS_CONSULTA.virtual[key]
  return (
    <span className="font-mono text-white">
      Presencial S/. {p[0]}→{p[1]}→{p[2]} · Virtual S/. {v[0]}→{v[1]}→{v[2]}
    </span>
  )
}
