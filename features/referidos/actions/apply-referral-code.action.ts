"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { aplicarCodigoReferido } from "../services/referido.service";

export async function applyReferralCodeAction(
  codigo: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { cliente } = await getCurrentClient();

    return await aplicarCodigoReferido(codigo, cliente.id);
  } catch (error) {
    console.error("Error in applyReferralCodeAction:", error);
    return { success: false, message: "Error al aplicar código" };
  }
}
