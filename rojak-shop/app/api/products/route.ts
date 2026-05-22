import { NextRequest, NextResponse } from 'next/server'
import { fetchSubcategoryPage } from '@/lib/scraper'
import { Product } from '@/types'
import fs from 'fs'
import path from 'path'

const PAGE_SIZE = 24

function loadAll(): Product[] | null {
  try {
    const fp = path.join(process.cwd(), 'public', 'products.json')
    if (!fs.existsSync(fp)) return null
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch { return null }
}

// Extrait le segment final d'une URL de sous-catégorie
// ex: /produits-asiatiques/produits-bio/riz/ → "riz"
function urlToSegment(url: string): string {
  return url.replace(/\/$/, '').split('/').pop() ?? ''
}

// Vérifie si l'URL d'un produit correspond à la sous-catégorie demandée
// ex: produit.url = "https://.../.../riz-jasmin-cock-123456/"
//     subUrl      = "/produits-asiatiques/produits-bio/riz/"
// → on vérifie que l'URL du produit CONTIENT le path de la sous-cat
function matchesSub(product: Product, subUrl: string): boolean {
  // Enlève le dernier segment (slug produit) de l'URL produit
  // pour ne garder que le chemin de catégorie
  const prodPath = new URL(product.url).pathname
    .replace(/\/$/, '')
    .split('/')
    .slice(0, -1)
    .join('/') + '/'

  return prodPath === subUrl || product.url.includes(subUrl.replace(/\/$/, ''))
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const subUrl = searchParams.get('url') ?? ''
  const page   = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search')?.toLowerCase().trim() ?? ''

  const all = loadAll()

  // ── Recherche globale ─────────────────────────────────────────────────────
  if (search) {
    if (!all) return NextResponse.json({ products: [], maxPage: 1, total: 0 })
    const filtered = all.filter(p =>
      p.name.toLowerCase().includes(search) ||
      (p.ref && p.ref.includes(search)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(search)) ||
      (p.category && p.category.toLowerCase().includes(search))
    )
    const total   = filtered.length
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const slice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return NextResponse.json({ products: slice, maxPage, total, source: 'static-search' })
  }

  if (!subUrl) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // ── Filtrage par sous-catégorie depuis le JSON statique ───────────────────
  if (all && all.length > 0) {
    // Filtre : l'URL du produit doit contenir le path de la sous-catégorie
    const subPath = subUrl.replace(/\/$/, '') // ex: "/produits-asiatiques/produits-bio/riz"
    const filtered = all.filter(p => {
      try {
        const prodPath = new URL(p.url).pathname.replace(/\/$/, '')
        // Le produit est dans cette sous-cat si son chemin commence par le path de la sous-cat
        return prodPath.startsWith(subPath)
      } catch {
        return p.url.includes(subPath)
      }
    })

    if (filtered.length > 0) {
      const total   = filtered.length
      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
      const slice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      return NextResponse.json({ products: slice, maxPage, total, source: 'static' })
    }
  }

  // ── Fallback : scrape live ────────────────────────────────────────────────
  try {
    const data = await fetchSubcategoryPage(subUrl, page)
    return NextResponse.json({ ...data, source: 'live' })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Fetch failed', products: [], maxPage: 1, total: 0 },
      { status: 500 }
    )
  }
}
