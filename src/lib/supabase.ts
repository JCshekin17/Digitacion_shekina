import { createClient } from '@supabase/supabase-js'

// Hardcoded with the EXACT key provided in the conversation
const supabaseUrl = 'https://sunjrcecovsmiqynwxfd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bmpyY2Vjb3ZzbWlxeW53eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzExMjcsImV4cCI6MjA5MzA0NzEyN30.-3o4pqh3ILm6Igrf8n5b0D9B8mcNXrJ2li8QAdMFPfE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
