"use server";

import { deleteProjectService } from "../services/delete-project.service";

export async function deleteProjectAction(
  id: string
) {
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
