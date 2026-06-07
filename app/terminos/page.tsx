export const metadata = { title: 'Términos y Condiciones — EVIPro' }

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#080a08] text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-4">Legal</p>
        <h1 className="text-4xl font-light font-serif italic mb-2">Términos y Condiciones</h1>
        <p className="text-gray-500 text-xs font-mono mb-12">Última actualización: junio 2026</p>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-light text-lg mb-3">1. Identificación del proveedor</h2>
            <p>El presente sitio web <strong className="text-white">evipro.pe</strong> es operado por <strong className="text-white">José Carlos Benjamín Jara Ovalle</strong>, con RUC <strong className="text-white">10439904572</strong>, con domicilio fiscal en la ciudad de Cusco, Perú. Correo de contacto: <a href="mailto:consultas@evipro.pe" className="text-[#7bc96f] hover:underline">consultas@evipro.pe</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">2. Objeto y aceptación</h2>
            <p>Estos Términos y Condiciones regulan el acceso y uso de la plataforma EVIPro, incluyendo la contratación de membresías de atención médica en Medicina Integral y Cannabis Medicinal. Al completar el proceso de registro y pago, el usuario acepta estos términos en su totalidad.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">3. Descripción del servicio</h2>
            <p className="mb-3">EVIPro ofrece membresías médicas con acceso a consultas virtuales y/o presenciales con el Dr. José Carlos Jara Ovalle (CMP por verificar), especialista en Medicina Integral y Cannabis Medicinal con sede en Cusco, Perú. Los planes disponibles son:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white">Plan Express</strong> (S/. 10/mes): 1 consulta virtual de 15 minutos + receta digital.</li>
              <li><strong className="text-white">Plan Cannabis</strong> (S/. 49/mes): Consultas de seguimiento a precio preferencial, receta incluida, apoyo RENPUC, coordinación con farmacia magistral.</li>
              <li><strong className="text-white">Plan Integral</strong> (S/. 79/mes): Consultas virtuales y presenciales a precio preferencial, todos los beneficios Cannabis más.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">4. Proceso de contratación y pago</h2>
            <p>El pago se realiza mediante tarjeta de crédito o débito a través de la pasarela de pagos <strong className="text-white">Culqi</strong>, certificada PCI-DSS. EVIPro no almacena ni procesa datos de tarjetas bancarias. Los cobros son recurrentes según el periodo seleccionado (mensual, trimestral, semestral o anual). El usuario autoriza expresamente los cobros automáticos al contratar la membresía.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">5. Activación y acceso</h2>
            <p>El acceso al área de miembros se activa automáticamente una vez confirmado el pago. En caso de fallo en el procesamiento, el acceso permanece suspendido hasta regularizar el pago.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">6. Naturaleza del servicio médico</h2>
            <p>Los servicios de EVIPro son de naturaleza médica y requieren evaluación individualizada. El médico se reserva el derecho de no prescribir si clínicamente no está indicado. Las consultas no reemplazan atención de urgencia o emergencia. Para emergencias médicas, acuda al servicio de urgencias más cercano o llame al 106 (SAMU).</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">7. Protección de datos personales</h2>
            <p>El tratamiento de datos personales se rige por la <strong className="text-white">Ley N.º 29733</strong> (Ley de Protección de Datos Personales del Perú). Los datos recopilados son utilizados exclusivamente para la prestación del servicio médico. Los datos sensibles (DNI, historia clínica) se almacenan de forma encriptada y solo son accesibles por el médico titular. El usuario puede solicitar acceso, rectificación, cancelación u oposición de sus datos escribiendo a <a href="mailto:consultas@evipro.pe" className="text-[#7bc96f] hover:underline">consultas@evipro.pe</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">8. Propiedad intelectual</h2>
            <p>Todo el contenido de EVIPro (textos médicos, guías, materiales educativos) es propiedad de José Carlos Benjamín Jara Ovalle y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización escrita.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">9. Modificaciones</h2>
            <p>EVIPro se reserva el derecho de modificar estos términos con previo aviso de 15 días calendario mediante correo electrónico al usuario registrado. El uso continuado del servicio tras la notificación implica aceptación de los cambios.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3">10. Jurisdicción y ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los tribunales de la ciudad del Cusco, sin perjuicio del derecho del consumidor a recurrir al INDECOPI.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 text-xs text-gray-600 font-mono">
          <a href="/politica-devoluciones" className="hover:text-white transition-colors">Política de cancelaciones →</a>
          <a href="/libro-reclamaciones" className="hover:text-white transition-colors">Libro de reclamaciones →</a>
        </div>
      </div>
    </main>
  )
}
