'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas o usuario no registrado.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#070e1b] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-orange-500/10 mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Acceso <span className="text-orange-400">Privado</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Panel Administrativo Shekina Tours</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label-corp">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-corp"
              placeholder="ejemplo@outlook.com"
            />
          </div>
          <div>
            <label className="label-corp">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-corp"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'VALIDANDO...' : 'ENTRAR AL PANEL'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Protección de Datos — Shekina Tours y Logística
        </p>
      </div>
    </div>
  )
}
