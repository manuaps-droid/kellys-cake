import { createClient } from "@/lib/supabase/server";

import type { Product } from "../types/product.type";

export async function getProductsRepository(
  filter?: "destacado" | "mas_vendido"
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select(`
      id,
      nombre,
      slug,
      descripcion,
      descripcion_corta,
      precio,
      categoria,
      catalogo_id,
      imagen,
      imagen_principal_id,
      disponible,
      destacado,
      mas_vendido,
      estado,
      seo_title,
      seo_description,
      created_at,
      media:imagen_principal_id (
        url
      )
    `)
    .order("created_at", { ascending: false });

  if (filter === "destacado") {
    query = query.eq("destacado", true);
  } else if (filter === "mas_vendido") {
    query = query.eq("mas_vendido", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Product[];
}