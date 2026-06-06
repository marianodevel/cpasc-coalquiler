'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()

  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos.')
        setLoading(false)
        return
      }
    }

    router.push(redirectTo ?? '/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
          required
          minLength={8}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full text-sm font-medium bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {mode === 'login' ? '¿Primera vez? Crear cuenta' : '¿Ya tenés cuenta? Ingresar'}
      </button>
    </form>
  )
}
