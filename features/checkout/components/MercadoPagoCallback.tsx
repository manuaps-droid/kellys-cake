"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useCart } from "@/features/cart/hooks/useCart";
import { useCheckout } from "@/features/checkout/hooks/useCheckout";
import { createOrder } from "@/features/checkout/actions/create-order.action";

export default function MercadoPagoCallback() {
  const searchParams = useSearchParams();
  const ranRef = useRef(false);
  const [state, setState] = useState<"loading" | "ok" | "error" | "ignored">("loading");
  const [message, setMessage] = useState("");

  const { subtotal: cartSubtotal } = useCart();
  const { checkout, reset } = useCheckout();

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const status = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");

    if (status !== "approved" || !paymentId) {
      setState("ignored");
      setMessage(
        status === "pending"
          ? "Tu pago está pendiente de aprobación. Te avisaremos cuando se confirme."
          : "El pago no se pudo completar."
      );
      return;
    }

    const isPickup = checkout.deliveryMethod === "pickup";
    const deliveryFee = isPickup ? 0 : (checkout.address.deliveryFee ?? 0);
    const total = cartSubtotal + deliveryFee;
    const tipoPago = checkout.paymentType === "abono" ? "abono" : "total";
    const montoPagado = tipoPago === "abono" ? Math.round(total * 0.5 * 100) / 100 : total;

    async function confirm() {
      try {
        const result = await createOrder({
          paymentMethod: "mercadopago",
          paymentReference: paymentId ?? undefined,
          deliveryFee,
          tipoPago,
          montoPagado,
        });

        if (!result.success) {
          setState("error");
          setMessage(result.message || "No se pudo registrar el pedido.");
          return;
        }

        reset();
        setState("ok");
      } catch {
        setState("error");
        setMessage("Error al registrar el pedido.");
      }
    }

    void confirm();
  }, [searchParams, cartSubtotal, checkout, reset]);

  if (state === "loading") {
    return (
      <p className="mt-6 text-sm text-gray-500">
        Confirmando tu pago de Mercado Pago...
      </p>
    );
  }

  if (state === "ok") {
    return (
      <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
        Tu pago fue aprobado. Hemos registrado tu pedido correctamente.
      </p>
    );
  }

  return (
    <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
      {message}
    </p>
  );
}
