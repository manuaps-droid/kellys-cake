"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export type ItemCopiado = {
  ingrediente_id: string;
  cantidad: number;
  unidad: string;
  merma_porcentaje: number;
};

/**
 * Lee los ingredientes de una receta existente para copiarlos
 * a otra (sin guardar, solo retorna los items).
 */
export async function leerItemsDeRecetaAction(
  recetaId: string
): Promise<{ items: ItemCopiado[]; rendimiento: number }> {
  try {
    const { tenantId } = await getFoodOSSession();

    if (!tenantId) {
      return { items: [], rendimiento: 1 };
    }

    const supabase = createAdminClient();

    const { data: receta } = await supabase
      .from("recetas")
      .select("id, rendimiento, tenant_id")
      .eq("id", recetaId)
      .single();

    if (!receta || receta.tenant_id !== tenantId) {
      return { items: [], rendimiento: 1 };
    }

    const { data: items } = await supabase
      .from("receta_items")
      .select("ingrediente_id, cantidad, unidad, merma_porcentaje")
      .eq("receta_id", recetaId)
      .order("created_at", { ascending: true });

    return {
      items: (items ?? []).map((item) => ({
        ingrediente_id: item.ingrediente_id ?? "",
        cantidad: Number(item.cantidad) || 0,
        unidad: item.unidad ?? "",
        merma_porcentaje: Number(item.merma_porcentaje) || 0,
      })),
      rendimiento: Number(receta.rendimiento) || 1,
    };
  } catch {
    return { items: [], rendimiento: 1 };
  }
}
