import Link from 'next/link'

/** CTA único de las tarjetas de plan. `primary` = acento brand (EVIPro "Recomendado");
 *  `secondary` = subtle (Básica / Turista). Un solo tratamiento, dos variantes. */
export default function PlanCTA({ href, variant = 'secondary', children }:
  { href: string; variant?: 'primary' | 'secondary'; children: React.ReactNode }) {
  const base = 'block text-center rounded p-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand'
  const styles = variant === 'primary'
    ? 'border border-brand hover:bg-brand/10'
    : 'border border-subtle hover:border-brand'
  return <Link href={href} className={`${base} ${styles}`}>{children}</Link>
}
