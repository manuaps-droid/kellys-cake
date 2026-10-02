import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getCartItems } from "@/features/cart/services/cart.service";
import { getItemUnitPrice } from "@/features/cart/types/cart.types";

export async function createOrderService(deliveryFee: number = 0) {
  const { supabase, cliente } = await getCurrentClient();

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
