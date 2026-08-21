import { deleteCatalogRepository } from "../repositories/delete-catalog.repository";

export async function deleteCatalogService(
  id: string
) {
  return deleteCatalogRepository(id);
}