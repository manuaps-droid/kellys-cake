"use server";

import { getCurrentClient } from "@/features/auth/services/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { awardPointsForPurchase } from "@/features/rewards/services/award-points.service";

/**
 * Acumula puntos Kelly's Rewards después de una compra verificada y pagada.
 * Blindado contra asignación fraudulenta de puntos.
 */
export async function awardPointsPostPurchaseAction(pedidoId: string) {
  try {
    const { cliente } = await getCurrentClient();

    if (!pedidoId) {
      return { success: false, message: "ID de pedido inválido." };
    }

    const supabase = createAdminClient();

    // 1. Obtener y verificar el pedido real en base de datos
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select("id, cliente_id, total, estado_pago")
      .eq("id", pedidoId)
      .maybeSingle();

    if (pedidoError || !pedido) {
      return { success: false, message: "Pedido no encontrado." };
    }

    // 2. Verificar pertenencia y estado pagado
    if (pedido.cliente_id !== cliente.id) {
      return { success: false, message: "No autorizado para este pedido." };
    }

    if (pedido.estado_pago !== "pagado") {
      return { success: false, message: "El pedido aún no figura como pagado." };
    }

    // 3. Verificar que no se hayan otorgado puntos previamente por este pedido (Anti-Doble Reclamo)
    const { data: historialPrevio } = await supabase
      .from("rewards_transacciones")
      .select("id")
      .eq("referencia_id", pedido.id)
      .eq("referencia_tipo", "pedido")
      .maybeSingle();

    if (historialPrevio) {
      return { success: true, message: "Los puntos ya fueron otorgados anteriormente." };
    }

    // 4. Calcular puntos usando el total REAL registrado en la base de datos
    const result = await awardPointsForPurchase(
      cliente.id,
      Number(pedido.total) || 0,
      pedido.id
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error al acumular puntos post-compra:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron acumular los puntos.",
    };
  }
}
