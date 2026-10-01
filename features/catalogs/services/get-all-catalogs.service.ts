import { getAllCatalogsRepository } from "../repositories/get-all-catalogs.repository";

import type { CatalogItem } from "../types/catalog.type";

export async function getAllCatalogsService(): Promise<CatalogItem[]> {
  return await getAllCatalogsRepository();
}
