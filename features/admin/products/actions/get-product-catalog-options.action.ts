"use server";

import { getProductCatalogOptionsService } from "../services/get-product-catalog-options.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getProductCatalogOptionsAction(
  productId: string
) {
  if (!(await checkIsAdmin())) {
    return [];
  }

  return await getProductCatalogOptionsService(
    productId
  );
}