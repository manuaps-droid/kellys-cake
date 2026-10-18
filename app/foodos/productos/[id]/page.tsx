import { notFound } from "next/navigation";
import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FoodOSProductoDetallePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from("foodos_productos")
    .select("id, nombre, precio_venta, precio_costo, margen_porcentaje, activo")
    .eq("id", id)
    .single();

  if (!producto) {
    notFound();
  }

  const costo = Number(producto.precio_costo ?? 0);
  const venta = Number(producto.precio_venta ?? 0);
  const margen = Number(producto.margen_porcentaje ?? 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {producto.nombre}
          </h1>
          <p className="text-sm text-gray-500">
            Producto de FoodOS — gestión de costos y recetas
          </p>
        </div>
        <Link
          href={`/foodos/productos/${id}/receta`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          {costo > 0 ? "Editar Receta" : "+ Crear Receta"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
          <p className="text-xs font-bold uppercase text-gray-400">
            Precio de venta
          </p>
          <p className="mt-2 text-3xl font-black text-gray-900">
            S/ {venta.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
          <p className="text-xs font-bold uppercase text-gray-400">
            Costo por porción
          </p>
          <p className="mt-2 text-3xl font-black text-blue-700">
            {costo > 0 ? `S/ ${costo.toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 text-center">
          <p className="text-xs font-bold uppercase text-gray-400">
            Margen real
          </p>
          <p
            className={`mt-2 text-3xl font-black ${
              margen > 60
                ? "text-emerald-600"
                : margen > 40
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {costo > 0 ? `${margen.toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      {costo === 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Este producto aún no tiene receta asignada. Crea su receta para
          que FoodOS calcule el costo exacto y el margen real.
        </div>
      )}
    </div>
  );
}
