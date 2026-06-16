export default function ConsejeriaPagoPendiente() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-yellow-400 text-6xl mb-6">⏳</p>
        <h1 className="text-2xl font-light mb-3">Pago en verificación</h1>
        <p className="text-muted text-sm mb-8">
          Tu reserva está registrada y el pago siendo verificado. Te contactaremos
          por WhatsApp una vez confirmado.
        </p>
        <a
          href="/consejeria"
          className="border border-strong hover:border-white/40 text-gray-300 px-8 py-3 rounded text-sm transition-colors"
        >
          Volver a consejería
        </a>
      </div>
    </main>
  )
}
