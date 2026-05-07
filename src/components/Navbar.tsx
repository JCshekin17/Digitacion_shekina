'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, PenSquare, Menu, X, Wallet } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/ventas',    label: 'Ingreso de Ventas', shortLabel: 'Ventas',    icon: <PenSquare className="w-4 h-4" /> },
    { href: '/caja',      label: 'Registro de Caja',   shortLabel: 'Caja',      icon: <Wallet className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Panel de Control',  shortLabel: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[#088DCF]/20 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/shekina-logo.png"
              alt="Shekina Tours y Logística"
              width={130}
              height={48}
              priority
              className="object-contain h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#088DCF] text-white shadow-md shadow-[#088DCF]/25'
                    : 'text-[#110E3C] hover:bg-[#088DCF]/10 hover:text-[#088DCF]'
                }`}
              >
                {link.icon}
                <span className="hidden md:inline">{link.label}</span>
                <span className="md:hidden">{link.shortLabel}</span>
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-[#110E3C] hover:bg-[#088DCF]/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#088DCF]/15 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-[#088DCF]/10 text-[#088DCF] border border-[#088DCF]/30'
                    : 'text-[#110E3C] hover:text-[#088DCF] hover:bg-[#088DCF]/05'
                }`}
              >
                {link.icon}
                <div>
                  <p className="font-bold">{link.label}</p>
                  <p className="text-xs text-slate-500 font-normal">
                    {link.href === '/ventas' ? 'Registrar nueva reserva' : link.href === '/caja' ? 'Control y arqueo de caja' : 'KPIs y reportes CSV'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
