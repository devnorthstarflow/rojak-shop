/**
 * Import products.json → Supabase
 * Usage: node scripts/import-to-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const __dirname = dirname(fileURLToPath(import.meta.url))
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('❌ Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_KEY dans .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)
const products = JSON.parse(readFileSync(join(__dirname, '../public/products.json'), 'utf-8'))

console.log(`📦 Import de ${products.length} produits vers Supabase...`)

const BATCH = 200
let total = 0

for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH).map(p => ({
    id: p.ref, ref: p.ref,
    name: p.name || `Produit ${p.ref}`,
    name_fr: p.name_fr || '', name_en: p.name_en || '',
    brand: p.brand || '', conditionnement: p.conditionnement || '',
    origine: p.origine || '', category: p.category || '',
    subcategory: p.subcategory || '', img: p.img || '', url: p.url || '',
  }))
  
  const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' })
  if (error) { console.error(`  ✗ batch ${i}:`, error.message) }
  else { total += batch.length; console.log(`  ✓ ${total}/${products.length}`) }
}

console.log(`\n✅ ${total} produits importés dans Supabase`)
