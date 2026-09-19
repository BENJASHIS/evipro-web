import { localizedMetadata } from '@/lib/localized-metadata'
import { T } from '@/app/components/Language'

export const generateMetadata = () => localizedMetadata('/politica-devoluciones', 'Política de Cancelaciones · EVIPro',
  'Consulta las condiciones de cancelación y devolución aplicables a los servicios de EVIPro.')

export default function PoliticaDevolucionesPage() {
  return (
    <main className="public-page min-h-screen bg-ink text-white py-20 px-4">
      <div className="public-panel max-w-3xl mx-auto rounded-lg p-6 sm:p-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">Legal</p>
        <h1 className="text-4xl font-light font-serif italic mb-2"><T>{"Política de Cancelaciones y Reembolsos"}</T></h1>
        <p className="text-faint text-xs font-mono mb-12"><T>{"Última actualización: junio 2026"}</T></p>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"1. Cancelación de membresía"}</T></h2>
            <p><T>{"El suscriptor puede cancelar su membresía en cualquier momento desde el área de miembros o enviando un correo a "}</T><a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a><T>{". La cancelación tiene efecto al final del periodo ya pagado. No se realizan cobros adicionales tras la cancelación confirmada."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"2. Derecho de desistimiento (7 días)"}</T></h2>
            <p><T>{"Conforme al "}</T><strong className="text-white"><T>{"artículo 45 del Código de Protección y Defensa del Consumidor (Ley 29571)"}</T></strong><T>{", el consumidor tiene derecho a desistirse del contrato dentro de los "}</T><strong className="text-white"><T>{"7 días calendario"}</T></strong><T>{" siguientes a la contratación, siempre que no haya hecho uso del servicio (es decir, no haya realizado ninguna consulta ni accedido a contenido exclusivo). En ese caso, se reembolsará el 100% del monto pagado."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"3. Reembolsos por servicios no prestados"}</T></h2>
            <p><T>{"Si EVIPro no puede prestar el servicio por causas imputables al proveedor (indisponibilidad del médico, fuerza mayor prolongada), el suscriptor tiene derecho a reembolso proporcional al tiempo no utilizado del periodo pagado."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"4. No aplica reembolso"}</T></h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><T>{"Servicios ya prestados (consultas realizadas, recetas emitidas)."}</T></li>
              <li><T>{"Cancelación iniciada después de los 7 días cuando el servicio ha sido utilizado."}</T></li>
              <li><T>{"Inasistencia a consulta programada sin cancelación previa con al menos 24 horas de anticipación."}</T></li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"5. Proceso de solicitud de reembolso"}</T></h2>
            <p className="mb-3"><T>{"Para solicitar un reembolso, el suscriptor debe:"}</T></p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li><T>{"Enviar correo a "}</T><a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a><T>{' con asunto "Solicitud de reembolso".'}</T></li>
              <li><T>{"Indicar nombre completo, email de la cuenta y motivo."}</T></li>
              <li><T>{"Adjuntar comprobante de pago si está disponible."}</T></li>
            </ol>
            <p className="mt-3"><T>{"EVIPro procesará la solicitud en un plazo máximo de "}</T><strong className="text-white"><T>{"15 días hábiles"}</T></strong><T>{". El reembolso se realiza al mismo método de pago utilizado."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"6. Reprogramación de consultas"}</T></h2>
            <p><T>{"Las consultas pueden reprogramarse con un mínimo de "}</T><strong className="text-white"><T>{"24 horas de anticipación"}</T></strong><T>{" sin costo adicional. La reprogramación tardía o la inasistencia sin aviso previo no generan derecho a reembolso."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"7. Contacto"}</T></h2>
            <p><T>{"Para cualquier consulta sobre esta política: "}</T><a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a><T>{" o a través del "}</T><a href="/libro-reclamaciones" className="text-brand hover:underline"><T>{"Libro de Reclamaciones"}</T></a>.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-subtle flex flex-wrap gap-6 text-xs text-faint font-mono">
          <a href="/terminos" className="hover:text-white transition-colors"><T>{"Términos y Condiciones →"}</T></a>
          <a href="/libro-reclamaciones" className="hover:text-white transition-colors"><T>{"Libro de reclamaciones →"}</T></a>
        </div>
      </div>
    </main>
  )
}
