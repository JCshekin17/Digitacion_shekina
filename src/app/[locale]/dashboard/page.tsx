'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Dashboard from '@/components/Dashboard'
import { ShieldAlert, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(true) // assume true if middleware lets us through
  const router = useRouter()
  const t = useTranslations('Dashboard')
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }



  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        aria-label={t('logout')}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('logout')}</span>
      </button>
      <Dashboard />
    </div>
  )
}

// Mostrar componente de acceso denegado si no tiene sesión
export function AccessDenied() {
  const router = useRouter()
  const t = useTranslations('Dashboard')
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4f6fa' }}>
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-[#110E3C] mb-2">{t('access_denied')}</h2>
        <p className="text-slate-500 text-sm mb-6">{t('no_permissions')}</p>
        <button onClick={() => router.push('/login')} className="btn-primary">
          {t('go_to_login')}
        </button>
      </div>
    </div>
  )
}
