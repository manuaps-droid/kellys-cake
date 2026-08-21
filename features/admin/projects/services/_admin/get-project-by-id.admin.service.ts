import { getProjectByIdAdminRepository } from "../../repositories/_admin/get-project-by-id.admin.repository";

export async function getProjectByIdAdminService(id: string) {
  return getProjectByIdAdminRepository(id);
}
