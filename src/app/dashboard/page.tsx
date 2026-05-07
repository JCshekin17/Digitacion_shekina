'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'
import { ShieldAlert, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      // ✅ Usar getUser() en lugar de getSession() — valida JWT en el servidor
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) {
        router.replace('/login')
      } else {
        setAuthenticated(true)
      }
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthenticated(false)
        router.replace('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fa' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#088DCF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#110E3C] font-bold text-xs uppercase tracking-widest">Validando Acceso...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        aria-label="Cerrar Sesión"
        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>
      <Dashboard />
    </div>
  )
}

// Mostrar componente de acceso denegado si no tiene sesión
export function AccessDenied() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fa' }}>
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-[#110E3C] mb-2">Acceso Denegado</h2>
        <p className="text-slate-500 text-sm mb-6">No tienes permisos para ver esta página.</p>
        <button onClick={() => router.push('/login')} className="btn-primary">
          Ir al Login
        </button>
      </div>
    </div>
  )
}
