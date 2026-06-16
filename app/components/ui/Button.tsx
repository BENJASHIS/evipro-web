import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-black hover:bg-brand-hover',
  outline: 'border border-strong text-white hover:border-white/50',
}

const BASE = 'inline-block px-8 py-3 rounded font-mono text-sm transition-colors'

type Props = {
  variant: Variant
  children: ReactNode
  href?: string
  className?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}

export default function Button({
  variant, children, href, className = '', type = 'button', onClick, disabled,
}: Props) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`.trim()
  if (href) {
    return <Link href={href} className={cls}>{children}</Link>
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
