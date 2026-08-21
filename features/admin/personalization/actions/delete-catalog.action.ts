"use server";

import { revalidatePath } from "next/cache";

import { deleteCatalogService } from "../services/delete-catalog.service";

export async function deleteCatalogAction(
  id: string
) {
  try {
    await deleteCatalogService(id);

    revalidatePath("/admin/catalogos");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "DELETE CATALOG ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : JSON.stringify(error),
    };
  }
}