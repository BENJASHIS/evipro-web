import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function Badge({ children, className = '' }: Props) {
  return (
    <p className={`text-xs tracking-widest text-brand uppercase font-mono ${className}`.trim()}>
      {children}
    </p>
  )
}
