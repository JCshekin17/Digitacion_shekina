'use client'

import { useMemo } from 'react'
import type { SaleRecord } from '@/lib/supabase'

interface CalendarViewProps {
  records: SaleRecord[]
  currentDate: Date
  onDateChange: (date: Date) => void
  onRecordClick: (record: SaleRecord) => void
}

export default function CalendarView({ records, currentDate, onDateChange, onRecordClick }: CalendarViewProps) {
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Array of days to render (including padding for first week)
    const days = []
    
    // Padding days from previous month to align with weekday (0 = Sunday, 1 = Monday...)
    const startPadding = firstDay.getDay()
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Actual days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        day: i,
        dateStr,
        records: records.filter(r => r.date === dateStr)
      })
    }
    return days
  }, [currentDate, records])

  const nextMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })

  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white capitalize">{monthName}</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn-secondary px-3 py-1 text-sm">◀ Anterior</button>
          <button onClick={() => onDateChange(new Date())} className="btn-secondary px-3 py-1 text-sm">Hoy</button>
          <button onClick={nextMonth} className="btn-secondary px-3 py-1 text-sm">Siguiente ▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weekdays.map(day => (
          <div key={day} className="text-center font-bold text-xs sm:text-sm text-slate-400 py-2 border-b border-white/5">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((dayData, index) => (
          <div 
            key={index} 
            className={`min-h-[80px] sm:min-h-[100px] p-1 border rounded-lg overflow-hidden flex flex-col ${
              dayData 
                ? 'border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors' 
                : 'border-transparent'
            }`}
          >
            {dayData && (
              <>
                <div className={`text-right text-xs font-bold mb-1 ${
                  dayData.dateStr === new Date().toISOString().split('T')[0] 
                    ? 'text-orange-400' 
                    : 'text-slate-500'
                }`}>
                  {dayData.day}
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto flex-1 scrollbar-hide">
                  {dayData.records.map(record => (
                    <button
                      key={record.id}
                      onClick={() => onRecordClick(record)}
                      className="text-left w-full truncate px-1.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-[10px] sm:text-xs transition-colors border border-blue-500/20"
                      title={`${record.customer_name} - ${record.service}`}
                    >
                      <span className="font-bold">{record.pax}x</span> {record.customer_name?.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
