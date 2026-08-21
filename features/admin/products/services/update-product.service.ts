import { updateProductRepository } from "../repositories/update-product.repository";

import type { ProductSchema } from "../validations/product.schema";

export async function updateProductService(
  id: string,
  data: ProductSchema
) {
  return updateProductRepository(
    id,
    data
  );
}