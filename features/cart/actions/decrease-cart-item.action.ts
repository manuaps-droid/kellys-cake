"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function decreaseCartItemAction(
  itemId: string
) {
  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("carrito_items")
    .select("cantidad")
    .eq("id", itemId)
    .single();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if (item.cantidad <= 1) {
    await supabase
      .from("carrito_items")
      .delete()
      .eq("id", itemId);

    revalidatePath("/carrito");

    return {
      success: true,
    };
  }

  const { error: updateError } = await supabase
    .from("carrito_items")
    .update({
      cantidad: item.cantidad - 1,
    })
    .eq("id", itemId);

  if (updateError) {
    return {
      success: false,
      message: updateError.message,
    };
  }

  revalidatePath("/carrito");

  return {
    success: true,
  };
}