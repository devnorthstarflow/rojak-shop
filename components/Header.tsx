'use client'

import { useCart } from '@/store/cart'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onSearch: (q: string) => void
  searchValue: string
  onMenuToggle: () => void
}

export default function Header({ onSearch, searchValue, onMenuToggle }: Props) {
  const { count, toggle } = useCart()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header style={{ background: 'var(--green)', borderBottom: '3px solid var(--gold)' }}
      className="px-4 md:px-8 sticky top-0 z-30 shadow-lg">
      <div className="flex items-center gap-4 h-16">

        {/* Mobile menu */}
        <button onClick={onMenuToggle}
          className="md:hidden text-white/70 hover:text-white transition-colors">
          <Menu size={22} />
        </button>

        {/* Logo */}
        <a href="https://rojak-family-market.vercel.app"
          className="flex items-center gap-3 flex-shrink-0 group">
          {/* Merlion-inspired mark */}
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--gold)' }}>
            <span className="font-syne text-white font-black text-xl leading-none">R</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-syne font-black text-white text-[16px] leading-tight tracking-wide">
              ROJAK
            </div>
            <div className="text-[9px] font-semibold tracking-[0.2em] leading-tight"
              style={{ color: 'var(--gold)' }}>
              FAMILY MARKET
            </div>
          </div>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: searchFocused ? 'var(--gold)' : 'rgba(255,255,255,0.35)' }} />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher riz, sauces, nouilles…"
            className="w-full pl-9 pr-4 py-2 text-sm text-white rounded-lg outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.09)',
              border: `1px solid ${searchFocused ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}`,
            }}
          />
        </div>

        {/* Tagline — desktop only */}
        <div className="hidden lg:block text-right flex-shrink-0">
          <div className="text-[10px] italic" style={{ color: 'var(--gold)' }}>
            Singapore spirit.
          </div>
          <div className="text-[10px] italic text-white/50">Alpine soul.</div>
        </div>

        {/* Cart */}
        <button onClick={toggle}
          className="relative flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
          style={{ background: 'var(--gold)', color: 'var(--green)' }}>
          <ShoppingCart size={16} />
          <span className="hidden sm:inline font-syne tracking-wide text-xs">PANIER</span>
          {count() > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center animate-pop"
              style={{ background: 'var(--red)', color: 'white' }}>
              {count()}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
