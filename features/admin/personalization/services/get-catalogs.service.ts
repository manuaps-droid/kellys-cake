import { getCatalogsRepository } from "../repositories/get-catalogs.repository";

export async function getCatalogsService() {
  return await getCatalogsRepository();
}