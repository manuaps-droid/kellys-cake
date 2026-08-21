import { createBulkCatalogRepository } from "../repositories/create-bulk-catalog.repository";

type CatalogItemData = {
  nombre: string;
  descripcion?: string;
};

type CreateBulkCatalogData = {
  tipo: string;
  activo: boolean;
  items: CatalogItemData[];
};

export async function createBulkCatalogService(
  data: CreateBulkCatalogData
) {
  return createBulkCatalogRepository(data);
}
