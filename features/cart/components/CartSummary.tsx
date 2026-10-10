"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

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

  const faltaTopper = !items.some((it) =>
    getItemNombre(it).toLowerCase().includes("topper")
  );

  function handleCheckout() {
    onClose?.();
    router.push("/checkout");
  }

  return (
    <aside className="rounded-2xl bg-white p-5 shadow">
      {/* Resumen (~1/4 del carrito) */}
      <h2 className="text-lg font-bold">Resumen del pedido</h2>

      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>S/ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-xs text-gray-500">
            Se calcula en checkout
          </span>
        </div>

        <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-cake-gold">
            S/ {subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Sugerencia topper (~1/4 del carrito) con botón destacado */}
      {faltaTopper && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
              <span aria-hidden>🧁</span>
              ¿Le falta el topper a tu festejo?
            </p>
            <span className="text-xs font-bold text-rose-600">
              + S/ 15.00
            </span>
          </div>

          <p className="mt-1 text-[11px] leading-snug text-rose-800/80">
            Personalízalo con el nombre del festejado.
          </p>

          <button
            type="button"
            onClick={() => {
              onClose?.();
              router.push("/personalizar/topper");
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/40 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            ¡Diseña tu topper ahora!
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        className="mt-4 w-full rounded-xl bg-cake-espresso py-3.5 text-sm font-semibold text-white transition hover:bg-cake-chocolate"
      >
        Continuar con el pedido
      </button>
    </aside>
  );
}