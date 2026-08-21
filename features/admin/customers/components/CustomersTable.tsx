import Link from "next/link";

import { Button } from "@/components/ui/Button";

import DataTable from "@/components/datatable/DataTable";
import DataTableEmpty from "@/components/datatable/DataTableEmpty";
import DataTableHeader from "@/components/datatable/DataTableHeader";

import type { AdminCustomer } from "../types/customer.type";

type CustomersTableProps = {
  customers: AdminCustomer[];
};

export default function CustomersTable({
  customers,
}: CustomersTableProps) {
  return (
    <DataTable>
      <DataTableHeader>
        <tr>
          <th className="px-6 py-4 text-left">
            Cliente
          </th>

          <th className="px-6 py-4 text-left">
            Correo
          </th>

          <th className="px-6 py-4 text-left">
            Celular
          </th>

          <th className="px-6 py-4 text-left">
            Rol
          </th>

          <th className="px-6 py-4 text-left">
            Estado
          </th>

          <th className="px-6 py-4 text-left">
            Registro
          </th>

          <th className="px-6 py-4 text-right">
            Acciones
          </th>
        </tr>
      </DataTableHeader>

      <tbody>
        {customers.map((customer) => (
          <tr
            key={customer.id}
            className="border-b transition hover:bg-gray-50"
          >
            <td className="px-6 py-4">
              <div className="font-semibold">
                {customer.nombre}
              </div>

              <div className="text-sm text-gray-500">
                {customer.apellidos}
              </div>
            </td>

            <td className="px-6 py-4">
              {customer.correo ?? "-"}
            </td>

            <td className="px-6 py-4">
              {customer.celular ?? "-"}
            </td>

            <td className="px-6 py-4 capitalize">
              {customer.rol}
            </td>

            <td className="px-6 py-4">
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  customer.activo
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {customer.activo
                  ? "Activo"
                  : "Inactivo"}
              </span>
            </td>

            <td className="px-6 py-4">
              {new Date(
                customer.created_at
              ).toLocaleDateString()}
            </td>

            <td className="px-6 py-4 text-right">
              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link
                  href={`/admin/clientes/${customer.id}`}
                >
                  Ver detalle
                </Link>
              </Button>
            </td>
          </tr>
        ))}

        {customers.length === 0 && (
          <DataTableEmpty
            colSpan={7}
            title="No existen clientes"
            description="Todavía no hay clientes registrados."
          />
        )}
      </tbody>
    </DataTable>
  );
}