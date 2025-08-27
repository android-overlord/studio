'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Perfume = {
  name: string;
  price: number;
  [key: string]: any; // Allow other properties
};

type CartState = {
  cart: Perfume[];
  addItem: (item: Perfume) => void;
  removeItem: (itemName: string) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addItem: (item) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((cartItem) => cartItem.name === item.name);

        if (existingItem) {
          // You could increase quantity here if you add it to the type
          return;
        }

        set({ cart: [...currentCart, item] });
      },
      removeItem: (itemName) => {
        set({ cart: get().cart.filter((item) => item.name !== itemName) });
      },
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
