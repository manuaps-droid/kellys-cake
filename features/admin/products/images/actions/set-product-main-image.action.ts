"use server";

import { revalidatePath } from "next/cache";

import { setProductMainImageService } from "../services/set-product-main-image.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function setProductMainImageAction(
  productId: string,
  imageId: string,
  mediaId: string
) {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }

  await setProductMainImageService(
    productId,
    imageId,
    mediaId
  );

  revalidatePath(
    `/admin/productos/${productId}`
  );
}