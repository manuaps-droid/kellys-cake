"use server";

import { revalidatePath } from "next/cache";

import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

// ============================================================
// MANO DE OBRA DIRECTA
// ============================================================

export type ManoObraInput = {
  id?: string;
  producto_id: string;
  fase: string;
  minutos_activos: number;
  minutos_pasivos: number;
};

export async function guardarManoObraAction(input: ManoObraInput) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    if (!tenantId) return { error: "No autorizado." };

    const fase = (input.fase ?? "").trim();
    const minutosActivos = Math.max(0, Number(input.minutos_activos) || 0);
    const minutosPasivos = Math.max(0, Number(input.minutos_pasivos) || 0);

    if (fase.length < 2) {
      return { error: "Escribe la fase (ej: preparación, decoración)." };
    }

    if (input.id) {
      const { error } = await supabase
        .from("foodos_mano_obra")
        .update({ fase, minutos_activos: minutosActivos, minutos_pasivos: minutosPasivos })
        .eq("id", input.id);

      if (error) return { error: "No se pudo actualizar la mano de obra." };
    } else {
      const { error } = await supabase.from("foodos_mano_obra").insert({
        tenant_id: tenantId,
        producto_id: input.producto_id,
        fase,
        minutos_activos: minutosActivos,
        minutos_pasivos: minutosPasivos,
      });

      if (error) return { error: "No se pudo registrar la mano de obra." };
    }

    revalidatePath("/foodos/rentabilidad");
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

export async function eliminarManoObraAction(id: string) {
  try {
    const { supabase } = await getFoodOSSession();

    const { error } = await supabase
      .from("foodos_mano_obra")
      .delete()
      .eq("id", id);

    if (error) return { error: "No se pudo eliminar." };
    revalidatePath("/foodos/rentabilidad");
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

// ============================================================
// COSTOS FIJOS / INDIRECTOS
// ============================================================

export type CostoFijoInput = {
  id?: string;
  concepto: string;
  monto_mensual: number;
};

export async function guardarCostoFijoAction(input: CostoFijoInput) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    if (!tenantId) return { error: "No autorizado." };

    const concepto = (input.concepto ?? "").trim();
    const monto = Math.max(0, Number(input.monto_mensual) || 0);

    if (concepto.length < 2) {
      return { error: "Escribe el concepto (ej: Alquiler, Luz, Planilla)." };
    }

    if (input.id) {
      const { error } = await supabase
        .from("foodos_costos_fijos")
        .update({ concepto, monto_mensual: monto })
        .eq("id", input.id);

      if (error) return { error: "No se pudo actualizar el costo fijo." };
    } else {
      const { error } = await supabase.from("foodos_costos_fijos").insert({
        tenant_id: tenantId,
        concepto,
        monto_mensual: monto,
      });

      if (error) return { error: "No se pudo registrar el costo fijo." };
    }

    revalidatePath("/foodos/rentabilidad");
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

export async function eliminarCostoFijoAction(id: string) {
  try {
    const { supabase } = await getFoodOSSession();

    const { error } = await supabase
      .from("foodos_costos_fijos")
      .delete()
      .eq("id", id);

    if (error) return { error: "No se pudo eliminar." };
    revalidatePath("/foodos/rentabilidad");
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

// ============================================================
// CAPACIDAD PRODUCTIVA Y COMISIÓN PASARELA (configuración)
// ============================================================

export async function guardarConfiguracionCosteoAction(input: {
  unidades_capacidad?: number;
  costo_minuto?: number;
  comision_pasarela?: number;
}) {
  try {
    const { supabase } = await getFoodOSSession();

    const { data: row } = await supabase
      .from("tienda_config")
      .select("seccion, data")
      .eq("seccion", "foodos_config_costeo")
      .maybeSingle();

    const actual = (row?.data as Record<string, unknown>) ?? {};

    const nuevo: Record<string, unknown> = { ...actual };

    if (input.unidades_capacidad != null) {
      nuevo.unidades_capacidad = Math.max(1, Number(input.unidades_capacidad) || 120);
    }
    if (input.costo_minuto != null) {
      nuevo.costo_minuto = Math.max(0.001, Number(input.costo_minuto) || 0.0833);
    }
    if (input.comision_pasarela != null) {
      nuevo.comision_pasarela = Math.max(0, Number(input.comision_pasarela) || 2.0);
    }

    const { error } = await supabase
      .from("tienda_config")
      .upsert(
        { seccion: "foodos_config_costeo", data: nuevo },
        { onConflict: "seccion" }
      );

    if (error) return { error: "No se pudo guardar la configuración." };
    revalidatePath("/foodos/rentabilidad");
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

// ============================================================
// KPIs FINANCIEROS: inversión (ROI) y patrimonio (ROE)
// ============================================================

export async function guardarConfiguracionKpisAction(input: {
  inversion_total?: number;
  patrimonio?: number;
}) {
  try {
    const { supabase } = await getFoodOSSession();

    const { data: row } = await supabase
      .from("tienda_config")
      .select("seccion, data")
      .eq("seccion", "foodos_config_kpis")
      .maybeSingle();

    const actual = (row?.data as Record<string, unknown>) ?? {};

    const nuevo: Record<string, unknown> = { ...actual };

    if (input.inversion_total != null) {
      nuevo.inversion_total = Math.max(0, Number(input.inversion_total) || 0);
    }
    if (input.patrimonio != null) {
      nuevo.patrimonio = Math.max(0, Number(input.patrimonio) || 0);
    }

    const { error } = await supabase
      .from("tienda_config")
      .upsert(
        { seccion: "foodos_config_kpis", data: nuevo },
        { onConflict: "seccion" }
      );

    if (error) return { error: "No se pudo guardar la configuración de KPIs." };
    revalidatePath("/foodos");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}
