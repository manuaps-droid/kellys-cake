"use server";

import { deleteProjectService } from "../services/delete-project.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function deleteProjectAction(
  id: string
) {
  if (!(await checkIsAdmin())) {
    return { success: false, message: "No autorizado." };
  }

  try {
    await deleteProjectService(id);

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el proyecto.",
    };
  }
}
