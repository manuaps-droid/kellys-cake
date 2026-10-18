"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

/**
 * Registra la merma del mes (lo horneado y no vendido) en soles.
 * El porcentaje se calcula contra las ventas reales del mes.
 */
export async function guardarMermaMesAction(monto: number) {
  try {
    const { tenantId } = await getFoodOSSession();

    if (!tenantId) {
      return { error: "No autorizado." };
    }

    const montoLimpio = Math.abs(Number(monto));

    if (!Number.isFinite(montoLimpio) || montoLimpio < 0) {
      return { error: "Ingresa un monto válido en soles." };
    }

    if (montoLimpio > 1000000) {
      return { error: "El monto parece demasiado grande. Revísalo." };
    }

    const admin = createAdminClient();

    const lima = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const mesActual = lima.toISOString().slice(0, 7);

    const { data: row } = await admin
      .from("tienda_config")
      .select("seccion, data")
      .eq("seccion", "foodos_merma")
      .maybeSingle();

    const actual = (row?.data as Record<string, unknown>) ?? {};

    const { error } = await admin
      .from("tienda_config")
      .upsert(
        {
          seccion: "foodos_merma",
          data: {
            ...actual,
            mes: mesActual,
            monto: Math.round(montoLimpio * 100) / 100,
            actualizado_en: new Date().toISOString(),
          },
        },
        { onConflict: "seccion" }
      );

    if (error) {
      return { error: "No se pudo registrar la merma." };
    }

    revalidatePath("/foodos/pulso");

    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}
