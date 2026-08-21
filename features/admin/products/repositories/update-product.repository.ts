import { createAdminClient } from "@/lib/supabase/admin";

import type { ProductSchema } from "../validations/product.schema";

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateProductRepository(
  id: string,
  data: ProductSchema
) {
  const supabase = createAdminClient();

  const slug =
    data.slug && data.slug.length > 0
      ? generateSlug(data.slug)
      : generateSlug(data.nombre);

  const { error } = await supabase
    .from("productos")
    .update({
      nombre: data.nombre,
      slug,
      descripcion: data.descripcion,
      descripcion_corta:
        data.descripcion_corta ?? null,
      categoria: data.categoria,
      catalogo_id: data.catalogo_id,
      precio: data.precio ?? null,
      imagen: data.imagen ?? null,
      imagen_principal_id:
        data.imagen_principal_id ?? null,
      disponible: data.disponible,
      destacado: data.destacado,
      mas_vendido: data.mas_vendido,
      estado: data.estado,
      seo_title: data.seo_title ?? null,
      seo_description:
        data.seo_description ?? null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}