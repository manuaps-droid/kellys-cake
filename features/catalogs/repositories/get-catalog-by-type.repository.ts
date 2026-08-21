import { createClient } from "@/lib/supabase/server";

import type { CatalogItem } from "../types/catalog.type";

export async function getCatalogByTypeRepository(
  tipo: string
): Promise<CatalogItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalogo_personalizacion")
    .select(`
      id,
      nombre,
      descripcion
    `)
    .eq("activo", true)
    .eq("tipo", tipo)
    .order("orden", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data as CatalogItem[];
}