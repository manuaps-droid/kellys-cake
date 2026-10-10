"use server";

import { revalidatePath } from "next/cache";

import { updateCatalogService } from "../services/update-catalog.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

type UpdateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  mostrar_en_productos?: boolean;
  mostrar_en_categorias?: boolean;
  precio?: number | null;
};

export async function updateCatalogAction(
  id: string,
  data: UpdateCatalogData
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await updateCatalogService(id, data);

    revalidatePath("/admin/catalogos");
    revalidatePath(`/admin/catalogos/${id}`);
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el catálogo.",
    };
  }
}
