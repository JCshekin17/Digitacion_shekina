import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Admin section is only for the admin
  if (user.email !== 'shekinatoursylogistica@outlook.com') {
    redirect(`/${locale}/caja`)
  }

  return <>{children}</>
}
