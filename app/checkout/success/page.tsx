// Página de confirmación tras un pago aprobado en Mercado Pago.
// MP redirige aquí con auto_return:'approved'. La activación real de la
// membresía la hace el webhook (/api/webhooks/mercadopago) de forma asíncrona,
// por eso el copy no afirma "activa ya" sino "estamos activando".
// URL estable para el seguimiento de conversiones de Google Ads.
export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white px-6">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg text-center">
        <p className="text-4xl mb-4">✓</p>
        <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2">Pago recibido</p>
        <h1 className="text-2xl font-light text-white mb-4">¡Gracias por tu suscripción!</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          Estamos confirmando tu pago y activando tu membresía. En unos minutos la verás
          activa en tu área de miembro.
        </p>
        <a
          href="/miembros"
          className="block w-full py-3 bg-brand-deep hover:bg-brand-mid text-white rounded transition-colors text-sm"
        >
          Ir a mi área de miembro →
        </a>
        <p className="text-center text-xs text-faint mt-4 font-mono">
          ¿Dudas? consulta@evipro.pe
        </p>
      </div>
    </main>
  )
}
