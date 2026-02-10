import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuItem, SelectedModifier } from '../types';
import { calculateItemTotal } from '../utils/price';

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem, modifiers: SelectedModifier[], quantity?: number, specialInstructions?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  cartTotal: () => number;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, modifiers, quantity = 1, specialInstructions = '') => {
        const newItem: CartItem = {
          id: generateId(),
          menuItem,
          quantity,
          selectedModifiers: modifiers,
          specialInstructions,
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      cartTotal: () =>
        get().items.reduce(
          (sum, item) =>
            sum +
            calculateItemTotal(
              item.menuItem.base_price,
              item.selectedModifiers.map((sm) => sm.modifier),
              item.quantity
            ),
          0
        ),
    }),
    {
      name: 'ordering_cart_threesquares',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
