"use server";

import { revalidatePath } from "next/cache";

import { createCatalogService } from "../services/create-catalog.service";

type CreateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
};

export async function createCatalogAction(
  data: CreateCatalogData
) {
  try {
    await createCatalogService(data);

    revalidatePath("/admin/catalogos");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null
          ? JSON.stringify(error)
          : String(error);

    return {
      success: false,
      message: msg || "No se pudo crear el catálogo.",
    };
  }
}
