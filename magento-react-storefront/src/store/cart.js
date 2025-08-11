import { create } from 'zustand'

export const useCartStore = create((set, get) => ({
  cartId: localStorage.getItem('cartId') || null,
  setCartId: (id) => {
    localStorage.setItem('cartId', id)
    set({ cartId: id })
  },
  clearCart: () => {
    localStorage.removeItem('cartId')
    set({ cartId: null })
  },
}))