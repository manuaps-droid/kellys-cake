"use server";

import { updateProjectStatusService } from "../services/update-project-status.service";

import type { AdminProjectStatus } from "../types/project.type";

export async function updateProjectStatusAction(
  id: string,
  status: AdminProjectStatus
) {
  try {
    await updateProjectStatusService(id, status);

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado.",
    };
  }
}
