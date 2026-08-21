"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCart } from "@/features/cart/services/cart.service";

export async function addProductToCart(productId: string) {
  try {
    const { supabase, carrito } = await getOrCreateCart();

    const { data: itemExistente, error: searchError } = await supabase
      .from("carrito_items")
      .select("*")
      .eq("carrito_id", carrito.id)
      .eq("producto_id", productId)
      .maybeSingle();

    if (searchError) {
      throw searchError;
    }

    if (itemExistente) {
      const { error } = await supabase
        .from("carrito_items")
        .update({
          cantidad: itemExistente.cantidad + 1,
        })
        .eq("id", itemExistente.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("carrito_items")
        .insert({
          carrito_id: carrito.id,
          producto_id: productId,
          cantidad: 1,
        });

      if (error) {
        throw error;
      }
    }

    revalidatePath("/");
    revalidatePath("/carrito");

    return {
      success: true,
      message: "Producto agregado al carrito.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error inesperado.",
    };
  }
}