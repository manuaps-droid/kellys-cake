"use server";

import { revalidatePath } from "next/cache";

import { createProductService } from "../services/create-product.service";

import type { ProductSchema } from "../validations/product.schema";

export async function createProduct(
  data: ProductSchema
) {
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