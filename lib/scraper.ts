import { Product } from '@/types'

const BASE = 'https://www.tang-freres.fr'

export const SUBCATEGORIES = [
  { category: '🌿 BIO', name: 'Noix de Coco', url: '/produits-asiatiques/produits-bio/coco/' },
  { category: '🌿 BIO', name: 'Pâtes de riz & Nouilles', url: '/produits-asiatiques/produits-bio/pates-de-riz-nouilles-et-vermicelles/' },
  { category: '🌿 BIO', name: 'Riz BIO', url: '/produits-asiatiques/produits-bio/riz/' },
  { category: '🌿 BIO', name: 'Sauces & Curry BIO', url: '/produits-asiatiques/produits-bio/sauces-produits-bio/' },
  { category: '🌿 BIO', name: 'Champignons & Baies', url: '/produits-asiatiques/produits-bio/champignons-baies/' },
  { category: '🌿 BIO', name: 'Herbes BIO', url: '/produits-asiatiques/produits-bio/herbes/' },
  { category: '🌿 BIO', name: 'Graines BIO', url: '/produits-asiatiques/produits-bio/graines/' },
  { category: '🌿 BIO', name: 'Crackers de riz', url: '/produits-asiatiques/produits-bio/crackers-de-riz/' },
  { category: '🛒 Épicerie', name: 'Galettes, Pâtes, Vermicelles', url: '/produits-asiatiques/epicerie/galettes-pates-vermicelles/' },
  { category: '🛒 Épicerie', name: 'Farines & Aides culinaires', url: '/produits-asiatiques/epicerie/farines-aides-culinaires/' },
  { category: '🛒 Épicerie', name: 'Riz, Céréales, Légumineuses', url: '/produits-asiatiques/epicerie/riz-cereales-legumineuses/' },
  { category: '🛒 Épicerie', name: 'Soupes & Nouilles instant.', url: '/produits-asiatiques/epicerie/soupes-nouilles-instantanees/' },
  { category: '🛒 Épicerie', name: 'Huiles, Vinaigres & Alcools', url: '/produits-asiatiques/epicerie/huiles-vinaigres-alcools-culinaires/' },
  { category: '🛒 Épicerie', name: 'Épices & Assaisonnements', url: '/produits-asiatiques/epicerie/epices-assaisonnements/' },
  { category: '🛒 Épicerie', name: 'Sauces', url: '/produits-asiatiques/epicerie/sauces/' },
  { category: '🛒 Épicerie', name: 'Conserves', url: '/produits-asiatiques/epicerie/conserves/' },
  { category: '🛒 Épicerie', name: 'Légumes & Fruits séchés', url: '/produits-asiatiques/epicerie/legumes-fruits-plantes-seches/' },
  { category: '🛒 Épicerie', name: 'Snacks & Desserts', url: '/produits-asiatiques/epicerie/snacks-desserts/' },
  { category: '🛒 Épicerie', name: 'Thés & Infusions', url: '/produits-asiatiques/epicerie/the-infusions-instantanes/' },
  { category: '❄️ Surgelés', name: 'Dimsum vapeur', url: '/produits-asiatiques/surgeles/dimsum-vapeur/' },
  { category: '❄️ Surgelés', name: 'Dimsum bouilli', url: '/produits-asiatiques/surgeles/dimsum-bouilli/' },
  { category: '❄️ Surgelés', name: 'Dimsum poêlé/frit', url: '/produits-asiatiques/surgeles/dimsum-poele-frit/' },
  { category: '❄️ Surgelés', name: 'Brioches & Galettes', url: '/produits-asiatiques/surgeles/brioches-galettes-salees/' },
  { category: '❄️ Surgelés', name: 'Plats préparés', url: '/produits-asiatiques/surgeles/plats-prepares/' },
  { category: '❄️ Surgelés', name: 'Dérivés riz, blé, soja', url: '/produits-asiatiques/surgeles/derives-riz-ble-soja/' },
  { category: '❄️ Surgelés', name: 'Poissons', url: '/produits-asiatiques/surgeles/poissons/' },
  { category: '❄️ Surgelés', name: 'Crevettes & Crabes', url: '/produits-asiatiques/surgeles/crevettes-crabes/' },
  { category: '❄️ Surgelés', name: 'Autres fruits de mer', url: '/produits-asiatiques/surgeles/fruits-de-mer-grenouilles/' },
  { category: '❄️ Surgelés', name: 'Viandes & Volailles', url: '/produits-asiatiques/surgeles/viandes-volailles/' },
  { category: '❄️ Surgelés', name: 'Snacks surgelés', url: '/produits-asiatiques/surgeles/snacks-desserts-surgeles/' },
  { category: '🧋 Boissons', name: 'Jus de coco', url: '/produits-asiatiques/boissons/jus-noix-coco/' },
  { category: '🧋 Boissons', name: 'Jus de fruits', url: '/produits-asiatiques/boissons/boisson-base-fruits/' },
  { category: '🧋 Boissons', name: 'Boissons au thé', url: '/produits-asiatiques/boissons/boissons-au-the/' },
  { category: '🧋 Boissons', name: 'Boissons gazeuses', url: '/produits-asiatiques/boissons/boissons-gazeuses-sodas/' },
  { category: '🧋 Boissons', name: 'Boissons au soja', url: '/produits-asiatiques/boissons/boissons-au-soja/' },
  { category: '🧋 Boissons', name: 'Bières', url: '/produits-asiatiques/boissons/bieres/' },
  { category: '🧋 Boissons', name: 'Sake & Liqueurs', url: '/produits-asiatiques/boissons/sake/' },
  { category: '🏮 Divers', name: 'Cuisson & Ustensiles', url: '/produits-asiatiques/divers/cuisson-ustensiles/' },
  { category: '🏮 Divers', name: 'Vaisselle', url: '/produits-asiatiques/divers/vaisselle/' },
  { category: '🏮 Divers', name: 'Arts de la table', url: '/produits-asiatiques/divers/arts-de-la-table/' },
]

function parseProducts(html: string, category: string, subcategory: string): { products: Product[], maxPage: number } {
  const products: Product[] = []
  const seen = new Set<string>()

  // Match linked product blocks: <a href="/produits-asiatiques/...SLUG-REF/"><img...><h2>NAME</h2></a>
  const blockRe = /<a\s[^>]*href="(\/produits-asiatiques\/[^"]+?-(\d{5,6})\/?)"[^>]*>([\s\S]*?)<\/a>/gi
  const imgRe = /src="(https?:\/\/[^"]*(?:produits\/|uploads\/)[^"]*?\.(jpg|png|webp))"/i
  const h2Re = /<h2[^>]*>([\s\S]*?)<\/h2>/i
  const tagRe = /<[^>]+>/g

  let match
  while ((match = blockRe.exec(html)) !== null) {
    const [, path, ref, inner] = match
    if (seen.has(path)) continue

    const h2 = h2Re.exec(inner)
    if (!h2) continue
    const name = h2[1].replace(tagRe, '').replace(/\s+/g, ' ').trim()
    if (!name || name.length < 3) continue

    const imgMatch = imgRe.exec(inner)
    let img = imgMatch ? imgMatch[1] : ''
    // normalize: remove -WxH suffix
    img = img.replace(/-\d+x\d+(\.(jpg|png|webp))/, '$1')

    // fallback image from ref
    if (!img && ref) img = `${BASE}/wp-content/uploads/produits/${ref}.jpg`

    seen.add(path)
    products.push({
      id: ref,
      name,
      ref,
      img,
      url: `${BASE}${path}`,
      category,
      subcategory,
    })
  }

  const pageNums = [...html.matchAll(/\?n=(\d+)/g)].map(m => parseInt(m[1]))
  const maxPage = pageNums.length > 0 ? Math.max(...pageNums) : 1

  return { products, maxPage }
}

export async function fetchSubcategoryPage(url: string, page = 1): Promise<{ products: Product[], maxPage: number }> {
  const fullUrl = `${BASE}${url}${page > 1 ? `?n=${page}` : ''}`

  const res = await fetch(fullUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    },
    next: { revalidate: 3600 }, // cache 1h
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${fullUrl}`)

  const html = await res.text()
  const sub = SUBCATEGORIES.find(s => s.url === url)
  return parseProducts(html, sub?.category ?? '', sub?.name ?? '')
}

export function getImageUrl(product: Product): string {
  if (product.img && product.img.includes('tang-freres')) return product.img
  if (product.ref) return `${BASE}/wp-content/uploads/produits/${product.ref}.jpg`
  return '/placeholder.png'
}
