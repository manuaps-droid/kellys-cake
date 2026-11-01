import { createAdminClient } from "@/lib/supabase/admin";
import {
  calcularCosteoReal,
  getConfigCosteo,
} from "./costeo-real.service";

// ================================================================
// UMBRALES DE MARGEN — única fuente de verdad
// ================================================================

export const MARGEN_SALUDABLE_PCT = 40;
export const MARGEN_ALERTA_PCT = 20;
export const MARGEN_ESTRELLA_PCT = 50;

export type EstadoSaludMetrica = "saludable" | "alerta" | "critico";

export type MetricaProducto = {
  producto_id: string;
  nombre: string;
  precio_costo: number;
  precio_venta: number;
  costo_completo: number;
  costo_variable: number;
  margen_bruto_pct: number;
  margen_contribucion: number;
  estado: EstadoSaludMetrica;
  tiene_receta: boolean;
};

export type MetricasProductosResult = {
  metricas: MetricaProducto[];
  margenPromedio: number;
  costoCompletoPromedio: number;
  precioVentaPromedio: number;
  saludables: number;
  alerta: number;
  criticos: number;
  estrellas: number;
};

function clasificar(margenPct: number): EstadoSaludMetrica {
  if (margenPct > MARGEN_SALUDABLE_PCT) return "saludable";
  if (margenPct > MARGEN_ALERTA_PCT) return "alerta";
  return "critico";
}

/**
 * Métricas de TODOS los productos con receta activa, en batch.
 * - Config de costeo compartida (2 queries totales, no 2N)
 * - Costeos individuales en paralelo (Promise.all)
 * - 5 queries por producto en paralelo en lugar de 7 secuenciales
 *
 * Reemplaza los 4 loops duplicados (dashboard, rentabilidad,
 * prediccion, vending) por una única fuente de verdad.
 */
export async function getMetricasProductos(
  soloConReceta = true
): Promise<MetricasProductosResult> {
  const supabase = createAdminClient();

  const { data: productosRows } = await supabase
    .from("foodos_productos")
    .select("id, nombre, precio_venta, precio_costo, margen_porcentaje")
    .order("nombre", { ascending: true });

  const productos = productosRows ?? [];
  const config = await getConfigCosteo();

  const costeos = await Promise.all(
    productos.map(async (p) => ({
      producto: p,
      desglose: await calcularCosteoReal(p.id, config),
    }))
  );

  const metricas: MetricaProducto[] = costeos.flatMap(({ producto, desglose }) => {
    if (soloConReceta && !desglose) return [];
    const margenBrutoPct = desglose?.margenBrutoPct ?? 0;
    return [
      {
        producto_id: producto.id,
        nombre: String(producto.nombre ?? ""),
        precio_costo: Number(producto.precio_costo) || 0,
        precio_venta: Number(producto.precio_venta) || 0,
        costo_completo: desglose?.costoCompletoUnitario ?? 0,
        costo_variable: desglose?.costoVariableUnitario ?? 0,
        margen_bruto_pct: Math.round(margenBrutoPct * 10) / 10,
        margen_contribucion: desglose?.margenContribucion ?? 0,
        estado: clasificar(margenBrutoPct),
        tiene_receta: Boolean(desglose),
      },
    ];
  });

  const n = metricas.length;
  const margenPromedio =
    n > 0 ? metricas.reduce((t, m) => t + m.margen_bruto_pct, 0) / n : 0;
  const costoCompletoPromedio =
    n > 0 ? metricas.reduce((t, m) => t + m.costo_completo, 0) / n : 0;
  const precioVentaPromedio =
    n > 0 ? metricas.reduce((t, m) => t + m.precio_venta, 0) / n : 0;

  return {
    metricas,
    margenPromedio: Math.round(margenPromedio * 10) / 10,
    costoCompletoPromedio: Math.round(costoCompletoPromedio * 100) / 100,
    precioVentaPromedio: Math.round(precioVentaPromedio * 100) / 100,
    saludables: metricas.filter((m) => m.estado === "saludable").length,
    alerta: metricas.filter((m) => m.estado === "alerta").length,
    criticos: metricas.filter((m) => m.estado === "critico").length,
    estrellas: metricas.filter(
      (m) => m.margen_bruto_pct > MARGEN_ESTRELLA_PCT
    ).length,
  };
}
