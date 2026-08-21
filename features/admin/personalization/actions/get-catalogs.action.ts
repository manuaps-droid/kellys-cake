"use server";

import { getCatalogsService } from "../services/get-catalogs.service";

export async function getCatalogosAction() {
  return await getCatalogsService();
}