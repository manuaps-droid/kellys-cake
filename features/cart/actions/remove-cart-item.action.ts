"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function removeCartItemAction(
  itemId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("carrito_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/carrito");

  return {
    success: true,
  };
}