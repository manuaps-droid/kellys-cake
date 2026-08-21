"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateMediaNameAction(
  id: string,
  nombre: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("media")
    .update({
      nombre,
    })
    .eq("id", id);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin");

  return {
    success: true,
  };
}