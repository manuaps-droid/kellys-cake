"use server";

import { revalidatePath } from "next/cache";

import { updateProductService } from "../services/update-product.service";

import type { ProductSchema } from "../validations/product.schema";

export async function updateProduct(
  id: string,
  data: ProductSchema
) {
  try {
    await updateProductService(
      id,
      data
    );

    revalidatePath("/admin/productos");
    revalidatePath(
      `/admin/productos/${id}`
    );

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