"use server";

import { getCatalogByTypeService } from "../services/get-catalog-by-type.service";

export async function getCatalogByTypeAction(
  tipo: string
) {
  return await getCatalogByTypeService(tipo);
}