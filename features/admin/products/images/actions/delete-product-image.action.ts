"use server";

import { deleteProductImageService } from "../services/delete-product-image.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function deleteProductImageAction(
  imageId: string
) {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }

  return await deleteProductImageService(imageId);
}