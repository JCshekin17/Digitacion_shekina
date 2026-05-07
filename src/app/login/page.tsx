'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react'

// ── Rate limit client-side: max 5 intentos / 60s ──
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 60_000

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const attemptsRef = useRef(0)
  const lockedUntilRef = useRef<number>(0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // ── Client-side rate limit check ──
    const now = Date.now()
    if (lockedUntilRef.current > now) {
      const secsLeft = Math.ceil((lockedUntilRef.current - now) / 1000)
      setError(`Demasiados intentos fallidos. Intenta de nuevo en ${secsLeft} segundos.`)
      return
    }

    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError) {
      attemptsRef.current++
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        lockedUntilRef.current = Date.now() + LOCKOUT_MS
        attemptsRef.current = 0
        setError(`Cuenta bloqueada temporalmente por seguridad. Espera 60 segundos.`)
      } else {
        const remaining = MAX_ATTEMPTS - attemptsRef.current
        setError(`Credenciales incorrectas. Te quedan ${remaining} intentos.`)
      }
      setLoading(false)
    } else {
      attemptsRef.current = 0
      router.replace('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f4f6fa' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#088DCF]/10 p-8 animate-fade-in">

        {/* Header con logo */}
        <div className="text-center mb-8">
          <Image
            src="/shekina-logo.png"
            alt="Shekina Tours y Logística"
            width={180}
            height={66}
            priority
            className="object-contain h-16 w-auto mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#088DCF]" />
            <h1 className="text-xl font-black text-[#110E3C] tracking-tight">
              Acceso <span style={{ color: '#088DCF' }}>Privado</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm">Panel Administrativo — Shekina Tours y Logística</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label-corp" htmlFor="login-email">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-corp pl-10"
                placeholder="ejemplo@outlook.com"
              />
            </div>
          </div>

          <div>
            <label className="label-corp" htmlFor="login-password">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-corp pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#088DCF] focus:outline-none transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading
              ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Validando...</>)
              : 'Entrar al Panel'
            }
          </button>
        </form>

        <p className="text-center text-slate-400 text-[10px] mt-8 uppercase tracking-[0.15em]">
          Protección de Datos — Shekina Tours y Logística
        </p>
      </div>
    </div>
  )
}
