import Link from "next/link";

import Price from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";

import DataTable from "@/components/datatable/DataTable";
import DataTableEmpty from "@/components/datatable/DataTableEmpty";
import DataTableHeader from "@/components/datatable/DataTableHeader";

import OrderStatusSelect from "./OrderStatusSelect";

import type { AdminOrder } from "../types/order.type";

type OrdersTableProps = {
  orders: AdminOrder[];
};

export default function OrdersTable({
  orders,
}: OrdersTableProps) {
  return (
    <DataTable>
      <DataTableHeader>
        <tr>
          <th className="px-6 py-4 text-left">
            Pedido
          </th>

          <th className="px-6 py-4 text-left">
            Cliente
          </th>

          <th className="px-6 py-4 text-left">
            Fecha
          </th>

          <th className="px-6 py-4 text-left">
            Estado
          </th>

          <th className="px-6 py-4 text-right">
            Total
          </th>

          <th className="px-6 py-4 text-right">
            Acciones
          </th>
        </tr>
      </DataTableHeader>

      <tbody>
        {orders.map((order) => (
          <tr
            key={order.id}
            className="border-b transition hover:bg-gray-50"
          >
            <td className="px-6 py-4 font-mono text-sm">
              #
              {order.numero ??
                order.id.slice(0, 8)}
            </td>

            <td className="px-6 py-4">
              <div className="font-semibold">
                {order.cliente?.nombre ?? "-"}
              </div>

              <div className="text-xs text-gray-500">
                {order.pedido_items.length} producto(s)
              </div>
            </td>

            <td className="px-6 py-4">
              {new Date(
                order.created_at
              ).toLocaleDateString()}
            </td>

            <td className="px-6 py-4">
              <OrderStatusSelect
                orderId={order.id}
                value={order.estado}
              />
            </td>

            <td className="px-6 py-4 text-right">
              <Price value={order.total} />
            </td>

            <td className="px-6 py-4 text-right">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link
                  href={`/admin/pedidos/${order.id}`}
                >
                  Ver detalle
                </Link>
              </Button>
            </td>
          </tr>
        ))}

        {orders.length === 0 && (
          <DataTableEmpty
            colSpan={6}
            title="No existen pedidos"
            description="Todavía no se han realizado pedidos."
          />
        )}
      </tbody>
    </DataTable>
  );
}