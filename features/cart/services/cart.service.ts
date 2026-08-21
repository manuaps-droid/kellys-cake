import { getCurrentClient } from "@/features/auth/services/auth.server";

import type {
  CartItem,
  CartProduct,
} from "../types/cart.types";

export async function getOrCreateCart() {
  const {
    supabase,
    cliente,
  } = await getCurrentClient();

  const {
    data: carrito,
    error,
  } = await supabase
    .from("carrito")
    .select("*")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (carrito) {
    return {
      supabase,
      carrito,
    };
  }

  const {
    data: nuevoCarrito,
    error: insertError,
  } = await supabase
    .from("carrito")
    .insert({
      cliente_id: cliente.id,
    })
    .select()
    .single();

  if (insertError || !nuevoCarrito) {
    throw (
      insertError ??
      new Error(
        "No se pudo crear el carrito."
      )
    );
  }

  return {
    supabase,
    carrito: nuevoCarrito,
  };
}

export async function getCartItems(): Promise<CartItem[]> {
  const {
    supabase,
    carrito,
  } = await getOrCreateCart();

  const {
    data,
    error,
  } = await supabase
    .from("carrito_items")
    .select(`
      id,
      producto_id,
      cantidad,
      precio_unitario,
      nombre,
      descripcion,
      imagen,
      cotizacion_id,
      presentacion_id,
      producto_presentaciones (
        nombre,
        precio
      ),
      productos (
        id,
        nombre,
        descripcion,
        precio,
        imagen
      )
    `)
    .eq(
      "carrito_id",
      carrito.id
    );

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map(
    (item: any): CartItem => ({
      id: item.id,

      producto_id:
        item.producto_id,

      cantidad:
        item.cantidad,

      productos: (
        Array.isArray(item.productos)
          ? item.productos[0]
          : item.productos
      ) as CartProduct | null,

      precio_unitario:
        item.precio_unitario,

      nombre: item.nombre,

      descripcion:
        item.descripcion,

      imagen: item.imagen,

      cotizacion_id:
        item.cotizacion_id,

      presentacion_id:
        item.presentacion_id,

      presentacion: item.presentacion_id
        ? ((Array.isArray(
            item.producto_presentaciones
          )
            ? item.producto_presentaciones[0]
            : item.producto_presentaciones) as {
            nombre: string;
            precio: number;
          } | null)
        : null,
    })
  );
}