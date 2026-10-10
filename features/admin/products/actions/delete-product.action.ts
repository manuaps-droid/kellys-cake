"use server";

import { revalidatePath } from "next/cache";

import { deleteProductService } from "../services/delete-product.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function deleteProduct(
  id: string
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

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