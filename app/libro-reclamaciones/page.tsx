'use client'
import { useState } from 'react'

const SERVICIOS = [
  'Plan Express (S/. 10/mes)',
  'Plan Cannabis (S/. 49/mes)',
  'Plan Integral (S/. 79/mes)',
  'Consulta virtual',
  'Consulta presencial',
  'Coordinación de farmacia',
  'Otro',
]

export default function LibroReclamacionesPage() {
  const [form, setForm] = useState({
    tipo: 'reclamo',
    full_name: '',
    dni: '',
    email: '',
    phone: '',
    servicio: '',
    descripcion: '',
    pretension: '',
  })
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      const data = await res.json()
      setCode(data.code)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error al enviar. Intenta de nuevo.')
    }
    setLoading(false)
  }

  if (code) {
    return (
      <main className="min-h-screen bg-[#080a08] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full border border-[#7bc96f]/30 rounded-lg p-8 text-center">
          <p className="text-[#7bc96f] text-xs font-mono uppercase tracking-widest mb-4">Reclamación registrada</p>
          <p className="text-gray-300 text-sm mb-6">Tu reclamación ha sido registrada exitosamente. Guarda este código de seguimiento:</p>
          <p className="text-3xl font-mono font-light text-white border border-white/10 rounded px-6 py-4 mb-6">{code}</p>
          <p className="text-gray-500 text-xs mb-8">Recibirás respuesta en <strong className="text-white">30 días calendario</strong> al correo <strong className="text-white">{form.email}</strong>. Para consultas escribe a <a href="mailto:reclamaciones@evipro.pe" className="text-[#7bc96f]">reclamaciones@evipro.pe</a> indicando tu código.</p>
          <a href="/" className="text-xs font-mono text-gray-500 hover:text-white transition-colors">← Volver al inicio</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080a08] text-white py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-widest text-[#7bc96f] mb-4">INDECOPI</p>
        <h1 className="text-4xl font-light font-serif italic mb-2">Libro de Reclamaciones</h1>
        <p className="text-gray-400 text-sm mb-2">Virtual — conforme a la Ley N.º 29571</p>
        <p className="text-gray-500 text-xs font-mono mb-10">
          Proveedor: José Carlos Benjamín Jara Ovalle · RUC 10439904572 · Cusco, Perú
        </p>

        <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 mb-8">
          <p className="text-yellow-400 text-xs font-mono leading-relaxed">
            ⚠️ La formulación de una queja o reclamo no impide acudir a otras vías de solución de controversias, incluyendo el INDECOPI (indecopi.gob.pe).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Tipo *</label>
            <div className="flex gap-4">
              {(['reclamo', 'queja'] as const).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={handleChange}
                    className="accent-[#7bc96f]" />
                  <span className="text-sm capitalize text-gray-300">{t}</span>
                  <span className="text-xs text-gray-600">
                    {t === 'reclamo' ? '(disconformidad con servicio)' : '(malestar sin pedido de compensación)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Datos del consumidor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'full_name', label: 'Nombre completo *', type: 'text', required: true },
              { name: 'dni', label: 'DNI / CE *', type: 'text', required: true },
              { name: 'email', label: 'Correo electrónico *', type: 'email', required: true },
              { name: 'phone', label: 'Teléfono', type: 'tel', required: false },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]"
                />
              </div>
            ))}
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Bien o servicio contratado *</label>
            <select name="servicio" value={form.servicio} onChange={handleChange} required
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f]">
              <option value="" disabled>Selecciona...</option>
              {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Descripción del reclamo / queja *</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={4}
              placeholder="Describe detalladamente lo ocurrido..."
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f] resize-none" />
          </div>

          {/* Pretensión */}
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">¿Qué solución solicitas? *</label>
            <textarea name="pretension" value={form.pretension} onChange={handleChange} required rows={3}
              placeholder="Ej: reembolso, reprogramación de consulta, disculpa formal..."
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7bc96f] resize-none" />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#2d5a27] hover:bg-[#4a8c42] text-white text-sm rounded transition-colors disabled:opacity-50">
            {loading ? 'Registrando...' : 'Registrar reclamación'}
          </button>

          <p className="text-xs text-gray-600 text-center font-mono">
            Al enviar aceptas que tus datos sean utilizados para gestionar tu reclamación · <a href="/terminos" className="hover:text-white">Términos</a>
          </p>
        </form>
      </div>
    </main>
  )
}
