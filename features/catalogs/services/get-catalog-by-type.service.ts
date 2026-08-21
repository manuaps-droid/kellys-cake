import { getCatalogByTypeRepository } from "../repositories/get-catalog-by-type.repository";

import type { CatalogItem } from "../types/catalog.type";

export async function getCatalogByTypeService(
  tipo: string
): Promise<CatalogItem[]> {
  return await getCatalogByTypeRepository(tipo);
}