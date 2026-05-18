'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  add: (product: Product) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clear: () => void
  toggle: () => void
  open: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (product) => set((state) => {
        const existing = state.items.find(i => i.product.id === product.id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }
        }
        return { items: [...state.items, { product, quantity: 1 }] }
      }),

      remove: (productId) => set((state) => ({
        items: state.items.filter(i => i.product.id !== productId)
      })),

      updateQty: (productId, qty) => set((state) => {
        if (qty <= 0) return { items: state.items.filter(i => i.product.id !== productId) }
        return {
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity: qty } : i
          )
        }
      }),

      clear: () => set({ items: [] }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      open: () => set({ isOpen: true }),

      total: () => get().items.reduce((s, i) => s + i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: 'rojak-cart' }
  )
)
