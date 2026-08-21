"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCart } from "@/features/cart/services/cart.service";

export async function increaseCartItem(itemId: string) {
  try {
    const { supabase, carrito } = await getOrCreateCart();

    const { data: item, error } = await supabase
      .from("carrito_items")
      .select("*")
      .eq("id", itemId)
      .eq("carrito_id", carrito.id)
      .single();

    if (error || !item) {
      throw new Error("Producto no encontrado.");
    }

    const { error: updateError } = await supabase
      .from("carrito_items")
      .update({
        cantidad: item.cantidad + 1,
      })
      .eq("id", itemId);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/carrito");
    revalidatePath("/");

    return {
      success: true,
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