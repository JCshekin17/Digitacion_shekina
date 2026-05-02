'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, type SaleRecord } from '@/lib/supabase'
import { COUNTRIES, getCitiesByCountry } from '@/lib/countries'
import { SERVICES } from '@/lib/services'

// ── Hoteles disponibles ──────────────────────────────────────
const HOTELS = [
  'HERNANDEZ SUITE',
  'TERRAZ DEL CABRERO',
  'BETTER GROUP',
  'BAHARI SUITE',
  'CASA TURBAY',
  'CONDOMINIO MONTU',
  'OTRO',
]

// ── Estado inicial del formulario ────────────────────────────
const INITIAL_FORM: Omit<SaleRecord, 'id' | 'created_at' | 'balance'> = {
  date: new Date().toISOString().split('T')[0],
  customer_name: '',
  passport_id: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  hotel: '',
  room: '',
  pax: 1,
  service: '',
  total_price: 0,
  deposit: 0,
  seller: '',
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function buildWhatsAppMessage(data: Omit<SaleRecord, 'id' | 'created_at'> & { balance: number }) {
  const lines = [
    `*Nueva Reserva - Shekina 2.0* 🌴`,
    ``,
    `📅 *Fecha:* ${data.date}`,
    ``,
    `👤 *DATOS DEL CLIENTE*`,
    `• Nombre: ${data.customer_name}`,
    `• Pasaporte/ID: ${data.passport_id || 'N/A'}`,
    `• Teléfono: ${data.phone || 'N/A'}`,
    `• Email: ${data.email || 'N/A'}`,
    `• País: ${data.country || 'N/A'}`,
    `• Ciudad: ${data.city || 'N/A'}`,
    ``,
    `🏨 *DETALLES DE LA RESERVA*`,
    `• Hotel: ${data.hotel || 'N/A'}`,
    `• Habitación: ${data.room || 'N/A'}`,
    `• Personas: ${data.pax}`,
    `• Servicio: ${data.service || 'N/A'}`,
    `• Asesor: ${data.seller || 'N/A'}`,
    ``,
    `💰 *FINANCIERO*`,
    `• Precio Total: ${formatCurrency(data.total_price)}`,
    `• Abono: ${formatCurrency(data.deposit)}`,
    `• *Saldo Pendiente: ${formatCurrency(data.balance)}*`,
    ``,
    `_Registrado en Reservas Shekina 2.0_`,
  ]
  return encodeURIComponent(lines.join('\n'))
}

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

  // Sync query cuando el valor externo cambia (ej. reset)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        // Si lo que queda en query no es un país válido, limpia
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

// ── Componente principal ─────────────────────────────────────
export default function SalesForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [customHotel, setCustomHotel] = useState('')

  // Autocalcular balance
  useEffect(() => {
    const total = parseFloat(String(form.total_price)) || 0
    const deposit = parseFloat(String(form.deposit)) || 0
    setBalance(total - deposit)
  }, [form.total_price, form.deposit])

  // Actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (form.country) {
      const cities = getCitiesByCountry(form.country)
      setAvailableCities(cities)
      // Reset ciudad si el país cambió
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

      // Forzar mayúsculas en el campo asesor
      if (name === 'seller' && typeof finalValue === 'string') {
        finalValue = finalValue.toUpperCase()
      }

      setForm((prev) => {
        const next = { ...prev, [name]: finalValue }
        
        // Si cambia PAX, recalculamos total_price basándonos en el servicio actual
        if (name === 'pax') {
          const service = SERVICES.find((s) => s.name === prev.service)
          if (service) {
            next.total_price = service.price * (next.pax as number)
          }
        }
        
        return next
      })
    },
    []
  )

  const handleCountryChange = useCallback((country: string) => {
    setForm((prev) => ({ ...prev, country, city: '' }))
  }, [])

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value
    const service = SERVICES.find((s) => s.name === selectedName)
    setForm((prev) => ({
      ...prev,
      service: selectedName,
      total_price: service ? service.price * prev.pax : prev.total_price,
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      // Si el hotel es "OTRO", usamos el nombre personalizado
      const finalHotel = form.hotel === 'OTRO' ? customHotel : form.hotel
      const submissionData = { ...form, hotel: finalHotel, balance }

      const { error: supabaseError } = await supabase
        .from('sales_records')
        .insert([submissionData])

      if (supabaseError) throw new Error(supabaseError.message)

      const message = buildWhatsAppMessage(submissionData)
      // Usar location.assign es mejor para móviles para evitar bloqueos de popups
      window.location.assign(`https://wa.me/573222309034?text=${message}`)

      setSuccess(true)
      setForm({ ...INITIAL_FORM, date: new Date().toISOString().split('T')[0] })
      setCustomHotel('')
      setBalance(0)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1">
          <span className="text-xl sm:text-2xl">✏️</span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reservas Shekina <span className="text-orange-400">2.0</span>
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm ml-8 sm:ml-11">Ingreso de Ventas — Shekina Tours y Logística</p>
        <div className="mt-3 sm:mt-4 h-px bg-gradient-to-r from-orange-500/50 via-blue-500/30 to-transparent" />
      </div>

      {/* Alertas */}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3 animate-fade-in">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-emerald-400 font-bold text-sm">¡Reserva registrada exitosamente!</p>
            <p className="text-emerald-300/70 text-xs mt-1">El resumen fue enviado por WhatsApp.</p>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3 animate-fade-in">
          <span className="text-xl">❌</span>
          <div>
            <p className="text-red-400 font-bold text-sm">Error al guardar</p>
            <p className="text-red-300/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

        {/* ── Información General ── */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-orange-400" />
            Información General
            <span className="inline-block flex-1 h-px bg-orange-400/20" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label-corp" htmlFor="seller">Asesor de Venta *</label>
              <input
                id="seller" name="seller" type="text" required
                placeholder="NOMBRE DEL ASESOR"
                value={form.seller} onChange={handleChange} className="input-corp font-bold"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="date">Fecha de Reserva *</label>
              <input
                id="date" name="date" type="date" required
                value={form.date} onChange={handleChange} className="input-corp"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="service">Servicio / Destino</label>
              <select
                id="service"
                name="service"
                value={form.service}
                onChange={handleServiceChange}
                className="input-corp"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="">— Selecciona un servicio —</option>
                {SERVICES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-corp" htmlFor="pax">Número de Pax *</label>
              <input
                id="pax" name="pax" type="number" min="1" max="100" required
                value={form.pax} onChange={handleChange} className="input-corp"
              />
            </div>
          </div>
        </div>

        {/* ── Datos del Cliente ── */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-orange-400" />
            Datos del Cliente
            <span className="inline-block flex-1 h-px bg-orange-400/20" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label-corp" htmlFor="customer_name">Nombre Completo *</label>
              <input
                id="customer_name" name="customer_name" type="text" required
                placeholder="Nombre del cliente"
                value={form.customer_name} onChange={handleChange} className="input-corp"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="passport_id">Pasaporte / Cédula</label>
              <input
                id="passport_id" name="passport_id" type="text"
                placeholder="Número de documento"
                value={form.passport_id} onChange={handleChange} className="input-corp"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="phone">Teléfono / WhatsApp</label>
              <input
                id="phone" name="phone" type="tel"
                placeholder="+57 300 000 0000"
                value={form.phone} onChange={handleChange} 
                className={`input-corp ${form.phone && !/^\+?\d{8,15}$/.test(form.phone.replace(/\s+/g, '')) ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {form.phone && !/^\+?\d{8,15}$/.test(form.phone.replace(/\s+/g, '')) && (
                <p className="text-[10px] text-red-400 mt-1">Formato de teléfono no válido</p>
              )}
            </div>
            <div>
              <label className="label-corp" htmlFor="email">Correo Electrónico</label>
              <input
                id="email" name="email" type="email"
                placeholder="cliente@email.com"
                value={form.email} onChange={handleChange} 
                className={`input-corp ${form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                <p className="text-[10px] text-red-400 mt-1">Formato de correo no válido</p>
              )}
            </div>

            {/* País — combobox con autocompletado */}
            <div>
              <label className="label-corp" htmlFor="country">
                País de Origen
                <span className="text-orange-400/60 normal-case font-normal ml-1">(mín. 3 letras)</span>
              </label>
              <CountryCombobox value={form.country} onChange={handleCountryChange} />
            </div>

            {/* Ciudad — select dinámico según país */}
            <div>
              <label className="label-corp" htmlFor="city">Ciudad</label>
              {availableCities.length > 0 ? (
                <select
                  id="city" name="city"
                  value={form.city} onChange={handleChange}
                  className="input-corp"
                  style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">Selecciona una ciudad</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="city" name="city" type="text"
                  placeholder={form.country ? 'Ciudad no disponible' : 'Selecciona un país primero'}
                  value={form.city} onChange={handleChange}
                  className="input-corp"
                  style={{ opacity: form.country ? 1 : 0.5 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Alojamiento ── */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-orange-400" />
            Alojamiento
            <span className="inline-block flex-1 h-px bg-orange-400/20" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Hotel — dropdown con hoteles predefinidos */}
            <div className="space-y-3">
              <div>
                <label className="label-corp" htmlFor="hotel">Hotel</label>
                <select
                  id="hotel" name="hotel"
                  value={form.hotel} onChange={handleChange}
                  className="input-corp"
                  style={{
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="">— Selecciona un hotel —</option>
                  {HOTELS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {form.hotel === 'OTRO' && (
                <div className="animate-fade-in">
                  <label className="label-corp" htmlFor="custom_hotel">Nombre del Hotel Personalizado *</label>
                  <input
                    id="custom_hotel"
                    type="text"
                    required
                    placeholder="Escribe el nombre del hotel"
                    value={customHotel}
                    onChange={(e) => setCustomHotel(e.target.value)}
                    className="input-corp border-orange-500/50"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="label-corp" htmlFor="room">Número de Habitación</label>
              <input
                id="room" name="room" type="text"
                placeholder="Ej: 101, Suite 202"
                value={form.room} onChange={handleChange} className="input-corp"
              />
            </div>
          </div>
        </div>

        {/* ── Financiero ── */}
        <div className="glass-card p-4 sm:p-6">
          <h2 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-orange-400" />
            Información Financiera
            <span className="inline-block flex-1 h-px bg-orange-400/20" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label-corp" htmlFor="total_price">Precio Total (COP) *</label>
              <input
                id="total_price" name="total_price" type="number"
                min="0" step="1000" required placeholder="0"
                value={form.total_price || ''} onChange={handleChange} className="input-corp"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="deposit">Abono / Depósito (COP) *</label>
              <input
                id="deposit" name="deposit" type="number"
                min="0" step="1000" required placeholder="0"
                value={form.deposit || ''} onChange={handleChange} className="input-corp"
              />
            </div>
            <div>
              <label className="label-corp" htmlFor="balance_display">
                Saldo Pendiente{' '}
                <span className="text-orange-400/60 normal-case font-normal">(autocalculado)</span>
              </label>
              <input
                id="balance_display" name="balance_display" type="text"
                readOnly value={formatCurrency(balance)} className="input-corp"
              />
            </div>
          </div>

          {balance > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <span className="text-orange-400 text-sm">⚠️</span>
              <p className="text-orange-300 text-sm">
                Saldo pendiente de <span className="font-bold">{formatCurrency(balance)}</span> por cobrar al cliente.
              </p>
            </div>
          )}
          {balance === 0 && form.total_price > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="text-emerald-400 text-sm">✅</span>
              <p className="text-emerald-300 text-sm font-semibold">Reserva pagada en su totalidad.</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between pt-2 pb-4 sm:pb-0">
          <p className="text-slate-500 text-xs order-3 sm:order-1 text-center sm:text-left">
            * Campos obligatorios. Al guardar se abrirá WhatsApp con el resumen.
          </p>
          <div className="flex gap-2 order-1 sm:order-2 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setForm({ ...INITIAL_FORM, date: new Date().toISOString().split('T')[0] })
                setCustomHotel('')
                setBalance(0)
                setError(null)
                setSuccess(false)
              }}
              disabled={loading}
              className="px-4 py-3 sm:py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/5 font-bold text-sm transition-all"
            >
              🧹 Limpiar
            </button>
            <button
              type="submit" disabled={loading}
              className="btn-primary flex-1 sm:flex-none" id="submit-sale-btn"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>💾 Guardar Reserva</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
