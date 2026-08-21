"use server";

import { revalidatePath } from "next/cache";

import {
  getConfigService,
  updateConfigService,
} from "../services/config.service";
import type { SeccionConfig } from "../validations/config.schema";

export async function getConfigAction<T extends SeccionConfig>(
  seccion?: T
) {
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
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración.",
    };
  }
}
