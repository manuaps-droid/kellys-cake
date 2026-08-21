import { deleteProductRepository } from "../repositories/delete-product.repository";

export async function deleteProductService(
  id: string
) {
  return deleteProductRepository(id);
}