"use server";

import { getProjectsService } from "../services/get-projects.service";

export async function getProjectsAction() {
  try {
    const projects =
      await getProjectsService();

    return {
      success: true,
      projects,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      projects: [],
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los proyectos.",
    };
  }
}