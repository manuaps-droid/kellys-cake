"use server";

import { getCatalogsService } from "../services/get-catalogs.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getCatalogosAction() {
  if (!(await checkIsAdmin())) {
    return [];
  }

  return await getCatalogsService();
}