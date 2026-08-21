"use server";

import { revalidatePath } from "next/cache";

import { createBulkCatalogService } from "../services/create-bulk-catalog.service";

type CatalogItemData = {
  nombre: string;
  descripcion?: string;
};

type CreateBulkCatalogData = {
  tipo: string;
  activo: boolean;
  items: CatalogItemData[];
};

export async function createBulkCatalogAction(
  data: CreateBulkCatalogData
) {
  try {
    await createBulkCatalogService(data);

    revalidatePath("/admin/catalogos");

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
      message: msg || "No se pudieron crear los catálogos.",
    };
  }
}
