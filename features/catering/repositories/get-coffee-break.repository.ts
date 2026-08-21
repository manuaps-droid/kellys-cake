import { createClient } from "@/lib/supabase/server";

export type CoffeeBreakItem = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
};

export type CoffeeBreakData = {
  items: CoffeeBreakItem[];
};

export async function getCoffeeBreakItemsRepository(): Promise<CoffeeBreakData> {
  const supabase = await createClient();

  // 1. Encontrar el catálogo "Coffee Break" (tipo categoria_producto)
  const { data: catalog, error: catalogError } = await supabase
    .from("catalogo_personalizacion")
    .select("id")
    .eq("tipo", "categoria_producto")
    .eq("nombre", "Coffee Break")
    .maybeSingle();

  if (catalogError) throw catalogError;
  const catalogoId = (catalog as Record<string, unknown> | null)?.id as string | undefined;

  if (!catalogoId) return { items: [] };

  // 2. Productos publicados del catálogo
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, descripcion_corta, precio")
    .eq("catalogo_id", catalogoId)
    .eq("estado", "publicado")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const items: CoffeeBreakItem[] = (data ?? []).map((row: Record<string, unknown>) => {
    const descripcion = (row.descripcion as string | null) ?? "";
    const descripcionCorta = (row.descripcion_corta as string | null) ?? "";
    return {
      id: row.id as string,
      nombre: row.nombre as string,
      descripcion: (descripcion || descripcionCorta) || null,
      precio: (row.precio as number | null) ?? null,
    };
  });

  return { items };
}
