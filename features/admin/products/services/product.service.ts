import {
  getProductsRepository,
} from "../repositories/get-products.repository";

import type { Product } from "../types/product.type";

export async function getProducts(
  filter?: "destacado" | "mas_vendido"
): Promise<Product[]> {
  return getProductsRepository(filter);
}