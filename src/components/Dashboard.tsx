'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, type SaleRecord } from '@/lib/supabase'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function exportToCSV(records: SaleRecord[]) {
  const headers = [
    'ID',
    'Fecha Registro',
    'Fecha Reserva',
    'Cliente',
    'Pasaporte/ID',
    'Teléfono',
    'Email',
    'País',
    'Ciudad',
    'Hotel',
    'Habitación',
    'Pax',
    'Servicio',
    'Precio Total',
    'Abono',
    'Saldo',
  ]

  const rows = records.map((r) => [
    r.id || '',
    r.created_at ? new Date(r.created_at).toLocaleDateString('es-CO') : '',
    r.date,
    r.customer_name,
    r.passport_id,
    r.phone,
    r.email,
    r.country,
    r.city,
    r.hotel,
    r.room,
    r.pax,
    r.service,
    r.total_price,
    r.deposit,
    r.balance ?? (r.total_price - r.deposit),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Reporte_Reservas_Shekina_2.0.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface KPIs {
  total_sales: number
  total_deposits: number
  total_balance: number
}

export default function Dashboard() {
  const [records, setRecords] = useState<SaleRecord[]>([])
  const [kpis, setKpis] = useState<KPIs>({ total_sales: 0, total_deposits: 0, total_balance: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('sales_records')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw new Error(err.message)

      const salesData = (data || []) as SaleRecord[]
      setRecords(salesData)

      // Calcular KPIs en cliente
      const totalSales = salesData.reduce((sum, r) => sum + (r.total_price || 0), 0)
      const totalDeposits = salesData.reduce((sum, r) => sum + (r.deposit || 0), 0)
      const totalBalance = salesData.reduce(
        (sum, r) => sum + (r.balance ?? r.total_price - r.deposit),
        0
      )
      setKpis({ total_sales: totalSales, total_deposits: totalDeposits, total_balance: totalBalance })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = records.filter(
    (r) =>
      r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hotel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.country?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-1">
          <span className="text-xl sm:text-2xl">📊</span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reservas Shekina <span className="text-orange-400">2.0</span>
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm ml-8 sm:ml-11">Panel de Control — Shekina Tours y Logística</p>
        <div className="mt-3 sm:mt-4 h-px bg-gradient-to-r from-orange-500/50 via-blue-500/30 to-transparent" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
        {/* Ventas Totales */}
        <div className="kpi-card animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-black text-white mb-1">
            {loading ? '—' : formatCurrency(kpis.total_sales)}
          </p>
          <p className="text-xs text-slate-500">{records.length} reservas registradas</p>
          <div className="mt-4 h-1 rounded-full bg-white/5">
            <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 w-full" />
          </div>
        </div>

        {/* Abonos */}
        <div className="kpi-card animate-fade-in" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dinero Recaudado</p>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-black text-emerald-400 mb-1">
            {loading ? '—' : formatCurrency(kpis.total_deposits)}
          </p>
          <p className="text-xs text-slate-500">Total de abonos recibidos</p>
          <div className="mt-4 h-1 rounded-full bg-white/5">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
              style={{
                width: kpis.total_sales > 0 ? `${Math.min((kpis.total_deposits / kpis.total_sales) * 100, 100)}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Cartera */}
        <div className="kpi-card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cartera por Cobrar</p>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-black text-orange-400 mb-1">
            {loading ? '—' : formatCurrency(kpis.total_balance)}
          </p>
          <p className="text-xs text-slate-500">Saldos pendientes de clientes</p>
          <div className="mt-4 h-1 rounded-full bg-white/5">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-orange-600 to-orange-400"
              style={{
                width: kpis.total_sales > 0 ? `${Math.min((kpis.total_balance / kpis.total_sales) * 100, 100)}%` : '0%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-[rgba(37,99,168,0.2)]">
          {/* Row 1: title + count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Registros de Ventas</h2>
              <span className="badge badge-blue">{filtered.length}</span>
            </div>
            {/* Refresh btn visible siempre */}
            <button
              onClick={fetchData}
              className="btn-secondary px-3 py-2 text-xs"
              id="refresh-records-btn"
              title="Actualizar"
            >
              🔄
            </button>
          </div>
          {/* Row 2: search + export */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-records"
                type="text"
                placeholder="Buscar cliente, hotel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-corp pl-8"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => exportToCSV(filtered)}
              disabled={filtered.length === 0}
              className="btn-primary text-xs px-3 sm:px-5 flex-shrink-0"
              id="export-csv-btn"
            >
              📥 <span className="hidden sm:inline">Exportar </span>CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <svg className="animate-spin w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-slate-400 text-sm">Cargando registros...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-red-400 font-semibold text-sm">Error al cargar datos</p>
                <p className="text-red-300/60 text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <span className="text-5xl opacity-40">📋</span>
              <p className="text-sm font-medium">Sin registros</p>
              <p className="text-xs">Ingresa tu primera venta desde el formulario.</p>
            </div>
          ) : (
            <table className="table-corp">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Pasaporte</th>
                  <th>País</th>
                  <th>Hotel</th>
                  <th>Habitación</th>
                  <th className="text-center">Pax</th>
                  <th>Servicio</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Abono</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const saldo = record.balance ?? record.total_price - record.deposit
                  return (
                    <tr key={record.id}>
                      <td>
                        <span className="badge badge-blue">
                          {record.date}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-white font-semibold text-xs">{record.customer_name}</p>
                          {record.phone && (
                            <p className="text-slate-500 text-xs mt-0.5">{record.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-400">{record.passport_id || '—'}</td>
                      <td className="text-slate-400">{record.country || '—'}</td>
                      <td className="text-slate-300">{record.hotel || '—'}</td>
                      <td className="text-slate-400">{record.room || '—'}</td>
                      <td className="text-center">
                        <span className="badge badge-orange">{record.pax}</span>
                      </td>
                      <td className="text-slate-400 max-w-[140px] truncate">{record.service || '—'}</td>
                      <td className="text-right font-semibold text-white">
                        {formatCurrency(record.total_price)}
                      </td>
                      <td className="text-right text-emerald-400 font-semibold">
                        {formatCurrency(record.deposit)}
                      </td>
                      <td className="text-right">
                        <span className={`font-bold ${saldo > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {formatCurrency(saldo)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 border-orange-500/30">
                  <td colSpan={8} className="text-right text-slate-400 font-bold text-xs uppercase tracking-wider py-3">
                    TOTALES
                  </td>
                  <td className="text-right font-black text-white py-3">
                    {formatCurrency(filtered.reduce((s, r) => s + r.total_price, 0))}
                  </td>
                  <td className="text-right font-black text-emerald-400 py-3">
                    {formatCurrency(filtered.reduce((s, r) => s + r.deposit, 0))}
                  </td>
                  <td className="text-right font-black text-orange-400 py-3">
                    {formatCurrency(filtered.reduce((s, r) => s + (r.balance ?? r.total_price - r.deposit), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
