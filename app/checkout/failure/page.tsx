export default function CheckoutFailure() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-red-400 text-6xl mb-6">✗</p>
        <h1 className="text-2xl font-light mb-3">Pago rechazado</h1>
        <p className="text-muted text-sm mb-8">
          El pago no pudo procesarse. Puedes intentarlo de nuevo o contactarnos.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/planes"
            className="bg-brand-deep hover:bg-brand-mid text-white px-6 py-3 rounded text-sm transition-colors"
          >
            Intentar de nuevo
          </a>
          <a
            href="https://wa.me/51924074152"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-strong hover:border-white/40 text-gray-300 px-6 py-3 rounded text-sm transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}
