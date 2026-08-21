import { updateProjectStatusRepository } from "../repositories/update-project-status.repository";

import type { AdminProjectStatus } from "../types/project.type";

export async function updateProjectStatusService(
  id: string,
  status: AdminProjectStatus
) {
  return updateProjectStatusRepository(id, status);
}
