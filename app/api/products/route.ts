import { NextRequest, NextResponse } from 'next/server'
import { fetchSubcategoryPage } from '@/lib/scraper'
import { Product } from '@/types'
import fs from 'fs'
import path from 'path'

// Charge le JSON pré-scraped si disponible (généré par scraper/scrape.py)
function loadStaticProducts(): Product[] | null {
  try {
    const filePath = path.join(process.cwd(), 'public', 'products.json')
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as Product[]
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const url      = searchParams.get('url')
  const page     = parseInt(searchParams.get('page') ?? '1')
  const search   = searchParams.get('search')?.toLowerCase() ?? ''
  const category = searchParams.get('category') ?? ''
  const PAGE_SIZE = 24

  // ── Mode recherche globale ────────────────────────────────────────────────
  if (search || category) {
    const all = loadStaticProducts()
    if (!all) {
      return NextResponse.json({ products: [], maxPage: 1, total: 0, source: 'none' })
    }
    let filtered = all
    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.ref?.includes(search) ||
        p.subcategory?.toLowerCase().includes(search)
      )
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category)
    }
    const total   = filtered.length
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const slice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return NextResponse.json({ products: slice, maxPage, total, source: 'static' })
  }

  // ── Mode sous-catégorie ───────────────────────────────────────────────────
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  // 1. Essaie le JSON statique d'abord
  const all = loadStaticProducts()
  if (all) {
    const filtered = all.filter(p => {
      // Retrouve la sous-cat par son URL path
      const subPath = url.replace(/\?.*/, '')
      return p.url?.includes(subPath.replace(/\/$/, '').split('/').pop() ?? '')
        || p.subcategory && url.includes(p.subcategory)
    })
    // Fallback : filtre par URL de produit contenant le segment de l'URL
    const segment = url.replace(/\/$/, '').split('/').pop() ?? ''
    const bySegment = all.filter(p => p.url?.includes(segment))

    const result = bySegment.length > 0 ? bySegment : filtered
    const total   = result.length
    const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const slice   = result.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    if (slice.length > 0) {
      return NextResponse.json({ products: slice, maxPage, total, source: 'static' })
    }
  }

  // 2. Fallback : scrape live
  try {
    const data = await fetchSubcategoryPage(url, page)
    return NextResponse.json({ ...data, source: 'live' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fetch failed', products: [], maxPage: 1, total: 0 }, { status: 500 })
  }
}
