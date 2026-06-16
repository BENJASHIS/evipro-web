import Nav from '@/app/components/Nav'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import Card from '@/app/components/ui/Card'

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-32">
        <Badge className="mb-6">Cusco · Perú</Badge>
        <h1 className="text-5xl md:text-6xl font-light font-serif italic leading-tight mb-6 max-w-2xl">
          Medicina integral<br />al alcance de todos
        </h1>
        <p className="text-muted text-lg mb-10 max-w-xl">
          Accede a atención médica especializada en Cannabis Medicinal,
          Medicina de Altura, Gerontología, Cuidados Paliativos y más —
          con membresías desde S/. 59/mes.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" href="/planes">Ver planes →</Button>
          <Button variant="outline" href="/registro">Crear cuenta</Button>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-t border-subtle py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Cannabis Medicinal',
              desc: 'Seguimiento personalizado, recetas y coordinación con farmacia magistral.',
            },
            {
              title: 'Medicina de Altura',
              desc: 'Atención especializada para condiciones relacionadas con la altitud andina.',
            },
            {
              title: 'Salud Mental',
              desc: 'Consultas virtuales y presenciales con enfoque integral y sin estigma.',
            },
            {
              title: 'Gerontología',
              desc: 'Atención integral del adulto mayor con enfoque humanizado para el paciente y su familia.',
            },
            {
              title: 'Cuidados Paliativos',
              desc: 'Acompañamiento médico en enfermedades crónicas y procesos de cuidado avanzado.',
            },
            {
              title: 'Diabetes y Metabólico',
              desc: 'Manejo de diabetes, enfermedades crónicas no transmisibles y seguimiento metabólico.',
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-lg">
              <p className="text-brand text-xs font-mono uppercase tracking-widest mb-3">✓</p>
              <h3 className="text-lg font-light mb-2">{item.title}</h3>
              <p className="text-muted text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-light font-serif italic mb-4">¿Listo para comenzar?</h2>
        <p className="text-muted mb-8 text-sm font-mono">
          Membresías mensuales, trimestrales y semestrales · Cancela cuando quieras
        </p>
        <Button variant="primary" href="/planes" className="px-10">Ver todos los planes →</Button>
      </section>

      {/* Contacto */}
      <section className="border-t border-subtle py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Badge className="mb-4 text-center">Contacto</Badge>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Teléfono</p>
              <a href="tel:+51942185939" className="text-white hover:text-brand transition-colors font-light block">
                942 185 939
              </a>
              <a href="tel:+51924074152" className="text-muted hover:text-brand transition-colors font-light text-sm block mt-1">
                924 074 152
              </a>
            </div>
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Correo</p>
              <a href="mailto:consulta@evipro.pe" className="text-white hover:text-brand transition-colors font-light">
                consulta@evipro.pe
              </a>
            </div>
            <div className="border border-subtle rounded-lg p-6">
              <p className="text-xs font-mono text-faint uppercase tracking-widest mb-2">Consultorio</p>
              <p className="text-white font-light text-sm leading-relaxed">
                Av. Infancia 410 Consultorio 2<br />
                Wanchaq · Cusco, Perú
              </p>
              <p className="text-faint text-xs mt-1">Ref. frente a Subcafae</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
