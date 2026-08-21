import Link from "next/link";
import { notFound } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";

import { getOrderByIdAction } from "@/features/admin/orders/actions/get-order-by-id.action";

import OrderCustomerCard from "@/features/admin/orders/components/OrderCustomerCard";
import OrderInfoCard from "@/features/admin/orders/components/OrderInfoCard";
import OrderItemsTable from "@/features/admin/orders/components/OrderItemsTable";
import OrderSummaryCard from "@/features/admin/orders/components/OrderSummaryCard";
import OrderDeliveryCard from "@/features/admin/orders/components/OrderDeliveryCard";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const result =
    await getOrderByIdAction(id);

  if (!result.success || !result.order) {
    notFound();
  }

  const order = result.order;

  return (
    <section className="space-y-8">
      <PageHeader
        title={`Pedido #${order.numero ?? order.id.slice(0, 8)}`}
        description={`${order.cliente?.nombre ?? "Cliente"} · ${new Date(order.created_at).toLocaleDateString()}`}
        actions={
          <Link
            href="/admin/pedidos"
            className="rounded-xl border border-gray-300 px-5 py-3 font-medium transition hover:bg-gray-100"
          >
            Volver
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <OrderInfoCard
          id={order.id}
          createdAt={order.created_at}
          status={order.estado}
          observaciones={order.observaciones}
          metodoPago={order.metodo_pago}
          tipoPago={order.tipo_pago}
          montoPagado={order.monto_pagado}
        />

        <OrderCustomerCard
          nombre={order.cliente?.nombre ?? "-"}
          correo={order.cliente?.correo}
          celular={order.cliente?.celular}
          direccion={order.direccion}
        />

        <OrderDeliveryCard
          orderId={order.id}
          fechaEntrega={order.fecha_entrega}
          horaEntrega={order.hora_entrega}
          tipoEntrega={order.tipo_entrega}
        />

        <OrderSummaryCard
          subtotal={order.subtotal}
          envio={order.envio}
          total={order.total}
        />
      </div>

      <OrderItemsTable
        items={order.pedido_items}
      />
    </section>
  );
}