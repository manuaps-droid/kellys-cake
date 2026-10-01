"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { generarCodigoReferido } from "../services/referido.service";

export async function generateCodeAction(): Promise<{
  success: boolean;
  data?: { codigo: string };
  error?: string;
}> {
  try {
    const { cliente } = await getCurrentClient();

    const result = await generarCodigoReferido(cliente.id);
    if (!result.success) {
      return { success: false, error: result.message || "Error al generar código" };
    }
    return { success: true, data: { codigo: result.codigo! } };
  } catch (error) {
    console.error("Error in generateCodeAction:", error);
    return { success: false, error: "Error al generar código" };
  }
}
