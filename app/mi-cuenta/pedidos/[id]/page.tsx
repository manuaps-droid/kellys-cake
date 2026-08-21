import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import PageHeader from "@/components/common/PageHeader";
import Card from "@/components/common/Card";
import Price from "@/components/ui/Price";
import StatusBadge from "@/components/common/StatusBadge";

import { getOrderById } from "@/features/orders/services/order.service";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-cake-ivory px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <PageHeader
            title={`Pedido #${order.id.slice(0, 8)}`}
            description="Detalle completo de tu pedido."
          />

          <Card>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">
                  Estado
                </p>

                <div className="mt-2">
                  <StatusBadge status={order.estado} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Fecha
                </p>

                <p className="mt-2 font-semibold">
                  {new Date(order.created_at).toLocaleDateString("es-PE")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <Price
                  value={order.total}
                  className="mt-2 text-2xl"
                />
              </div>
            </div>
          </Card>

          <Card className="mt-8">
            <h2 className="text-2xl font-bold text-cake-espresso">
              Productos
            </h2>

            <div className="mt-8 space-y-6">
              {order.pedido_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {item.productos.nombre}
                    </h3>

                    <p className="text-gray-500">
                      Cantidad: {item.cantidad}
                    </p>

                    <p className="text-gray-500">
                      Precio unitario:
                      {" "}
                      <Price value={item.precio} />
                    </p>
                  </div>

                  <Price
                    value={item.precio * item.cantidad}
                  />
                </div>
              ))}
            </div>

            <div className="mt-10 border-t pt-6 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>

                <Price value={order.subtotal} />
              </div>

              <div className="flex justify-between">
                <span>Envío</span>

                <Price value={order.envio} />
              </div>

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>

                <Price
                  value={order.total}
                  className="text-xl"
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}