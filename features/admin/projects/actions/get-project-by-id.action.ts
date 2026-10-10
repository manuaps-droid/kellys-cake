"use server";

import { getProjectByIdService } from "../services/get-project-by-id.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getProjectByIdAction(id: string) {
  if (!(await checkIsAdmin())) {
    return { success: false, project: null, message: "No autorizado." };
  }

  try {
    const project = await getProjectByIdService(id);

    return {
      success: true,
      project,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      project: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el proyecto.",
    };
  }
}
