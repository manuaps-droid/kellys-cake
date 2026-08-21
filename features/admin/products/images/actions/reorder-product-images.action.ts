"use server";

import { revalidatePath } from "next/cache";

import { reorderProductImagesService } from "../services/reorder-product-images.service";

export async function reorderProductImagesAction(
  productId: string,
  orderedIds: string[]
) {
  await reorderProductImagesService(
    productId,
    orderedIds
  );

  revalidatePath(
    `/admin/productos/${productId}`
  );
}