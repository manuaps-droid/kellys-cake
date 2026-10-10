"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

type Cambio = { id: string; orden: number };

/**
 * Persiste el orden de publicación de los catálogos.
 * Recibe solo los cambios (id + nueva posición) para minimizar
 * escrituras en la base de datos.
 */
export async function saveCatalogosOrderAction(cambios: Cambio[]) {
  if (!(await checkIsAdmin())) {
    return { success: false as const, message: "No autorizado." };
  }

  if (!Array.isArray(cambios)) {
    return { success: false as const, message: "Datos inválidos." };
  }

  const supabase = createAdminClient();

  try {
    for (const cambio of cambios) {
      const { error } = await supabase
        .from("catalogo_personalizacion")
        .update({ orden: cambio.orden })
        .eq("id", cambio.id);

      if (error) throw new Error(error.message);
    }
  } catch (err) {
    return {
      success: false as const,
      message:
        err instanceof Error
          ? err.message
          : "No se pudo guardar el orden.",
    };
  }

  // Refrescar vistas que listan catálogos
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/catalogos");
  revalidatePath("/productos");
  revalidatePath("/");

  return { success: true as const };
}
