import { T } from '@/app/components/Language'
import { PRECIOS_CONSULTA, type TarifaConsulta } from '@/lib/consulta-pricing'

/** Precio de 1ª consulta (presencial/virtual) para una tarjeta de plan, con pista
 *  de que la reconsulta baja a la mitad. El detalle completo va en la nota al pie. */
export default function LineaConsultas({ tarifa }: { tarifa: TarifaConsulta }) {
  const presencial = PRECIOS_CONSULTA.presencial[tarifa][0]
  const virtual = PRECIOS_CONSULTA.virtual[tarifa][0]
  return (
    <span className="text-muted">
      <span className="font-mono text-white"><T>{"Presencial S/. "}</T>{presencial}<T>{" · Virtual S/. "}</T>{virtual}</span>{' '}
      <span className="text-faint"><T>{"(reconsulta a mitad)"}</T></span>
    </span>
  )
}
