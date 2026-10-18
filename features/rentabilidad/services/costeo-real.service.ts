import { createAdminClient } from "@/lib/supabase/admin";

// ================================================================
// TIPOS
// ================================================================

export type EmpaqueItem = {
  nombre: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
};

export type ManoObraItem = {
  fase: string;
  minutosActivos: number;
  minutosPasivos: number;
  costoMinuto: number;
  costoAsignado: number;
};

export type CostoFijoItem = {
  concepto: string;
  montoMensual: number;
};

export type DesgloseCosteo = {
  // Capa 1: Ingredientes
  costoIngredientes: number;
  rendimiento: number;
  mermaAplicada: string[];
  ingredientesDetalle: Array<{
    nombre: string;
    cantidad: number;
    unidad: string;
    costoUnitarioUso: number;
    mermaPct: number;
    costoLinea: number;
  }>;

  // Capa 2: Empaques y directos
  empaques: EmpaqueItem[];
  costoEmpaques: number;
  costoOtrosDirectos: number;

  // Capa 3: Mano de obra directa
  manoObra: ManoObraItem[];
  costoManoObra: number;
  minutosActivosTotales: number;
  costoPorMinuto: number;

  // Capa 4: Costos indirectos
  costosFijos: CostoFijoItem[];
  totalFijosMensuales: number;
  unidadesMensualesCapacidad: number;
  tasaIndirectosPorUnidad: number;
  costoIndirectosAsignado: number;

  // Resultados
  costoVariableUnitario: number;
  costoCompletoUnitario: number;
  margenContribucion: number;
  margenContribucionPct: number;
  margenBrutoPct: number;

  // Diagnóstico de datos
  alertas: string[];
  datosFaltantes: string[];
  origenDatos: string;
};

// ================================================================
// CONFIGURACIÓN (de la base o defaults marcados como estimación)
// ================================================================

export const COSTO_MINUTO_DEFAULT = 0.0833; // S/ 5,000 planilla ÷ 60,000 min/mes
export const UNIDADES_CAPACIDAD_DEFAULT = 120; // unidades vendibles/mes
export const OTROS_DIRECTOS_DEFAULT = 2.0;

// ================================================================
// SERVICIO PRINCIPAL: calcula el costeo real de un producto
// ================================================================

export async function calcularCosteoReal(productoId: string): Promise<DesgloseCosteo | null> {
  const supabase = createAdminClient();
  const alertas: string[] = [];
  const datosFaltantes: string[] = [];

  // ── 1. Producto y receta activa ──
  const { data: producto } = await supabase
    .from("foodos_productos")
    .select("id, nombre, precio_venta, precio_costo")
    .eq("id", productoId)
    .single();

  if (!producto) return null;

  const { data: receta } = await supabase
    .from("recetas")
    .select("id, rendimiento, costo_total, costo_unitario")
    .eq("producto_id", productoId)
    .eq("es_activa", true)
    .single();

  if (!receta) {
    datosFaltantes.push("Sin receta activa: no se pueden calcular ingredientes.");
    return null;
  }

  const rendimiento = Number(receta.rendimiento) || 1;

  // ── 2. Ingredientes con costo y merma ──
  const { data: items } = await supabase
    .from("receta_items")
    .select(`
      cantidad,
      unidad,
      merma_porcentaje,
      costo_linea,
      ingredientes (
        id,
        nombre,
        costo_por_unidad_uso,
        porcentaje_merma_estandar,
        factor_conversion,
        unidad_compra,
        unidad_uso
      )
    `)
    .eq("receta_id", receta.id)
    .order("created_at", { ascending: true });

  const ingredientesDetalle: DesgloseCosteo["ingredientesDetalle"] = [];
  const mermaAplicada: string[] = [];
  let costoIngredientesTotal = 0;

  for (const item of (items ?? []) as Array<{
    cantidad: number;
    unidad: string;
    merma_porcentaje: number | null;
    ingredientes: {
      nombre: string;
      costo_por_unidad_uso: number;
      porcentaje_merma_estandar: number;
    } | { nombre: string; costo_por_unidad_uso: number; porcentaje_merma_estandar: number }[] | null;
  }>) {
    const ing = Array.isArray(item?.ingredientes)
      ? (item.ingredientes as Array<{ nombre: string; costo_por_unidad_uso: number; porcentaje_merma_estandar: number }>)[0]
      : item?.ingredientes;

    if (!ing) continue;

    const cantidad = Number(item.cantidad) || 0;
    const mermaBase = Number(ing.porcentaje_merma_estandar) || 0;
    const mermaExtra = Number(item.merma_porcentaje) || 0;
    const mermaTotal = (mermaBase + mermaExtra) / 100;
    const factorMerma = 1 - (mermaTotal >= 1 ? 0.99 : mermaTotal);
    const cantidadReal = cantidad / factorMerma;
    const costoUso = Number(ing.costo_por_unidad_uso) || 0;
    const costoLinea = cantidadReal * costoUso;

    ingredientesDetalle.push({
      nombre: ing.nombre,
      cantidad,
      unidad: item.unidad,
      costoUnitarioUso: costoUso,
      mermaPct: Math.round((mermaBase + mermaExtra) * 10) / 10,
      costoLinea: Math.round(costoLinea * 10000) / 10000,
    });

    costoIngredientesTotal += costoLinea;

    if (mermaTotal > 0) {
      mermaAplicada.push(
        `${ing.nombre}: ${Math.round((mermaBase + mermaExtra) * 10) / 10}% merma (+S/ ${Math.round((cantidadReal - cantidad) * costoUso * 100) / 100})`
      );
    }
  }

  const costoIngredientesPorUnidad = costoIngredientesTotal / rendimiento;

  // ── 3. Empaques ──
  const { data: empaquesDB } = await supabase
    .from("foodos_empaques")
    .select("nombre, cantidad, costo_unitario")
    .eq("producto_id", productoId)
    .eq("activo", true);

  const empaques: EmpaqueItem[] = (empaquesDB ?? []).map((e: {
    nombre: string;
    cantidad: number;
    costo_unitario: number;
  }) => ({
    nombre: e.nombre,
    cantidad: Number(e.cantidad) || 1,
    costoUnitario: Number(e.costo_unitario) || 0,
    costoTotal: (Number(e.cantidad) || 1) * (Number(e.costo_unitario) || 0),
  }));

  const costoEmpaques = empaques.reduce((t, e) => t + e.costoTotal, 0);

  if (empaques.length === 0) {
    datosFaltantes.push("Sin empaques registrados: usando estimación de S/ 0.50.");
  }

  // ── 4. Mano de obra directa ──
  const { data: manoObraDB } = await supabase
    .from("foodos_mano_obra")
    .select("fase, minutos_activos, minutos_pasivos")
    .eq("producto_id", productoId)
    .eq("activo", true);

  const manoObra: ManoObraItem[] = (manoObraDB ?? []).map((m: {
    fase: string;
    minutos_activos: number;
    minutos_pasivos: number;
  }) => {
    const minutosActivos = Number(m.minutos_activos) || 0;
    const costoAsignado = minutosActivos * COSTO_MINUTO_DEFAULT;
    return {
      fase: m.fase,
      minutosActivos,
      minutosPasivos: Number(m.minutos_pasivos) || 0,
      costoMinuto: COSTO_MINUTO_DEFAULT,
      costoAsignado: Math.round(costoAsignado * 100) / 100,
    };
  });

  const costoManoObra = manoObra.reduce((t, m) => t + m.costoAsignado, 0) / rendimiento;

  if (manoObra.length === 0) {
    datosFaltantes.push(
      "Sin minutos de mano de obra registrados: no se está asignando planilla a este producto."
    );
  }

  // ── 5. Costos fijos/indirectos ──
  const { data: costosFijosDB } = await supabase
    .from("foodos_costos_fijos")
    .select("concepto, monto_mensual")
    .eq("activo", true);

  const costosFijos: CostoFijoItem[] = (costosFijosDB ?? []).map((c: {
    concepto: string;
    monto_mensual: number;
  }) => ({
    concepto: c.concepto,
    montoMensual: Number(c.monto_mensual) || 0,
  }));

  const totalFijosMensuales = costosFijos.reduce((t, c) => t + c.montoMensual, 0);
  const unidadesMensualesCapacidad = UNIDADES_CAPACIDAD_DEFAULT;
  const tasaIndirectosPorUnidad =
    unidadesMensualesCapacidad > 0
      ? totalFijosMensuales / unidadesMensualesCapacidad
      : 0;
  const costoIndirectosAsignado = tasaIndirectosPorUnidad;

  if (costosFijos.length === 0) {
    datosFaltantes.push(
      "Sin costos fijos registrados en la base: usando 0 como indirectos. Configura en Admin → Costos."
    );
  } else {
    alertas.push(
      `Indirectos: S/ ${tasaIndirectosPorUnidad.toFixed(2)}/unidad (S/ ${totalFijosMensuales.toFixed(0)} ÷ ${unidadesMensualesCapacidad} unidades/mes)`
    );
  }

  // ── 6. Resultados ──
  const costoOtrosDirectos = OTROS_DIRECTOS_DEFAULT; // Comisión pasarela estimada
  const costoVariableUnitario =
    costoIngredientesPorUnidad + costoEmpaques + costoManoObra + costoOtrosDirectos;
  const costoCompletoUnitario = costoVariableUnitario + costoIndirectosAsignado;

  const precioVenta = Number(producto.precio_venta) || 0;
  const margenContribucion = precioVenta - costoVariableUnitario;
  const margenContribucionPct =
    precioVenta > 0 ? (margenContribucion / precioVenta) * 100 : 0;
  const margenBrutoPct =
    precioVenta > 0
      ? ((precioVenta - costoCompletoUnitario) / precioVenta) * 100
      : 0;

  if (precioVenta > 0 && precioVenta < costoCompletoUnitario) {
    alertas.push(
      `⚠️ El precio actual (S/ ${precioVenta.toFixed(2)}) NO cubre el costo completo (S/ ${costoCompletoUnitario.toFixed(2)}).`
    );
  }

  const origenDatos =
    `Receta: ${receta ? "FoodOS (activa)" : "falta"}, ` +
    `Empaques: ${empaques.length > 0 ? "registrados" : "estimación"}, ` +
    `Mano de obra: ${manoObra.length > 0 ? "registrada" : "no asignada"}, ` +
    `Costos fijos: ${costosFijos.length > 0 ? "registrados" : "sin configurar"}`;

  return {
    costoIngredientes: Math.round(costoIngredientesPorUnidad * 100) / 100,
    rendimiento,
    mermaAplicada,
    ingredientesDetalle: ingredientesDetalle.map(d => ({
      ...d,
      costoLinea: Math.round(d.costoLinea * 100) / 100,
    })),
    empaques,
    costoEmpaques: Math.round(costoEmpaques * 100) / 100,
    costoOtrosDirectos,
    manoObra,
    costoManoObra: Math.round(costoManoObra * 100) / 100,
    minutosActivosTotales: manoObra.reduce((t, m) => t + m.minutosActivos, 0),
    costoPorMinuto: COSTO_MINUTO_DEFAULT,
    costosFijos,
    totalFijosMensuales,
    unidadesMensualesCapacidad,
    tasaIndirectosPorUnidad: Math.round(tasaIndirectosPorUnidad * 100) / 100,
    costoIndirectosAsignado: Math.round(costoIndirectosAsignado * 100) / 100,
    costoVariableUnitario: Math.round(costoVariableUnitario * 100) / 100,
    costoCompletoUnitario: Math.round(costoCompletoUnitario * 100) / 100,
    margenContribucion: Math.round(margenContribucion * 100) / 100,
    margenContribucionPct: Math.round(margenContribucionPct * 10) / 10,
    margenBrutoPct: Math.round(margenBrutoPct * 10) / 10,
    alertas,
    datosFaltantes,
    origenDatos,
  };
}
