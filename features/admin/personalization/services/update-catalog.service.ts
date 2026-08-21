import { updateCatalogRepository } from "../repositories/update-catalog.repository";

type UpdateCatalogData = {
  tipo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
  mostrar_en_productos?: boolean;
  mostrar_en_categorias?: boolean;
  precio?: number | null;
};

export async function updateCatalogService(
  id: string,
  data: UpdateCatalogData
) {
  return updateCatalogRepository(id, data);
}
