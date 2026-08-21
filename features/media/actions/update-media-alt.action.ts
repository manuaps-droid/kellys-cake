"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateMediaAltAction(
  id: string,
  alt: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("media")
    .update({
      alt,
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