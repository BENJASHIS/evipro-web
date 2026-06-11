import Link from 'next/link'

function LogoIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#0f1a0f" stroke="rgba(123,201,111,0.25)" strokeWidth="2" />
      {/* Rod */}
      <rect x="47.5" y="14" width="5" height="72" rx="2.5" fill="#7bc96f" />
      {/* Top orb */}
      <circle cx="50" cy="12" r="5.5" fill="#7bc96f" />
      {/* Snake */}
      <path
        d="M50,28 C66,34 66,44 50,50 C34,56 34,66 50,72"
        stroke="#a8e89c"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* Snake head */}
      <ellipse cx="51" cy="72" rx="8" ry="5.5" fill="#a8e89c" transform="rotate(-15,51,72)" />
      <circle cx="48" cy="70" r="1.8" fill="#0f1a0f" />
    </svg>
  )
}

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
      <Link href="/" className="flex items-center gap-2.5 group">
        <LogoIcon />
        <span className="font-serif italic text-lg tracking-tight text-white">EVIPro</span>
      </Link>
      <div className="flex items-center gap-6 text-xs font-mono text-gray-400">
        <Link href="/planes" className="hover:text-white transition-colors">Planes</Link>
        <Link href="/medicos" className="hover:text-white transition-colors">Médicos</Link>
        <Link href="/consejeria" className="hover:text-white transition-colors">Consejería</Link>
        <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
        <Link
          href="/registro"
          className="border border-[#7bc96f] text-[#7bc96f] px-4 py-1.5 rounded hover:bg-[#7bc96f] hover:text-black transition-colors"
        >
          Unirme
        </Link>
      </div>
    </nav>
  )
}
