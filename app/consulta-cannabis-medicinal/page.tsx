import { localizedMetadata } from '@/lib/localized-metadata'
import { T } from '@/app/components/Language'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/app/components/Nav'
import Button from '@/app/components/ui/Button'
import { DOCTORS } from '@/lib/doctors'
import { precioConsulta } from '@/lib/consulta-pricing'
import { MEDICO } from '@/lib/home-content'
import { CONSULTA_PATH, SITE_URL } from '@/lib/seo'

export const generateMetadata = () => localizedMetadata(
  CONSULTA_PATH,
  'Consulta de cannabis medicinal: precios y reserva | EVIPro',
  'Evaluación con el Dr. Carlos Jara en Cusco o por teleconsulta en Perú. Consulta precios, qué incluye la atención y cómo reservar. Receta solo si corresponde.',
)

export default function ConsultaCannabisPage() {
  const doctor = DOCTORS.find(d => d.slug === 'dr-jara')!
  const agendar = `/medicos/${doctor.slug}/agendar`
  const modalidades = [
    { id: 'presencial' as const, nombre: 'Consulta presencial en Cusco', detalle: MEDICO.direccion },
    { id: 'virtual' as const, nombre: 'Consulta online en Perú', detalle: 'Teleconsulta con el médico. Coordina la fecha y el horario al reservar.' },
  ]
  // Describe únicamente la oferta visible. No declara eficacia, estrellas,
  // especialidades acreditadas ni horarios que no estén verificados.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Consulta de cannabis medicinal en Cusco y online',
    url: `${SITE_URL}${CONSULTA_PATH}`,
    serviceType: 'Consulta médica',
    areaServed: { '@type': 'Country', name: 'Perú' },
    provider: { '@type': 'Organization', name: 'EVIPro', url: SITE_URL },
    offers: modalidades.map(m => ({
      '@type': 'Offer', name: `${m.nombre} · primera consulta, tarifa regular`,
      price: precioConsulta(m.id, 'regular', 1), priceCurrency: 'PEN',
      url: `${SITE_URL}${CONSULTA_PATH}#modalidades`,
    })),
  }

  return (
    <main className="public-page min-h-screen bg-ink text-white">
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
      }} />
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <p className="text-brand text-xs font-mono uppercase tracking-widest mb-5"><T>{"Evaluación médica · Cusco y Perú"}</T></p>
        <h1 className="text-3xl md:text-5xl font-serif font-light leading-tight max-w-3xl mb-6"><T>{"Consulta de cannabis medicinal en Cusco y online"}</T></h1>
        <p className="text-muted text-lg leading-relaxed max-w-2xl mb-8"><T>{"Conversa con el médico sobre tu motivo de consulta, los tratamientos que utilizas y tus dudas. La evaluación determina si el cannabis medicinal corresponde a tu caso; reservar una consulta no garantiza una receta."}</T></p>
        <div className="flex flex-wrap gap-4 mb-14">
          <Button variant="primary" href={agendar}><T>{"Reservar con el Dr. Jara →"}</T></Button>
          <Button variant="outline" href="#modalidades"><T>{"Ver modalidades y precios"}</T></Button>
        </div>

        <section id="modalidades" className="public-panel scroll-mt-8 rounded-lg px-6 py-10 mb-10">
          <h2 className="text-2xl font-serif mb-3"><T>{"Modalidades y precios de consulta"}</T></h2>
          <p className="text-muted mb-6"><T>{"Tarifa regular, sin membresía. El precio corresponde a la atención médica."}</T></p>
          <div className="grid md:grid-cols-2 gap-8">
            {modalidades.map(m => (
              <div key={m.id} className="border-l-2 border-brand pl-5">
                <h3 className="text-lg mb-2"><T>{m.nombre}</T></h3>
                <p className="text-3xl mb-2">S/{precioConsulta(m.id, 'regular', 1)} <span className="text-sm text-muted"><T>{"primera consulta"}</T></span></p>
                <p className="text-muted text-sm mb-3"><T>{"Reconsulta: S/"}</T>{precioConsulta(m.id, 'regular', 2)}<T>{" · Desde la tercera: S/"}</T>{precioConsulta(m.id, 'regular', 3)}</p>
                <p className="text-sm text-muted leading-relaxed"><T>{m.detalle}</T></p>
              </div>
            ))}
          </div>
          <p className="text-muted text-sm mt-6"><T>{"Si tienes membresía, revisa las condiciones de tu "}</T><Link className="text-brand underline" href="/planes"><T>{"plan EVIPro"}</T></Link>.</p>
        </section>

        <section className="border-t border-subtle py-10 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-serif mb-4"><T>{"Qué se revisa en la consulta"}</T></h2>
            <ul className="list-disc pl-5 text-muted space-y-3 leading-relaxed">
              <li><T>{"Tu motivo de consulta, antecedentes y tratamientos actuales."}</T></li>
              <li><T>{"La pertinencia de un tratamiento y sus límites para tu situación."}</T></li>
              <li><T>{"Las indicaciones y el seguimiento que el médico considere necesarios."}</T></li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-serif mb-4"><T>{"Qué debes tener a mano"}</T></h2>
            <ul className="list-disc pl-5 text-muted space-y-3 leading-relaxed">
              <li><T>{"Tu documento de identidad."}</T></li>
              <li><T>{"La lista de medicamentos y suplementos que utilizas."}</T></li>
              <li><T>{"Informes o exámenes previos relacionados con tu consulta, si los tienes."}</T></li>
            </ul>
          </div>
        </section>

        <section className="border-t border-subtle py-10 flex flex-col sm:flex-row gap-6 items-start">
          <Image src={doctor.photo} alt={doctor.name} width={112} height={112} sizes="112px" className="w-28 h-28 rounded-lg object-cover object-top" />
          <div>
            <h2 className="text-2xl font-serif mb-3"><T>{"Quién te atiende"}</T></h2>
            <p className="mb-2">{doctor.name}</p>
            <p className="text-brand text-sm font-mono mb-3"><T>{"Médico Cirujano · CMP "}</T>{doctor.cmp}{doctor.rna ? ` · RNA ${doctor.rna}` : ''}</p>
            <p className="text-muted text-sm mb-4"><T>{"Atención presencial en Wanchaq, Cusco, y por teleconsulta."}</T></p>
            <Link href={`/medicos/${doctor.slug}`} className="text-brand underline"><T>{"Ver formación y perfil del médico →"}</T></Link>
          </div>
        </section>

        <section className="border-t border-subtle py-10">
          <h2 className="text-2xl font-serif mb-6"><T>{"Antes de reservar"}</T></h2>
          <div className="space-y-6 max-w-3xl text-muted leading-relaxed">
            <div><h3 className="text-white mb-2"><T>{"¿La consulta incluye el producto?"}</T></h3><p><T>{"No. EVIPro ofrece atención médica y no vende cannabis ni derivados. La adquisición del producto, si se prescribe, es independiente."}</T></p></div>
            <div><h3 className="text-white mb-2"><T>{"¿Necesito membresía?"}</T></h3><p><T>{"Puedes reservar a tarifa regular. Las membresías son una opción adicional; consulta sus condiciones antes de elegir."}</T></p></div>
            <div><h3 className="text-white mb-2"><T>{"¿Estoy reservando una consulta o comprando una receta?"}</T></h3><p><T>{"Una consulta médica. La receta se emite solo si corresponde tras la evaluación del profesional."}</T></p></div>
            <div><h3 className="text-white mb-2"><T>{"¿Voy a viajar a Cusco?"}</T></h3><p><T>{"Consulta la información del "}</T><Link href="/planes#turista" className="text-brand underline"><T>{"Plan Turista"}</T></Link><T>{" para conocer el acompañamiento disponible antes o durante tu viaje."}</T></p></div>
          </div>
        </section>
        <div className="border-t border-subtle pt-10 flex flex-wrap items-center gap-5">
          <Button variant="primary" href={agendar}><T>{"Elegir modalidad y reservar →"}</T></Button>
          <Link href={`https://wa.me/${doctor.whatsapp}`} className="text-brand underline"><T>{"Coordinar por WhatsApp"}</T></Link>
          <Link href="/politica-devoluciones" className="text-muted text-sm underline"><T>{"Política de cancelaciones"}</T></Link>
        </div>
      </div>
    </main>
  )
}
