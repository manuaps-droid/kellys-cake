import Link from "next/link";
import { notFound } from "next/navigation";

import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/common/PageHeader";

import { getCustomerByIdAction } from "@/features/admin/customers/actions/get-customer-by-id.action";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const result = await getCustomerByIdAction(id);

  if (!result.success || !result.customer) {
    notFound();
  }

  const customer = result.customer;
  const fullName = `${customer.nombre} ${customer.apellidos ?? ""}`.trim();

  return (
    <section className="space-y-8">
      <PageHeader
        title={fullName}
        description="Detalle del cliente."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/clientes">Volver</Link>
          </Button>
        }
      />

      {/* Datos personales */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-kc-charcoal">Datos personales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium">{customer.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Apellidos</p>
            <p className="font-medium">{customer.apellidos ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Correo</p>
            <p className="font-medium">{customer.correo ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Celular</p>
            <p className="font-medium">{customer.celular ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rol</p>
            <p className="font-medium capitalize">{customer.rol}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm ${
                customer.activo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registrado</p>
            <p className="font-medium">
              {new Date(customer.created_at).toLocaleDateString("es-PE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Pedidos */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-kc-charcoal">
          Pedidos ({customer.pedidos?.length ?? 0})
        </h2>
        {(customer.pedidos?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">No tiene pedidos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 font-medium text-gray-500">Pedido</th>
                  <th className="py-3 font-medium text-gray-500">Total</th>
                  <th className="py-3 font-medium text-gray-500">Estado</th>
                  <th className="py-3 font-medium text-gray-500">Fecha</th>
                  <th className="py-3 text-right font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customer.pedidos?.map((pedido) => (
                  <tr key={pedido.id} className="border-b">
                    <td className="py-3 font-medium">#{pedido.id.slice(0, 8)}</td>
                    <td className="py-3">S/ {(pedido.total ?? 0).toFixed(2)}</td>
                    <td className="py-3 capitalize">{pedido.estado}</td>
                    <td className="py-3">
                      {new Date(pedido.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/pedidos/${pedido.id}`}
                        className="text-kc-rose-gold hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Proyectos personalizados */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-kc-charcoal">
          Proyectos personalizados ({customer.proyectos?.length ?? 0})
        </h2>
        {(customer.proyectos?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">No tiene proyectos personalizados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 font-medium text-gray-500">Proyecto</th>
                  <th className="py-3 font-medium text-gray-500">Personas</th>
                  <th className="py-3 font-medium text-gray-500">Presupuesto</th>
                  <th className="py-3 font-medium text-gray-500">Estado</th>
                  <th className="py-3 font-medium text-gray-500">Fecha</th>
                  <th className="py-3 text-right font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customer.proyectos?.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-3 font-medium">#{p.id.slice(0, 8)}</td>
                    <td className="py-3">{p.personas}</td>
                    <td className="py-3">
                      {p.presupuesto != null
                        ? `S/ ${p.presupuesto.toFixed(2)}`
                        : "Pendiente"}
                    </td>
                    <td className="py-3 capitalize">{p.estado}</td>
                    <td className="py-3">
                      {new Date(p.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/proyectos/${p.id}`}
                        className="text-kc-rose-gold hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}