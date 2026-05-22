'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

export interface CartItem {
  product: Product
  quantity: number
  notes: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  sessionId: string
  // Actions
  add: (product: Product) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  updateNotes: (productId: string, notes: string) => void
  clear: () => void
  toggle: () => void
  open: () => void
  // Computed
  count: () => number
  // Export
  toExcelRows: () => ExcelRow[]
}

export interface ExcelRow {
  'Référence':     string
  'Nom':           string
  'Marque':        string
  'Conditionnement': string
  'Catégorie':     string
  'Sous-catégorie': string
  'Quantité':      number
  'Notes':         string
  'Lien':          string
}

function makeSessionId() {
  return `rojak_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      sessionId: makeSessionId(),

      add: (product) => set((s) => {
        const existing = s.items.find(i => i.product.id === product.id)
        if (existing) {
          return { items: s.items.map(i => i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 } : i) }
        }
        return { items: [...s.items, { product, quantity: 1, notes: '' }] }
      }),

      remove: (id) => set((s) => ({
        items: s.items.filter(i => i.product.id !== id)
      })),

      updateQty: (id, qty) => set((s) => {
        if (qty <= 0) return { items: s.items.filter(i => i.product.id !== id) }
        return { items: s.items.map(i => i.product.id === id ? { ...i, quantity: qty } : i) }
      }),

      updateNotes: (id, notes) => set((s) => ({
        items: s.items.map(i => i.product.id === id ? { ...i, notes } : i)
      })),

      clear: () => set({ items: [] }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      open: () => set({ isOpen: true }),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),

      toExcelRows: () => get().items.map(({ product: p, quantity, notes }) => ({
        'Référence':       p.ref,
        'Nom':             p.name,
        'Marque':          p.brand || '',
        'Conditionnement': p.conditionnement || '',
        'Catégorie':       p.category || '',
        'Sous-catégorie':  p.subcategory || '',
        'Quantité':        quantity,
        'Notes':           notes,
        'Lien':            p.url || '',
      })),
    }),
    { name: 'rojak-cart-v2' }
  )
)
