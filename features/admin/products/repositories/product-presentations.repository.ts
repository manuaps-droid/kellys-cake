import { createClient } from "@/lib/supabase/server";

import {
  CreateProductPresentationInput,
  ProductPresentation,
  UpdateProductPresentationInput,
} from "../types/product-presentation";

export async function getProductPresentationsRepository(
  productoId: string
): Promise<ProductPresentation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producto_presentaciones")
    .select("*")
    .eq("producto_id", productoId)
    .order("orden", { ascending: true });

  if (error) throw error;

  return (data ?? []) as ProductPresentation[];
}

export async function createProductPresentationRepository(
  input: CreateProductPresentationInput
): Promise<ProductPresentation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producto_presentaciones")
    .insert({
      producto_id: input.producto_id,

      nombre: input.nombre,
      descripcion: input.descripcion ?? null,

      precio: input.precio,
      precio_oferta: input.precio_oferta ?? null,

      sku: input.sku ?? null,
      codigo_barras: input.codigo_barras ?? null,

      stock: input.stock ?? null,

      peso: input.peso ?? null,
      tiempo_preparacion: input.tiempo_preparacion ?? null,

      imagen_id: input.imagen_id ?? null,

      slug: input.slug ?? null,

      orden: input.orden ?? 0,
      predeterminada: input.predeterminada ?? false,
    })
    .select()
    .single();

  if (error) throw error;

  return data as ProductPresentation;
}

export async function updateProductPresentationRepository(
  input: UpdateProductPresentationInput
): Promise<ProductPresentation> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producto_presentaciones")
    .update({
      nombre: input.nombre,
      descripcion: input.descripcion ?? null,

      precio: input.precio,
      precio_oferta: input.precio_oferta ?? null,

      sku: input.sku ?? null,
      codigo_barras: input.codigo_barras ?? null,

      stock: input.stock ?? null,

      peso: input.peso ?? null,
      tiempo_preparacion: input.tiempo_preparacion ?? null,

      imagen_id: input.imagen_id ?? null,

      slug: input.slug ?? null,

      predeterminada: input.predeterminada ?? false,

      activo: input.activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw error;

  return data as ProductPresentation;
}

export async function deleteProductPresentationRepository(
  id: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("producto_presentaciones")
    .delete()
    .eq("id", id);

  if (error) throw error;
}