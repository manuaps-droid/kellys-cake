"use server";

import {
  calcularCosteoReal,
  getConfigCosteo,
} from "@/features/rentabilidad/services/costeo-real.service";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MARGEN_SALUDABLE_PCT,
  MARGEN_ALERTA_PCT,
} from "@/features/rentabilidad/services/metricas-producto.service";

type ResultadoPrediccionResponse = {
  success: boolean;
  error?: string;
  resultado?: {
    promedios: {
      margenBrutoPct: number;
      costoIngredientes: number;
      costoEmpaques: number;
      costoManoObra: number;
      costoIndirectos: number;
      costoVariable: number;
      costoCompleto: number;
      precioVenta: number;
    };
    totalConReceta: number;
    saludables: number;
    alerta: number;
    criticos: number;
    productos: Array<{
      nombre: string;
      margen: number;
      costoCompleto: number;
      precio: number;
    }>;
  };
};

export async function guardarPrediccionDemanda(input: {
  producto_ids: string[];
  maquina_id?: string;
  dias_proyectados: number;
}): Promise<ResultadoPrediccionResponse> {
  const supabase = createAdminClient();

  try {
    const { data: productosRows } = await supabase
      .from("foodos_productos")
      .select("id, nombre, precio_venta")
      .in("id", input.producto_ids);

    if (!productosRows) {
      return { success: false, error: "No se encontraron productos." };
    }

    const productosMap = new Map(
      productosRows.map((p) => [p.id as string, p])
    );

    const config = await getConfigCosteo();

    const resultados = await Promise.all(
      input.producto_ids.map(async (productoId) => {
        const d = await calcularCosteoReal(productoId, config);
        if (!d) return null;

        const producto = productosMap.get(productoId);
        const precioVenta = Number(producto?.precio_venta) || 0;
        const costoCompleto = d.costoCompletoUnitario;
        const margenBrutoPct = d.margenBrutoPct;

        const precioCalculado =
          precioVenta > 0
            ? precioVenta
            : margenBrutoPct > 0 && margenBrutoPct < 100
              ? costoCompleto / (1 - margenBrutoPct / 100)
              : costoCompleto;

        return {
          producto_id: productoId,
          nombre: producto?.nombre || "Producto",
          precio_venta: Math.round(precioCalculado * 100) / 100,
          costo_completo: Math.round(costoCompleto * 100) / 100,
          costo_variable: Math.round(d.costoVariableUnitario * 100) / 100,
          costo_ingredientes: Math.round(d.costoIngredientes * 100) / 100,
          costo_empaques: Math.round(d.costoEmpaques * 100) / 100,
          costo_mano_obra: Math.round(d.costoManoObra * 100) / 100,
          costo_indirectos: Math.round(d.costoIndirectosAsignado * 100) / 100,
          margen_bruto_pct: Math.round(d.margenBrutoPct * 10) / 10,
        };
      })
    );

    const validos = resultados.filter((r) => r !== null);

    if (validos.length === 0) {
      return { success: false, error: "No se pudieron calcular los costos." };
    }

    const promedio = (fn: (r: (typeof validos)[number]) => number) =>
      validos.reduce((t, r) => t + fn(r), 0) / validos.length;

    const saludables = validos.filter(
      (r) => r.margen_bruto_pct > MARGEN_SALUDABLE_PCT
    ).length;
    const enAlerta = validos.filter(
      (r) =>
        r.margen_bruto_pct > MARGEN_ALERTA_PCT &&
        r.margen_bruto_pct <= MARGEN_SALUDABLE_PCT
    ).length;
    const criticos = validos.filter(
      (r) => r.margen_bruto_pct <= MARGEN_ALERTA_PCT
    ).length;

    revalidatePath("/foodos/prediccion");

    return {
      success: true,
      resultado: {
        promedios: {
          margenBrutoPct: Math.round(promedio((r) => r.margen_bruto_pct) * 10) / 10,
          costoIngredientes:
            Math.round(promedio((r) => r.costo_ingredientes) * 100) / 100,
          costoEmpaques:
            Math.round(promedio((r) => r.costo_empaques) * 100) / 100,
          costoManoObra:
            Math.round(promedio((r) => r.costo_mano_obra) * 100) / 100,
          costoIndirectos:
            Math.round(promedio((r) => r.costo_indirectos) * 100) / 100,
          costoVariable:
            Math.round(promedio((r) => r.costo_variable) * 100) / 100,
          costoCompleto:
            Math.round(promedio((r) => r.costo_completo) * 100) / 100,
          precioVenta: Math.round(promedio((r) => r.precio_venta) * 100) / 100,
        },
        totalConReceta: validos.length,
        saludables,
        alerta: enAlerta,
        criticos,
        productos: validos.map((r) => ({
          nombre: r.nombre,
          margen: r.margen_bruto_pct,
          costoCompleto: r.costo_completo,
          precio: r.precio_venta,
        })),
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al calcular predicción.",
    };
  }
}

export async function guardarSupuestoDemanda(
  tenantId: string,
  input: {
    producto_id: string;
    maquina_id?: string;
    unidades_base: number;
    dia_semana?: number;
  }
) {
  const { supabase } = await getFoodOSSession();

  try {
    const { data, error } = await supabase
      .from("foodos_supuestos_demanda")
      .insert({ ...input, tenant_id: tenantId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/foodos/prediccion");
    return { success: true, supuesto: data };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al guardar supuesto.",
    };
  }
}

export async function eliminarSupuestoDemanda(id: string) {
  const { supabase } = await getFoodOSSession();

  try {
    await supabase.from("foodos_supuestos_demanda").delete().eq("id", id);
    revalidatePath("/foodos/prediccion");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar supuesto.",
    };
  }
}

export async function obtenerSupuestosDemanda(
  tenantId: string,
  productoId?: string
) {
  const { supabase } = await getFoodOSSession();

  try {
    let query = supabase
      .from("foodos_supuestos_demanda")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("activo", true);

    if (productoId) {
      query = query.eq("producto_id", productoId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return { success: true, supuestos: data ?? [] };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al obtener supuestos.",
    };
  }
}

export async function calcularPrediccionDemanda(input: {
  producto_ids: string[];
  maquina_id?: string;
  dias_proyectados: number;
}) {
  await getFoodOSSession();

  try {
    const resultado = await calcularPrediccion(input);
    revalidatePath("/foodos/prediccion");
    return { success: true, resultado };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al calcular predicción.",
    };
  }
}

// ================================================================
// MOTOR DE PREDICCIÓN DE DEMANDA (estadística simple, sin ML)
// ================================================================

export async function calcularPrediccion(input: {
  producto_ids: string[];
  maquina_id?: string;
  dias_proyectados: number;
}) {
  const supabase = createAdminClient();

  const dias = Math.max(1, input.dias_proyectados || 30);
  const config = await getConfigCosteo();

  const productos: Array<{
    producto_id: string;
    producto_nombre: string;
    unidades_base_por_dia: number;
    demanda_total_estimada: number;
    costo_unitario: number;
    costo_variable_total: number;
    precio_venta: number;
    ingresos_estimados: number;
    margen_bruto: number;
    margen_porcentaje: number;
    estado: "saludable" | "alerta" | "critico";
    origen: "supuesto" | "estadistico";
    es_provisional: boolean;
  }> = [];

  const hace30 = new Date(Date.now() - 5 * 60 * 60 * 1000);
  hace30.setUTCDate(hace30.getUTCDate() - 30);
  const desde = hace30.toISOString().slice(0, 10);

  for (const productoId of input.producto_ids) {
    const d = await calcularCosteoReal(productoId, config);
    if (!d) continue;

    const { data: productoRow } = await supabase
      .from("foodos_productos")
      .select("id, nombre, precio_venta")
      .eq("id", productoId)
      .maybeSingle();

    const precioVenta = Number(productoRow?.precio_venta) || 0;
    const costoVariable = d.costoVariableUnitario;

    // Promedio móvil simple: unidades vendidas de este producto en
    // los últimos 30 días (pedido_items + pedidos no cancelados)
    const { data: items } = await supabase
      .from("pedido_items")
      .select("cantidad, pedido_id, pedidos (created_at, estado)")
      .eq("producto_id", productoId)
      .gte("pedidos.created_at", desde)
      .neq("pedidos.estado", "cancelado");

    let unidadesVendidas = 0;
    const diasConVenta = new Set<string>();
    for (const it of ((items ?? []) as unknown as Array<{
      cantidad: number | null;
      pedidos:
        | { created_at: string | null; estado?: string }
        | Array<{ created_at: string | null; estado?: string }>
        | null;
    }>)) {
      const pedidosRel = Array.isArray(it.pedidos)
        ? it.pedidos[0]
        : it.pedidos;
      unidadesVendidas += Number(it.cantidad) || 0;
      const f = String(pedidosRel?.created_at ?? "").slice(0, 10);
      if (f) diasConVenta.add(f);
    }

    const unidadesBase = diasConVenta.size > 0 ? unidadesVendidas / 30 : 0;
    const origen: "supuesto" | "estadistico" =
      diasConVenta.size >= 8 ? "estadistico" : "supuesto";

    const demanda = unidadesBase * dias;
    const costoVariableTotal = demanda * costoVariable;
    const ingresos = demanda * precioVenta;
    const margenBruto = ingresos - costoVariableTotal;
    const margenPct = ingresos > 0 ? (margenBruto / ingresos) * 100 : 0;

    productos.push({
      producto_id: productoId,
      producto_nombre: String(productoRow?.nombre ?? "Producto"),
      unidades_base_por_dia: Math.round(unidadesBase * 100) / 100,
      demanda_total_estimada: Math.round(demanda * 10) / 10,
      costo_unitario: Math.round(costoVariable * 100) / 100,
      costo_variable_total: Math.round(costoVariableTotal * 100) / 100,
      precio_venta: Math.round(precioVenta * 100) / 100,
      ingresos_estimados: Math.round(ingresos * 100) / 100,
      margen_bruto: Math.round(margenBruto * 100) / 100,
      margen_porcentaje: Math.round(margenPct * 10) / 10,
      estado:
        margenPct > MARGEN_SALUDABLE_PCT
          ? "saludable"
          : margenPct > MARGEN_ALERTA_PCT
            ? "alerta"
            : "critico",
      origen,
      es_provisional: origen === "supuesto",
    });
  }

  const ingresosTotales = productos.reduce((t, p) => t + p.ingresos_estimados, 0);
  const costoVariableTotal = productos.reduce(
    (t, p) => t + p.costo_variable_total,
    0
  );
  const margenBruto = ingresosTotales - costoVariableTotal;
  const margenPct = ingresosTotales > 0 ? (margenBruto / ingresosTotales) * 100 : 0;

  const costoFijoTotal = config.totalFijosMensuales;

  const utilidad = margenBruto - costoFijoTotal;
  const salud =
    utilidad > 0 ? "saludable" : utilidad > -costoFijoTotal * 0.2 ? "alerta" : "critico";

  return {
    productos,
    costo_variable_total: Math.round(costoVariableTotal * 100) / 100,
    costo_fijo_total: Math.round(costoFijoTotal * 100) / 100,
    costo_total: Math.round((costoVariableTotal + costoFijoTotal) * 100) / 100,
    ingresos_totales: Math.round(ingresosTotales * 100) / 100,
    utilidad_bruta: Math.round(utilidad * 100) / 100,
    margen_global_porcentaje: Math.round(margenPct * 10) / 10,
    punto_equilibrio_unidades: 0,
    punto_equilibrio_soles: Math.round(costoFijoTotal * 100) / 100,
    dias_para_equilibrio: 0,
    salud,
    recomendacion:
      utilidad > 0
        ? "La proyección cubre costos fijos y genera utilidad."
        : "La proyección no cubre los costos fijos. Aumenta unidades o ajusta precios.",
    origen: productos.some((p) => p.origen === "estadistico")
      ? ("estadistico" as const)
      : ("supuesto" as const),
    es_provisional: productos.every((p) => p.es_provisional),
  };
}
