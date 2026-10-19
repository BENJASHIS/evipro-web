import Link from 'next/link'
import { T } from '@/app/components/Language'
import { AMBITOS, colorFor, REGEN_VERSION, RECURSOS_AYUDA, type Color, type Resultado } from '@/lib/regen'

const LABELS: Record<Color, string> = {
  verde: 'Pocas dificultades reportadas',
  amarillo: 'Dificultades para revisar',
  rojo: 'Dificultades frecuentes reportadas',
}
const COLORS: Record<Color, string> = { verde: 'text-brand', amarillo: 'text-yellow-300', rojo: 'text-orange-300' }

export function RegenSupport() {
  return <aside className="border-l-2 border-brand bg-brand/5 p-5 space-y-4" aria-labelledby="regen-apoyo">
    <h2 id="regen-apoyo" className="text-xl font-serif"><T>Puedes buscar apoyo</T></h2>
    <p className="text-sm leading-relaxed"><T>Has indicado miedo, acoso o una situación de peligro. Aunque ocurra pocas veces, puedes pedir orientación. Este cuestionario no determina la gravedad ni descarta riesgos.</T></p>
    <p className="text-sm text-muted"><T>Si hay peligro inmediato, prioriza tu seguridad y busca ayuda de emergencia local cuando sea seguro hacerlo. Este formulario no se vigila en tiempo real.</T></p>
    <div>
      <Link href="/miembros/mensajes" className="inline-block text-brand underline py-1"><T>Escribe al equipo de EVIPro →</T></Link>
      <p className="text-xs text-muted"><T>Te leemos y respondemos por Mensajes. No es un servicio de emergencias.</T></p>
    </div>
    <p className="text-xs text-muted"><T>Líneas nacionales: pueden tardar o no atender en todas las zonas.</T></p>
    <ul className="divide-y divide-subtle">
      {RECURSOS_AYUDA.map(resource => <li key={resource.href} className="py-3">
        <p className="text-sm"><T>{resource.nombre}</T></p>
        <a href={resource.href} target={resource.href.startsWith('https') ? '_blank' : undefined}
          rel={resource.href.startsWith('https') ? 'noopener noreferrer' : undefined}
          className="inline-block text-brand underline py-1"><T>{resource.contacto}</T></a>
        <p className="text-xs text-muted"><T>{resource.detalle}</T>{resource.sourceUrl && <>{' '}
          <a href={resource.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline"><T>Fuente oficial ↗</T></a>
        </>}</p>
      </li>)}
    </ul>
  </aside>
}

export function RegenResult({ resultado }: { resultado: Resultado }) {
  const support = resultado.safetyTriggered || resultado.supportFlags.length > 0
  return <>
    {support && <div className="mb-6"><RegenSupport /></div>}
    <p className="text-xs text-muted"><T>El índice de cada ámbito va de 0 a 100: 0 si respondiste «Nunca» a todo y 100 si respondiste «Siempre» a todo. Muestra con qué frecuencia marcaste dificultades; no es un porcentaje de riesgo ni una nota.</T></p>
    <div className="divide-y divide-subtle">
    {AMBITOS.map(ambito => <section key={ambito.id} className="py-5">
      <h3 className="font-medium mb-2"><T>{ambito.nombre}</T></h3>
      <p className={`text-sm ${COLORS[resultado.colores[ambito.id]]}`}><T>{LABELS[resultado.colores[ambito.id]]}</T></p>
      <p className="text-xs text-muted mt-2"><T>Índice de respuestas</T>: {resultado.scores[ambito.id]}/100</p>
      {resultado.consejos[ambito.id].length > 0 && <ul className="mt-3 list-disc pl-5 text-sm text-muted space-y-2">
        {resultado.consejos[ambito.id].map(consejo => <li key={consejo}><T>{consejo}</T></li>)}
      </ul>}
    </section>)}
    </div>
  </>
}

export type RegenHistoryEntry = {
  created_at: string
  version: string
  scores: unknown
  flags: unknown
  safety_triggered: boolean
}

export function RegenHistory({ entries }: { entries: RegenHistoryEntry[] }) {
  return <section className="mt-12 border-t border-subtle pt-8">
    <h2 className="text-2xl font-serif mb-4"><T>Tu historial de Regen</T></h2>
    {entries.length === 0 ? <p className="text-sm text-muted"><T>Aún no hay evaluaciones guardadas.</T></p> : <div className="divide-y divide-subtle">
      {entries.map((entry, index) => {
        const date = new Date(entry.created_at)
        const support = entry.safety_triggered || Array.isArray(entry.flags) && entry.flags.length > 0
        const scores = entry.scores && typeof entry.scores === 'object' && !Array.isArray(entry.scores)
          ? entry.scores as Record<string, unknown> : {}
        return <details key={`${entry.created_at}-${index}`} className="py-4">
          <summary className="cursor-pointer text-sm">
            {Number.isFinite(date.getTime()) ? date.toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' }) : <T>Fecha no disponible</T>}
            {support && <span className="block text-brand mt-1"><T>Orientación de apoyo</T></span>}
          </summary>
          <p className="text-xs text-muted mt-3"><T>Versión</T>: {entry.version}</p>
          {entry.version !== REGEN_VERSION && <p className="text-xs text-muted mt-2"><T>Registro de una versión anterior. El contexto y la presentación pueden haber cambiado.</T></p>}
          {support && <p className="text-sm mt-3"><T>Se registraron señales para ofrecer orientación de apoyo. El puntaje no sustituye una evaluación individual.</T></p>}
          <ul className="mt-3 space-y-2 text-sm">
            {AMBITOS.map(ambito => {
              const score = scores[ambito.id]
              return <li key={ambito.id}><T>{ambito.nombre}</T>: {typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
                ? <>{score}/100{entry.version === REGEN_VERSION && <> · <T>{LABELS[colorFor(score)]}</T></>}</>
                : <T>Sin dato válido</T>}</li>
            })}
          </ul>
        </details>
      })}
    </div>}
    <p className="text-xs text-muted mt-4"><T>Se muestran hasta cinco evaluaciones recientes. Los índices describen respuestas; no son diagnósticos ni probabilidades de enfermedad.</T></p>
  </section>
}
