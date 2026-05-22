import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = 'https://ftzawlowchbxtigmumaj.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0emF3bG93Y2hieHRpZ211bWFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ3MTMyMSwiZXhwIjoyMDk1MDQ3MzIxfQ.ie1AoeyziWnOS3XXufFWS_1qQxfCF_74x_3XJrmrqUc'

const supabase = createClient(url, key)
const products = JSON.parse(readFileSync(join(__dirname, '../public/products.json'), 'utf-8'))

console.log('📦 Import de ' + products.length + ' produits vers Supabase...')

const BATCH = 200
let total = 0

for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH).map(p => ({
    id: p.ref, ref: p.ref,
    name: p.name || 'Produit ' + p.ref,
    name_fr: p.name_fr || '', name_en: p.name_en || '',
    brand: p.brand || '', conditionnement: p.conditionnement || '',
    origine: p.origine || '', category: p.category || '',
    subcategory: p.subcategory || '', img: p.img || '', url: p.url || '',
  }))
  const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' })
  if (error) { console.error('Erreur:', error.message) }
  else { total += batch.length; console.log('  ✓ ' + total + '/' + products.length) }
}

console.log('\n✅ ' + total + ' produits importés dans Supabase')