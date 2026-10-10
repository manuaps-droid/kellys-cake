"use server";

import { getProjectsService } from "../services/get-projects.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function getProjectsAction() {
  if (!(await checkIsAdmin())) {
    return { success: false, projects: [], message: "No autorizado." };
  }

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