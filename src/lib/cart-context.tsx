"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cart, CartLine } from "@/types";

const STORAGE_KEY = "kipling-cart";

interface CartContextValue {
  cart: Cart | null;
  addItem: (
    restaurantId: string,
    restaurantName: string,
    item: { id: string; name: string; price: number }
  ) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): Cart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cart) : null;
  } catch {
    return null;
  }
}

function writeCart(cart: Cart | null) {
  if (typeof window === "undefined") return;
  try {
    if (cart) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage on mount
    setCart(readCart());
  }, []);

  const persist = useCallback((next: Cart | null) => {
    setCart(next);
    writeCart(next);
  }, []);

  const addItem = useCallback(
    (
      restaurantId: string,
      restaurantName: string,
      item: { id: string; name: string; price: number }
    ) => {
      setCart((prev) => {
        // Switching restaurants starts a fresh cart — orders are single-restaurant.
        const base: Cart =
          prev && prev.restaurantId === restaurantId
            ? prev
            : { restaurantId, restaurantName, lines: [] };

        const existing = base.lines.find((l) => l.menuItemId === item.id);
        const lines: CartLine[] = existing
          ? base.lines.map((l) =>
              l.menuItemId === item.id
                ? { ...l, quantity: l.quantity + 1 }
                : l
            )
          : [
              ...base.lines,
              {
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
              },
            ];

        const next = { ...base, lines };
        writeCart(next);
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const lines = prev.lines
        .map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0);
      const next = lines.length ? { ...prev, lines } : null;
      writeCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => {
      if (!prev) return prev;
      const lines = prev.lines.filter((l) => l.menuItemId !== menuItemId);
      const next = lines.length ? { ...prev, lines } : null;
      writeCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => persist(null), [persist]);

  const total = useMemo(
    () =>
      cart?.lines.reduce((sum, l) => sum + l.price * l.quantity, 0) ?? 0,
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, addItem, updateQuantity, removeItem, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
