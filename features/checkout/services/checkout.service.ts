import { createClient } from "@/lib/supabase/server";
import { getCartItems } from "@/features/cart/services/cart.service";
import { getItemUnitPrice } from "@/features/cart/types/cart.types";

export async function createOrderService(deliveryFee: number = 0) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Debe iniciar sesión.");
  }

  const { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (clienteError || !cliente) {
    throw new Error("Cliente no encontrado.");
  }

  const items = await getCartItems();

  if (items.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  const subtotal = items.reduce((total, item) => {
    return total + getItemUnitPrice(item) * item.cantidad;
  }, 0);

  const envio = deliveryFee;

  const total = subtotal + envio;

  return {
    supabase,
    clienteId: cliente.id,
    items,
    subtotal,
    envio,
    total,
  };
}
