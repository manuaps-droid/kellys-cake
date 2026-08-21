"use server";

import { deleteProductImageService } from "../services/delete-product-image.service";

export async function deleteProductImageAction(
  imageId: string
) {
  return await deleteProductImageService(imageId);
}