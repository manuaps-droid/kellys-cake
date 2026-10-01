import { createClient } from "@/lib/supabase/server";

import type { CatalogItem } from "../types/catalog.type";

export async function getAllCatalogsRepository(): Promise<CatalogItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalogo_personalizacion")
    .select(`
      id,
      nombre,
      descripcion
    `)
    .eq("activo", true)
    .order("orden", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data as CatalogItem[];
}
