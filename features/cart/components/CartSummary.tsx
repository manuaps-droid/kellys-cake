"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  getItemUnitPrice,
  getItemNombre,
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

        {/* Cross-selling topper si el cliente aún no tiene uno en el carrito */}
        {!items.some((it) => getItemNombre(it).toLowerCase().includes("topper")) && (
          <div className="max-h-12 flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-3 py-2 transition hover:bg-amber-50">
            <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-amber-900">
              <span aria-hidden>✨</span>
              <span className="truncate">¿Falta el topper?</span>
              <span className="shrink-0 font-bold text-amber-700">+ S/ 15.00</span>
            </p>

            <button
              type="button"
              onClick={() => {
                onClose?.();
                router.push("/personalizar/topper");
              }}
              className="shrink-0 rounded-lg bg-amber-700/10 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap text-amber-900 transition hover:bg-amber-700 hover:text-white"
            >
              Diseñar topper →
            </button>
          </div>
        )}

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