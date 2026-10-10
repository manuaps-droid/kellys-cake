"use server";

import { revalidatePath } from "next/cache";

import { createProductService } from "../services/create-product.service";

import type { ProductSchema } from "../validations/product.schema";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function createProduct(
  data: ProductSchema
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    const id = await createProductService(data);

    revalidatePath("/admin/productos");

    return {
      success: true,
      id,
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