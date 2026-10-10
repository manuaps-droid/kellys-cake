"use server";

import { revalidatePath } from "next/cache";

import { reorderProductImagesService } from "../services/reorder-product-images.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function reorderProductImagesAction(
  productId: string,
  orderedIds: string[]
) {
  if (!(await checkIsAdmin())) {
    throw new Error("No autorizado.");
  }

  await reorderProductImagesService(
    productId,
    orderedIds
  );

  revalidatePath(
    `/admin/productos/${productId}`
  );
}