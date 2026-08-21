import Link from "next/link";

import type { AdminCatalog } from "../types/catalog.type";

type Props = {
  catalogs: AdminCatalog[];
};

export default function CatalogsTable({
  catalogs,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Tipo
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Nombre
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold">
              Descripción
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold">
              Orden
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold">
              Estado
            </th>

            <th className="px-6 py-4 text-right text-sm font-semibold">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {catalogs.map((catalog) => (
            <tr
              key={catalog.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="px-6 py-4">
                <span className="rounded-full bg-[#FFF5E8] px-3 py-1 text-xs font-semibold text-[#D8B07A]">
                  {catalog.tipo}
                </span>
              </td>

              <td className="px-6 py-4 font-medium">
                {catalog.nombre}
              </td>

              <td className="px-6 py-4 text-gray-500">
                {catalog.descripcion ??
                  "-"}
              </td>

              <td className="px-6 py-4 text-center">
                {catalog.orden}
              </td>

              <td className="px-6 py-4 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    catalog.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {catalog.activo
                    ? "Activo"
                    : "Inactivo"}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/catalogos/${catalog.id}`}
                    className="rounded-lg border border-kc-rose-gold px-4 py-2 text-sm transition hover:bg-kc-cream"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/admin/catalogos/${catalog.id}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100"
                  >
                    Editar
                  </Link>
                </div>
              </td>
            </tr>
          ))}

          {catalogs.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-10 text-center text-gray-500"
              >
                No existen registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}