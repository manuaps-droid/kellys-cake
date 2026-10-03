import { updateOrderStatusRepository } from "../repositories/update-order-status.repository";

import { createClient } from "@/lib/supabase/server";
import { archivarSolicitudOrigen } from "@/features/checkout/services/order-source.service";

import type { OrderStatus } from "@/features/orders/constants/order-status";

export async function updateOrderStatusService(
  id: string,
  status: OrderStatus
) {
  await updateOrderStatusRepository(id, status);

  // Al confirmar el pedido (pago verificado), se archiva la solicitud
  // origen (catering/proyecto) para evitar duplicados en sus áreas.
  if (status === "confirmado") {
    const supabase = await createClient();

    // Sincronizar estado_pago a 'pagado' para que se agende en producción
    await supabase
      .from("pedidos")
      .update({ estado_pago: "pagado" })
      .eq("id", id)
      .eq("estado_pago", "pendiente");

    const { data: pedido } = await supabase
      .from("pedidos")
      .select("cotizacion_id")
      .eq("id", id)
      .maybeSingle();

    if (pedido?.cotizacion_id) {
      await archivarSolicitudOrigen(pedido.cotizacion_id);
    }
  }
}