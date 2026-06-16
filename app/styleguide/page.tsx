import Button from '@/app/components/ui/Button'
import Card from '@/app/components/ui/Card'
import Section from '@/app/components/ui/Section'
import Badge from '@/app/components/ui/Badge'

const SWATCHES = [
  'bg-brand', 'bg-brand-hover', 'bg-brand-mid', 'bg-brand-deep',
  'bg-ink', 'bg-surface', 'bg-surface-2',
]

export default function StyleGuide() {
  return (
    <main className="min-h-screen">
      <Section>
        <Badge>Sistema de diseño</Badge>
        <h1 className="text-4xl font-serif italic mb-10">EVIPro · Styleguide</h1>

        <h2 className="font-mono text-sm text-muted uppercase mb-4">Colores</h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-12">
          {SWATCHES.map((c) => (
            <div key={c}>
              <div className={`${c} h-16 rounded border border-subtle`} />
              <p className="text-xs font-mono text-faint mt-2">{c}</p>
            </div>
          ))}
        </div>

        <h2 className="font-mono text-sm text-muted uppercase mb-4">Botones</h2>
        <div className="flex gap-4 mb-12">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
        </div>

        <h2 className="font-mono text-sm text-muted uppercase mb-4">Card</h2>
        <Card className="mb-12 max-w-sm">
          <p className="text-muted">Contenido de ejemplo dentro de una Card.</p>
        </Card>

        <h2 className="font-mono text-sm text-muted uppercase mb-4">Tipografía</h2>
        <p className="font-serif italic text-3xl mb-2">Título serif (Lora)</p>
        <p className="font-sans mb-2">Cuerpo sans (Geist)</p>
        <p className="font-mono text-sm text-muted">Mono (Geist Mono)</p>
      </Section>
    </main>
  )
}
