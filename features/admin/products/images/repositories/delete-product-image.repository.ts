import { createClient } from "@/lib/supabase/server";

export async function deleteProductImageRepository(
  imageId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("producto_imagenes")
    .delete()
    .eq("id", imageId);

  if (error) {
    throw error;
  }
}