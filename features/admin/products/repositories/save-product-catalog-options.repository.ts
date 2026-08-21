import { createClient } from "@/lib/supabase/server";

type ProductCatalogOptionInput = {
  catalogo_id: string;
  precio_extra: number;
  obligatorio: boolean;
};

export async function saveProductCatalogOptionsRepository(
  productId: string,
  options: ProductCatalogOptionInput[]
) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("producto_catalogo")
    .delete()
    .eq("producto_id", productId);

  if (deleteError) {
    throw deleteError;
  }

  if (options.length === 0) {
    return;
  }

  const rows = options.map((item, index) => ({
    producto_id: productId,
    catalogo_id: item.catalogo_id,
    precio_extra: item.precio_extra,
    obligatorio: item.obligatorio,
    orden: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("producto_catalogo")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }
}