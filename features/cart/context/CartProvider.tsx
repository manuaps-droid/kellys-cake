"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

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

  // Ref para abrir el drawer desde la notificación sin causar dependencias circulares.
  const openDrawerRef = useRef<() => void>(() => setDrawerOpen(true));
  useEffect(() => {
    openDrawerRef.current = () => setDrawerOpen(true);
  });

  // Ref para saber si es la primera carga de un usuario (login reciente).
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Control de carreras: solo el último refresco puede actualizar
  // el estado (evita que una petición lenta pise datos más nuevos).
  const fetchSeq = useRef(0);

  // Función interna que retorna los items (usada para la notificación de login).
  const fetchCart = useCallback(async (): Promise<CartItem[]> => {
    const seq = ++fetchSeq.current;
    setLoading(true);

    try {
      const result = await getCartItemsAction();

      if (seq !== fetchSeq.current) return [];

      if (result.success) {
        setItems(result.items);
        return result.items;
      } else {
        setItems([]);
        return [];
      }
    } catch (error) {
      console.error(error);

      if (seq === fetchSeq.current) {
        setItems([]);
      }

      return [];
    } finally {
      if (seq === fetchSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  // Función pública del contexto (retorna void según CartContextType).
  const refreshCart = useCallback(async (): Promise<void> => {
    await fetchCart();
  }, [fetchCart]);

  // El carrito sigue el estado de sesión (anclado al id del
  // usuario para ignorar renovaciones de token): al cerrar
  // sesión se vacía la vista; al iniciar sesión se carga el
  // carrito guardado en la base desde el principio.
  const userId = user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;

    if (userId) {
      const isNewLogin = prevUserIdRef.current !== userId;
      prevUserIdRef.current = userId;

      fetchCart().then((loadedItems) => {
        // Solo notificar si es un login nuevo y hay productos previos en el carrito.
        if (isNewLogin && loadedItems.length > 0) {
          const totalUnidades = loadedItems.reduce(
            (sum, item) => sum + item.cantidad,
            0
          );
          toast(
            `Tienes ${totalUnidades} ${totalUnidades === 1 ? "producto" : "productos"} en tu carrito`,
            {
              icon: <ShoppingCart className="w-4 h-4 text-pink-500" />,
              description: "Quedaron de tu sesión anterior.",
              action: {
                label: "Ver carrito",
                onClick: () => openDrawerRef.current(),
              },
              duration: 6000,
            }
          );
        }
      });
    } else {
      prevUserIdRef.current = null;
      setItems([]);
      setDrawerOpen(false);
      setLoading(false);
    }
  }, [userId, authLoading, fetchCart]);

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