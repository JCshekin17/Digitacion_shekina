import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  // Use getUser() for secure server-side validation
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Dashboard is only for the admin
  if (user.email !== 'shekinatoursylogistica@outlook.com') {
    redirect(`/${locale}/caja`)
  }

  return <>{children}</>
}
