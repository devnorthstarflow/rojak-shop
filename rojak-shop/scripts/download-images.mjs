/**
 * Télécharge et optimise les images produits depuis tang-freres.fr
 * Usage: node scripts/download-images.mjs
 * 
 * - Télécharge uniquement les images manquantes
 * - Compresse en WebP 200x200px (< 15KB chacune)
 * - Génère public/images/REF.webp
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PRODUCTS_FILE = join(__dirname, '../public/products.json')
const IMAGES_DIR    = join(__dirname, '../public/images')
const BASE_IMG_URL  = 'https://www.tang-freres.fr/wp-content/uploads/produits'
const DELAY_MS      = 300
const CONCURRENT    = 5

mkdirSync(IMAGES_DIR, { recursive: true })

const products = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf-8'))
const refs = [...new Set(products.map(p => p.ref))].filter(Boolean)
const missing = refs.filter(ref => !existsSync(join(IMAGES_DIR, `${ref}.webp`))
                                && !existsSync(join(IMAGES_DIR, `${ref}.jpg`)))

console.log(`📸 ${refs.length} produits | ${missing.length} images à télécharger`)
console.log(`   Dossier : ${IMAGES_DIR}`)

if (missing.length === 0) {
  console.log('✅ Toutes les images sont déjà téléchargées !')
  process.exit(0)
}

// Check si sharp est disponible pour la compression
let sharp
try {
  const m = await import('sharp')
  sharp = m.default
  console.log('✓ sharp disponible — compression WebP activée\n')
} catch {
  console.log('⚠ sharp non installé — images JPEG brutes (lance: npm install sharp)\n')
}

async function downloadImage(ref) {
  const outPath = join(IMAGES_DIR, `${ref}.${sharp ? 'webp' : 'jpg'}`)
  if (existsSync(outPath)) return { ref, status: 'skip' }

  const urls = [
    `${BASE_IMG_URL}/${ref}.jpg`,
    `${BASE_IMG_URL}/${ref}.png`,
    `${BASE_IMG_URL}/${ref}.jpeg`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.tang-freres.fr/' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue

      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 500) continue // image vide

      if (sharp) {
        // Compresse en WebP 200x200 max (garde ratio)
        await sharp(buf)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(outPath)
      } else {
        writeFileSync(outPath, buf)
      }
      return { ref, status: 'ok', url }
    } catch {}
  }
  return { ref, status: 'error' }
}

// Téléchargement par batches
let done = 0, ok = 0, errors = 0
const start = Date.now()

for (let i = 0; i < missing.length; i += CONCURRENT) {
  const batch = missing.slice(i, i + CONCURRENT)
  const results = await Promise.all(batch.map(downloadImage))
  
  for (const r of results) {
    done++
    if (r.status === 'ok') ok++
    else if (r.status === 'error') errors++
  }

  const pct  = Math.round(done * 100 / missing.length)
  const mins = Math.round((Date.now() - start) / 60000)
  process.stdout.write(`\r  ${pct}% (${done}/${missing.length}) | ✓${ok} ✗${errors} | ${mins}min`)
  
  await new Promise(r => setTimeout(r, DELAY_MS))
}

console.log(`\n\n✅ Terminé : ${ok} images téléchargées, ${errors} erreurs`)
console.log(`   Taille : ${(ok * 12 / 1024).toFixed(0)} MB environ (WebP ~12KB/image)`)
