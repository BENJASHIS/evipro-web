export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-brand text-6xl mb-6">✓</p>
        <h1 className="text-2xl font-light mb-3">Pago aprobado</h1>
        <p className="text-muted text-sm mb-8">
          Tu membresía está siendo activada. Recibirás una confirmación en breve.
        </p>
        <a
          href="/miembros"
          className="bg-brand-deep hover:bg-brand-mid text-white px-8 py-3 rounded text-sm transition-colors"
        >
          Ir a mi área de miembro →
        </a>
      </div>
    </main>
  )
}
