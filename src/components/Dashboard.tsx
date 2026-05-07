'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, type SaleRecord } from '@/lib/supabase'
import { SERVICES, normalizeServiceName } from '@/lib/services'
import CalendarView from './CalendarView'
import { BarChart3, CircleDollarSign, CheckCircle2, Clock, ClipboardList, Hotel, User, Calendar, CalendarDays, TrendingUp, Banknote } from 'lucide-react'
import Image from 'next/image'

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
  total_cost: number
}

type DashboardView = 'list' | 'hotel' | 'seller' | 'month' | 'product' | 'cash' | 'calendar'
const ITEMS_PER_PAGE = 15

export default function Dashboard() {
  const [records, setRecords] = useState<SaleRecord[]>([])
  const [view, setView] = useState<DashboardView>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingRecord, setEditingRecord] = useState<SaleRecord | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date())
  const [selectedDetailsRecord, setSelectedDetailsRecord] = useState<SaleRecord | null>(null)

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

  const handleDelete = async (id: string, customer: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la reserva de "${customer}"?`)) return
    
    const { error } = await supabase
      .from('sales_records')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      setRecords(prev => prev.filter(r => r.id !== id))
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const [filterHotel, setFilterHotel] = useState('')
  const [filterSeller, setFilterSeller] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterService, setFilterService] = useState('')

  const [sortField, setSortField] = useState('total')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(prev => !prev)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1 text-[10px]">⇅</span>
    return sortAsc ? <span className="text-[#088DCF] ml-1 text-[10px]">▲</span> : <span className="text-[#088DCF] ml-1 text-[10px]">▼</span>
  }

  const uniqueHotels = useMemo(() => {
    return Array.from(new Set(records.map(r => r.hotel).filter(Boolean))).sort()
  }, [records])

  const uniqueSellers = useMemo(() => {
    return Array.from(new Set(records.map(r => r.seller).filter(Boolean))).sort()
  }, [records])

  const uniqueMonths = useMemo(() => {
    return Array.from(new Set(records.map(r => r.date ? r.date.substring(0, 7) : '').filter(Boolean))).sort().reverse()
  }, [records])

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(records.map(r => r.service).filter(Boolean))).sort()
  }, [records])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchSearch = !searchTerm ? true : (
        r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hotel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.seller?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const matchHotel = !filterHotel ? true : r.hotel === filterHotel
      const matchSeller = !filterSeller ? true : r.seller === filterSeller
      const matchMonth = !filterMonth ? true : (r.date && r.date.substring(0, 7) === filterMonth)
      const matchService = !filterService ? true : r.service === filterService

      return matchSearch && matchHotel && matchSeller && matchMonth && matchService
    })
  }, [records, searchTerm, filterHotel, filterSeller, filterMonth, filterService])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, view, filterHotel, filterSeller, filterMonth, filterService])

  const paginatedList = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      let valA: any = a[sortField as keyof SaleRecord] ?? ''
      let valB: any = b[sortField as keyof SaleRecord] ?? ''

      if (sortField === 'key' || sortField === 'date') {
        valA = a.date ?? ''
        valB = b.date ?? ''
      } else if (sortField === 'total') {
        valA = a.total_price ?? 0
        valB = b.total_price ?? 0
      } else if (sortField === 'balance') {
        valA = a.total_price - a.deposit
        valB = b.total_price - b.deposit
      } else if (sortField === 'customer') {
        valA = a.customer_name ?? ''
        valB = b.customer_name ?? ''
      } else if (sortField === 'count') {
        valA = a.pax ?? 1
        valB = b.pax ?? 1
      }

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortAsc ? valA - valB : valB - valA
    })

    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sorted.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage, sortField, sortAsc])
  
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const kpis = useMemo(() => {
    const totalSales = filtered.reduce((sum, r) => sum + (r.total_price || 0), 0)
    const totalDeposits = filtered.reduce((sum, r) => sum + (r.deposit || 0), 0)
    const totalBalance = filtered.reduce(
      (sum, r) => sum + (r.balance ?? r.total_price - r.deposit),
      0
    )
    const totalCost = filtered.reduce((sum, r) => {
      const srv = SERVICES.find(s => s.name === r.service)
      return sum + ((srv?.cost || 0) * (r.pax || 1))
    }, 0)
    
    return { total_sales: totalSales, total_deposits: totalDeposits, total_balance: totalBalance, total_cost: totalCost }
  }, [filtered])

  // Lógica de resúmenes
  const summaries = useMemo(() => {
    const byHotel: Record<string, { count: number; total: number; deposit: number; cost: number; services: Record<string, number> }> = {}
    const bySeller: Record<string, { count: number; total: number; deposit: number; cost: number }> = {}
    const byMonth: Record<string, { count: number; total: number; deposit: number; cost: number }> = {}
    const byService: Record<string, { count: number; total: number; deposit: number; pax: number }> = {}
    const byCash: Record<string, { count: number; total: number; deposit: number; cost: number }> = {}

    filtered.forEach((r) => {
      const h = r.hotel || 'Sin Hotel'
      const s = r.seller || 'Sin Asesor'
      const m = r.date ? r.date.substring(0, 7) : 'Sin Fecha' // YYYY-MM
      const srv = r.service || 'Sin Servicio'

      if (!byHotel[h]) byHotel[h] = { count: 0, total: 0, deposit: 0, cost: 0, services: {} }
      if (!bySeller[s]) bySeller[s] = { count: 0, total: 0, deposit: 0, cost: 0 }
      if (!byMonth[m]) byMonth[m] = { count: 0, total: 0, deposit: 0, cost: 0 }
      if (!byService[srv]) byService[srv] = { count: 0, total: 0, deposit: 0, pax: 0 }

      const amt = r.total_price || 0
      const dep = r.deposit || 0
      const pax = r.pax || 1
      
      // Búsqueda insensible a mayúsculas/espacios/tildes para garantizar match con SERVICES
      const serviceInfo = SERVICES.find(
        serv => normalizeServiceName(serv.name) === normalizeServiceName(r.service || '')
      )
      const cost = (serviceInfo?.cost || 0) * pax

      byHotel[h].count++
      byHotel[h].total += amt
      byHotel[h].deposit += dep
      byHotel[h].cost += cost
      byHotel[h].services[srv] = (byHotel[h].services[srv] || 0) + pax

      bySeller[s].count++
      bySeller[s].total += amt
      bySeller[s].deposit += dep
      bySeller[s].cost += cost

      byMonth[m].count++
      byMonth[m].total += amt
      byMonth[m].deposit += dep
      byMonth[m].cost += cost

      byService[srv].count++
      byService[srv].total += amt
      byService[srv].deposit += dep
      byService[srv].pax += pax
      
      if (r.payment_method === 'Efectivo') {
        if (!byCash[h]) byCash[h] = { count: 0, total: 0, deposit: 0, cost: 0 }
        byCash[h].count++
        byCash[h].total += amt
        byCash[h].deposit += dep
        byCash[h].cost += cost
      }
    })

    const sortSummaryEntries = (entries: [string, any][], defaultField: string) => {
      const field = sortField || defaultField
      return entries.sort((a, b) => {
        let valA: any
        let valB: any

        if (field === 'key') {
          valA = a[0]
          valB = b[0]
        } else if (field === 'margen') {
          valA = a[1].total - a[1].cost
          valB = b[1].total - b[1].cost
        } else if (field === 'comHotel') {
          valA = (a[1].total - a[1].cost) * 0.30
          valB = (b[1].total - b[1].cost) * 0.30
        } else if (field === 'comAsesor') {
          valA = (a[1].total - a[1].cost) * 0.15
          valB = (b[1].total - b[1].cost) * 0.15
        } else if (field === 'pax') {
          valA = a[1].pax ?? a[1].count
          valB = b[1].pax ?? b[1].count
        } else {
          valA = a[1][field] ?? a[1][defaultField] ?? 0
          valB = b[1][field] ?? b[1][defaultField] ?? 0
        }

        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortAsc ? valA - valB : valB - valA
      })
    }

    return {
      hotel: sortSummaryEntries(Object.entries(byHotel), 'total'),
      seller: sortSummaryEntries(Object.entries(bySeller), 'total'),
      month: sortSummaryEntries(Object.entries(byMonth), 'key'),
      product: sortSummaryEntries(Object.entries(byService), 'total'),
      cash: sortSummaryEntries(Object.entries(byCash), 'deposit'),
    }
  }, [filtered, sortField, sortAsc])

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <Image
            src="/shekina-logo.png"
            alt="Shekina Tours y Logística"
            width={140}
            height={52}
            priority
            className="object-contain h-10 sm:h-12 w-auto"
          />
          <div className="h-8 w-px bg-[#088DCF]/30" />
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#110E3C] tracking-tight leading-tight">
              Panel de <span style={{color:'#088DCF'}}>Control</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">Resúmenes Estadísticos 2.0</p>
          </div>
        </div>
        <div className="h-px" style={{background:'linear-gradient(90deg, #088DCF55, #110E3C00)'}} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ventas Totales</p>
            <CircleDollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-[#110E3C]">{formatCurrency(kpis.total_sales)}</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#088DCF] w-full" />
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recaudado</p>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{formatCurrency(kpis.total_deposits)}</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{ width: kpis.total_sales > 0 ? `${(kpis.total_deposits/kpis.total_sales)*100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por Cobrar</p>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-[#088DCF]">{formatCurrency(kpis.total_balance)}</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#088DCF]/60"
              style={{ width: kpis.total_sales > 0 ? `${(kpis.total_balance/kpis.total_sales)*100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'list', label: 'Lista Completa', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'hotel', label: 'Por Hotel', icon: <Hotel className="w-4 h-4" /> },
          { id: 'seller', label: 'Por Asesor', icon: <User className="w-4 h-4" /> },
          { id: 'month', label: 'Por Mes', icon: <Calendar className="w-4 h-4" /> },
          { id: 'calendar', label: 'Calendario', icon: <CalendarDays className="w-4 h-4" /> },
          { id: 'product', label: 'Rentabilidad / Ingreso Neto', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'cash', label: 'Caja (Efectivo)', icon: <Banknote className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as DashboardView)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              view === tab.id
                ? 'bg-[#088DCF] border-[#088DCF] text-white shadow-md shadow-[#088DCF]/20'
                : 'bg-white border-slate-200 text-[#110E3C] hover:bg-[#088DCF]/08 hover:border-[#088DCF]/30'
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
        <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-[#110E3C] uppercase tracking-wide">
              {view === 'list' ? 'Registros Detallados' : view === 'product' ? 'Tabla de Precios e Ingreso Neto' : view === 'cash' ? 'Efectivo en Caja por Hotel' : view === 'calendar' ? 'Calendario de Reservas' : `Resumen ${view === 'hotel' ? 'por Hotel' : view === 'seller' ? 'por Asesor' : 'por Mes'}`}
            </h2>
            <button onClick={fetchData} className="btn-secondary p-2 text-xs">🔄</button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por cliente, país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-corp flex-1"
            />
            <button onClick={() => exportToCSV(filtered)} className="btn-primary text-xs px-4">📥 Exportar</button>
          </div>

          {/* Filtros de Panel Inteligente */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 border-t border-slate-100/50 pt-2">
            <div>
              <label className="text-[10px] font-bold text-[#110E3C]/60 uppercase tracking-wider block mb-1">Hotel</label>
              <select
                value={filterHotel}
                onChange={(e) => setFilterHotel(e.target.value)}
                className="input-corp w-full text-xs"
              >
                <option value="">Todos los Hoteles</option>
                {uniqueHotels.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#110E3C]/60 uppercase tracking-wider block mb-1">Asesor</label>
              <select
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
                className="input-corp w-full text-xs"
              >
                <option value="">Todos los Asesores</option>
                {uniqueSellers.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#110E3C]/60 uppercase tracking-wider block mb-1">Mes</label>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="input-corp w-full text-xs"
              >
                <option value="">Todos los Meses</option>
                {uniqueMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#110E3C]/60 uppercase tracking-wider block mb-1">Servicio</label>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="input-corp w-full text-xs"
              >
                <option value="">Todos los Servicios</option>
                {uniqueServices.map(srv => (
                  <option key={srv} value={srv}>{srv}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="table-wrapper">
          {view === 'calendar' ? (
            <CalendarView 
              records={filtered} 
              currentDate={currentMonthDate} 
              onDateChange={setCurrentMonthDate} 
              onRecordClick={setSelectedDetailsRecord} 
            />
          ) : loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">Cargando datos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">No hay datos disponibles</div>
          ) : (
            <table className="table-corp">
              {view === 'list' ? (
                <>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('date')} className="cursor-pointer hover:bg-white/5 select-none">Fecha {renderSortIndicator('date')}</th>
                      <th onClick={() => handleSort('customer')} className="cursor-pointer hover:bg-white/5 select-none">Cliente {renderSortIndicator('customer')}</th>
                      <th onClick={() => handleSort('seller')} className="cursor-pointer hover:bg-white/5 select-none">Asesor {renderSortIndicator('seller')}</th>
                      <th onClick={() => handleSort('hotel')} className="cursor-pointer hover:bg-white/5 select-none">Hotel {renderSortIndicator('hotel')}</th>
                      <th onClick={() => handleSort('service')} className="cursor-pointer hover:bg-white/5 select-none">Servicio {renderSortIndicator('service')}</th>
                      <th onClick={() => handleSort('total')} className="text-right cursor-pointer hover:bg-white/5 select-none">Total {renderSortIndicator('total')}</th>
                      <th onClick={() => handleSort('balance')} className="text-right cursor-pointer hover:bg-white/5 select-none">Saldo {renderSortIndicator('balance')}</th>
                      <th className="text-center select-none">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedList.map((r) => (
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
                        <td className="text-center whitespace-nowrap">
                          <button 
                            onClick={() => setEditingRecord(r)}
                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all mr-1"
                            title="Editar Registro"
                          >
                            <span className="text-sm">✏️</span>
                          </button>
                          <button 
                            onClick={() => r.id && handleDelete(r.id, r.customer_name)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Eliminar Registro"
                          >
                            <span className="text-sm">🗑️</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : view === 'product' ? (
                <>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('key')} className="cursor-pointer hover:bg-white/5 select-none">Producto / Servicio {renderSortIndicator('key')}</th>
                      <th onClick={() => handleSort('pax')} className="text-center cursor-pointer hover:bg-white/5 select-none">Pax Vendidos {renderSortIndicator('pax')}</th>
                      <th className="text-right select-none">Precio Unit.</th>
                      <th className="text-right select-none">Costo Unit.</th>
                      <th onClick={() => handleSort('total')} className="text-right cursor-pointer hover:bg-white/5 select-none">Ingreso Bruto {renderSortIndicator('total')}</th>
                      <th className="text-right select-none">Costo Total</th>
                      <th onClick={() => handleSort('margen')} className="text-right text-emerald-400 cursor-pointer hover:bg-white/5 select-none">Ingreso Neto {renderSortIndicator('margen')}</th>
                      <th className="text-right text-orange-400 select-none">Comisiones</th>
                      <th className="text-right text-blue-400 select-none">Utilidad Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.product.map(([key, val]) => {
                      const serviceInfo = SERVICES.find(s => s.name === key)
                      const unitPrice = serviceInfo ? serviceInfo.price : 0
                      const unitCost = serviceInfo ? (serviceInfo.cost || 0) : 0
                      
                      const totalCost = unitCost * val.pax
                      const netIncome = val.total - totalCost
                      const commissions = netIncome * 0.45
                      const finalProfit = netIncome - commissions

                      return (
                        <tr key={key}>
                          <td className="text-white font-bold text-xs">{key}</td>
                          <td className="text-center">
                            <span className="badge badge-blue">{val.pax}</span>
                          </td>
                          <td className="text-right text-slate-300">{formatCurrency(unitPrice)}</td>
                          <td className="text-right text-red-300">{formatCurrency(unitCost)}</td>
                          <td className="text-right text-white font-bold">{formatCurrency(val.total)}</td>
                          <td className="text-right text-red-400 font-bold">-{formatCurrency(totalCost)}</td>
                          <td className="text-right text-emerald-400 font-black">{formatCurrency(netIncome)}</td>
                          <td className="text-right text-orange-400 font-bold">-{formatCurrency(commissions)}</td>
                          <td className="text-right text-blue-400 font-black">{formatCurrency(finalProfit)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5 border-t-2 border-orange-500/30">
                      <td className="font-black text-white text-xs py-4 uppercase">TOTALES</td>
                      <td className="text-center font-bold text-white">{summaries.product.reduce((acc, [_, val]) => acc + val.pax, 0)}</td>
                      <td className="text-right"></td>
                      <td className="text-right"></td>
                      <td className="text-right font-black text-white">{formatCurrency(kpis.total_sales)}</td>
                      <td className="text-right font-black text-red-400">
                        -{formatCurrency(summaries.product.reduce((acc, [key, val]) => {
                          const s = SERVICES.find(s => s.name === key)
                          return acc + ((s?.cost || 0) * val.pax)
                        }, 0))}
                      </td>
                      <td className="text-right font-black text-emerald-400">
                        {formatCurrency(kpis.total_sales - summaries.product.reduce((acc, [key, val]) => {
                          const s = SERVICES.find(s => s.name === key)
                          return acc + ((s?.cost || 0) * val.pax)
                        }, 0))}
                      </td>
                      <td className="text-right font-black text-orange-400">
                        -{formatCurrency((kpis.total_sales - summaries.product.reduce((acc, [key, val]) => {
                          const s = SERVICES.find(s => s.name === key)
                          return acc + ((s?.cost || 0) * val.pax)
                        }, 0)) * 0.45)}
                      </td>
                      <td className="text-right font-black text-blue-400">
                        {formatCurrency((kpis.total_sales - summaries.product.reduce((acc, [key, val]) => {
                          const s = SERVICES.find(s => s.name === key)
                          return acc + ((s?.cost || 0) * val.pax)
                        }, 0)) * 0.55)}
                      </td>
                    </tr>
                  </tfoot>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('key')} className="cursor-pointer hover:bg-white/5 select-none">
                        {view === 'hotel' ? 'Hotel' : view === 'seller' ? 'Asesor' : view === 'cash' ? 'Hotel (Solo Efectivo)' : 'Mes'} {renderSortIndicator('key')}
                      </th>
                      {view === 'hotel' && <th className="select-none">Productos Vendidos</th>}
                      <th onClick={() => handleSort('count')} className="text-center cursor-pointer hover:bg-white/5 select-none">Cant. Reservas {renderSortIndicator('count')}</th>
                      {view !== 'cash' && <th onClick={() => handleSort('total')} className="text-right cursor-pointer hover:bg-white/5 select-none">Producción Bruta {renderSortIndicator('total')}</th>}
                      {view !== 'cash' && <th onClick={() => handleSort('cost')} className="text-right text-red-400 cursor-pointer hover:bg-white/5 select-none">Costo Total {renderSortIndicator('cost')}</th>}
                      {view !== 'cash' && <th onClick={() => handleSort('margen')} className="text-right text-emerald-300 cursor-pointer hover:bg-white/5 select-none">Margen (Bruto−Costo) {renderSortIndicator('margen')}</th>}
                      <th onClick={() => handleSort('deposit')} className="text-right cursor-pointer hover:bg-white/5 select-none">{view === 'cash' ? 'Efectivo en Caja (Abono)' : 'Recaudado'} {renderSortIndicator('deposit')}</th>
                      {view !== 'cash' && <th onClick={() => handleSort('balance')} className="text-right cursor-pointer hover:bg-white/5 select-none">Por Cobrar {renderSortIndicator('balance')}</th>}
                      {(view === 'hotel' || view === 'month') && (
                        <th onClick={() => handleSort('comHotel')} className="text-right text-orange-400 cursor-pointer hover:bg-white/5 select-none">Comisión Hotel (30%) {renderSortIndicator('comHotel')}</th>
                      )}
                      {(view === 'seller' || view === 'month') && (
                        <th onClick={() => handleSort('comAsesor')} className="text-right text-yellow-400 cursor-pointer hover:bg-white/5 select-none">Comisión Asesor (15%) {renderSortIndicator('comAsesor')}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {summaries[view as keyof typeof summaries].map(([key, val]) => {
                      const margen = val.total - (val as any).cost
                      const comHotel = margen * 0.30
                      const comAsesor = margen * 0.15
                      return (
                        <tr key={key}>
                          <td className="text-white font-bold uppercase">{key}</td>
                          {view === 'hotel' && (
                            <td className="text-xs text-slate-400">
                              {Object.entries((val as any).services || {}).map(([s, c]) => (
                                <div key={s} className="truncate max-w-[200px]" title={s}>
                                  <span className="text-orange-400 font-bold">{c as number}x</span> {s}
                                </div>
                              ))}
                            </td>
                          )}
                          <td className="text-center">
                            <span className="badge badge-blue">{val.count}</span>
                          </td>
                          {view !== 'cash' && <td className="text-right text-white font-black">{formatCurrency(val.total)}</td>}
                          {view !== 'cash' && <td className="text-right text-red-400 font-bold">-{formatCurrency((val as any).cost)}</td>}
                          {view !== 'cash' && <td className="text-right text-emerald-300 font-black">{formatCurrency(margen)}</td>}
                          <td className="text-right text-emerald-400 font-bold">{formatCurrency(val.deposit)}</td>
                          {view !== 'cash' && <td className="text-right text-orange-400 font-bold">{formatCurrency(val.total - val.deposit)}</td>}
                          {(view === 'hotel' || view === 'month') && (
                            <td className="text-right text-orange-400 font-black">{formatCurrency(comHotel)}</td>
                          )}
                          {(view === 'seller' || view === 'month') && (
                            <td className="text-right text-yellow-400 font-black">{formatCurrency(comAsesor)}</td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/5 border-t-2 border-orange-500/30">
                      <td className="font-black text-white text-xs py-4 uppercase">TOTALES</td>
                      {view === 'hotel' && <td></td>}
                      <td className="text-center font-bold text-white">
                        {view === 'cash' ? filtered.filter(r => r.payment_method === 'Efectivo').length : filtered.length}
                      </td>
                      {view !== 'cash' && (
                        <td className="text-right font-black text-white">
                          {formatCurrency(kpis.total_sales)}
                        </td>
                      )}
                      {view !== 'cash' && (
                        <td className="text-right font-black text-red-400">
                          -{formatCurrency(kpis.total_cost)}
                        </td>
                      )}
                      {view !== 'cash' && (
                        <td className="text-right font-black text-emerald-300">
                          {formatCurrency(kpis.total_sales - kpis.total_cost)}
                        </td>
                      )}
                      <td className="text-right font-black text-emerald-400">
                        {formatCurrency(view === 'cash' ? filtered.filter(r => r.payment_method === 'Efectivo').reduce((sum, r) => sum + (r.deposit || 0), 0) : kpis.total_deposits)}
                      </td>
                      {view !== 'cash' && (
                        <td className="text-right font-black text-orange-400">
                          {formatCurrency(kpis.total_balance)}
                        </td>
                      )}
                      {(view === 'hotel' || view === 'month') && (
                        <td className="text-right font-black text-orange-400">
                          {formatCurrency((kpis.total_sales - kpis.total_cost) * 0.30)}
                        </td>
                      )}
                      {(view === 'seller' || view === 'month') && (
                        <td className="text-right font-black text-yellow-400">
                          {formatCurrency((kpis.total_sales - kpis.total_cost) * 0.15)}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </>
              )}
            </table>
          )}
          
          {view === 'list' && filtered.length > ITEMS_PER_PAGE && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-xs text-white transition-colors"
                >
                  Anterior
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 text-xs text-white transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1f38] border border-orange-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span>✏️</span> Editar Reserva
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setSavingEdit(true)
              try {
                const updatedBalance = editingRecord.total_price - editingRecord.deposit
                const { error } = await supabase
                  .from('sales_records')
                  .update({
                    customer_name: editingRecord.customer_name,
                    phone: editingRecord.phone,
                    hotel: editingRecord.hotel,
                    service: editingRecord.service,
                    pax: editingRecord.pax,
                    total_price: editingRecord.total_price,
                    deposit: editingRecord.deposit,
                    balance: updatedBalance
                  })
                  .eq('id', editingRecord.id)
                if (error) throw error
                setRecords(prev => prev.map(r => r.id === editingRecord.id ? {...editingRecord, balance: updatedBalance} : r))
                setEditingRecord(null)
              } catch (err) {
                alert('Error al guardar cambios: ' + (err instanceof Error ? err.message : 'Error desconocido'))
              } finally {
                setSavingEdit(false)
              }
            }} className="space-y-4">
              <div>
                <label className="label-corp">Nombre del Cliente</label>
                <input type="text" value={editingRecord.customer_name} onChange={e => setEditingRecord({...editingRecord, customer_name: e.target.value})} className="input-corp" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-corp">Teléfono</label>
                  <input type="text" value={editingRecord.phone || ''} onChange={e => setEditingRecord({...editingRecord, phone: e.target.value})} className="input-corp" />
                </div>
                <div>
                  <label className="label-corp">Hotel</label>
                  <input type="text" value={editingRecord.hotel || ''} onChange={e => setEditingRecord({...editingRecord, hotel: e.target.value})} className="input-corp" />
                </div>
              </div>
              {/* Servicio / Destino — dropdown del catálogo */}
              <div>
                <label className="label-corp">Servicio / Destino</label>
                <select
                  value={editingRecord.service || ''}
                  onChange={e => {
                    const selectedService = SERVICES.find(s => s.name === e.target.value)
                    const pax = editingRecord.pax || 1
                    const newTotal = selectedService ? selectedService.price * pax : editingRecord.total_price
                    setEditingRecord({
                      ...editingRecord,
                      service: e.target.value,
                      total_price: newTotal,
                    })
                  }}
                  className="input-corp"
                  required
                >
                  <option value="">— Selecciona un servicio —</option>
                  {SERVICES.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* PAX + Precio calculado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-corp">PAX (Personas)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingRecord.pax || 1}
                    onChange={e => {
                      const pax = Math.max(1, Number(e.target.value))
                      const selectedService = SERVICES.find(s => s.name === editingRecord.service)
                      const newTotal = selectedService ? selectedService.price * pax : editingRecord.total_price
                      setEditingRecord({ ...editingRecord, pax, total_price: newTotal })
                    }}
                    className="input-corp"
                    required
                  />
                </div>
                <div>
                  <label className="label-corp">Precio Total (COP)</label>
                  <input
                    type="number"
                    value={editingRecord.total_price || 0}
                    onChange={e => setEditingRecord({...editingRecord, total_price: Number(e.target.value)})}
                    className="input-corp"
                    required
                  />
                  {(() => {
                    const srv = SERVICES.find(s => s.name === editingRecord.service)
                    const expectedPrice = srv ? srv.price * (editingRecord.pax || 1) : null
                    return expectedPrice !== null && expectedPrice !== editingRecord.total_price ? (
                      <p className="text-[10px] text-yellow-400 mt-1">
                        ⚠️ Precio sugerido: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(expectedPrice)}
                      </p>
                    ) : null
                  })()}
                </div>
              </div>

              {/* Abono */}
              <div>
                <label className="label-corp">Abono (COP)</label>
                <input
                  type="number"
                  value={editingRecord.deposit || 0}
                  onChange={e => setEditingRecord({...editingRecord, deposit: Number(e.target.value)})}
                  className="input-corp"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Saldo pendiente: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(editingRecord.total_price - editingRecord.deposit)}
                </p>
              </div>
              
              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-white/10">
                <button type="button" disabled={savingEdit} onClick={() => setEditingRecord(null)} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEdit} className="btn-primary py-2 px-6">
                  {savingEdit ? 'Guardando...' : '💾 Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles Reserva (Calendario) */}
      {selectedDetailsRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedDetailsRecord(null)}>
          <div className="bg-[#0d1f38] border border-blue-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDetailsRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-white mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
              <span>📋</span> Detalle de Reserva
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</p>
                <p className="text-white font-medium">{selectedDetailsRecord.customer_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servicio</p>
                  <p className="text-orange-400 font-bold">{selectedDetailsRecord.service}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PAX</p>
                  <p className="text-white font-medium">{selectedDetailsRecord.pax}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hotel de Recogida</p>
                <p className="text-slate-300">{selectedDetailsRecord.hotel || 'No especificado'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Reserva</p>
                  <p className="text-slate-300">{selectedDetailsRecord.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asesor</p>
                  <p className="text-slate-300">{selectedDetailsRecord.seller || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => {
                  setEditingRecord(selectedDetailsRecord)
                  setSelectedDetailsRecord(null)
                }} 
                className="btn-secondary text-xs px-4 py-2"
              >
                ✏️ Editar Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
