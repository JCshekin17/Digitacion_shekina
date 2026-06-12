'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { COUNTRIES, getCitiesByCountry } from '@/lib/countries'
import { X, CheckCircle2, XCircle } from 'lucide-react'
import { ServiceItem, normalizeServiceName } from '@/lib/services'

const HOTELS = [
  'HERNANDEZ SUITE',
  'TERRAZ DEL CABRERO',
  'BETTER GROUP',
  'BAHARI SUITE',
  'CASA TURBAY',
  'CONDOMINIO MONTU',
  'OTRO',
]

// ── Combobox de país con autocompletado ──────────────────────
interface CountryComboboxProps {
  value: string
  onChange: (country: string) => void
}

function CountryCombobox({ value, onChange }: CountryComboboxProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered =
    query.length >= 3
      ? COUNTRIES.filter((c) =>
          c.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 12)
      : []

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        const exact = COUNTRIES.find((c) => c.name.toLowerCase() === query.toLowerCase())
        if (!exact) {
          setQuery('')
          onChange('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query, onChange])

  function select(name: string) {
    setQuery(name)
    onChange(name)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(filtered[highlighted].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          id="country"
          type="text"
          autoComplete="off"
          placeholder="Escribe 3 letras para buscar..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlighted(0)
            setOpen(true)
          }}
          onFocus={() => query.length >= 3 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="input-corp pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
          🔍
        </span>
      </div>

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 rounded-xl border border-[rgba(37,99,168,0.4)] overflow-hidden shadow-2xl"
          style={{ background: '#0d1f38', maxHeight: '220px', overflowY: 'auto' }}
        >
          {filtered.map((c, i) => (
            <li
              key={c.name}
              onMouseDown={() => select(c.name)}
              className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
              style={{
                background: i === highlighted ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: i === highlighted ? '#fb923c' : '#cbd5e1',
                borderBottom: '1px solid rgba(30,58,95,0.3)',
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}

      {open && query.length >= 3 && filtered.length === 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border border-[rgba(37,99,168,0.3)] px-4 py-3 text-sm text-slate-500"
          style={{ background: '#0d1f38' }}
        >
          Sin resultados para &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export interface CartItem {
  id: string;
  service: ServiceItem;
  pax: number;
  date: string;
  basePrice: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, cartItems, onSuccess }: CheckoutModalProps) {
  const INITIAL_FORM = {
    customer_name: '',
    passport_id: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    hotel: '',
    room: '',
    deposit: 0,
    payment_method: 'Link de Pago',
  }

  const [form, setForm] = useState(INITIAL_FORM)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [customHotel, setCustomHotel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.basePrice, 0)
  
  // Recargo 7% para Datafono o Link de Pago
  const appliesSurcharge = form.payment_method === 'Datafono' || form.payment_method === 'Link de Pago'
  const surcharge = appliesSurcharge ? totalCartPrice * 0.07 : 0
  const finalTotalPrice = totalCartPrice + surcharge
  const balance = finalTotalPrice - (form.deposit || 0)

  useEffect(() => {
    if (form.country) {
      const cities = getCitiesByCountry(form.country)
      setAvailableCities(cities)
      setForm((prev) => ({ ...prev, city: cities[0] ?? '' }))
    } else {
      setAvailableCities([])
      setForm((prev) => ({ ...prev, city: '' }))
    }
  }, [form.country])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      let finalValue: string | number = type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
      setForm((prev) => ({ ...prev, [name]: finalValue }))
    },
    []
  )

  const handleCountryChange = useCallback((country: string) => {
    setForm((prev) => ({ ...prev, country, city: '' }))
  }, [])

  function buildWhatsAppMessage() {
    const finalHotel = form.hotel === 'OTRO' ? customHotel : form.hotel

    const servicesList = cartItems.map(s => {
      let serviceText = `• ${s.pax}x ${s.service.name} (${s.date})`;
      if (s.service.description) {
        serviceText += `\n\n📝 *Detalles del Servicio:*\n${s.service.description}\n`;
      }
      return serviceText;
    }).join('\n\n----------------------------\n\n')

    const lines = [
      `*Nueva Reserva Web - Shekina 2.0* 🌴`,
      ``,
      `📅 *Fecha de Reserva:* ${new Date().toISOString().split('T')[0]}`,
      ``,
      `👤 *DATOS DEL CLIENTE*`,
      `• Nombre: ${form.customer_name}`,
      `• Pasaporte/ID: ${form.passport_id || 'N/A'}`,
      `• Teléfono: ${form.phone || 'N/A'}`,
      `• Email: ${form.email || 'N/A'}`,
      `• País: ${form.country || 'N/A'}`,
      `• Ciudad: ${form.city || 'N/A'}`,
      ``,
      `🏨 *DETALLES DE LA RESERVA*`,
      `• Hotel: ${finalHotel || 'N/A'}`,
      `• Habitación: ${form.room || 'N/A'}`,
      `• Asesor: WEB`,
      ``,
      `🎒 *SERVICIOS ADQUIRIDOS*`,
      servicesList,
      ``,
      `💰 *FINANCIERO*`,
      `• Valor del Producto: ${formatCurrency(totalCartPrice)}`,
      surcharge > 0 ? `• Recargo (7% pasarela): ${formatCurrency(surcharge)}` : null,
      `• Precio Total: ${formatCurrency(finalTotalPrice)}`,
      `• Abono: ${formatCurrency(form.deposit)}`,
      `• Método de Pago: ${form.payment_method || 'N/A'}`,
      `• *Saldo Pendiente: ${formatCurrency(balance)}*`,
      ``,
      `_Registrado desde el Catálogo Web_`,
    ].filter(line => line !== null)
    return encodeURIComponent(lines.join('\n'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(false)

    try {
      const finalHotel = form.hotel === 'OTRO' ? customHotel : form.hotel
      let payment_proof_url = ''

      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `web_${Date.now()}_${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, proofFile)
        if (uploadError) throw new Error('Error al subir el comprobante: ' + uploadError.message)
        const { data: publicUrlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName)
        payment_proof_url = publicUrlData.publicUrl
      }

      let remainingDeposit = form.deposit || 0

      const submissions = cartItems.map((s) => {
        let currentTotalPrice = s.basePrice
        let currentSurcharge = 0
        if (appliesSurcharge) {
           currentSurcharge = currentTotalPrice * 0.07
           currentTotalPrice += currentSurcharge
        }

        const currentDeposit = Math.min(currentTotalPrice, remainingDeposit)
        remainingDeposit -= currentDeposit

        return {
          customer_name: form.customer_name,
          passport_id: form.passport_id,
          phone: form.phone,
          email: form.email,
          country: form.country,
          city: form.city,
          hotel: finalHotel,
          room: form.room,
          seller: 'WEB', // Por defecto web
          date: s.date,
          service: s.service.name,
          pax: s.pax,
          total_price: currentTotalPrice,
          discount: 0,
          deposit: currentDeposit,
          payment_method: form.payment_method,
          ...(payment_proof_url ? { payment_proof_url } : {})
        }
      })

      const { error: supabaseError } = await supabase
        .from('sales_records')
        .insert(submissions)

      if (supabaseError) throw new Error(supabaseError.message)

      const message = buildWhatsAppMessage()
      window.open(`https://wa.me/573222309034?text=${message}`, '_blank')

      setSuccessMsg(true)
      setTimeout(() => {
        setSuccessMsg(false)
        onSuccess()
        onClose()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al procesar la compra')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-in my-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-black text-[#110E3C] mb-2">Finalizar Compra</h2>
          <p className="text-slate-500 text-sm mb-6">Completa tus datos para confirmar la reserva.</p>

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-emerald-500 font-bold text-sm">¡Reserva exitosa!</p>
                <p className="text-emerald-600/70 text-xs mt-1">Serás redirigido a WhatsApp en breve...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <p className="text-red-500 font-bold text-sm">Error en la reserva</p>
                <p className="text-red-600/70 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sección Datos Personales */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#088DCF] uppercase tracking-wider mb-4 border-b pb-2">Datos del Cliente</h3>
                
                <div>
                  <label className="label-corp" htmlFor="customer_name">Nombre Completo *</label>
                  <input
                    id="customer_name" name="customer_name" type="text" required
                    value={form.customer_name} onChange={handleChange} className="input-corp"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-corp" htmlFor="passport_id">Pasaporte/ID</label>
                    <input
                      id="passport_id" name="passport_id" type="text"
                      value={form.passport_id} onChange={handleChange} className="input-corp"
                    />
                  </div>
                  <div>
                    <label className="label-corp" htmlFor="phone">Teléfono / WhatsApp *</label>
                    <input
                      id="phone" name="phone" type="tel" required
                      value={form.phone} onChange={handleChange} className="input-corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-corp" htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    value={form.email} onChange={handleChange} className="input-corp"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="label-corp">País *</label>
                    <CountryCombobox value={form.country} onChange={handleCountryChange} />
                  </div>
                  <div>
                    <label className="label-corp" htmlFor="city">Ciudad *</label>
                    {availableCities.length > 0 ? (
                      <select id="city" name="city" value={form.city} onChange={handleChange} required className="input-corp">
                        <option value="">Selecciona...</option>
                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input
                        id="city" name="city" type="text" required
                        value={form.city} onChange={handleChange} className="input-corp"
                        placeholder="Ej. Bogotá"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-corp" htmlFor="hotel">Hotel *</label>
                    <select
                      id="hotel" name="hotel" required
                      value={form.hotel} onChange={handleChange} className="input-corp"
                    >
                      <option value="">Selecciona...</option>
                      {HOTELS.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {form.hotel === 'OTRO' && (
                      <input
                        type="text" required placeholder="Nombre del hotel"
                        value={customHotel} onChange={(e) => setCustomHotel(e.target.value.toUpperCase())}
                        className="input-corp mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="label-corp" htmlFor="room">Habitación</label>
                    <input
                      id="room" name="room" type="text"
                      value={form.room} onChange={handleChange} className="input-corp"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Pago */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#088DCF] uppercase tracking-wider mb-4 border-b pb-2">Información de Pago</h3>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-800">{formatCurrency(totalCartPrice)}</span>
                  </div>
                  {surcharge > 0 && (
                    <div className="flex justify-between items-center mb-2 text-orange-600 text-sm">
                      <span>Recargo por pasarela (7%)</span>
                      <span>+{formatCurrency(surcharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-800 font-black">Total a Pagar</span>
                    <span className="font-black text-[#088DCF] text-lg">{formatCurrency(finalTotalPrice)}</span>
                  </div>
                </div>

                <div>
                  <label className="label-corp" htmlFor="payment_method">Método de Pago *</label>
                  <select
                    id="payment_method" name="payment_method" required
                    value={form.payment_method} onChange={handleChange} className="input-corp"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Link de Pago">Link de Pago (Wompi, etc.)</option>
                    <option value="Datafono">Datáfono</option>
                    <option value="Pendiente">Pendiente por Pagar</option>
                  </select>
                </div>

                <div>
                  <label className="label-corp" htmlFor="deposit">Valor del Abono (Deposit) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      id="deposit" name="deposit" type="number" required min="0" max={finalTotalPrice}
                      value={form.deposit} onChange={handleChange} className="input-corp pl-8"
                    />
                  </div>
                </div>

                <div className="bg-[#088DCF]/10 p-4 rounded-xl flex justify-between items-center mt-4">
                  <span className="text-[#088DCF] font-bold">Saldo Pendiente</span>
                  <span className="font-black text-xl text-[#110E3C]">{formatCurrency(balance)}</span>
                </div>

                <div>
                  <label className="label-corp">Comprobante de Abono (Opcional)</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#088DCF]/10 file:text-[#088DCF] hover:file:bg-[#088DCF]/20 transition-all cursor-pointer"
                  />
                </div>
              </div>

            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#088DCF] hover:bg-[#0670A6] shadow-lg shadow-[#088DCF]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
