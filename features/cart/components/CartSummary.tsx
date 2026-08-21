"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  getItemUnitPrice,
  type CartItem,
} from "../types/cart.types";

type Props = {
  items?: CartItem[];
  onClose?: () => void;
};

export default function CartSummary({
  items = [],
  onClose,
}: Props) {
  const router = useRouter();

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + getItemUnitPrice(item) * item.cantidad,
      0
    );
  }, [items]);

  function handleCheckout() {
    onClose?.();
    router.push("/checkout");
  }

  return (
    <aside className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">
        Resumen del pedido
      </h2>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-sm text-gray-500">
            Se calcula en checkout
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-xl font-bold">
          <span>Subtotal</span>
          <span className="text-cake-gold">
            S/ {subtotal.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          className="mt-6 w-full rounded-xl bg-cake-espresso py-4 font-semibold text-white transition hover:bg-cake-chocolate"
        >
          Continuar con el pedido
        </button>
      </div>
    </aside>
  );
}