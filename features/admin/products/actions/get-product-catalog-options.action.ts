"use server";

import { getProductCatalogOptionsService } from "../services/get-product-catalog-options.service";

export async function getProductCatalogOptionsAction(
  productId: string
) {
  return await getProductCatalogOptionsService(
    productId
  );
}