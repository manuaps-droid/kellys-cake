"use server";

import { updateProjectStatusService } from "../services/update-project-status.service";

import type { AdminProjectStatus } from "../types/project.type";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function updateProjectStatusAction(
  id: string,
  status: AdminProjectStatus
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

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
