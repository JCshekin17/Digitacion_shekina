'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { setGlobalCatalogSettings } from '@/lib/catalogStorage'
import TourCard from '@/components/TourCard'
import { ServiceItem } from '@/lib/services'
import Link from 'next/link'
import { ShoppingCart, X, Trash2, CreditCard } from 'lucide-react'
import CheckoutModal, { CartItem } from '@/components/CheckoutModal'

interface ServiceWithImages extends ServiceItem {
  images: string[]
}

interface CatalogGridProps {
  services: ServiceWithImages[]
  initialHideWithoutPhotos?: boolean
}

export default function CatalogGrid({ services, initialHideWithoutPhotos = false }: CatalogGridProps) {
  const [hideWithoutPhotos, setHideWithoutPhotos] = useState(initialHideWithoutPhotos)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'shekinatoursylogistica@outlook.com') {
        setIsAdmin(true)
      }
    }
    checkUser()
  }, [])

  const filteredServices = hideWithoutPhotos
    ? services.filter(s => s.images.length > 0)
    : services

  const handleAddToCart = (service: ServiceItem, date: string, pax: number) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      service,
      pax,
      date,
      basePrice: service.price * pax
    }
    setCartItems(prev => [...prev, newItem])
    setIsCartOpen(true) // Open cart when item is added
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const cartTotal = cartItems.reduce((acc, item) => acc + item.basePrice, 0)

  return (
    <div>
      {/* Admin Controls */}
      {isAdmin && (
        <div className="mb-6 flex flex-col sm:flex-row justify-end items-center gap-4">
          <Link 
            href="/admin/catalog" 
            className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Administrar Fotos
          </Link>
          <label className={`flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-sm font-medium ${isSaving ? 'opacity-50 text-slate-400' : 'text-slate-700'}`}>
            <input
              type="checkbox"
              disabled={isSaving}
              checked={hideWithoutPhotos}
              onChange={async (e) => {
                const newVal = e.target.checked;
                setHideWithoutPhotos(newVal);
                setIsSaving(true);
                const result = await setGlobalCatalogSettings({ hideWithoutPhotos: newVal });
                setIsSaving(false);
                if (!result.success) {
                  setHideWithoutPhotos(!newVal);
                  alert("Error al guardar: " + result.error + "\n\nAsegúrate de haber ejecutado el SQL en Supabase o revisa el nombre del bucket.");
                }
              }}
              className="rounded text-[#088DCF] focus:ring-[#088DCF] w-4 h-4 disabled:opacity-50"
            />
            {isSaving ? 'Guardando...' : 'Ocultar servicios sin fotos'}
          </label>
        </div>
      )}

      {/* Floating Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#088DCF] text-white p-4 rounded-full shadow-2xl hover:bg-[#0670A6] hover:scale-105 transition-all flex items-center justify-center group"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartItems.length}
            </span>
          </div>
        </button>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-black text-[#110E3C] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#088DCF]" /> Tu Carrito
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#110E3C] leading-tight pr-6">{item.service.name}</h4>
                      <div className="text-xs text-slate-500 mt-1">Fecha: {item.date}</div>
                      <div className="text-xs text-slate-500">Personas (Pax): {item.pax}</div>
                      <div className="text-[#088DCF] font-bold text-sm mt-1">
                        ${item.basePrice.toLocaleString('es-CO')}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-600 font-semibold">Subtotal</span>
                  <span className="text-xl font-black text-[#110E3C]">${cartTotal.toLocaleString('es-CO')}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                  className="w-full bg-[#088DCF] text-white py-3 rounded-xl font-bold hover:bg-[#0670A6] shadow-lg shadow-[#088DCF]/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" /> Proceder al Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        cartItems={cartItems}
        onSuccess={() => setCartItems([])}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredServices.map((service, idx) => (
          <TourCard key={idx} service={service} images={service.images} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No hay servicios disponibles con las opciones seleccionadas.
        </div>
      )}
    </div>
  )
}
