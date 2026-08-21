import { getCatalogByIdRepository } from "../repositories/get-catalog-by-id.repository";

export async function getCatalogByIdService(
  id: string
) {
  return getCatalogByIdRepository(id);
}