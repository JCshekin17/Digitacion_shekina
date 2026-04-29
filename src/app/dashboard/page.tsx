'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
      }
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) router.push('/login')
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#070e1b] flex items-center justify-center">
      <div className="text-orange-500 animate-pulse font-black tracking-widest text-xs uppercase">Validando Acceso...</div>
    </div>
  )

  if (!session) return null

  return (
    <div className="relative">
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
      >
        Cerrar Sesión 🔒
      </button>
      <Dashboard />
    </div>
  )
}
