'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ProductGrid from '@/components/ProductGrid'
import CartDrawer from '@/components/CartDrawer'
import { SUBCATEGORIES } from '@/lib/scraper'

export default function ShopShell() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [currentName, setCurrentName] = useState('')
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

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
        <Sidebar
          currentUrl={currentUrl}
          onSelect={handleSelect}
          mobileOpen={mobileMenu}
          onMobileClose={() => setMobileMenu(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {search.trim() ? (
            <SearchPage query={search} onSelect={handleSelect} cats={cats} />
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

/* ── Home ── */
function HomePage({ cats, onSelect }: {
  cats: Record<string, typeof SUBCATEGORIES>
  onSelect: (url: string, name: string) => void
}) {
  return (
    <div>
      {/* Hero banner */}
      <div className="relative px-8 py-12 overflow-hidden"
        style={{ background: 'var(--green)' }}>
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--gold)' }} />
        <div className="absolute right-32 bottom-0 w-32 h-32 rounded-full opacity-5"
          style={{ background: 'var(--gold)' }} />

        <div className="relative max-w-2xl">
          <div className="text-xs font-syne font-bold tracking-[0.25em] uppercase mb-3"
            style={{ color: 'var(--gold)' }}>
            Épicerie Asiatique Premium
          </div>
          <h1 className="font-syne font-black text-white text-3xl md:text-4xl leading-tight mb-2">
            Explorez le catalogue
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-lg">
            Parcourez notre sélection de produits asiatiques — riz, sauces, nouilles, surgelés et bien plus.
            Constituez votre liste et préparez-vous pour l'ouverture du marché.
          </p>

          {/* Tagline */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 max-w-12" style={{ background: 'var(--gold)', opacity: 0.4 }} />
            <span className="text-sm italic" style={{ color: 'var(--gold)' }}>
              Singapore spirit. Alpine soul.
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-8 flex flex-wrap gap-6">
          {[
            ['11 000+', 'produits référencés'],
            ['2027', 'ouverture cible'],
            ['Pays de Gex', 'frontière Genève'],
          ].map(([val, label]) => (
            <div key={val}>
              <div className="font-syne font-black text-xl" style={{ color: 'var(--gold)' }}>{val}</div>
              <div className="text-[11px] text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="mx-6 mt-5 mb-2 rounded-xl px-5 py-3 flex items-start gap-3"
        style={{ background: 'var(--gold-bg)', border: '1px solid rgba(196,160,82,0.35)' }}>
        <span className="text-lg mt-0.5">🕐</span>
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--green)' }}>
            Boutique en cours de construction
          </div>
          <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Le partenariat d'approvisionnement est en cours de finalisation.
            Ce catalogue vous permet de préparer vos listes dès maintenant.
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="p-6">
        {Object.entries(cats).map(([cat, subs]) => (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.split(' ')[0]}</span>
              <h2 className="font-syne font-bold text-sm uppercase tracking-wider"
                style={{ color: 'var(--green)' }}>
                {cat.replace(/^\S+\s/, '')}
              </h2>
              <div className="flex-1 h-px ml-2" style={{ background: 'var(--border)' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {subs.map(sub => (
                <button
                  key={sub.url}
                  onClick={() => onSelect(sub.url, sub.name)}
                  className="rounded-xl px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'white',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
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
                  <div className="text-[11px] font-medium leading-snug">{sub.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Category ── */
function CategoryPage({ name, url, onHome }: { name: string; url: string; onHome: () => void }) {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-5" style={{ color: 'var(--muted)' }}>
        <button onClick={onHome}
          className="hover:underline transition-colors"
          style={{ color: 'var(--green)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--green)' }}>
          Accueil
        </button>
        <span style={{ color: 'var(--gold)' }}>›</span>
        <span>{name}</span>
      </div>

      <div className="flex items-end gap-3 mb-6 pb-4" style={{ borderBottom: '2px solid var(--gold)', borderBottomWidth: '1px' }}>
        <h1 className="font-serif text-2xl" style={{ color: 'var(--green)' }}>{name}</h1>
      </div>

      <ProductGrid subcategoryUrl={url} subcategoryName={name} />
    </div>
  )
}

/* ── Search ── */
function SearchPage({ query, onSelect, cats }: {
  query: string
  onSelect: (url: string, name: string) => void
  cats: Record<string, typeof SUBCATEGORIES>
}) {
  const ql = query.toLowerCase()
  const matches = Object.values(cats).flat().filter(s =>
    s.name.toLowerCase().includes(ql) || s.category.toLowerCase().includes(ql)
  )

  return (
    <div className="p-6">
      <h2 className="font-serif text-xl mb-1" style={{ color: 'var(--green)' }}>
        Résultats pour « {query} »
      </h2>
      {matches.length > 0 ? (
        <>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            {matches.length} catégorie{matches.length > 1 ? 's' : ''} trouvée{matches.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {matches.map(s => (
              <button
                key={s.url}
                onClick={() => onSelect(s.url, s.name)}
                className="px-4 py-2 rounded-full text-sm transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text)', background: 'white' }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--gold)'
                  el.style.color = 'var(--green)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border)'
                  el.style.color = 'var(--text)'
                }}>
                {s.category.split(' ')[0]} {s.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
          Aucune catégorie trouvée. Essayez : riz, sauce, nouilles, bière…
        </p>
      )}
    </div>
  )
}
