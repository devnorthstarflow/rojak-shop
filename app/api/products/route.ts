import { NextRequest, NextResponse } from 'next/server'
import { fetchSubcategoryPage } from '@/lib/scraper'
import { Product } from '@/types'
import fs from 'fs'
import path from 'path'

const PAGE_SIZE = 24

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

const URL_TO_SUBCAT: Record<string, string> = {
  // BIO
  'coco':                                'Noix de Coco',
  'pates-de-riz-nouilles-et-vermicelles':'Pâtes de riz & Nouilles',
  'riz':                                 'Riz BIO',
  'sauces-produits-bio':                 'Sauces & Curry BIO',
  'champignons-baies':                   'Champignons & Baies',
  'herbes':                              'Herbes BIO',
  'graines':                             'Graines BIO',
  'sucres':                              'Sucres BIO',
  'the':                                 'Thé BIO',
  'crackers-de-riz':                     'Crackers de riz',
  // Épicerie
  'galettes-pates-vermicelles':          'Galettes, Pâtes, Vermicelles',
  'farines-aides-culinaires':            'Farines & Aides culinaires',
  'riz-cereales-legumineuses':           'Riz, Céréales, Légumineuses',
  'soupes-nouilles-instantanees':        'Soupes & Nouilles instant.',
  'huiles-vinaigres-alcools-culinaires': 'Huiles, Vinaigres & Alcools',
  'epices-assaisonnements':              'Épices & Assaisonnements',
  'sauces':                              'Sauces',
  'conserves':                           'Conserves',
  'legumes-fruits-plantes-seches':       'Légumes & Fruits séchés',
  'snacks-desserts':                     'Snacks & Desserts',
  'the-infusions-instantanes':           'Thés & Infusions',
  // Surgelés
  'dimsum-vapeur':                       'Surgelés',
  'dimsum-bouilli':                      'Surgelés',
  'dimsum-poele-frit':                   'Surgelés',
  'brioches-galettes-salees':            'Surgelés',
  'plats-prepares':                      'Surgelés',
  'derives-riz-ble-soja':                'Surgelés',
  'poissons':                            'Surgelés',
  'crevettes-crabes':                    'Surgelés',
  'fruits-de-mer-grenouilles':           'Surgelés',
  'viandes-volailles':                   'Surgelés',
  'snacks-desserts-surgeles':            'Surgelés',
  'mollusques':                          'Surgelés',
  // Boissons — sous-catégories exactes
  'jus-noix-coco':                       'Jus de coco',
  'boisson-base-fruits':                 'Jus de fruits',
  'boissons-au-the':                     'Boissons au thé',
  'boissons-gazeuses-sodas':             'Boissons gazeuses',
  'boissons-au-soja':                    'Boissons au soja',
  'boissons-aux-plantes':                'Boissons aux plantes',
  'autres-boissons':                     'Autres boissons',
  'bieres':                              'Bières',
  'sake':                                'Sake',
  'liqueurs':                            'Liqueurs',
  'autres-alcools':                      'Autres alcools',
  // Divers
  'cuisson-ustensiles':                  'Divers',
  'vaisselle':                           'Divers',
  'arts-de-la-table':                    'Divers',
  'decoration':                          'Divers',
}

function subcatFromUrl(url: string): string {
  const segment = url.replace(/\/$/, '').split('/').pop() ?? ''
  return URL_TO_SUBCAT[segment] ?? ''
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const url      = searchParams.get('url')
  const page     = parseInt(searchParams.get('page') ?? '1')
  const search   = searchParams.get('search')?.toLowerCase() ?? ''
  const category = searchParams.get('category') ?? ''

  const all = loadStaticProducts()

  // ── Recherche globale ─────────────────────────────────────────────────────
  if (search || category) {
    if (!all) return NextResponse.json({ products: [], maxPage: 1, total: 0, source: 'none' })
    let filtered = all
    if (search) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.ref?.includes(search) ||
        (p as any).brand?.toLowerCase().includes(search) ||
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
  if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 })

  if (all && all.length > 0) {
    const targetSubcat = subcatFromUrl(url)

    let filtered = all.filter(p => {
      if (targetSubcat) return p.subcategory === targetSubcat
      const segment = url.replace(/\/$/, '').split('/').pop() ?? ''
      return p.category?.toLowerCase().includes(segment) ||
             p.subcategory?.toLowerCase().includes(segment)
    })

    // Fallback Surgelés : toute la catégorie
    if (filtered.length === 0 && targetSubcat === 'Surgelés') {
      filtered = all.filter(p => p.category === 'Surgelés')
    }

    if (filtered.length > 0) {
      const total   = filtered.length
      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
      const slice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      return NextResponse.json({ products: slice, maxPage, total, source: 'static' })
    }
  }

  // ── Fallback live scraping ────────────────────────────────────────────────
  try {
    const data = await fetchSubcategoryPage(url, page)
    return NextResponse.json({ ...data, source: 'live' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fetch failed', products: [], maxPage: 1, total: 0 }, { status: 500 })
  }
}
