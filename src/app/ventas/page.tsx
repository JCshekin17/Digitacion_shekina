'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SalesForm from '@/components/SalesForm'

export default function VentasPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
      } else {
        setAuthenticated(true)
      }
      setLoading(false)
    }
    checkUser()
  }, [router])

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

  return <SalesForm />
}
