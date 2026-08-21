import { createCatalogRepository } from "../repositories/create-catalog.repository";

type CreateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
};

export async function createCatalogService(
  data: CreateCatalogData
) {
  return createCatalogRepository(data);
}
