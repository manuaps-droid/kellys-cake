"use server";

import { revalidatePath } from "next/cache";

import { deleteProductService } from "../services/delete-product.service";

export async function deleteProduct(
  id: string
) {
  try {
    await deleteProductService(id);

    revalidatePath("/admin/productos");

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
          : "Error inesperado.",
    };
  }
}