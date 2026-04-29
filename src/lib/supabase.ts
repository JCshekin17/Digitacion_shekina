import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para la tabla sales_records
export interface SaleRecord {
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
  balance?: number
  seller?: string
}
