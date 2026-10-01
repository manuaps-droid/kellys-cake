"use server";

import { getAllCatalogsService } from "../services/get-all-catalogs.service";

export async function getAllCatalogsAction() {
  return await getAllCatalogsService();
}
