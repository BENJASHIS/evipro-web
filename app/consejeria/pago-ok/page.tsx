export default function ConsejeriaPagoOk() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-brand text-6xl mb-6">✓</p>
        <h1 className="text-2xl font-light mb-3">Pago confirmado</h1>
        <p className="text-muted text-sm mb-8">
          Tu reserva de consejería está registrada. El Dr. te contactará por WhatsApp
          en menos de 2 horas para confirmar tu sesión.
        </p>
        <a
          href="https://wa.me/51924074152"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-deep hover:bg-brand-mid text-white px-8 py-3 rounded text-sm transition-colors"
        >
          Ir a WhatsApp →
        </a>
      </div>
    </main>
  )
}
