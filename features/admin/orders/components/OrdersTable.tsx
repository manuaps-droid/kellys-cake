import Link from "next/link";

import Price from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";

import DataTable from "@/components/datatable/DataTable";
import DataTableEmpty from "@/components/datatable/DataTableEmpty";
import DataTableHeader from "@/components/datatable/DataTableHeader";

import OrderStatusSelect from "./OrderStatusSelect";
import DeleteOrderButton from "./DeleteOrderButton";

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
              <div className="text-sm font-medium text-gray-700">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
              {order.fecha_entrega ? (
                <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-kc-rose-gold">
                  <span>📅 {order.fecha_entrega.slice(0, 10)}</span>
                  {order.hora_entrega && <span>· ⏰ {order.hora_entrega.slice(0, 5)}</span>}
                </div>
              ) : (
                <div className="mt-1 text-[11px] text-gray-400">
                  Sin fecha asignada
                </div>
              )}
            </td>

            <td className="px-6 py-4">
              <OrderStatusSelect
                orderId={order.id}
                value={order.estado}
              />
              <div className="mt-1.5">
                {order.estado_pago === "pagado" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    ✓ Pagado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    ⏳ Pago Pendiente
                  </span>
                )}
              </div>
            </td>

            <td className="px-6 py-4 text-right">
              <Price value={order.total} />
            </td>

            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
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

                <DeleteOrderButton
                  orderId={order.id}
                  orderNumber={order.numero}
                />
              </div>
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