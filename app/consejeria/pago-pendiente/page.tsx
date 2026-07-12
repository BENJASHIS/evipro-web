// Retorno de Mercado Pago cuando el pago de la consejería queda pendiente.
export default function ConsejeriaPagoPendientePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white px-6">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg text-center">
        <p className="text-4xl mb-4">⏳</p>
        <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2">Pago en proceso</p>
        <h1 className="text-2xl font-light text-white mb-4">Tu pago está en proceso</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          En cuanto se acredite, el equipo confirmará tu cita y te contactará por el medio
          que indicaste.
        </p>
        <a
          href="/miembros"
          className="block w-full py-3 bg-brand-deep hover:bg-brand-mid text-white rounded transition-colors text-sm"
        >
          Ver mis citas →
        </a>
        <p className="text-center text-xs text-faint mt-4 font-mono">
          ¿Dudas? consulta@evipro.pe
        </p>
      </div>
    </main>
  )
}
