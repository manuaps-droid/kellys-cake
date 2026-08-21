import { reorderProductImagesRepository } from "../repositories/reorder-product-images.repository";

export async function reorderProductImagesService(
  productId: string,
  orderedIds: string[]
) {
  await reorderProductImagesRepository(
    productId,
    orderedIds
  );
}