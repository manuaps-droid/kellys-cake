"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthContext } from "@/providers/AuthProvider";

import { getCartItemsAction } from "../actions/get-cart-items.action";

import {
  getItemUnitPrice,
  type CartContextType,
  type CartItem,
} from "../types/cart.types";

export const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } =
    useAuthContext();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);

    try {
      const result =
        await getCartItemsAction();

      if (result.success) {
        setItems(result.items);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // El carrito sigue el estado de sesión: al cerrar sesión se
  // vacía la vista (el carrito guardado en la base se conserva
  // y vuelve a aparecer al iniciar sesión de nuevo).
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      void refreshCart();
    } else {
      setItems([]);
      setDrawerOpen(false);
      setLoading(false);
    }
  }, [user, authLoading, refreshCart]);

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.cantidad,
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + getItemUnitPrice(item) * item.cantidad,
      0
    );
  }, [items]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      loading,
      drawerOpen,
      totalItems,
      subtotal,

      openDrawer: () =>
        setDrawerOpen(true),

      closeDrawer: () =>
        setDrawerOpen(false),

      refreshCart,
    }),
    [
      items,
      loading,
      drawerOpen,
      totalItems,
      subtotal,
      refreshCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}