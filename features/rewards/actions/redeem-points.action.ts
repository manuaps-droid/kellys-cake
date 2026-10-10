"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function redeemPointsAction(
  cantidad: number,
  motivo: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { cliente } = await getCurrentClient();

    // Validar cantidad: entero positivo y dentro de un rango razonable
    const cantidadNumerica = Math.floor(Number(cantidad));
    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica <= 0 ||
      cantidadNumerica > 10000
    ) {
      return { success: false, message: "Cantidad de puntos inválida." };
    }

    const motivoLimpio =
      typeof motivo === "string" ? motivo.trim().slice(0, 200) : "";

    const supabase = createAdminClient();
    const { error } = await supabase.rpc('redeem_points', {
      p_cliente_id: cliente.id,
      p_cantidad: cantidadNumerica,
      p_motivo: motivoLimpio
    });

    if (error) {
      console.error("Error in redeem_points rpc:", error);
      return { success: false, message: error.message || "Error al canjear puntos" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in redeemPointsAction:", error);
    return { success: false, message: "Excepción al canjear puntos" };
  }
}
