import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Elimina un cliente y todo lo asociado a él para poder limpiar la
 * base de datos. Orden de borrado:
 *   1) carrito_items y carrito
 *   2) pedido_items y pedidos
 *   3) la fila en clientes (proyectos, rewards, reseñas y demás
 *      tablas con ON DELETE CASCADE se limpian solas)
 *   4) la cuenta de acceso en auth.users
 */
export async function deleteCustomerRepository(
  id: string
): Promise<{ authUserDeleted: boolean }> {
  const supabase = createAdminClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  const { data: carritos } = await supabase
    .from("carrito")
    .select("id")
    .eq("cliente_id", id);

  const carritoIds = (carritos ?? []).map((c) => c.id as string);

  if (carritoIds.length > 0) {
    const { error } = await supabase
      .from("carrito_items")
      .delete()
      .in("carrito_id", carritoIds);

    if (error) throw error;
  }

  const { error: carritoError } = await supabase
    .from("carrito")
    .delete()
    .eq("cliente_id", id);

  if (carritoError) throw carritoError;

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id")
    .eq("cliente_id", id);

  const pedidoIds = (pedidos ?? []).map((p) => p.id as string);

  if (pedidoIds.length > 0) {
    const { error } = await supabase
      .from("pedido_items")
      .delete()
      .in("pedido_id", pedidoIds);

    if (error) throw error;
  }

  const { error: pedidosError } = await supabase
    .from("pedidos")
    .delete()
    .eq("cliente_id", id);

  if (pedidosError) throw pedidosError;

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id", id);

  if (error) throw error;

  const user_id = cliente?.user_id as string | null;

  if (!user_id) {
    return { authUserDeleted: false };
  }

  try {
    await supabase.auth.admin.deleteUser(user_id);
    return { authUserDeleted: true };
  } catch {
    return { authUserDeleted: false };
  }
}