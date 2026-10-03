"use server";

import { getProductById } from "../services/get-product.service";
import type { Product } from "../types/product.type";

export async function getProductAction(
  id: string
): Promise<{ success: boolean; product: Product | null; message?: string }> {
  try {
    const product = await getProductById(id);

    if (!product) {
      return {
        success: false,
        product: null,
        message: "Producto no encontrado.",
      };
    }

    return {
      success: true,
      product,
    };
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return {
      success: false,
      product: null,
      message:
        error instanceof Error
          ? error.message
          : "Error al recuperar el producto.",
    };
  }
}
