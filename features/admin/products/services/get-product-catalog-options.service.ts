import { getProductCatalogOptionsRepository } from "../repositories/get-product-catalog-options.repository";

export async function getProductCatalogOptionsService(
  productId: string
) {
  return await getProductCatalogOptionsRepository(
    productId
  );
}