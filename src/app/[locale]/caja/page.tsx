'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type CashRecord } from '@/lib/supabase'
import { Wallet, Calendar, User, DollarSign, Calculator, Info, Trash2, PlusCircle, CheckCircle, RefreshCw, AlertCircle, Copy, UploadCloud, FileText, X, ExternalLink, LogOut } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const ADVISORS = ['YIRLEY', 'KEREN', 'GABRIELA']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export default function CajaPage() {
  const [authenticated, setAuthenticated] = useState(true)
  const router = useRouter()
  const t = useTranslations('Caja')
  const tCommon = useTranslations('Common')

  const [date, setDate] = useState('')
  const [advisor, setAdvisor] = useState('')
  const [foundAmount, setFoundAmount] = useState<number | ''>('')
  const [receivedAmount, setReceivedAmount] = useState<number | ''>('')
  const [cashHandedAmount, setCashHandedAmount] = useState<number | ''>('')
  const [consignedAmount, setConsignedAmount] = useState<number | ''>('')
  const [records, setRecords] = useState<CashRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showSqlHelp, setShowSqlHelp] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [noConsignment, setNoConsignment] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const fAmt = Number(foundAmount) || 0
  const cAmt = Number(consignedAmount) || 0
  const hAmt = Number(cashHandedAmount) || 0
  const finalConsignedAmountUI = noConsignment ? 0 : cAmt
  const balance = fAmt - finalConsignedAmountUI - hAmt

  const sqlQuery = `-- EJECUTA ESTO EN TU SQL EDITOR DE SUPABASE PARA EL REGISTRO DE CAJA:

-- 1. CREAR LA TABLA
CREATE TABLE IF NOT EXISTS public.cash_records (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date          DATE NOT NULL,
  advisor       TEXT NOT NULL,
  found_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  consigned_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cash_handed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  balance       NUMERIC(12, 2) GENERATED ALWAYS AS (found_amount - consigned_amount - cash_handed_amount) STORED,
  proof_url     TEXT
);

-- SI LA TABLA YA EXISTÍA, AÑADIR LA COLUMNA FALTANTE Y RECREAR EL BALANCE:
ALTER TABLE public.cash_records ADD COLUMN IF NOT EXISTS proof_url TEXT;
ALTER TABLE public.cash_records ADD COLUMN IF NOT EXISTS received_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.cash_records ADD COLUMN IF NOT EXISTS cash_handed_amount NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.cash_records DROP COLUMN IF EXISTS balance;
ALTER TABLE public.cash_records ADD COLUMN balance NUMERIC(12, 2) GENERATED ALWAYS AS (found_amount - consigned_amount - cash_handed_amount) STORED;

-- 2. POLÍTICAS DE LA TABLA
ALTER TABLE public.cash_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.cash_records;
CREATE POLICY "Allow public read" ON public.cash_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.cash_records;
CREATE POLICY "Allow public insert" ON public.cash_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.cash_records;
CREATE POLICY "Allow public update" ON public.cash_records FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.cash_records;
CREATE POLICY "Allow public delete" ON public.cash_records FOR DELETE USING (true);

-- 3. CREAR EL BUCKET PARA LOS COMPROBANTES Y SUS POLÍTICAS
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Allow public insert" ON storage.objects;
CREATE POLICY "Allow public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');
`;

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
      } else if (data) {
        setRecords((data as CashRecord[]) || [])
      } else {
        setRecords([])
      }
    } catch (err: any) {
      setError('Error inesperado: ' + err.message)
      const local = localStorage.getItem('shekina_cash_records')
      setRecords(local ? JSON.parse(local) : [])
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    if (!authenticated) return
    setDate(new Date().toISOString().split('T')[0])
    fetchRecords()
  }, [authenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!advisor) {
      setError('Por favor selecciona un asesor')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    const finalAdvisor = noConsignment ? `${advisor} (SIN CONSIGNACIÓN)` : advisor
    const finalConsignedAmount = noConsignment ? 0 : cAmt
    const rAmt = Number(receivedAmount) || 0

    try {
      let finalProofUrl = ''

      if (proofFile && !noConsignment) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `caja_${Date.now()}_${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, proofFile)

        if (uploadError) {
          throw new Error('Error al subir el comprobante: ' + uploadError.message)
        }

        const { data: publicUrlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(fileName)

        finalProofUrl = publicUrlData.publicUrl
      }

      const newRecord: CashRecord = {
        date,
        advisor: finalAdvisor,
        found_amount: fAmt,
        consigned_amount: finalConsignedAmount,
        received_amount: rAmt,
        cash_handed_amount: hAmt,
        balance,
        proof_url: finalProofUrl,
      }

      // Intenta guardar en Supabase sin incluir la columna generada 'balance'
      const { error: sbError } = await supabase
        .from('cash_records')
        .insert([{
          date,
          advisor: finalAdvisor,
          found_amount: fAmt,
          consigned_amount: finalConsignedAmount,
          received_amount: rAmt,
          cash_handed_amount: hAmt,
          proof_url: finalProofUrl
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
        setReceivedAmount('')
        setConsignedAmount('')
        setCashHandedAmount('')
        setNoConsignment(false)
        setProofFile(null)
        fetchRecords()
      }
    } catch (err: any) {
      console.error("Error guardando en Supabase:", err);
      // Fallback
      saveLocally({
        date,
        advisor: finalAdvisor,
        found_amount: fAmt,
        consigned_amount: finalConsignedAmount,
        received_amount: rAmt,
        cash_handed_amount: hAmt,
        balance,
      })
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
    setReceivedAmount('')
    setCashHandedAmount('')
    setConsignedAmount('')
    setTimeout(() => setSuccess(false), 5000)
  }

  const handleDelete = async (id: string) => {
    const pin = prompt('Solo el administrador puede eliminar registros.\nIngrese el PIN de seguridad:')
    if (pin !== (process.env.NEXT_PUBLIC_ADMIN_PIN || 'admin123')) {
      if (pin !== null) alert('PIN incorrecto. Operación cancelada.')
      return
    }

    if (!confirm('¿Estás totalmente seguro de eliminar este registro de caja?')) return

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }



  return (
    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in" style={{ color: '#110E3C' }}>
      
      <button
        onClick={handleLogout}
        aria-label={t('logout')}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('logout')}</span>
      </button>

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
              {t('title')} <span className="text-[#088DCF]">{t('title_highlight')}</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t('subtitle')}</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-[#088DCF]/40 to-transparent" />
      </div>

      {/* Alertas */}
      {success && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50 flex items-start gap-3 animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-800 font-bold text-sm">{t('success_title')}</p>
            <p className="text-emerald-600 text-xs mt-0.5">{t('success_desc')}</p>
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
            {t('new_record')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fecha */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cDate">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('date')} *
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
                <User className="w-3.5 h-3.5 text-slate-400" /> {t('advisor')} *
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
                <option value="">{t('select_advisor')}</option>
                {ADVISORS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Cantidad Encontrada */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cFound">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {t('found_amount')} *
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

            {/* Cantidad Recibida en Turno */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cReceived">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {t('received_amount')} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  id="cReceived"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="0"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] font-semibold transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium px-1">{t('received_desc')}</p>
            </div>

            {/* Entrega en Efectivo */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cHanded">
                <Wallet className="w-3.5 h-3.5 text-slate-400" /> {t('cash_handed')} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  id="cHanded"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="0"
                  value={cashHandedAmount}
                  onChange={(e) => setCashHandedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] font-semibold transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium px-1">{t('cash_handed_desc')}</p>
            </div>

            {/* Checkbox No Consignación */}
            <div className="flex items-center gap-2 py-1.5 px-1">
              <input
                id="noConsignment"
                type="checkbox"
                checked={noConsignment}
                onChange={(e) => {
                  setNoConsignment(e.target.checked)
                  if (e.target.checked) {
                    setConsignedAmount(0)
                  } else {
                    setConsignedAmount('')
                  }
                }}
                className="w-4 h-4 rounded text-[#088DCF] focus:ring-[#088DCF]/20 border-slate-300"
              />
              <label htmlFor="noConsignment" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                {t('no_consignment')}
              </label>
            </div>

            {/* Cantidad Consignada */}
            <div className={noConsignment ? 'opacity-50' : ''}>
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5" htmlFor="cConsigned">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {t('consigned_amount')} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  id="cConsigned"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  disabled={noConsignment}
                  placeholder="0"
                  value={noConsignment ? 0 : consignedAmount}
                  onChange={(e) => setConsignedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#088DCF]/20 focus:border-[#088DCF] font-semibold transition-all"
                />
              </div>
            </div>

            {/* Comprobante de Consignación */}
            {!noConsignment && (
              <div className="animate-fade-in mt-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-slate-400" /> {t('proof')}
                </label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-[#088DCF]/40 bg-slate-50 hover:bg-[#088DCF]/02 rounded-2xl p-4 transition-all text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProofFile(e.target.files[0])
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {proofFile ? (
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 bg-white border border-slate-100 p-2 rounded-xl">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-[#088DCF] shrink-0" />
                        <span className="truncate">{proofFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProofFile(null)
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#088DCF] mx-auto mb-1.5 transition-colors" />
                      <p className="text-xs font-bold text-slate-500 group-hover:text-[#088DCF] transition-colors">{t('select_proof')}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{t('formats')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Subtraction Card (Arqueo Actual) */}
            <div className="mt-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
                <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> {t('current_balance')}</span>
                <span>{t('live_calc')}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 font-medium">{t('remaining_balance')}</span>
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
                  <RefreshCw className="w-4 h-4 animate-spin" /> {t('saving')}
                </>
              ) : (
                t('save_record')
              )}
            </button>
          </form>
        </div>

        {/* Historial y Resumen */}
        <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-5 sm:p-6 lg:col-span-2 overflow-hidden flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-[#110E3C] uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              {t('history')} ({records.length})
            </h2>
            <button
              onClick={fetchRecords}
              className="text-xs font-bold text-[#088DCF] hover:text-[#077db8] flex items-center gap-1 bg-[#088DCF]/08 hover:bg-[#088DCF]/15 px-3 py-1.5 rounded-lg transition-colors border border-[#088DCF]/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {t('refresh')}
            </button>
          </div>

          {/* Resumen Global */}
          {Array.isArray(records) && records.length > 0 && !loading && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fade-in shadow-inner">
              <h3 className="text-xs font-black text-[#110E3C] uppercase mb-3 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#088DCF]" /> {t('global_summary')}
              </h3>
              
              {/* Totales Generales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('total_found')}</p>
                  <p className="text-sm font-black text-[#110E3C]">{formatCurrency(records.reduce((acc, r) => acc + (Number(r.found_amount) || 0), 0))}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('total_received')}</p>
                  <p className="text-sm font-black text-emerald-600">{formatCurrency(records.reduce((acc, r) => acc + (Number(r.received_amount) || 0), 0))}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('total_handed')}</p>
                  <p className="text-sm font-black text-indigo-600">{formatCurrency(records.reduce((acc, r) => acc + (Number(r.cash_handed_amount) || 0), 0))}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('total_consigned')}</p>
                  <p className="text-sm font-black text-amber-600">{formatCurrency(records.reduce((acc, r) => acc + ((r.advisor || '').includes('SIN CONSIGNACIÓN') || (r.advisor || '').includes('No Consignment') ? 0 : (Number(r.consigned_amount) || 0)), 0))}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('global_diff')}</p>
                  <p className={`text-sm font-black ${records.reduce((acc, r) => acc + ((Number(r.found_amount) || 0) - ((r.advisor || '').includes('SIN CONSIGNACIÓN') ? 0 : (Number(r.consigned_amount) || 0)) - (Number(r.cash_handed_amount) || 0)), 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatCurrency(records.reduce((acc, r) => acc + ((Number(r.found_amount) || 0) - ((r.advisor || '').includes('SIN CONSIGNACIÓN') ? 0 : (Number(r.consigned_amount) || 0)) - (Number(r.cash_handed_amount) || 0)), 0))}
                  </p>
                </div>
              </div>

              {/* Distribución por Asesor */}
              <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">{t('advisor_dist')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(
                  records.reduce((acc, r) => {
                    const cleanAdv = (r.advisor || '').replace(' (SIN CONSIGNACIÓN)', '') || 'Desconocido'
                    if (!acc[cleanAdv]) acc[cleanAdv] = { count: 0, found: 0, received: 0, consigned: 0, handed: 0 }
                    acc[cleanAdv].count += 1
                    acc[cleanAdv].found += (Number(r.found_amount) || 0)
                    acc[cleanAdv].received += (Number(r.received_amount) || 0)
                    const isNoCons = (r.advisor || '').includes('SIN CONSIGNACIÓN')
                    const safeConsigned = isNoCons ? 0 : (Number(r.consigned_amount) || 0)
                    acc[cleanAdv].consigned += safeConsigned
                    acc[cleanAdv].handed += (Number(r.cash_handed_amount) || 0)
                    return acc
                  }, {} as Record<string, {count: number, found: number, received: number, consigned: number, handed: number}>)
                ).map(([adv, stats]) => (
                  <div key={adv} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-1.5 hover:border-[#088DCF]/40 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#110E3C] uppercase">{adv}</span>
                      <span className="text-[9px] font-bold text-[#088DCF] bg-[#088DCF]/10 px-1.5 py-0.5 rounded">{stats.count} registros</span>
                    </div>
                    <div className="text-[10px] flex justify-between text-slate-500 font-medium mt-1">
                      <span>Caja:</span>
                      <span className="font-bold text-slate-700">{formatCurrency(stats.found)}</span>
                    </div>
                    <div className="text-[10px] flex justify-between text-slate-500 font-medium">
                      <span>Recibido:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(stats.received)}</span>
                    </div>
                    <div className="text-[10px] flex justify-between text-slate-500 font-medium">
                      <span>Ent. Efec.:</span>
                      <span className="font-bold text-indigo-600">{formatCurrency(stats.handed)}</span>
                    </div>
                    <div className="text-[10px] flex justify-between text-slate-500 font-medium">
                      <span>Consig.:</span>
                      <span className="font-bold text-amber-600">{formatCurrency(stats.consigned)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de registros */}

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">{t('loading_history')}</div>
          ) : (!Array.isArray(records) || records.length === 0) ? (
            <div className="py-20 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              {t('no_records')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-1">{t('table_date')}</th>
                    <th className="pb-3">{t('table_advisor')}</th>
                    <th className="pb-3 text-right">{t('table_found')}</th>
                    <th className="pb-3 text-right">{t('table_received')}</th>
                    <th className="pb-3 text-right">{t('table_handed')}</th>
                    <th className="pb-3 text-right">{t('table_consigned')}</th>
                    <th className="pb-3 text-right">{t('table_diff')}</th>
                    <th className="pb-3 text-center">{t('table_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {records.map((r, i) => {
                    const safeAdvisor = r.advisor || ''
                    const isNoCons = safeAdvisor.includes('SIN CONSIGNACIÓN')
                    const cleanAdvisor = safeAdvisor.replace(' (SIN CONSIGNACIÓN)', '') || 'Desconocido'
                    const displayConsigned = isNoCons ? 0 : (Number(r.consigned_amount) || 0)
                    const diff = (Number(r.found_amount) || 0) - (Number(r.consigned_amount) || 0) - (Number(r.cash_handed_amount) || 0)
                    return (
                      <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pl-1 text-slate-500 font-semibold">{r.date}</td>
                        <td className="py-3.5 text-[#110E3C] font-extrabold uppercase">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                            <span>{cleanAdvisor}</span>
                            {isNoCons && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {t('no_consignment_badge')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-bold text-slate-600">{formatCurrency(Number(r.found_amount) || 0)}</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">{formatCurrency(Number(r.received_amount) || 0)}</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">{formatCurrency(Number(r.cash_handed_amount) || 0)}</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">
                          {isNoCons ? (
                            <span className="text-slate-400 font-semibold italic">{t('no_consignment_text')}</span>
                          ) : (
                            `-${formatCurrency(displayConsigned)}`
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`font-black ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(diff)}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {r.proof_url && (
                              <a
                                href={r.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[#088DCF] hover:text-[#077db8] hover:bg-[#088DCF]/08 rounded-lg transition-all"
                                title="Ver Comprobante de Consignación"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => r.id && handleDelete(r.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar Registro de Caja"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
