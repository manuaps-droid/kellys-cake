"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

type RespondInput = {
  id: string;
  respuesta: string;
  estado: "en_proceso" | "resuelto";
};

/**
 * Guarda la respuesta del administrador y actualiza el estado
 * de una solicitud del Libro de Reclamaciones.
 */
export async function respondReclamoAction(input: RespondInput) {
  if (!(await checkIsAdmin())) {
    return {
      success: false as const,
      message: "No autorizado.",
    };
  }

  if (!input.respuesta.trim()) {
    return {
      success: false as const,
      message: "Escribe la respuesta antes de guardar.",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("libro_reclamaciones")
    .update({
      respuesta: input.respuesta.trim(),
      estado: input.estado,
      respondido_at:
        input.estado === "resuelto" ? new Date().toISOString() : null,
    })
    .eq("id", input.id);

  if (error) {
    return { success: false as const, message: error.message };
  }

  revalidatePath("/admin/reclamos");

  return { success: true as const };
}
