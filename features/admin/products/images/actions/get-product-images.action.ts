"use server";

import { getProductImagesService } from "../services/get-product-images.service";

export async function getProductImagesAction(
  productId: string
) {
  return await getProductImagesService(productId);
}