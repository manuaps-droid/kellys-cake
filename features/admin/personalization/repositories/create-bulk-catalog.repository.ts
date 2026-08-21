import { createClient } from "@/lib/supabase/server";

type CatalogItemData = {
  nombre: string;
  descripcion?: string;
};

type CreateBulkCatalogData = {
  tipo: string;
  activo: boolean;
  items: CatalogItemData[];
};

export async function createBulkCatalogRepository(
  data: CreateBulkCatalogData
) {
  const supabase = await createClient();

  const tipo = data.tipo.trim().toLowerCase();

  const { count } = await supabase
    .from("catalogo_personalizacion")
    .select("id", { count: "exact", head: true })
    .eq("tipo", tipo);

  const startOrden = (count ?? 0) + 1;

  const rows = data.items.map((item, i) => ({
    tipo,
    nombre: item.nombre.trim(),
    descripcion: item.descripcion?.trim() || null,
    orden: startOrden + i,
    activo: data.activo,
  }));

  const { error } = await supabase
    .from("catalogo_personalizacion")
    .insert(rows);

  if (error) {
    throw error;
  }
}
