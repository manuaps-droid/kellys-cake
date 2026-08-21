import { createClient } from "@/lib/supabase/server";

import type { OrderStatus } from "@/features/orders/constants/order-status";

export async function updateOrderStatusRepository(
  id: string,
  status: OrderStatus
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pedidos")
    .update({
      estado: status,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}