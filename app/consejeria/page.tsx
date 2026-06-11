import type { Metadata } from 'next'
import Nav from '@/app/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Consejería — EVIPro',
  description: 'Orientación médica especializada con los especialistas de EVIPro.',
}

export default function ConsejeriaPage() {
  return (
    <main className="min-h-screen bg-[#080a08] text-white">
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-32 text-center">
        <p className="text-xs tracking-widest text-[#7bc96f] uppercase mb-4 font-mono">Próximamente</p>
        <h1 className="text-4xl font-light font-serif italic mb-6">Consejería Especializada</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm">
          Sesiones cortas con nuestros especialistas. Para nuevos pacientes y dudas entre consultas.
          Disponible muy pronto.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/medicos"
            className="border border-white/20 text-white px-6 py-2.5 rounded font-mono text-sm hover:border-white/50 transition-colors"
          >
            Ver equipo médico
          </Link>
          <a
            href="https://wa.me/51942185939"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#7bc96f] text-black px-6 py-2.5 rounded font-mono text-sm hover:bg-[#6ab85f] transition-colors"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
