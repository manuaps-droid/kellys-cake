import Navbar from "@/components/layout/Navbar";

import CartItemCard from "@/features/cart/components/CartItemCard";
import CartSummary from "@/features/cart/components/CartSummary";
import VaciarCarritoButton from "@/features/cart/components/VaciarCarritoButton";

import { getCartItems } from "@/features/cart/services/cart.service";

export default async function CarritoPage() {
  const items = await getCartItems();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cake-ivory pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-cake-espresso">
              Mi carrito
            </h1>

            <VaciarCarritoButton disabled={items.length === 0} />
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-white p-16 text-center shadow">
              <h2 className="text-2xl font-semibold">
                Tu carrito está vacío
              </h2>

              <p className="mt-3 text-gray-500">
                Agrega productos para comenzar tu pedido.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-10 lg:grid-cols-[2fr_380px]">
                <div className="space-y-5">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>

                <CartSummary
                  items={items}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}