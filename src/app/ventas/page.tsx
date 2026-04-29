import SalesForm from '@/components/SalesForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ingreso de Ventas — Reservas Shekina 2.0',
  description: 'Formulario de registro de ventas y reservas para asesoras de Shekina Tours',
}

export default function VentasPage() {
  return <SalesForm />
}
