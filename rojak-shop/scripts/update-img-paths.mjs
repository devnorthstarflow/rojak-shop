/**
 * Met à jour products.json pour pointer vers les images locales
 * Usage: node scripts/update-img-paths.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRODUCTS_FILE = join(__dirname, '../public/products.json')
const IMAGES_DIR    = join(__dirname, '../public/images')

const products = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'))
let updated = 0

const result = products.map(p => {
  const webp = join(IMAGES_DIR, `${p.ref}.webp`)
  const jpg  = join(IMAGES_DIR, `${p.ref}.jpg`)
  let img = p.img
  if (existsSync(webp))     { img = `/images/${p.ref}.webp`; updated++ }
  else if (existsSync(jpg)) { img = `/images/${p.ref}.jpg`;  updated++ }
  return { ...p, img }
})

writeFileSync(PRODUCTS_FILE, JSON.stringify(result, null, 0))
console.log(`✅ ${updated}/${products.length} produits mis à jour avec images locales`)
