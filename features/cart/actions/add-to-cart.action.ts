"use server";

import { revalidatePath } from "next/cache";

import { getCurrentClient } from "@/features/auth/services/auth.server";

export async function addToCartAction(
  productoId: string,
  presentacionId?: string | null
) {
  const {
    supabase,
    cliente,
  } = await getCurrentClient();

  let presentacion: {
    id: string;
    nombre: string;
    precio: number;
  } | null = null;

  if (presentacionId) {
    const { data, error } = await supabase
      .from("producto_presentaciones")
      .select("id, nombre, precio, producto_id")
      .eq("id", presentacionId)
      .maybeSingle();

    if (error || !data || data.producto_id !== productoId) {
      return {
        success: false,
        message:
          "La presentación seleccionada no es válida.",
      };
    }

    presentacion = data;
  }

  let { data: carrito } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", cliente.id)
    .maybeSingle();

  if (!carrito) {
    const {
      data: nuevoCarrito,
      error,
    } = await supabase
      .from("carrito")
      .insert({
        cliente_id: cliente.id,
      })
      .select("id")
      .single();

    if (error || !nuevoCarrito) {
      return {
        success: false,
        message:
          error?.message ??
          "No se pudo crear el carrito.",
      };
    }

    carrito = nuevoCarrito;
  }

  if (!carrito) {
    return {
      success: false,
      message: "Carrito no disponible.",
    };
  }

  // Buscar ítem existente con el mismo producto Y misma presentación
  let query = supabase
    .from("carrito_items")
    .select("id,cantidad")
    .eq("carrito_id", carrito.id)
    .eq("producto_id", productoId);

  query = presentacionId
    ? query.eq("presentacion_id", presentacionId)
    : query.is("presentacion_id", null);

  const { data: itemExistente } =
    await query.maybeSingle();

  if (itemExistente) {
    const { error } = await supabase
      .from("carrito_items")
      .update({
        cantidad:
          itemExistente.cantidad + 1,
      })
      .eq("id", itemExistente.id);

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  } else {
    const { error } = await supabase
      .from("carrito_items")
      .insert({
        carrito_id: carrito.id,
        producto_id: productoId,
        cantidad: 1,
        presentacion_id: presentacion?.id ?? null,
        precio_unitario: presentacion?.precio ?? null,
      });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  revalidatePath("/carrito");

  return {
    success: true,
  };
}
