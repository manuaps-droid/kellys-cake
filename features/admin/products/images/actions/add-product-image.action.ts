"use server";

import { addProductImageService } from "../services/add-product-image.service";

export async function addProductImageAction(
  productId: string,
  mediaId: string
) {
  return await addProductImageService(
    productId,
    mediaId
  );
}