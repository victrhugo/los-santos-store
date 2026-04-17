"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, Product, ProductVariant } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "los-santos-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (product: Product, variant: ProductVariant, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.variant.id === variant.id);
        if (existing) {
          const next = Math.min(existing.quantity + quantity, variant.stock);
          return prev.map((i) =>
            i.variant.id === variant.id ? { ...i, quantity: next } : i
          );
        }
        return [...prev, { product, variant, quantity: Math.min(quantity, variant.stock) }];
      });
    },
    []
  );

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variant.id !== variantId));
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (i.variant.id !== variantId) return i;
          return { ...i, quantity: Math.min(quantity, i.variant.stock) };
        })
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
