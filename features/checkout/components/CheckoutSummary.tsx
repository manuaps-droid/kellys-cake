import Image from "next/image";

import {
  getItemImagen,
  getItemNombre,
  getItemUnitPrice,
  type CartItem,
} from "@/features/cart/types/cart.types";

type CheckoutSummaryProps = {
  items?: CartItem[];
  subtotal?: number;
  envio?: number;
};

export default function CheckoutSummary({
  items = [],
  subtotal = 0,
  envio = 0,
}: CheckoutSummaryProps) {
  const total = subtotal + envio;

  return (
    <aside className="rounded-2xl bg-white p-8 shadow lg:sticky lg:top-28">
      <h2 className="text-2xl font-bold text-cake-espresso">
        Resumen del pedido
      </h2>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500">
          Tu carrito está vacío.
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-gray-100 pb-4"
              >
                <Image
                  src={
                    getItemImagen(item) ||
                    "/images/placeholder-product.jpg"
                  }
                  alt={getItemNombre(item)}
                  width={70}
                  height={70}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-cake-espresso">
                    {getItemNombre(item)}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Cantidad: {item.cantidad}
                  </p>

                  <p className="text-sm text-gray-500">
                    S/ {getItemUnitPrice(item).toFixed(2)} c/u
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-cake-espresso">
                    S/{" "}
                    {(getItemUnitPrice(item) * item.cantidad).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>S/ {envio.toFixed(2)}</span>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-bold">
              <span>Total</span>
              <span className="text-cake-gold">
                S/ {total.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}