"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function redeemPointsAction(
  cantidad: number,
  motivo: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const { cliente } = await getCurrentClient();

    const supabase = createAdminClient();
    const { error } = await supabase.rpc('redeem_points', {
      p_cliente_id: cliente.id,
      p_cantidad: cantidad,
      p_motivo: motivo
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
