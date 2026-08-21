import Image from "next/image";

import Card from "@/components/ui/Card";
import Price from "@/components/ui/Price";

import type { AdminOrderItem } from "../types/order.type";

type Props = {
  items: AdminOrderItem[];
};

export default function OrderItemsTable({
  items,
}: Props) {
  return (
    <Card className="p-8">
      <h2 className="mb-6 text-xl font-semibold text-[#0B1423]">
        Productos del pedido
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left">
                Producto
              </th>

              <th className="px-4 py-4 text-center">
                Cantidad
              </th>

              <th className="px-4 py-4 text-right">
                Precio
              </th>

              <th className="px-4 py-4 text-right">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b last:border-0"
              >
                <td className="px-4 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-gray-100">
                      <Image
                        src={
                          item.productos.imagen
                        }
                        alt={
                          item.productos.nombre
                        }
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-semibold text-[#0B1423]">
                        {item.productos.nombre}
                      </h3>

                      <p className="max-w-md text-sm text-gray-500">
                        {item.productos
                          .descripcion ??
                          "Sin descripción"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-5 text-center font-medium">
                  {item.cantidad}
                </td>

                <td className="px-4 py-5 text-right">
                  <Price
                    value={item.precio}
                  />
                </td>

                <td className="px-4 py-5 text-right font-semibold">
                  <Price
                    value={
                      item.precio *
                      item.cantidad
                    }
                  />
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Este pedido no tiene productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}