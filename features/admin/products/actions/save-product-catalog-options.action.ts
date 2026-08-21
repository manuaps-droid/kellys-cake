"use server";

import { revalidatePath } from "next/cache";

import { saveProductCatalogOptionsService } from "../services/save-product-catalog-options.service";

export type ProductCatalogOptionInput = {
  catalogo_id: string;
  precio_extra: number;
  obligatorio: boolean;
};

export async function saveProductCatalogOptionsAction(
  productId: string,
  options: ProductCatalogOptionInput[]
) {
  try {
    await saveProductCatalogOptionsService(
      productId,
      options
    );

    revalidatePath("/admin/productos");
    revalidatePath(
      `/admin/productos/${productId}`
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