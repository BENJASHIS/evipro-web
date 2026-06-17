import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  bordered?: boolean
  className?: string
  innerClassName?: string
}

export default function Section({
  children, bordered = false, className = '', innerClassName = '',
}: Props) {
  const sectionCls = `px-6 py-20 ${bordered ? 'border-t border-subtle' : ''} ${className}`.trim()
  return (
    <section className={sectionCls}>
      <div className={`max-w-5xl mx-auto ${innerClassName}`.trim()}>
        {children}
      </div>
    </section>
  )
}
