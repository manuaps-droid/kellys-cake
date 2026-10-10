"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function deleteCateringRequest(id: string) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    const supabase = createAdminClient();

    const { data: solicitud } = await supabase
      .from("cotizaciones_catering")
      .select("id, proyecto_id")
      .eq("id", id)
      .maybeSingle();

    if (!solicitud) {
      return {
        success: false,
        message: "La solicitud no existe.",
      };
    }

    // Eliminar el proyecto vinculado (sus imágenes y catálogos se
    // borran en cascada). La solicitud de catering y las cotizaciones
    // asociadas se eliminan con este borrado en cascada.
    if (solicitud.proyecto_id) {
      const { error: proyectoError } = await supabase
        .from("proyectos_personalizados")
        .delete()
        .eq("id", solicitud.proyecto_id);

      if (proyectoError) {
        throw proyectoError;
      }
    }

    const { error } = await supabase
      .from("cotizaciones_catering")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/catering");
    revalidatePath("/admin/proyectos");
    revalidatePath("/admin/agenda");

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la solicitud.",
    };
  }
}
