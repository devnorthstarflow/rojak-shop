'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'
import ProductCard from './ProductCard'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export default function ProductGrid({ subcategoryUrl, subcategoryName }: { subcategoryUrl: string; subcategoryName: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/products?url=${encodeURIComponent(subcategoryUrl)}&page=${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setProducts(data.products); setMaxPage(data.maxPage); setPage(p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError('Impossible de charger. ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [subcategoryUrl])

  useEffect(() => { setPage(1); load(1) }, [subcategoryUrl, load])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <Loader2 size={36} className="animate-spin" style={{ color: 'var(--gold)' }} />
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Chargement de {subcategoryName}…</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>
      <button onClick={() => load(page)}
        className="px-6 py-2 rounded-lg text-sm font-semibold"
        style={{ background: 'var(--green)', color: 'var(--gold)' }}>
        Réessayer
      </button>
    </div>
  )

  if (!products.length) return (
    <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
      <p className="text-4xl mb-3">📭</p>
      <p className="text-sm">Aucun produit dans cette catégorie.</p>
    </div>
  )

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-fade-up">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {maxPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => load(page - 1)} disabled={page <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(maxPage, 9) }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => load(n)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors"
              style={n === page
                ? { background: 'var(--green)', color: 'var(--gold)', border: '1px solid var(--green)' }
                : { border: '1px solid var(--border)', color: 'var(--text)' }}>
              {n}
            </button>
          ))}
          {maxPage > 9 && <span className="text-sm px-1" style={{ color: 'var(--muted)' }}>…{maxPage}</span>}

          <button onClick={() => load(page + 1)} disabled={page >= maxPage}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
