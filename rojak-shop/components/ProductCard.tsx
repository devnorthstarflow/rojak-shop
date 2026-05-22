'use client'

import { Product } from '@/types'
import { useCart } from '@/store/cart'
import { getImageUrl } from '@/lib/scraper'
import { ShoppingCart, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { add, items, open } = useCart()
  const [added, setAdded] = useState(false)
  const qty = items.find(i => i.product.id === product.id)?.quantity ?? 0

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    add(product)
    open()
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(28,57,40,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
    >
      {/* Image */}
      <div className="relative h-36 flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--cream)' }}>
        <img
          src={getImageUrl(product)}
          alt={product.name}
          loading="lazy"
          className="max-h-32 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={e => {
            const t = e.target as HTMLImageElement
            t.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><rect width='80' height='80' fill='%23F8F4EC'/><text x='40' y='48' text-anchor='middle' font-size='30'>📦</text></svg>`
          }}
        />
        {qty > 0 && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--green)', color: 'var(--gold)' }}>
            {qty}
          </div>
        )}
        {/* External link */}
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(28,57,40,0.85)', color: 'white' }}
          title="Voir la source">
          <ExternalLink size={10} />
        </a>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-3 gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
            {product.name}
          </p>
          {product.ref && (
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
              Réf. {product.ref}
            </p>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200"
          style={{
            background: added ? '#2A5239' : 'var(--green)',
            color: added ? '#C4A052' : 'var(--gold)',
            fontFamily: 'Syne, sans-serif',
            letterSpacing: '0.05em',
          }}>
          {added ? <Check size={11} /> : <ShoppingCart size={11} />}
          {added ? 'AJOUTÉ' : 'AJOUTER'}
        </button>
      </div>
    </div>
  )
}
