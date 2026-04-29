'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
    'Asesor',
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
    r.seller || 'N/A',
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

type DashboardView = 'list' | 'hotel' | 'seller' | 'month'

export default function Dashboard() {
  const [records, setRecords] = useState<SaleRecord[]>([])
  const [view, setView] = useState<DashboardView>('list')
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
      setRecords((data || []) as SaleRecord[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hotel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.seller?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [records, searchTerm])

  const kpis = useMemo(() => {
    const totalSales = filtered.reduce((sum, r) => sum + (r.total_price || 0), 0)
    const totalDeposits = filtered.reduce((sum, r) => sum + (r.deposit || 0), 0)
    const totalBalance = filtered.reduce(
      (sum, r) => sum + (r.balance ?? r.total_price - r.deposit),
      0
    )
    return { total_sales: totalSales, total_deposits: totalDeposits, total_balance: totalBalance }
  }, [filtered])

  // Lógica de resúmenes
  const summaries = useMemo(() => {
    const byHotel: Record<string, { count: number; total: number; deposit: number }> = {}
    const bySeller: Record<string, { count: number; total: number; deposit: number }> = {}
    const byMonth: Record<string, { count: number; total: number; deposit: number }> = {}

    filtered.forEach((r) => {
      const h = r.hotel || 'Sin Hotel'
      const s = r.seller || 'Sin Asesor'
      const m = r.date ? r.date.substring(0, 7) : 'Sin Fecha' // YYYY-MM

      if (!byHotel[h]) byHotel[h] = { count: 0, total: 0, deposit: 0 }
      if (!bySeller[s]) bySeller[s] = { count: 0, total: 0, deposit: 0 }
      if (!byMonth[m]) byMonth[m] = { count: 0, total: 0, deposit: 0 }

      const amt = r.total_price || 0
      const dep = r.deposit || 0

      byHotel[h].count++
      byHotel[h].total += amt
      byHotel[h].deposit += dep

      bySeller[s].count++
      bySeller[s].total += amt
      bySeller[s].deposit += dep

      byMonth[m].count++
      byMonth[m].total += amt
      byMonth[m].deposit += dep
    })

    return {
      hotel: Object.entries(byHotel).sort((a, b) => b[1].total - a[1].total),
      seller: Object.entries(bySeller).sort((a, b) => b[1].total - a[1].total),
      month: Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])),
    }
  }, [filtered])

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
        <p className="text-slate-400 text-xs sm:text-sm ml-8 sm:ml-11">Panel de Control y Resúmenes Estadísticos</p>
        <div className="mt-3 sm:mt-4 h-px bg-gradient-to-r from-orange-500/50 via-blue-500/30 to-transparent" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</p>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-2xl font-black text-white">{formatCurrency(kpis.total_sales)}</p>
          <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-orange-500 w-full" />
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recaudado</p>
            <span className="text-xl">✅</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(kpis.total_deposits)}</p>
          <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500" 
              style={{ width: kpis.total_sales > 0 ? `${(kpis.total_deposits/kpis.total_sales)*100}%` : '0%' }} 
            />
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por Cobrar</p>
            <span className="text-xl">⏳</span>
          </div>
          <p className="text-2xl font-black text-orange-400">{formatCurrency(kpis.total_balance)}</p>
          <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-orange-600" 
              style={{ width: kpis.total_sales > 0 ? `${(kpis.total_balance/kpis.total_sales)*100}%` : '0%' }} 
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'list', label: 'Lista Completa', icon: '📋' },
          { id: 'hotel', label: 'Por Hotel', icon: '🏨' },
          { id: 'seller', label: 'Por Asesor', icon: '👤' },
          { id: 'month', label: 'Por Mes', icon: '📅' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as DashboardView)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              view === tab.id
                ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                : 'bg-navy-800/50 border-white/5 text-slate-400 hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="glass-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
              {view === 'list' ? 'Registros Detallados' : `Resumen ${view === 'hotel' ? 'por Hotel' : view === 'seller' ? 'por Asesor' : 'por Mes'}`}
            </h2>
            <button onClick={fetchData} className="btn-secondary p-2 text-xs">🔄</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filtrar datos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-corp flex-1"
            />
            <button onClick={() => exportToCSV(filtered)} className="btn-primary text-xs px-4">📥 Exportar</button>
          </div>
        </div>

        {/* Content */}
        <div className="table-wrapper">
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Cargando datos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">No hay datos disponibles</div>
          ) : (
            <table className="table-corp">
              {view === 'list' ? (
                <>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Hotel</th>
                      <th>Servicio</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td className="text-[10px]">{r.date}</td>
                        <td className="text-white font-medium">{r.customer_name}</td>
                        <td className="text-orange-400 font-bold text-[10px] uppercase">{r.seller || '—'}</td>
                        <td className="text-slate-400">{r.hotel}</td>
                        <td className="text-slate-500 truncate max-w-[120px]">{r.service}</td>
                        <td className="text-right text-white font-bold">{formatCurrency(r.total_price)}</td>
                        <td className="text-right">
                          <span className={r.total_price - r.deposit > 0 ? 'text-orange-500 font-bold' : 'text-emerald-500'}>
                            {formatCurrency(r.total_price - r.deposit)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th>{view === 'hotel' ? 'Hotel' : view === 'seller' ? 'Asesor' : 'Mes'}</th>
                      <th className="text-center">Cant. Reservas</th>
                      <th className="text-right">Producción Bruta</th>
                      <th className="text-right">Recaudado</th>
                      <th className="text-right">Por Cobrar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries[view as keyof typeof summaries].map(([key, val]) => (
                      <tr key={key}>
                        <td className="text-white font-bold uppercase">{key}</td>
                        <td className="text-center">
                          <span className="badge badge-blue">{val.count}</span>
                        </td>
                        <td className="text-right text-white font-black">{formatCurrency(val.total)}</td>
                        <td className="text-right text-emerald-400">{formatCurrency(val.deposit)}</td>
                        <td className="text-right text-orange-400 font-bold">{formatCurrency(val.total - val.deposit)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5 border-t-2 border-orange-500/30">
                      <td className="font-black text-white text-xs py-4 uppercase">TOTALES</td>
                      <td className="text-center font-bold text-white">{filtered.length}</td>
                      <td className="text-right font-black text-white">{formatCurrency(kpis.total_sales)}</td>
                      <td className="text-right font-black text-emerald-400">{formatCurrency(kpis.total_deposits)}</td>
                      <td className="text-right font-black text-orange-400">{formatCurrency(kpis.total_balance)}</td>
                    </tr>
                  </tfoot>
                </>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
