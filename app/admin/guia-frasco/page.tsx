import { VIGENCIA_DEFECTO, VIGENCIAS_DIAS } from '@/lib/guia-frasco'
import GuiaFrascoForm from './GuiaFrascoForm'

export const metadata = { title: 'Guía del frasco · Admin EVIPro', robots: { index: false, follow: false } }

export default function GuiaFrascoAdminPage() {
  return <div className="max-w-xl">
    <h1 className="font-serif text-2xl mb-2">Guía del frasco</h1>
    <p className="text-sm text-muted mb-6">Genera un enlace con la composición del frasco recetado. El enlace no lleva nombre, DNI ni ningún otro dato del paciente.</p>
    <GuiaFrascoForm vigencias={[...VIGENCIAS_DIAS]} vigenciaDefecto={VIGENCIA_DEFECTO} />
  </div>
}
