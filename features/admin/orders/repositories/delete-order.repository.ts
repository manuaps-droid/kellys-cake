import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Elimina un pedido y sus items para poder limpiar la base de
 * datos. resenas y pago_webhooks referencian pedidos con
 * ON DELETE SET NULL, por lo que la base los desvincula sola.
 */
export async function deleteOrderRepository(
  id: string
) {
  const supabase = createAdminClient();

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .delete()
    .eq("pedido_id", id);

  if (itemsError) {
    throw itemsError;
  }

  const { error } = await supabase
    .from("pedidos")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
