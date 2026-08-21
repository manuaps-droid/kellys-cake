import { createClient } from "@/lib/supabase/server";

import type { AdminCatalog } from "../types/catalog.type";

export async function getCatalogsRepository(): Promise<
  AdminCatalog[]
> {
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
    .order("tipo")
    .order("orden");

  if (error) {
    throw error;
  }

  // Si existen las columnas opcionales, hacer una segunda query añadirlas.
  // PostgREST falla con 42703 si seleccionamos columnas inexistentes (ej: precio).
  // Para evitar romper la UI, intentamos el select adicional solo si la tabla lo soporta.
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const ids = rows.map((r) => r.id as string);

  if (ids.length > 0) {
    try {
      const { data: extra } = await supabase
        .from("catalogo_personalizacion")
        .select("id, precio, mostrar_en_productos, mostrar_en_categorias")
        .in("id", ids);
      const extraMap = new Map(
        (extra ?? []).map((e: Record<string, unknown>) => [e.id as string, e])
      );
      for (const row of rows) {
        const e = extraMap.get(row.id as string);
        if (e) {
          row.precio = e.precio;
          row.mostrar_en_productos = e.mostrar_en_productos;
          row.mostrar_en_categorias = e.mostrar_en_categorias;
        }
      }
    } catch {
      /* Las columnas extra no existen todavía en el schema — ignorar. */
    }
  }

  return rows as unknown as AdminCatalog[];
}