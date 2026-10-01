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
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3.5 text-xs text-amber-900 transition hover:bg-amber-50">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <span>✨</span> ¿Falta el Topper de tu festejo?
              </span>
              <span className="text-[11px] text-amber-700 font-bold">+ S/ 15.00</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800/80 leading-relaxed">
              Personalízalo con el nombre del festejado en segundos.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                router.push("/personalizar/topper");
              }}
              className="mt-2.5 inline-flex w-full items-center justify-center rounded-lg bg-amber-700/10 py-1.5 font-medium text-amber-900 transition hover:bg-amber-700 hover:text-white"
            >
              Diseñar mi topper ahora →
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