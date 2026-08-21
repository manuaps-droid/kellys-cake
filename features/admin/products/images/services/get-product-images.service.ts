import { getProductImagesRepository } from "../repositories/get-product-images.repository";

import type { ProductImage } from "../../types/product-image.type";

export async function getProductImagesService(
  productId: string
): Promise<ProductImage[]> {
  return await getProductImagesRepository(productId);
}