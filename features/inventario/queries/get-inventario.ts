import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
}

export async function getInventario(almacenId?: string) {
  const supabase = await getSupabaseClient();
  let query = supabase
    .from('foodos_inventario')
    .select(`
      id,
      stock_actual,
      stock_minimo,
      ubicacion_estante,
      updated_at,
      almacen:foodos_almacenes (id, nombre),
      ingrediente:ingredientes (id, nombre, unidad_compra, unidad_uso, costo_unitario)
    `);

  if (almacenId) {
    query = query.eq('almacen_id', almacenId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error obteniendo inventario:", error);
    return [];
  }
  return data || [];
}
