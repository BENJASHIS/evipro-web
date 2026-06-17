export const metadata = { title: 'Política de Cancelaciones — EVIPro' }

export default function PoliticaDevolucionesPage() {
  return (
    <main className="min-h-screen bg-ink text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">Legal</p>
        <h1 className="text-4xl font-light font-serif italic mb-2">Política de Cancelaciones y Reembolsos</h1>
        <p className="text-faint text-xs font-mono mb-12">Última actualización: junio 2026</p>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-light text-lg mb-3">1. Cancelación de membresía</h2>
            <p>El suscriptor puede cancelar su membresía en cualquier momento desde el área de miembros o enviando un correo a <a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a>. La cancelación tiene efecto al final del periodo ya pagado. No se realizan cobros adicionales tras la cancelación confirmada.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">2. Derecho de desistimiento (7 días)</h2>
            <p>Conforme al <strong className="text-white">artículo 45 del Código de Protección y Defensa del Consumidor (Ley 29571)</strong>, el consumidor tiene derecho a desistirse del contrato dentro de los <strong className="text-white">7 días calendario</strong> siguientes a la contratación, siempre que no haya hecho uso del servicio (es decir, no haya realizado ninguna consulta ni accedido a contenido exclusivo). En ese caso, se reembolsará el 100% del monto pagado.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">3. Reembolsos por servicios no prestados</h2>
            <p>Si EVIPro no puede prestar el servicio por causas imputables al proveedor (indisponibilidad del médico, fuerza mayor prolongada), el suscriptor tiene derecho a reembolso proporcional al tiempo no utilizado del periodo pagado.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">4. No aplica reembolso</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Servicios ya prestados (consultas realizadas, recetas emitidas).</li>
              <li>Cancelación iniciada después de los 7 días cuando el servicio ha sido utilizado.</li>
              <li>Inasistencia a consulta programada sin cancelación previa con al menos 24 horas de anticipación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">5. Proceso de solicitud de reembolso</h2>
            <p className="mb-3">Para solicitar un reembolso, el suscriptor debe:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Enviar correo a <a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a> con asunto &quot;Solicitud de reembolso&quot;.</li>
              <li>Indicar nombre completo, email de la cuenta y motivo.</li>
              <li>Adjuntar comprobante de pago si está disponible.</li>
            </ol>
            <p className="mt-3">EVIPro procesará la solicitud en un plazo máximo de <strong className="text-white">15 días hábiles</strong>. El reembolso se realiza al mismo método de pago utilizado.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">6. Reprogramación de consultas</h2>
            <p>Las consultas pueden reprogramarse con un mínimo de <strong className="text-white">24 horas de anticipación</strong> sin costo adicional. La reprogramación tardía o la inasistencia sin aviso previo no generan derecho a reembolso.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">7. Contacto</h2>
            <p>Para cualquier consulta sobre esta política: <a href="mailto:reclamaciones@evipro.pe" className="text-brand hover:underline">reclamaciones@evipro.pe</a> o a través del <a href="/libro-reclamaciones" className="text-brand hover:underline">Libro de Reclamaciones</a>.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-subtle flex flex-wrap gap-6 text-xs text-faint font-mono">
          <a href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones →</a>
          <a href="/libro-reclamaciones" className="hover:text-white transition-colors">Libro de reclamaciones →</a>
        </div>
      </div>
    </main>
  )
}
