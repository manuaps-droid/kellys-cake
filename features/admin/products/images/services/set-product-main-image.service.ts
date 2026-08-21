import { setProductMainImageRepository } from "../repositories/set-product-main-image.repository";

export async function setProductMainImageService(
  productId: string,
  imageId: string,
  mediaId: string
) {
  await setProductMainImageRepository(
    productId,
    imageId,
    mediaId
  );
}