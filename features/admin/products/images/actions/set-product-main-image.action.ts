"use server";

import { revalidatePath } from "next/cache";

import { setProductMainImageService } from "../services/set-product-main-image.service";

export async function setProductMainImageAction(
  productId: string,
  imageId: string,
  mediaId: string
) {
  await setProductMainImageService(
    productId,
    imageId,
    mediaId
  );

  revalidatePath(
    `/admin/productos/${productId}`
  );
}