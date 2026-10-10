"use server";

import { getCatalogByIdService } from "../services/get-catalog-by-id.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getCatalogByIdAction(
  id: string
) {
  if (!(await checkIsAdmin())) {
    return { success: false, catalog: null, message: "No autorizado." };
  }

  try {
    const catalog =
      await getCatalogByIdService(id);

    return {
      success: true,
      catalog,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      catalog: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el catálogo.",
    };
  }
}