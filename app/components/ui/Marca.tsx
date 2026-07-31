import Link from 'next/link'
import Image from 'next/image'

/** Logo + marca EVIPro. Estaba copiado a mano en cinco cabeceras y en dos de
 *  ellas se había quedado sin logo: aquí vive una sola vez.
 *
 *  `href` por defecto es la portada pública: desde el área de miembro o el
 *  admin, hacer clic en la marca es la forma de salir al sitio (moverte dentro
 *  del área es lo que hace el menú de al lado). */
export default function Marca({
  href = '/',
  sufijo,
  size = 32,
}: {
  href?: string
  sufijo?: string
  size?: number
}) {
  return (
    <Link href={href} className="flex items-center gap-2 shrink-0 w-fit" aria-label="EVIPro, ir al inicio">
      <Image
        src="/images/logo-evipro.png"
        alt=""
        width={size}
        height={size}
        className="rounded-full"
      />
      <span className="text-xl tracking-tight">
        <span className="font-bold text-white">EVI</span><span className="font-serif italic text-brand">Pro</span>
        {sufijo && <span className="text-muted font-mono text-sm ml-2">{sufijo}</span>}
      </span>
    </Link>
  )
}
