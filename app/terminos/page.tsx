import { localizedMetadata } from '@/lib/localized-metadata'
import { T } from '@/app/components/Language'
import { PRECIOS_CONSULTA, PRECIO_DOMICILIO } from '@/lib/consulta-pricing'

export const generateMetadata = () => localizedMetadata('/terminos', 'Términos y Condiciones · EVIPro',
  'Condiciones de uso, consultas y membresías de EVIPro. Revisa las condiciones del servicio antes de reservar.')

export default function TerminosPage() {
  return (
    <main className="public-page min-h-screen bg-ink text-white py-20 px-4">
      <div className="public-panel max-w-3xl mx-auto rounded-lg p-6 sm:p-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand mb-4">Legal</p>
        <h1 className="text-4xl font-light font-serif italic mb-2"><T>{"Términos y Condiciones"}</T></h1>
        <p className="text-faint text-xs font-mono mb-12"><T>{"Última actualización: agosto 2026"}</T></p>

        <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"1. Identificación del proveedor"}</T></h2>
            <p><T>{"El presente sitio web "}</T><strong className="text-white">evipro.pe</strong><T>{" es operado por "}</T><strong className="text-white">José Carlos Benjamín Jara Ovalle</strong><T>{", con RUC "}</T><strong className="text-white">10439904572</strong><T>{", con domicilio fiscal en la ciudad de Cusco, Perú. Correo de contacto: "}</T><a href="mailto:consulta@evipro.pe" className="text-brand hover:underline">consulta@evipro.pe</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"2. Objeto y aceptación"}</T></h2>
            <p><T>{"Estos Términos y Condiciones regulan el acceso y uso de la plataforma EVIPro: la contratación de membresías y el agendamiento de consultas médicas en cannabis medicinal, medicina de altura y las demás especialidades del equipo. Al completar el proceso de registro y pago, o al agendar una consulta, el usuario acepta estos términos en su totalidad."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"3. Descripción del servicio"}</T></h2>
            <p className="mb-3"><T>{"EVIPro ofrece dos cosas distintas, que se contratan por separado: "}</T><strong className="text-white"><T>{"consultas médicas"}</T></strong><T>{" y "}</T><strong className="text-white"><T>{"membresías"}</T></strong><T>{". El equipo médico lo forman el Dr. José Carlos Benjamín Jara Ovalle (CMP 82817, cannabis medicinal y medicina de altura) y el Dr. Shinvert Enmanuel Vera Sanchez (CMP 099649, gerontología y cuidados paliativos), con sede en Cusco, Perú."}</T></p>

            <h3 className="text-white font-light mb-2 mt-6"><T>{"3.1 Consulta médica"}</T></h3>
            <p className="mb-3"><T>{"La consulta médica es un acto médico: historia clínica, evaluación de interacciones, diagnóstico y, cuando corresponde, receta e inscripción en el RENPUC. "}</T><strong className="text-white"><T>{"No requiere membresía ni crear una cuenta"}</T></strong><T>{": se agenda con nombre y teléfono. El pago de la consulta "}</T><strong className="text-white"><T>{"no se cobra en línea"}</T></strong><T>{"; se realiza directamente al médico en el momento de la atención."}</T></p>
            <p className="mb-3"><T>{"El precio depende de la modalidad y de cuántas veces ha venido el paciente. Cada consulta de seguimiento cuesta la mitad de la anterior hasta la tercera; de la tercera en adelante se mantiene ese precio, que es el más bajo. Si transcurren 90 días sin volver, la cuenta reinicia desde la primera consulta. Tarifas vigentes en soles (1ª · 2ª · 3ª en adelante):"}</T></p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li><strong className="text-white"><T>{"Sin membresía:"}</T></strong><T>{" presencial "}</T>{PRECIOS_CONSULTA.presencial.regular.join(' · ')}<T>{" · virtual "}</T>{PRECIOS_CONSULTA.virtual.regular.join(' · ')}</li>
              <li><strong className="text-white"><T>{"Con Membresía Básica:"}</T></strong><T>{" presencial "}</T>{PRECIOS_CONSULTA.presencial.basica.join(' · ')}<T>{" · virtual "}</T>{PRECIOS_CONSULTA.virtual.basica.join(' · ')}</li>
              <li><strong className="text-white"><T>{"Con Membresía EVIPro:"}</T></strong><T>{" presencial "}</T>{PRECIOS_CONSULTA.presencial.evipro.join(' · ')}<T>{" · virtual "}</T>{PRECIOS_CONSULTA.virtual.evipro.join(' · ')}<T>{". El miembro que acaba de pagar o renovar inicia directamente en el segundo escalón, una vez por pago."}</T></li>
              <li><strong className="text-white"><T>{"Visita a domicilio:"}</T></strong><T>{" desde S/. "}</T>{PRECIO_DOMICILIO}<T>{", según distancia. No aplica la escala de seguimiento."}</T></li>
            </ul>
            <p className="mb-3"><T>{"El médico puede no prescribir si clínicamente no está indicado; la consulta se cobra igual, porque el servicio prestado es la evaluación médica."}</T></p>

            <h3 className="text-white font-light mb-2 mt-6"><T>{"3.2 Membresías"}</T></h3>
            <p className="mb-3"><T>{"La membresía no es la consulta: es acceso a contenido y condiciones preferentes. Los precios vigentes de cada membresía y de sus módulos opcionales son los publicados en "}</T><a href="/planes" className="text-brand hover:underline">evipro.pe/planes</a><T>{" al momento de la compra."}</T></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-white"><T>{"Membresía Básica:"}</T></strong><T>{" contenido para miembros, 1 ticket de sorteo y consultas a la tarifa Básica indicada arriba. Sin compromiso de permanencia."}</T></li>
              <li><strong className="text-white"><T>{"Membresía EVIPro:"}</T></strong><T>{" incluye evaluación y seguimiento en cannabis medicinal, receta solo si corresponde, apoyo con el trámite RENPUC, coordinación documentaria con farmacia autorizada y consultas a la tarifa EVIPro. Contratable por período mensual, trimestral o semestral."}</T></li>
              <li><strong className="text-white"><T>{"Módulo de especialista (opcional, solo sobre EVIPro):"}</T></strong><T>{" añade la atención en gerontología, cuidados paliativos y enfermedades crónicas con el Dr. Vera."}</T></li>
              <li><strong className="text-white"><T>{"Plan Turista Inicio:"}</T></strong><T>{" para visitantes nuevos en cannabis medicinal. Consulta virtual, receta solo si corresponde, apoyo RENPUC y coordinación documentaria con farmacia autorizada."}</T></li>
              <li><strong className="text-white"><T>{"Plan Turista Plus:"}</T></strong><T>{" para visitantes con tratamiento previo. Evaluación virtual de continuidad terapéutica, receta peruana solo si corresponde, apoyo RENPUC y coordinación documentaria con farmacia autorizada."}</T></li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"4. Proceso de contratación y pago"}</T></h2>
            <p><T>{"El pago "}</T><strong className="text-white"><T>{"de las membresías"}</T></strong><T>{" se realiza mediante tarjeta de crédito o débito a través de la pasarela de pagos "}</T><strong className="text-white">Mercado Pago</strong><T>{", certificada PCI-DSS. La consulta médica no se paga en línea: se abona directamente al médico. EVIPro no almacena ni procesa datos de tarjetas bancarias. Los cobros son recurrentes según el periodo seleccionado (quincenal, mensual, trimestral, semestral o anual). El usuario autoriza expresamente los cobros automáticos al contratar la membresía."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"5. Activación y acceso"}</T></h2>
            <p><T>{"El acceso al área de miembros se activa automáticamente una vez confirmado el pago. En caso de fallo en el procesamiento, el acceso permanece suspendido hasta regularizar el pago."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"6. Naturaleza del servicio médico"}</T></h2>
            <p><T>{"Los servicios de EVIPro son de naturaleza médica y requieren evaluación individualizada. El médico se reserva el derecho de no prescribir si clínicamente no está indicado. Las consultas no reemplazan atención de urgencia o emergencia. Para emergencias médicas, acuda al servicio de urgencias más cercano o llame al 106 (SAMU)."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"7. Protección de datos personales"}</T></h2>
            <p><T>{"El tratamiento de datos personales se rige por la "}</T><strong className="text-white"><T>{"Ley N.º 29733"}</T></strong><T>{" (Ley de Protección de Datos Personales del Perú). Los datos recopilados son utilizados exclusivamente para la prestación del servicio médico. Los documentos de identidad registrados desde la plataforma se cifran en servidor y el sitio solo muestra una pista enmascarada; la información clínica se protege mediante controles de acceso y uso limitado al equipo autorizado. El usuario puede solicitar acceso, rectificación, cancelación u oposición de sus datos escribiendo a "}</T><a href="mailto:consulta@evipro.pe" className="text-brand hover:underline">consulta@evipro.pe</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"8. Plan Turista: condiciones especiales"}</T></h2>
            <p className="mb-3"><T>{"Los planes Turista Inicio y Turista Plus están diseñados para personas que visitan el territorio peruano. Aplican las siguientes condiciones especiales:"}</T></p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong className="text-white"><T>{"Ámbito territorial:"}</T></strong><T>{" EVIPro opera exclusivamente dentro del territorio peruano. La atención médica, receta si corresponde y coordinación documentaria se realizan conforme a la legislación peruana."}</T></li>
              <li><strong className="text-white"><T>{"Farmacia autorizada:"}</T></strong><T>{" EVIPro no vende, almacena, transporta ni dispensa productos de cannabis. La preparación, dispensación, pago y entrega corresponden a farmacias autorizadas, según sus propios procedimientos."}</T></li>
              <li><strong className="text-white"><T>{"Transporte internacional:"}</T></strong><T>{" Cualquier traslado o uso de productos fuera del Perú es responsabilidad exclusiva del paciente, conforme a las leyes aplicables. EVIPro puede brindar orientación general si se solicita, sin asumir responsabilidad legal por el resultado."}</T></li>
              <li><strong className="text-white"><T>{"Plan quincenal (15 días):"}</T></strong><T>{" La preparación y dispensación por farmacia autorizada puede no completarse antes de la fecha de salida del paciente. Si EVIPro no puede prestar un componente del servicio contratado por causa imputable a EVIPro, aplica la política de reembolso sobre ese componente. No se reembolsan productos o servicios pagados directamente a terceros."}</T></li>
              <li><strong className="text-white"><T>{"Reserva pre-llegada:"}</T></strong><T>{" El paciente puede contratar el plan y agendar la consulta virtual desde su país de origen antes de viajar a Cusco."}</T></li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"9. Propiedad intelectual"}</T></h2>
            <p><T>{"Todo el contenido de EVIPro (textos médicos, guías, materiales educativos) es propiedad de José Carlos Benjamín Jara Ovalle y está protegido por las leyes de propiedad intelectual. Queda prohibida su reproducción sin autorización escrita."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"10. Modificaciones"}</T></h2>
            <p><T>{"EVIPro se reserva el derecho de modificar estos términos con previo aviso de 15 días calendario mediante correo electrónico al usuario registrado. El uso continuado del servicio tras la notificación implica aceptación de los cambios."}</T></p>
          </section>

          <section>
            <h2 className="text-white font-light text-lg mb-3"><T>{"11. Jurisdicción y ley aplicable"}</T></h2>
            <p><T>{"Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será sometida a la jurisdicción de los tribunales de la ciudad del Cusco, sin perjuicio del derecho del consumidor a recurrir al INDECOPI."}</T></p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-subtle flex flex-wrap gap-6 text-xs text-faint font-mono">
          <a href="/politica-devoluciones" className="hover:text-white transition-colors"><T>{"Política de cancelaciones →"}</T></a>
          <a href="/libro-reclamaciones" className="hover:text-white transition-colors"><T>{"Libro de reclamaciones →"}</T></a>
        </div>
      </div>
    </main>
  )
}
