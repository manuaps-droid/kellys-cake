"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function deleteMediaAction(
  id: string
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return {
      success: false,
      message: "Imagen no encontrada.",
    };
  }

  await supabase.storage
    .from(data.bucket)
    .remove([
      `${data.carpeta}/${data.archivo}`,
    ]);

  const { error } = await supabase
    .from("media")
    .delete()
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