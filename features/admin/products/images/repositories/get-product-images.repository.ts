import { createAdminClient } from "@/lib/supabase/admin";
import { ProductImage } from "../../types/product-image.type";

export async function getProductImagesRepository(
  productId: string
): Promise<ProductImage[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("producto_imagenes")
    .select(`
      id,
      producto_id,
      media_id,
      orden,
      principal,
      created_at,
      media:media_id (
        id,
        nombre,
        url
      )
    `)
    .eq("producto_id", productId)
    .order("orden");

  if (error) {
    throw error;
  }

  return (data ?? []) as ProductImage[];
}