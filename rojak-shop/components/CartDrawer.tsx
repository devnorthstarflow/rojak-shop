'use client'

import { useState } from 'react'
import { useCart } from '@/store/cart'
import { getImageUrl } from '@/lib/scraper'
import { X, Minus, Plus, Trash2, FileSpreadsheet, Download, ShoppingCart, Loader2, MessageSquare } from 'lucide-react'

export default function CartDrawer() {
  const { items, isOpen, toggle, remove, updateQty, updateNotes, clear, count } = useCart()
  const [cartName, setCartName] = useState('Sélection produits')
  const [exporting, setExporting] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)

  const handleExport = async () => {
    if (!items.length) return
    setExporting(true)
    try {
      const { toExcelRows } = useCart.getState()
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toExcelRows(), cartName }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Rojak_Devis_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Erreur export. Réessayez.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={toggle} />}

      <div className={`fixed right-0 top-0 h-full w-[420px] max-w-full z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'white' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'var(--green)', borderBottom: '3px solid var(--gold)' }}>
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} style={{ color: 'var(--gold)' }} />
            <span className="font-syne font-bold text-white tracking-wider text-sm">DEVIS EN COURS</span>
            {count() > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--gold)', color: 'var(--green)' }}>
                {count()} art.
              </span>
            )}
          </div>
          <button onClick={toggle} className="text-white/50 hover:text-white"><X size={20} /></button>
        </div>

        {/* Nom du devis */}
        {items.length > 0 && (
          <div className="px-4 py-2 flex-shrink-0" style={{ background: 'var(--gold-bg)', borderBottom: '1px solid var(--border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--muted)' }}>
              Nom du devis
            </label>
            <input
              value={cartName}
              onChange={e => setCartName(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg outline-none"
              style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text)' }}
              onFocus={e => e.target.style.borderColor = 'var(--gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--muted)' }}>
              <ShoppingCart size={48} strokeWidth={1.2} style={{ color: 'var(--border)' }} />
              <div className="text-center">
                <p className="text-sm font-medium">Votre sélection est vide</p>
                <p className="text-xs mt-1 italic" style={{ color: 'var(--gold)' }}>Ajoutez des produits pour créer un devis</p>
              </div>
            </div>
          ) : (
            <div>
              {items.map(({ product: p, quantity, notes }) => (
                <div key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex gap-3 px-4 py-3 hover:bg-stone-50 transition-colors">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: 'var(--cream)' }}>
                      <img src={getImageUrl(p)} alt={p.name}
                        className="max-h-12 max-w-12 object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.brand && <span className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>{p.brand}</span>}
                        {p.conditionnement && <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{p.conditionnement}</span>}
                        <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Réf. {p.ref}</span>
                      </div>

                      {/* Qty + actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(p.id, quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--border)' }}>
                          <Minus size={9} />
                        </button>
                        <span className="text-sm font-bold w-5 text-center" style={{ color: 'var(--green)' }}>
                          {quantity}
                        </span>
                        <button onClick={() => updateQty(p.id, quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--border)' }}>
                          <Plus size={9} />
                        </button>

                        {/* Note */}
                        <button onClick={() => setEditingNote(editingNote === p.id ? null : p.id)}
                          className="ml-1 flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors"
                          style={{
                            background: notes ? 'var(--gold-bg)' : 'transparent',
                            color: notes ? 'var(--gold)' : 'var(--muted)',
                            border: `1px solid ${notes ? 'var(--gold)' : 'var(--border)'}`,
                          }}>
                          <MessageSquare size={9} />
                          Note
                        </button>

                        <button onClick={() => remove(p.id)} className="ml-auto transition-colors"
                          style={{ color: 'var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--border)')}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Note field */}
                  {editingNote === p.id && (
                    <div className="px-4 pb-3">
                      <input
                        autoFocus
                        value={notes}
                        onChange={e => updateNotes(p.id, e.target.value)}
                        placeholder="Note pour le fournisseur (variante, commentaire...)"
                        className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                        style={{ border: '1px solid var(--gold)', background: 'var(--gold-bg)', color: 'var(--text)' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 p-4 space-y-2.5"
            style={{ borderTop: '2px solid var(--gold)', background: 'var(--cream)' }}>

            {/* Récap */}
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
              <span>{items.length} référence{items.length > 1 ? 's' : ''}</span>
              <span>{count()} article{count() > 1 ? 's' : ''} au total</span>
            </div>

            {/* Export Excel */}
            <button onClick={handleExport} disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-syne font-bold text-xs tracking-widest uppercase transition-all disabled:opacity-60"
              style={{ background: 'var(--green)', color: 'var(--gold)' }}>
              {exporting
                ? <><Loader2 size={14} className="animate-spin" /> Génération...</>
                : <><FileSpreadsheet size={14} /> EXPORTER EN EXCEL (DEVIS)</>
              }
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => {
                  const text = items.map(({ product: p, quantity, notes }) =>
                    `• ${p.name} — Réf.${p.ref}${p.conditionnement ? ` (${p.conditionnement})` : ''} × ${quantity}${notes ? ` [${notes}]` : ''}`
                  ).join('\n')
                  navigator.clipboard.writeText(`Devis Rojak Family Market\n${cartName}\n\n${text}`)
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ border: '1px solid var(--green)', color: 'var(--green)' }}>
                <Download size={12} /> Copier liste
              </button>
              <button onClick={clear}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>
                <Trash2 size={12} /> Vider
              </button>
            </div>

            <div className="rounded-lg p-2.5 text-[10px] leading-snug text-center"
              style={{ background: 'var(--gold-bg)', border: '1px solid rgba(196,160,82,0.3)', color: 'var(--muted)' }}>
              L'export Excel inclut 2 feuilles : liste complète + tri par catégorie
            </div>
          </div>
        )}
      </div>
    </>
  )
}
