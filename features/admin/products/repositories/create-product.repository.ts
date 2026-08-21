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

export async function createProductRepository(
  formData: ProductSchema
) {
  const supabase = createAdminClient();

  const slug =
    formData.slug && formData.slug.length > 0
      ? generateSlug(formData.slug)
      : generateSlug(formData.nombre);

  const { data, error } = await supabase
    .from("productos")
    .insert({
      nombre: formData.nombre,
      slug,
      descripcion: formData.descripcion,
      descripcion_corta:
        formData.descripcion_corta ?? null,
      categoria: formData.categoria,
      catalogo_id: formData.catalogo_id,
      precio: formData.precio ?? null,
      imagen: formData.imagen ?? null,
      imagen_principal_id:
        formData.imagen_principal_id ?? null,
      disponible: formData.disponible,
      destacado: formData.destacado,
      mas_vendido: formData.mas_vendido,
      estado: formData.estado,
      seo_title: formData.seo_title ?? null,
      seo_description:
        formData.seo_description ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}