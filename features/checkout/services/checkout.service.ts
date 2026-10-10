import { getCurrentClient } from "@/features/auth/services/auth.server";
import { getCartItems } from "@/features/cart/services/cart.service";
import { getItemUnitPrice } from "@/features/cart/types/cart.types";

/**
 * Verifica contra la pasarela real que un pago exista y cubra el
 * total esperado. Nunca se confía en los flags que envía el cliente.
 *
 * - culqi: consulta GET /v2/charges/{id} y exige que el monto coincida
 *   y que el cargo esté pagado/capturado.
 * - mercadopago: consulta GET /v1/payments/{id} y exige estado
 *   "approved" con monto coincidente.
 * - Cualquier otro método (efectivo/transferencia) => no pagado.
 */
export async function verifyPayment(
  method: string | undefined,
  reference: string | undefined,
  expectedTotal: number
): Promise<boolean> {
  if (!method || !reference) return false;

  try {
    if (method === "culqi") {
      const key = process.env.CULQI_SECRET_KEY;
      if (!key) return false;

      const res = await fetch(
        `https://api.culqi.com/v2/charges/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        }
      );
      if (!res.ok) return false;

      const charge = (await res.json()) as {
        amount?: number;
        paid?: boolean;
        state?: string;
      };
      const amountOk = Math.round(expectedTotal * 100) === Number(charge.amount);
      const captured = charge.paid === true || charge.state === "captured";
      return amountOk && captured;
    }

    if (method === "mercadopago") {
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return false;

      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${encodeURIComponent(reference)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      if (!res.ok) return false;

      const payment = (await res.json()) as {
        status?: string;
        transaction_amount?: number;
      };
      const amountOk =
        Math.abs(Number(payment.transaction_amount) - expectedTotal) < 0.01;
      return amountOk && payment.status === "approved";
    }
  } catch (error) {
    console.error("verifyPayment error:", error);
  }

  return false;
}

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
