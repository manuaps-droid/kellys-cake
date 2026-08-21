import { createProductRepository } from "../repositories/create-product.repository";

import type { ProductSchema } from "../validations/product.schema";

export async function createProductService(
  data: ProductSchema
) {
  return createProductRepository(data);
}
