import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: Props) {
  return (
    <div className={`border border-subtle rounded p-6 ${className}`.trim()}>
      {children}
    </div>
  )
}
