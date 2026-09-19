import { T } from '@/app/components/Language'
// Retorno de Mercado Pago cuando el pago de la membresía no se aprueba.
export default function CheckoutFailurePage() {
  return (
    <main className="public-page min-h-screen flex items-center justify-center bg-ink text-white px-6">
      <div className="w-full max-w-sm p-8 border border-subtle rounded-lg text-center">
        <p className="text-4xl mb-4">✕</p>
        <p className="text-xs text-brand font-mono uppercase tracking-widest mb-2"><T>{"Pago no completado"}</T></p>
        <h1 className="text-2xl font-light text-white mb-4"><T>{"El pago no se completó"}</T></h1>
        <p className="text-muted text-sm mb-8 leading-relaxed"><T>{"No se realizó ningún cargo. Puedes intentarlo de nuevo o probar otro medio de pago."}</T></p>
        <a
          href="/planes"
          className="block w-full py-3 bg-brand-deep hover:bg-brand-mid text-white rounded transition-colors text-sm"
        ><T>{"Volver a los planes →"}</T></a>
        <p className="text-center text-xs text-faint mt-4 font-mono"><T>{"¿Dudas? consulta@evipro.pe"}</T></p>
      </div>
    </main>
  )
}
