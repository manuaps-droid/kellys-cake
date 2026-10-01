"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getMisReferidos } from "../services/referido.service";
import { Referido, ReferidoStats } from "../types/referido.types";

export async function getMisReferidosAction(): Promise<{
  success: boolean;
  data?: { referidos: Referido[]; stats: ReferidoStats };
  error?: string;
}> {
  try {
    const { cliente } = await getCurrentClient();

    const { referidos, stats } = await getMisReferidos(cliente.id);
    return { success: true, data: { referidos, stats } };
  } catch (error) {
    console.error("Error in getMisReferidosAction:", error);
    return { success: false, error: "Error al obtener referidos" };
  }
}
