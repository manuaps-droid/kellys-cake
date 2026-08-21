"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCart } from "@/features/cart/services/cart.service";

export async function clearCart() {
  try {
    const { supabase, carrito } = await getOrCreateCart();

    const { error } = await supabase
      .from("carrito_items")
      .delete()
      .eq("carrito_id", carrito.id);

    if (error) {
      throw error;
    }

    revalidatePath("/");
    revalidatePath("/carrito");

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