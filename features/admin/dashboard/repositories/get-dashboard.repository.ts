import { createClient } from "@/lib/supabase/server";

import type { DashboardStats } from "../types/dashboard.type";

/**
 * Usa la RPC `dashboard_stats` para obtener todos los KPIs
 * en una sola consulta con agregados en el servidor.
 */
export async function getDashboardRepository(): Promise<DashboardStats> {
  const supabase = await createClient();

  // 1. Obtener métricas agregadas por RPC o consultas seguras
  const [{ data: rpcData }, { data: pedidosData }] = await Promise.all([
    supabase.rpc("dashboard_stats"),
    supabase.from("pedidos").select("total, cliente_id, estado").limit(500),
  ]);

  const r = (rpcData as Record<string, number>) || {};

  const pedidos = r.pedidos_total ?? (pedidosData?.length ?? 0);
  const productos = r.productos_total ?? 0;
  const clientes = r.clientes_total ?? 0;
  const proyectos = r.proyectos_total ?? 0;
  const ventas = Number(r.ventas_total ?? 0);
  const pedidosPendientes = r.pedidos_pendientes ?? 0;
  const productosActivos = r.productos_activos ?? 0;
  const clientesActivos = r.clientes_activos ?? 0;
  const proyectosPendientes = r.proyectos_pendientes ?? 0;

  // 2. Cálculo de KPIs Analíticos
  let ticketPromedio = 0;
  let tasaRecompra = 0;
  let clientesRecurrentes = 0;

  if (pedidosData && pedidosData.length > 0) {
    const totalSuma = pedidosData.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
    ticketPromedio = Math.round((totalSuma / pedidosData.length) * 100) / 100;

    // Frecuencia por cliente para tasa de recompra
    const clientePedidosCount = new Map<string, number>();
    for (const p of pedidosData) {
      if (p.cliente_id) {
        clientePedidosCount.set(p.cliente_id, (clientePedidosCount.get(p.cliente_id) || 0) + 1);
      }
    }

    clientesRecurrentes = Array.from(clientePedidosCount.values()).filter((c) => c > 1).length;
    if (clientePedidosCount.size > 0) {
      tasaRecompra = Math.round((clientesRecurrentes / clientePedidosCount.size) * 100);
    }
  }

  // Meta mensual sugerida para Kelly's Cake (Meta S/ 10,000 en pastelería de autor)
  const metaMensualVentas = 10000;
  const cumplimientoMeta = Math.min(100, Math.round((ventas / metaMensualVentas) * 100));

  return {
    pedidos,
    productos,
    clientes,
    proyectos,
    ventas,
    pedidosPendientes,
    productosActivos,
    clientesActivos,
    proyectosPendientes,
    ticketPromedio: ticketPromedio || (ventas && pedidos ? Math.round((ventas / pedidos) * 100) / 100 : 0),
    tasaConversion: 0, // Calculado en la vista con visitas reales
    tasaRecompra,
    clientesRecurrentes,
    metaMensualVentas,
    cumplimientoMeta,
  };
}
