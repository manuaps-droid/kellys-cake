import { createClient } from "@/lib/supabase/server";

import type { DashboardStats } from "../types/dashboard.type";

/**
 * Usa la RPC `dashboard_stats` para obtener todos los KPIs
 * en una sola consulta con agregados en el servidor.
 */
export async function getDashboardRepository(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("dashboard_stats");

  if (error || !data) {
    // Fallback a ceros si algo falla, evitando romper el render.
    return {
      pedidos: 0,
      productos: 0,
      clientes: 0,
      proyectos: 0,
      ventas: 0,
      pedidosPendientes: 0,
      productosActivos: 0,
      clientesActivos: 0,
      proyectosPendientes: 0,
    };
  }

  const r = data as Record<string, number>;

  return {
    pedidos: r.pedidos_total ?? 0,
    productos: r.productos_total ?? 0,
    clientes: r.clientes_total ?? 0,
    proyectos: r.proyectos_total ?? 0,
    ventas: Number(r.ventas_total ?? 0),
    pedidosPendientes: r.pedidos_pendientes ?? 0,
    productosActivos: r.productos_activos ?? 0,
    clientesActivos: r.clientes_activos ?? 0,
    proyectosPendientes: r.proyectos_pendientes ?? 0,
  };
}
