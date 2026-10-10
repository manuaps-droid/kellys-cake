"use server";

import { uploadMediaService } from "../services/media.service";
import { checkIsAdmin } from "@/lib/auth/isAdmin";

export async function uploadMediaAction(
  formData: FormData
) {
  try {
    if (!(await checkIsAdmin())) {
      return {
        success: false,
        message: "No autorizado.",
      };
    }

    const file = formData.get(
      "file"
    ) as File | null;

    if (!file) {
      return {
        success: false,
        message:
          "No se recibió ningún archivo.",
      };
    }

    const media =
      await uploadMediaService(file);

    return {
      success: true,
      media,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error subiendo archivo.",
    };
  }
}