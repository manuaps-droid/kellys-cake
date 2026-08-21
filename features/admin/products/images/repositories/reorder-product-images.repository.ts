import { createClient } from "@/lib/supabase/server";

export async function reorderProductImagesRepository(
  productId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();

  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from("producto_imagenes")
      .update({
        orden: index,
      })
      .eq("id", orderedIds[index])
      .eq("producto_id", productId);

    if (error) {
      throw error;
    }
  }
}