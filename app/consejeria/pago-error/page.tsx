// Retorno de Mercado Pago cuando el pago de la consejería no se aprueba.
export default function ConsejeriaPagoErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white px-6">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg text-center">
        <p className="text-4xl mb-4">✕</p>
        <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2">Pago no completado</p>
        <h1 className="text-2xl font-light text-white mb-4">El pago no se completó</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          No se realizó ningún cargo. Puedes volver a reservar tu cita e intentarlo de nuevo.
        </p>
        <a
          href="/consejeria"
          className="block w-full py-3 bg-brand-deep hover:bg-brand-mid text-white rounded transition-colors text-sm"
        >
          Volver a consejería →
        </a>
        <p className="text-center text-xs text-faint mt-4 font-mono">
          ¿Dudas? consulta@evipro.pe
        </p>
      </div>
    </main>
  )
}
