import Link from "next/link";

import Navbar from "@/components/layout/Navbar";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import Card from "@/components/common/Card";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/common/StatusBadge";

import { getOrders } from "@/features/orders/services/order.service";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cake-ivory px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <PageHeader
            title="Mis pedidos"
            description="Consulta el estado y el historial de tus pedidos."
          />

          {orders.length === 0 ? (
            <EmptyState
              title="Aún no tienes pedidos."
              description="Cuando realices tu primera compra, aparecerá aquí."
              actionLabel="Ver productos"
              actionHref="/productos"
            />
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id}>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-cake-espresso">
                        Pedido #{order.id.slice(0, 8)}
                      </h2>

                      <p className="mt-2 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("es-PE")}
                      </p>
                    </div>

                    <StatusBadge status={order.estado} />

                    <Price
                      value={order.total}
                      className="text-2xl"
                    />

                    <Link
                      href={`/mi-cuenta/pedidos/${order.id}`}
                      className="rounded-xl bg-cake-espresso px-5 py-3 text-center font-semibold text-white transition hover:bg-cake-chocolate"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}