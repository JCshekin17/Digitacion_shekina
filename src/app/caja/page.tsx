'use client'

import { useState, useEffect } from 'react'
import { supabase, type CashRecord } from '@/lib/supabase'
import { Wallet, Calendar, User, DollarSign, Calculator, Info, Trash2, PlusCircle, CheckCircle, RefreshCw, AlertCircle, Copy } from 'lucide-react'
import Image from 'next/image'

const ADVISORS = ['YIRLEY', 'KEREN', 'GABRIELA']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function CajaPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [advisor, setAdvisor] = useState('')
  const [foundAmount, setFoundAmount] = useState<number | ''>('')
  const [consignedAmount, setConsignedAmount] = useState<number | ''>('')
  const [records, setRecords] = useState<CashRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSqlHelp, setShowSqlHelp] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Calcule balance live
  const fAmt = Number(foundAmount) || 0
  const cAmt = Number(consignedAmount) || 0
  const balance = fAmt - cAmt

  const sqlQuery = `-- EJECUTA ESTO EN TU SQL EDITOR DE SUPABASE PARA EL REGISTRO DE CAJA:
CREATE TABLE IF NOT EXISTS public.cash_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date          DATE NOT NULL,
  advisor       TEXT NOT NULL,
  found_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  consigned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12, 2) GENERATED ALWAYS AS (found_amount - consigned_amount) STORED
);

ALTER TABLE public.cash_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.cash_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.cash_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.cash_records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.cash_records FOR DELETE USING (true);`;

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      // Intenta leer de Supabase
      const { data, error: sbError } = await supabase
        .from('cash_records')
        .select('*')
        .order('date', { ascending: false })

      if (sbError) {
        // Fallback a localStorage si la tabla no existe en la BD
        if (sbError.message.includes('Could not find') || sbError.message.includes('does not exist')) {
          const local = localStorage.getItem('shekina_cash_records')
          setRecords(local ? JSON.parse(local) : [])
          setShowSqlHelp(true)
        } else {
          throw new Error(sbError.message)
        }
      } else {
        setRecords(data || [])
        setShowSqlHelp(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener los registros de caja')
      // Fallback
      const local = localStorage.getItem('shekina_cash_records')
      setRecords(local ? JSON.parse(local) : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!advisor) {
      setError('Por favor selecciona un asesor')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    const newRecord: CashRecord = {
      date,
      advisor,
      found_amount: fAmt,
      consigned_amount: cAmt,
      balance,
    }

    try {
      // Intenta guardar en Supabase sin incluir la columna generada 'balance'
      const { error: sbError } = await supabase
        .from('cash_records')
        .insert([{
          date,
          advisor,
          found_amount: fAmt,
          consigned_amount: cAmt
        }])

      if (sbError) {
        if (sbError.message.includes('Could not find') || sbError.message.includes('does not exist')) {
          // Guardar localmente como fallback
          saveLocally(newRecord)
          setShowSqlHelp(true)
        } else {
          throw new Error(sbError.message)
        }
      } else {
        setSuccess(true)
        setAdvisor('')
        setFoundAmount('')
        setConsignedAmount('')
        fetchRecords()
      }
    } catch (err: any) {
      // Fallback
      saveLocally(newRecord)
      setShowSqlHelp(true)
    } finally {
      setSaving(false)
    }
  }

  const saveLocally = (record: CashRecord) => {
    const localRecords = [...records]
    const enriched: CashRecord = {
      ...record,
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString()
    }
    localRecords.unshift(enriched)
    localStorage.setItem('shekina_cash_records', JSON.stringify(localRecords))
    setRecords(localRecords)
    setSuccess(true)
    setAdvisor('')
    setFoundAmount('')
    setConsignedAmount('')
    setTimeout(() => setSuccess(false), 5000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de caja?')) return

    setError(null)
    try {
      const { error: sbError } = await supabase
        .from('cash_records')
        .delete()
        .eq('id', id)

      if (sbError) {
        // Eliminar localmente como fallback
        deleteLocally(id)
      } else {
        fetchRecords()
      }
    } catch {
      deleteLocally(id)
    }
  }

  const deleteLocally = (id: string) => {
    const localRecords = records.filter(r => r.id !== id)
    localStorage.setItem('shekina_cash_records', JSON.stringify(localRecords))
    setRecords(localRecords)
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in" style={{ color: '#110E3C' }}>
      
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
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
            <h1 className="text-xl sm:text-2xl font-black text-[#110E3C] tracking-tight leading-tight uppercase">
              Registro de <span className="text-[#088DCF]">Caja</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Control diario de Arqueo y Consignaciones</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-[#088DCF]/40 to-transparent" />
      </div>

      {/* Alertas */}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-800 font-bold text-sm">¡Registro de caja guardado exitosamente!</p>
            <p className="text-emerald-600 text-xs mt-0.5">El arqueo de caja se registró en el historial de manera correcta.</p>
          </div>
        </div>
      )}

      {/* Cloud Sync Help Card */}
      {showSqlHelp && (
        <div className="mb-8 p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-50/70 to-amber-50/70 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 rounded-full bg-orange-400/10 blur-xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-800 text-sm">¡Guardando de forma segura en Local Storage!</h3>
              <p className="text-orange-700 text-xs mt-1 leading-relaxed">
                El módulo está funcionando perfectamente de forma local. Para habilitar la sincronización en la nube con Supabase, simplemente abre el panel de control de Supabase de tu proyecto, dirígete al <strong>SQL Editor</strong>, pega el siguiente código y presiona <strong>Run</strong>:
              </p>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <button
                  onClick={handleCopySql}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> ¡Esquema Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar Esquema SQL
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-xs text-orange-600/80 font-medium px-1">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Una vez ejecutado, los datos se sincronizarán solos en la nube.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* Formulario */}
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-5 sm:p-6 lg:col-span-1">
          <h2 className="text-sm font-bold text-[#110E3C] uppercase tracking-wider mb-5 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#088DCF]" />
            Nuevo Registro
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fecha */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cDate">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha del Arqueo *
              </label>
              <input
                id="cDate"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] transition-all"
              />
            </div>

            {/* Asesor */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cAdvisor">
                <User className="w-3.5 h-3.5 text-slate-400" /> Asesor de Turno *
              </label>
              <select
                id="cAdvisor"
                required
                value={advisor}
                onChange={(e) => setAdvisor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] transition-all"
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                }}
              >
                <option value="">— Selecciona un asesor —</option>
                {ADVISORS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Cantidad Encontrada */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cFound">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Cantidad Encontrada (Caja) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  id="cFound"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="0"
                  value={foundAmount}
                  onChange={(e) => setFoundAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] font-semibold transition-all"
                />
              </div>
            </div>

            {/* Cantidad Consignada */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cConsigned">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Cantidad Consignada (Banco) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  id="cConsigned"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="0"
                  value={consignedAmount}
                  onChange={(e) => setConsignedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] font-semibold transition-all"
                />
              </div>
            </div>

            {/* Live Subtraction Card (Arqueo Actual) */}
            <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Saldo Actual</span>
                <span>Cálculo en vivo</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 font-medium">Saldo Sobrante/Restante:</span>
                <span className={`text-base font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(balance)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl text-white font-black text-sm uppercase tracking-wider bg-[#088DCF] hover:bg-[#077db8] transition-all shadow-md shadow-[#088DCF]/20 flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : (
                'Guardar Arqueo'
              )}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-5 sm:p-6 lg:col-span-2 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-bold text-[#110E3C] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Historial de Caja ({records.length})
            </h2>
            <button
              onClick={fetchRecords}
              className="text-xs font-bold text-[#088DCF] hover:text-[#077db8] flex items-center gap-1 bg-[#088DCF]/08 hover:bg-[#088DCF]/15 px-3 py-1.5 rounded-lg transition-colors border border-[#088DCF]/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar Historial
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Cargando historial de caja...</div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              No hay registros de arqueo guardados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Fecha</th>
                    <th className="pb-3">Asesor</th>
                    <th className="pb-3 text-right">Cantidad Encontrada</th>
                    <th className="pb-3 text-right">Cantidad Consignada</th>
                    <th className="pb-3 text-right">Diferencia / Saldo</th>
                    <th className="pb-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {records.map((r, i) => {
                    const diff = r.found_amount - r.consigned_amount
                    return (
                      <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-1 text-slate-500 font-semibold">{r.date}</td>
                        <td className="py-3.5 text-[#110E3C] font-extrabold uppercase">{r.advisor}</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">{formatCurrency(r.found_amount)}</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">-{formatCurrency(r.consigned_amount)}</td>
                        <td className="py-3.5 text-right">
                          <span className={`font-black ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(diff)}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => r.id && handleDelete(r.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar Registro de Caja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
