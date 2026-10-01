import { createClient } from "@/lib/supabase/server";
import { Resena, ResenaStats } from "../types/resena.types";

export async function getResenasByProducto(productoId: string, page = 1, perPage = 10): Promise<{ resenas: Resena[], stats: ResenaStats, total: number }> {
  const supabase = await createClient();
  
  // Get stats (all approved reviews for the product)
  const { data: allApproved } = await supabase
    .from("resenas")
    .select("calificacion")
    .eq("producto_id", productoId)
    .eq("aprobada", true);
    
  let stats: ResenaStats = { promedio: 0, total: 0, distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  
  if (allApproved && allApproved.length > 0) {
    stats.total = allApproved.length;
    let sum = 0;
    
    allApproved.forEach(r => {
      sum += r.calificacion;
      stats.distribucion[r.calificacion as number] = (stats.distribucion[r.calificacion as number] || 0) + 1;
    });
    
    stats.promedio = Number((sum / stats.total).toFixed(1));
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Get paginated reviews
  const { data, count, error } = await supabase
    .from("resenas")
    .select(`
      *,
      cliente:clientes(nombre, apellidos, foto)
    `, { count: "exact" })
    .eq("producto_id", productoId)
    .eq("aprobada", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Error al obtener reseñas: ${error.message}`);
  }

  // Transform data to match Resena interface, Supabase might return array for cliente if not uniquely mapped, but it should be object since it's one-to-one
  const resenas: Resena[] = (data || []).map((item: any) => ({
    ...item,
    cliente: Array.isArray(item.cliente) ? item.cliente[0] : item.cliente
  }));

  return {
    resenas,
    stats,
    total: count || 0
  };
}

export async function getResenasByCliente(clienteId: string): Promise<Resena[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("resenas")
    .select(`
      *,
      cliente:clientes(nombre, apellidos, foto)
    `)
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener reseñas del cliente: ${error.message}`);
  }

  const resenas: Resena[] = (data || []).map((item: any) => ({
    ...item,
    cliente: Array.isArray(item.cliente) ? item.cliente[0] : item.cliente
  }));

  return resenas;
}
