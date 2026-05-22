'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ProductGrid from '@/components/ProductGrid'
import CartDrawer from '@/components/CartDrawer'
import ProductCard from '@/components/ProductCard'
import { SUBCATEGORIES } from '@/lib/scraper'
import { Product } from '@/types'
import { Loader2, SearchX } from 'lucide-react'

export default function ShopShell() {
  const [currentUrl,  setCurrentUrl]  = useState<string | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [search,      setSearch]      = useState('')
  const [mobileMenu,  setMobileMenu]  = useState(false)

  const handleSelect = (url: string, name: string) => {
    setCurrentUrl(url); setCurrentName(name); setSearch('')
  }

  const cats = useMemo(() => {
    const map: Record<string, typeof SUBCATEGORIES> = {}
    SUBCATEGORIES.forEach(s => { if (!map[s.category]) map[s.category] = []; map[s.category].push(s) })
    return map
  }, [])

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--cream)' }}>
      <Header onSearch={setSearch} searchValue={search} onMenuToggle={() => setMobileMenu(true)} />
      <CartDrawer />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentUrl={currentUrl} onSelect={handleSelect}
          mobileOpen={mobileMenu} onMobileClose={() => setMobileMenu(false)} />
        <main className="flex-1 overflow-y-auto">
          {search.trim().length >= 2 ? (
            <SearchPage query={search} />
          ) : currentUrl ? (
            <CategoryPage name={currentName} url={currentUrl} onHome={() => setCurrentUrl(null)} />
          ) : (
            <HomePage cats={cats} onSelect={handleSelect} />
          )}
        </main>
      </div>
    </div>
  )
}

/* ── Search ── */
function SearchPage({ query }: { query: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(false)
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [maxPage,  setMaxPage]  = useState(1)

  const doSearch = useCallback(async (q: string, p: number) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${p}`)
      const data = await res.json()
      setProducts(data.products ?? [])
      setTotal(data.total ?? 0)
      setMaxPage(data.maxPage ?? 1)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { doSearch(query, 1) }, [query, doSearch])

  return (
    <div className="p-6">
      <div className="flex items-baseline gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-serif text-2xl" style={{ color: 'var(--green)' }}>
          « {query} »
        </h2>
        {!loading && (
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {total} résultat{total > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--gold)' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3" style={{ color: 'var(--muted)' }}>
          <SearchX size={40} strokeWidth={1.2} />
          <p className="text-sm">Aucun produit trouvé pour « {query} »</p>
          <p className="text-xs italic" style={{ color: 'var(--gold)' }}>
            Lancez d'abord le scraper pour indexer le catalogue
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-fade-up">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {maxPage > 1 && (
            <div className="flex justify-center gap-2 mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              {Array.from({ length: maxPage }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => doSearch(query, n)}
                  className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                  style={n === page
                    ? { background: 'var(--green)', color: 'var(--gold)', border: '1px solid var(--green)' }
                    : { border: '1px solid var(--border)', color: 'var(--text)' }}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Category ── */
function CategoryPage({ name, url, onHome }: { name: string; url: string; onHome: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-xs mb-5" style={{ color: 'var(--muted)' }}>
        <button onClick={onHome} className="hover:underline" style={{ color: 'var(--green)' }}>
          Accueil
        </button>
        <span style={{ color: 'var(--gold)' }}>›</span>
        <span>{name}</span>
      </div>
      <div className="flex items-end gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="font-serif text-2xl" style={{ color: 'var(--green)' }}>{name}</h1>
      </div>
      <ProductGrid subcategoryUrl={url} subcategoryName={name} />
    </div>
  )
}

/* ── Home ── */
function HomePage({ cats, onSelect }: {
  cats: Record<string, typeof SUBCATEGORIES>
  onSelect: (url: string, name: string) => void
}) {
  return (
    <div>
      {/* Hero */}
      <div className="relative px-8 py-12 overflow-hidden" style={{ background: 'var(--green)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--gold)' }} />
        <div className="relative max-w-2xl">
          <div className="text-xs font-syne font-bold tracking-[0.25em] uppercase mb-3"
            style={{ color: 'var(--gold)' }}>Épicerie Asiatique Premium</div>
          <h1 className="font-syne font-black text-white text-3xl md:text-4xl leading-tight mb-2">
            Explorez le catalogue
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-lg">
            Parcourez notre sélection de produits asiatiques. Constituez votre liste et préparez-vous pour l'ouverture.
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-12" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            <span className="text-sm italic" style={{ color: 'var(--gold)' }}>Singapore spirit. Alpine soul.</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-6">
          {[['11 000+', 'produits référencés'], ['2027', 'ouverture cible'], ['Pays de Gex', 'frontière Genève']].map(([v, l]) => (
            <div key={v}>
              <div className="font-syne font-black text-xl" style={{ color: 'var(--gold)' }}>{v}</div>
              <div className="text-[11px] text-white/50 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="mx-6 mt-5 mb-2 rounded-xl px-5 py-3 flex items-start gap-3"
        style={{ background: 'var(--gold-bg)', border: '1px solid rgba(196,160,82,0.35)' }}>
        <span className="text-lg mt-0.5">🕐</span>
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--green)' }}>
            Boutique en cours de construction
          </div>
          <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Partenariat d'approvisionnement en finalisation. Catalogue en preview — lancez le scraper pour indexer tous les produits.
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="p-6">
        {Object.entries(cats).map(([cat, subs]) => (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-syne font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--green)' }}>
                {cat}
              </h2>
              <div className="flex-1 h-px ml-1" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {subs.map(sub => (
                <button key={sub.url} onClick={() => onSelect(sub.url, sub.name)}
                  className="rounded-xl px-3 py-2.5 text-left text-[11px] font-medium transition-all hover:-translate-y-0.5"
                  style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--gold)'
                    el.style.boxShadow = '0 4px 12px rgba(28,57,40,0.1)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border)'
                    el.style.boxShadow = 'none'
                  }}>
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
