"use server";

import { addProductImageService } from "../services/add-product-image.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function addProductImageAction(
  productId: string,
  mediaId: string
) {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }

  return await addProductImageService(
    productId,
    mediaId
  );
}