'use client'

import { useCart } from '@/store/cart'
import { getImageUrl } from '@/lib/scraper'
import { X, Minus, Plus, ShoppingCart, Trash2, ExternalLink, Copy } from 'lucide-react'

export default function CartDrawer() {
  const { items, isOpen, toggle, remove, updateQty, clear, count } = useCart()

  const copyList = () => {
    const text = items.map(i =>
      `• ${i.product.name}${i.product.ref ? ` — Réf. ${i.product.ref}` : ''} (x${i.quantity})`
    ).join('\n')
    navigator.clipboard.writeText(`🛒 Ma liste Rojak Family Market\n\n${text}`)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={toggle} />
      )}

      <div className={`fixed right-0 top-0 h-full w-[380px] max-w-full z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 animate-slide-in' : 'translate-x-full'}`}
        style={{ background: 'white' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'var(--green)', borderBottom: '3px solid var(--gold)' }}>
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} style={{ color: 'var(--gold)' }} />
            <span className="font-syne font-bold text-white tracking-wider text-sm">
              MON PANIER
            </span>
            {count() > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--gold)', color: 'var(--green)' }}>
                {count()} article{count() > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button onClick={toggle} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16"
              style={{ color: 'var(--muted)' }}>
              <ShoppingCart size={48} strokeWidth={1.2} style={{ color: 'var(--border)' }} />
              <div className="text-center">
                <p className="text-sm font-medium">Votre panier est vide</p>
                <p className="text-xs mt-1 italic" style={{ color: 'var(--gold)' }}>
                  Singapore spirit. Alpine soul.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {items.map(({ product, quantity }) => (
                <div key={product.id}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-stone-50"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: 'var(--cream)' }}>
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="max-h-12 max-w-12 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                      {product.name}
                    </p>
                    {product.ref && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        Réf. {product.ref}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        style={{ border: '1px solid var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                        <Minus size={9} />
                      </button>
                      <span className="text-xs font-bold w-5 text-center" style={{ color: 'var(--green)' }}>
                        {quantity}
                      </span>
                      <button onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        style={{ border: '1px solid var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                        <Plus size={9} />
                      </button>
                      <button onClick={() => remove(product.id)}
                        className="ml-auto transition-colors"
                        style={{ color: 'var(--border)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--border)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-4 space-y-2.5"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>

            {/* Info box */}
            <div className="rounded-lg p-3 text-[11px] leading-snug"
              style={{ background: 'var(--gold-bg)', border: '1px solid rgba(196,160,82,0.3)', color: 'var(--muted)' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Catalogue préviewé</span> — 
              La boutique ouvrira avec le partenariat d'approvisionnement. 
              Retrouvez ces produits sur tang-freres.fr dès maintenant.
            </div>

            {/* Actions */}
            <button onClick={copyList}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ border: '1px solid var(--green)', color: 'var(--green)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gold-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <Copy size={13} />
              Copier ma liste de courses
            </button>

            <a href="https://www.tang-freres.fr" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-syne font-bold text-xs tracking-widest transition-colors"
              style={{ background: 'var(--green)', color: 'var(--gold)' }}>
              <ExternalLink size={13} />
              COMMANDER SUR TANG FRÈRES
            </a>

            <button onClick={clear}
              className="w-full text-[10px] transition-colors py-1"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}>
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  )
}
