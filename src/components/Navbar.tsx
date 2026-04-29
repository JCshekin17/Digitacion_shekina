'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(37,99,168,0.3)] bg-[rgba(7,14,26,0.97)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo / Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <div>
              <p className="text-white font-bold text-xs sm:text-sm leading-none">Reservas Shekina</p>
              <p className="text-orange-400 font-black text-xs leading-none tracking-widest">2.0</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/ventas"
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                pathname === '/ventas'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ✏️ <span className="hidden md:inline">Ingreso de </span>Ventas
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📊 <span className="hidden md:inline">Panel de </span>Control
            </Link>
            <span className="badge badge-blue hidden lg:inline-block ml-2">Shekina Tours</span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[rgba(37,99,168,0.2)] bg-[rgba(7,14,26,0.98)]">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/ventas"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/ventas'
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">✏️</span>
              <div>
                <p className="font-bold">Ingreso de Ventas</p>
                <p className="text-xs text-slate-500 font-normal">Registrar nueva reserva</p>
              </div>
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">📊</span>
              <div>
                <p className="font-bold">Panel de Control</p>
                <p className="text-xs text-slate-500 font-normal">KPIs y reportes CSV</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
