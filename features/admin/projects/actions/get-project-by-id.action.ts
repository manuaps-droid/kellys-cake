"use server";

import { getProjectByIdService } from "../services/get-project-by-id.service";

export async function getProjectByIdAction(id: string) {
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
