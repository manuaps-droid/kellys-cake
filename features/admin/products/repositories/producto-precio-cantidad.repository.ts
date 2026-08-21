import { createAdminClient } from "@/lib/supabase/admin";

export type PrecioCantidadRow = {
  id: string;
  producto_id: string;
  cantidad_minima: number;
  precio: number;
  orden: number;
};

export async function getPreciosCantidadRepository(
  productoId: string
): Promise<PrecioCantidadRow[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("producto_precio_cantidad")
    .select("id, producto_id, cantidad_minima, precio, orden")
    .eq("producto_id", productoId)
    .order("cantidad_minima", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PrecioCantidadRow[];
}

export async function getPreciosCantidadByCatalogoRepository(
  catalogoId: string
): Promise<Record<string, PrecioCantidadRow[]>> {
  const supabase = createAdminClient();

  // 1) Obtener productos del catálogo
  const { data: productos, error: prodError } = await supabase
    .from("productos")
    .select("id")
    .eq("catalogo_id", catalogoId)
    .eq("estado", "publicado");

  if (prodError) throw prodError;

  const productoIds = (productos ?? []).map((p) => p.id as string);

  if (productoIds.length === 0) return {};

  // 2) Obtener todos los tiers de precios para esos productos
  const { data: precios, error: preciosError } = await supabase
    .from("producto_precio_cantidad")
    .select("id, producto_id, cantidad_minima, precio, orden")
    .in("producto_id", productoIds)
    .order("cantidad_minima", { ascending: true });

  if (preciosError) throw preciosError;

  // 3) Agrupar por producto_id
  const result: Record<string, PrecioCantidadRow[]> = {};
  for (const p of (precios ?? []) as PrecioCantidadRow[]) {
    if (!result[p.producto_id]) result[p.producto_id] = [];
    result[p.producto_id].push(p);
  }

  return result;
}

export async function upsertPreciosCantidadRepository(
  productoId: string,
  tiers: Array<{ cantidad_minima: number; precio: number }>
): Promise<void> {
  const supabase = createAdminClient();

  // 1) Eliminar tiers existentes
  const { error: deleteError } = await supabase
    .from("producto_precio_cantidad")
    .delete()
    .eq("producto_id", productoId);

  if (deleteError) throw deleteError;

  // 2) Insertar nuevos tiers
  if (tiers.length === 0) return;

  const rows = tiers.map((t, idx) => ({
    producto_id: productoId,
    cantidad_minima: t.cantidad_minima,
    precio: t.precio,
    orden: idx,
  }));

  const { error: insertError } = await supabase
    .from("producto_precio_cantidad")
    .insert(rows);

  if (insertError) throw insertError;
}
