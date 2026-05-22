'use client'

import { SUBCATEGORIES } from '@/lib/scraper'
import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'

interface Props {
  currentUrl: string | null
  onSelect: (url: string, name: string) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const CATS = SUBCATEGORIES.reduce((acc, s) => {
  if (!acc[s.category]) acc[s.category] = []
  acc[s.category].push(s)
  return acc
}, {} as Record<string, typeof SUBCATEGORIES>)

const CAT_ICONS: Record<string, string> = {
  '🌿 BIO': '🌿',
  '🛒 Épicerie': '🛒',
  '❄️ Surgelés': '❄️',
  '🧋 Boissons': '🧋',
  '🏮 Divers': '🏮',
}

export default function Sidebar({ currentUrl, onSelect, mobileOpen, onMobileClose }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ '🛒 Épicerie': true })

  const handleSelect = (url: string, name: string) => {
    onSelect(url, name)
    onMobileClose()
  }

  const content = (
    <nav className="flex flex-col h-full overflow-hidden">
      {/* Sidebar header */}
      <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ background: 'var(--green)', borderBottom: '1px solid rgba(196,160,82,0.3)' }}>
        <span className="font-syne font-bold text-xs tracking-[0.15em] uppercase"
          style={{ color: 'var(--gold)' }}>
          Rayons
        </span>
        <button onClick={onMobileClose} className="md:hidden text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Coming soon banner */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ background: 'var(--gold-bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
          style={{ color: 'var(--gold)' }}>
          Boutique en cours
        </div>
        <div className="text-[11px] leading-snug" style={{ color: 'var(--muted)' }}>
          Partenariat d'approvisionnement en finalisation. Aperçu du catalogue ci-dessous.
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto bg-white">
        {Object.entries(CATS).map(([cat, subs]) => {
          const isOpen = open[cat]
          const hasActive = subs.some(s => s.url === currentUrl)
          return (
            <div key={cat} style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                onClick={() => setOpen(p => ({ ...p, [cat]: !p[cat] }))}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-stone-50"
                style={{ color: hasActive ? 'var(--green)' : 'var(--muted)' }}>
                <span className="text-base w-5 text-center">{CAT_ICONS[cat]}</span>
                <span className="font-syne font-bold text-[11px] uppercase tracking-wider flex-1">
                  {cat.replace(/^\S+\s/, '')}
                </span>
                <ChevronRight size={13}
                  style={{
                    color: 'var(--gold)',
                    transform: isOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform .2s'
                  }} />
              </button>

              {isOpen && (
                <div style={{ background: '#FAFAF7' }}>
                  {subs.map(sub => (
                    <button
                      key={sub.url}
                      onClick={() => handleSelect(sub.url, sub.name)}
                      className="w-full text-left text-[12px] px-4 pl-10 py-2 transition-colors flex items-center justify-between gap-2"
                      style={{
                        color: currentUrl === sub.url ? 'var(--green)' : 'var(--muted)',
                        background: currentUrl === sub.url ? 'var(--gold-bg)' : 'transparent',
                        borderLeft: `3px solid ${currentUrl === sub.url ? 'var(--gold)' : 'transparent'}`,
                        fontWeight: currentUrl === sub.url ? 500 : 400,
                      }}>
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex-shrink-0 text-center"
        style={{ background: 'var(--green)' }}>
        <div className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--gold)' }}>
          Ouverture 2027
        </div>
        <div className="text-[10px] text-white/40 mt-0.5">Pays de Gex · Frontière Genève</div>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 h-full overflow-hidden"
        style={{ borderRight: '1px solid var(--border)' }}>
        {content}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative w-72 flex flex-col h-full animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
