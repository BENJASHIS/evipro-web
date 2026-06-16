export default function CheckoutPending() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-yellow-400 text-6xl mb-6">⏳</p>
        <h1 className="text-2xl font-light mb-3">Pago en proceso</h1>
        <p className="text-muted text-sm mb-8">
          Tu pago está siendo verificado. Te notificaremos cuando se confirme.
          Esto puede tomar unos minutos.
        </p>
        <a
          href="/miembros"
          className="border border-strong hover:border-white/40 text-gray-300 px-8 py-3 rounded text-sm transition-colors"
        >
          Ir a mi área de miembro
        </a>
      </div>
    </main>
  )
}
