"use server";

import { getProductImagesService } from "../services/get-product-images.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getProductImagesAction(
  productId: string
) {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }

  return await getProductImagesService(productId);
}