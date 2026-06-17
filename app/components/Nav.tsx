import Link from 'next/link'
import Image from 'next/image'

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
      <Link href="/" className="flex items-center gap-2 group">
        <Image
          src="/images/logo-evipro.png"
          alt="EVIPro"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-xl tracking-tight">
          <span className="font-bold text-white">EVI</span><span className="font-serif italic text-brand">Pro</span>
        </span>
      </Link>
      <div className="flex items-center gap-6 text-xs font-mono text-muted">
        <Link href="/planes" className="hover:text-white transition-colors">Planes</Link>
        <Link href="/medicos" className="hover:text-white transition-colors">Médicos</Link>
        <Link href="/consejeria" className="hover:text-white transition-colors">Consejería</Link>
        <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
        <Link
          href="/registro"
          className="border border-brand text-brand px-4 py-1.5 rounded hover:bg-brand hover:text-black transition-colors"
        >
          Unirme
        </Link>
      </div>
    </nav>
  )
}
