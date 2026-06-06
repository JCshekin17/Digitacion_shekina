'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const loginEmail = email.includes('@') ? email.toLowerCase().trim() : `${email.toLowerCase().trim()}@shekina.com`

  console.log('[LoginAction] Attempting login for:', loginEmail)

  const cookieStore = await cookies()
  // Clean up any potentially corrupted HttpOnly cookies from previous bugs
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('sb-') && cookie.name.includes('-auth-token')) {
      cookieStore.delete(cookie.name)
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  if (error) {
    console.error('[LoginAction] Login failed:', error.message)
    return { error: error.message }
  }

  console.log('[LoginAction] Login successful! Returning success to client.')
  
  return { success: true }
}
