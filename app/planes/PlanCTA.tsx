import Link from 'next/link'

/** CTA único de las tarjetas de plan.
 *  primary = acción recomendada EVIPro; secondary = plan de apoyo; turista = ruta de viaje. */
export default function PlanCTA({ href, variant = 'secondary', children }:
  { href: string; variant?: 'primary' | 'secondary' | 'turista'; children: React.ReactNode }) {
  const base = 'block text-center rounded p-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand'
  const styles = {
    primary: 'bg-brand text-black hover:bg-brand-hover',
    secondary: 'border border-subtle text-white hover:border-brand',
    turista: 'bg-yellow-400 text-black hover:bg-yellow-300',
  }[variant]
  return <Link href={href} className={`${base} ${styles}`}>{children}</Link>
}
