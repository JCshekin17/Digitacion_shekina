import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

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
  discount?: number
  deposit: number
  balance: number
  seller: string
  payment_method?: string
  payment_proof_url?: string
}

export type CashRecord = {
  id?: string
  created_at?: string
  date: string
  advisor: 'YIRLEY' | 'KEREN' | 'GABRIELA' | string
  found_amount: number
  consigned_amount: number
  balance: number
  proof_url?: string
}
