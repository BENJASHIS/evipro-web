// Retorno de Mercado Pago tras pagar una cita de consejería.
export default function ConsejeriaPagoOkPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ink text-white px-6">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg text-center">
        <p className="text-4xl mb-4">✓</p>
        <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2">Pago recibido</p>
        <h1 className="text-2xl font-light text-white mb-4">¡Tu cita está agendada!</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          Recibimos tu pago. El equipo confirmará tu cita y te contactará por el medio que
          indicaste. Si estás registrado, puedes verla en tu área de miembro.
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
