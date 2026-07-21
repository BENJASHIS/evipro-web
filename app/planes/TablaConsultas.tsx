import { PRECIOS_CONSULTA } from '@/lib/consulta-pricing'

const FILAS: { label: string; modalidad: 'presencial' | 'virtual'; miembro: boolean }[] = [
  { label: 'Presencial · sin membresía', modalidad: 'presencial', miembro: false },
  { label: 'Presencial · miembro EVIPro', modalidad: 'presencial', miembro: true },
  { label: 'Virtual · sin membresía', modalidad: 'virtual', miembro: false },
  { label: 'Virtual · miembro EVIPro', modalidad: 'virtual', miembro: true },
]

/** Tabla informativa de precios de consulta (escalera de reconsulta). No cobra online;
 *  el precio se aplica al reservar. */
export default function TablaConsultas() {
  return (
    <div className="border border-subtle rounded-lg p-4 mb-16 bg-white/[0.02] overflow-x-auto">
      <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">Precios de consulta</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-faint text-[11px] font-mono uppercase tracking-widest">
            <th className="text-left font-normal pb-2">Modalidad</th>
            <th className="text-right font-normal pb-2">1ª</th>
            <th className="text-right font-normal pb-2">2ª (−50%)</th>
            <th className="text-right font-normal pb-2">3ª+</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map(f => {
            const [p1, p2, p3] = PRECIOS_CONSULTA[f.modalidad][f.miembro ? 'miembro' : 'noMiembro']
            return (
              <tr key={f.label} className={`border-t border-subtle/40 ${f.miembro ? 'text-white' : 'text-muted'}`}>
                <td className="py-2">{f.label}</td>
                <td className="py-2 text-right">S/. {p1}</td>
                <td className="py-2 text-right">S/. {p2}</td>
                <td className="py-2 text-right">S/. {p3}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-muted mt-3">Visita a domicilio: <span className="text-white">desde S/. 150</span> <span className="text-faint">(según distancia)</span></p>
      <p className="text-xs text-faint font-mono mt-2 leading-relaxed">
        La reconsulta cuesta la mitad de la primera; de la 3ª consulta en adelante, el piso.
        El descuento se aplica al reservar; reinicia si pasan 90 días sin volver.
        Miembro que acaba de pagar/renovar: su próxima consulta arranca directo a mitad de precio.
      </p>
    </div>
  )
}
