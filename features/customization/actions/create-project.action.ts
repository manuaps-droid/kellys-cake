"use server";

import { after } from "next/server";

import { createProjectService } from "../services/create-project.service";
import { notificarAdminsPush } from "@/features/notifications/services/push.service";
import { ProjectData } from "../types/project.types";

export async function createProjectAction(
  data: ProjectData
) {
  try {
    console.log("📤 Datos recibidos:", data);

    const project =
      await createProjectService(data);

    console.log(
      "✅ Proyecto creado:",
      project
    );

    after(() =>
      notificarAdminsPush(
        "Nueva solicitud de diseño",
        "Un cliente pidió una cotización de pastel personalizado.",
        "/admin/proyectos"
      )
    );

    return {
      success: true,
      project,
    };
  } catch (error) {
    console.error(
      "❌ Error creando proyecto:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : JSON.stringify(error),
    };
  }
}