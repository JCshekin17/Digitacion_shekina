'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const loginEmail = email.includes('@') ? email.toLowerCase().trim() : `${email.toLowerCase().trim()}@shekina.com`

  console.log('[LoginAction] Attempting login for:', loginEmail)

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  })

  if (error) {
    console.error('[LoginAction] Login failed:', error.message)
    return { error: error.message }
  }

  console.log('[LoginAction] Login successful!')
  return { success: true }
}
