import { deleteProductImageRepository } from "../repositories/delete-product-image.repository";

export async function deleteProductImageService(
  imageId: string
) {
  return await deleteProductImageRepository(imageId);
}