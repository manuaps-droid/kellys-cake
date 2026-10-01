"use server";

import { revalidatePath } from "next/cache";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function toggleModulo(modulo: string, nuevoEstado: boolean) {
  if (modulo === "core") return { error: "El módulo Core es obligatorio y no se puede desactivar." };

  try {
    const { supabase, tenantId } = await getFoodOSSession();

  const { error } = await supabase
    .from('foodos_modulos')
    .upsert({
      tenant_id: tenantId,
      modulo,
      activo: nuevoEstado,
      fecha_activacion: nuevoEstado ? new Date().toISOString() : null
    }, { onConflict: 'tenant_id,modulo' });

  if (error) {
    console.error("Error al actualizar módulo:", error);
    return { error: "No se pudo actualizar el estado del módulo." };
  }

  revalidatePath('/foodos');
  revalidatePath('/foodos/modulos');
  return { success: true };
  } catch (err) {
    console.error("Error en toggleModulo:", err);
    return { error: "No autorizado o error al actualizar módulo." };
  }
}
