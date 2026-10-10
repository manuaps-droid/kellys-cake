"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getConfigService,
  updateConfigService,
} from "../services/config.service";
import type { SeccionConfig } from "../validations/config.schema";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getConfigAction<T extends SeccionConfig>(
  seccion?: T
) {
  if (!(await checkIsAdmin())) {
    return { success: false, data: null, message: "No autorizado." };
  }

  try {
    const data = await getConfigService(seccion);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar la configuración.",
    };
  }
}

export async function updateConfigAction<T extends SeccionConfig>(
  seccion: T,
  data: unknown
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await updateConfigService(seccion, data);

    // Invalida toda la app: layout (SEO/pixeles), home (banner),
    // footer (redes) y admin.
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/productos");
    revalidatePath("/admin/configuracion");

    return { success: true };
  } catch (error) {
    console.error(error);
    let message = "No se pudo guardar la configuración.";
    if (error instanceof z.ZodError) {
      message = error.issues
        .map((i) => (i.message && !i.message.startsWith("Invalid") ? i.message : `${i.path.join(".")}: dato inválido`))
        .join(". ");
    } else if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}
