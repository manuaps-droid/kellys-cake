import { createAdminClient } from "@/lib/supabase/admin";

export async function addProductImageRepository(
  productId: string,
  mediaId: string
) {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("producto_imagenes")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("producto_id", productId);

  const { error } = await supabase
    .from("producto_imagenes")
    .insert({
      producto_id: productId,
      media_id: mediaId,
      orden: count ?? 0,
      principal: (count ?? 0) === 0,
    });

  if (error) {
    throw error;
  }
}