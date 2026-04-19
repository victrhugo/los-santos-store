"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface CartUIContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartUIContext = createContext<CartUIContextType>({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
});

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCart  = useCallback(() => setIsOpen(true),  []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartUIContext.Provider value={{ isOpen, openCart, closeCart }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  return useContext(CartUIContext);
}
