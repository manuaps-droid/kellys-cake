import { getProjectsAdminRepository } from "../../repositories/_admin/get-projects.admin.repository";

export async function getProjectsAdminService(estado?: string) {
  return getProjectsAdminRepository(estado);
}
