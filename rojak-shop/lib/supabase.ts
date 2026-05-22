import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export type Product = {
  id: string
  ref: string
  name: string
  name_fr: string
  name_en: string
  brand: string
  conditionnement: string
  origine: string
  category: string
  subcategory: string
  img: string
  url: string
  price_ht?: number
  in_stock?: boolean
}

export type CartItem = {
  id?: number
  session_id: string
  product_ref: string
  product_name: string
  brand: string
  conditionnement: string
  quantity: number
  price_ht?: number
  created_at?: string
}
