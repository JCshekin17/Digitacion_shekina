import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export type SaleRecord = {
  id?: string
  created_at?: string
  date: string
  customer_name: string
  passport_id: string
  phone: string
  email: string
  country: string
  city: string
  hotel: string
  room: string
  pax: number
  service: string
  total_price: number
  deposit: number
  balance: number
  seller: string
}
