import { addProductImageRepository } from "../repositories/add-product-image.repository";

export async function addProductImageService(
  productId: string,
  mediaId: string
) {
  return await addProductImageRepository(
    productId,
    mediaId
  );
}