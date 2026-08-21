import { getCurrentClient } from "@/features/auth/services/auth.server";

import type {
  Order,
  OrderItem,
} from "../types/order.types";

export async function getOrders(): Promise<Order[]> {
  const {
    supabase,
    cliente,
  } = await getCurrentClient();

  const {
    data,
    error,
  } = await supabase
    .from("pedidos")
    .select(`
      id,
      created_at,
      estado,
      subtotal,
      envio,
      total,
      pedido_items (
        id,
        cantidad,
        precio,
        nombre,
        imagen,
        productos (
          id,
          nombre,
          imagen
        )
      )
    `)
    .eq("cliente_id", cliente.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (order: any): Order => ({
      ...order,

      pedido_items:
        order.pedido_items.map(
          (item: any): OrderItem => {
            const productos = Array.isArray(item.productos)
              ? item.productos[0]
              : item.productos;

            return {
              ...item,

              productos:
                productos ?? {
                  id: item.id,
                  nombre: item.nombre ?? "Producto",
                  imagen:
                    item.imagen ??
                    "/images/placeholder-product.jpg",
                },
            };
          }
        ),
    })
  );
}

export async function getOrderById(
  id: string
): Promise<Order | null> {
  const {
    supabase,
    cliente,
  } = await getCurrentClient();

  const {
    data,
    error,
  } = await supabase
    .from("pedidos")
    .select(`
      id,
      created_at,
      estado,
      subtotal,
      envio,
      total,
      pedido_items (
        id,
        cantidad,
        precio,
        nombre,
        imagen,
        productos (
          id,
          nombre,
          imagen
        )
      )
    `)
    .eq("id", id)
    .eq("cliente_id", cliente.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,

    pedido_items:
      data.pedido_items.map(
        (item: any): OrderItem => {
          const productos = Array.isArray(item.productos)
            ? item.productos[0]
            : item.productos;

          return {
            ...item,

            productos:
              productos ?? {
                id: item.id,
                nombre: item.nombre ?? "Producto",
                imagen:
                  item.imagen ??
                  "/images/placeholder-product.jpg",
              },
          };
        }
      ),
  };
}