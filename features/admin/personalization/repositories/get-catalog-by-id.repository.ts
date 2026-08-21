import { createClient } from "@/lib/supabase/server";

import type { AdminCatalog } from "../types/catalog.type";

export async function getCatalogByIdRepository(
  id: string
): Promise<AdminCatalog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalogo_personalizacion")
    .select(`
      id,
      tipo,
      nombre,
      descripcion,
      orden,
      activo
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  const row = data as unknown as Record<string, unknown>;

  // Intentar cargar las columnas opcionales por separado (no abortan si no existen).
  try {
    const { data: extra } = await supabase
      .from("catalogo_personalizacion")
      .select("id, precio, mostrar_en_productos, mostrar_en_categorias")
      .eq("id", id)
      .maybeSingle();
    if (extra) {
      const e = extra as Record<string, unknown>;
      row.precio = e.precio;
      row.mostrar_en_productos = e.mostrar_en_productos;
      row.mostrar_en_categorias = e.mostrar_en_categorias;
    }
  } catch {
    /* Columnas extra no existen — ignorar. */
  }

  return row as unknown as AdminCatalog;
}