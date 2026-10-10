"use server";

import { getResumenVisitasService } from "../services/visitas.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getResumenVisitasAction() {
  if (!(await checkIsAdmin())) {
    return { success: false, resumen: null, message: "No autorizado." };
  }

  try {
    const resumen = await getResumenVisitasService();
    return {
      success: true,
      resumen,
    };
  } catch (error) {
    console.error("Error al obtener resumen de visitas:", error);
    return {
      success: false,
      resumen: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el resumen de visitas.",
    };
  }
}
