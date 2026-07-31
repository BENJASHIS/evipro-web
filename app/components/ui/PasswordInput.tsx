'use client'
import { useState } from 'react'

const INPUT = 'w-full bg-white/5 border border-subtle rounded px-3 py-2 pr-12 text-white text-sm focus:outline-none focus:border-brand'

/** Campo de contraseña con ojo para verla. Un solo campo (no repetido): con el
 *  ojo, confirmar la contraseña estorba más de lo que evita. */
export default function PasswordInput({
  id = 'password',
  name = 'password',
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  id?: string
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete: 'current-password' | 'new-password'
  minLength?: number
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className={INPUT}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 px-3 text-faint hover:text-white transition-colors"
      >
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  )
}
