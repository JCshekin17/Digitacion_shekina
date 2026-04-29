import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Panel de Control — Reservas Shekina 2.0',
  description: 'Dashboard ejecutivo con KPIs de ventas, cartera y exportación CSV para Shekina Tours',
}

export default function DashboardPage() {
  return <Dashboard />
}
