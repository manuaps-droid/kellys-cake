import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SimuladorRentabilidad } from "@/features/rentabilidad/components/SimuladorRentabilidad";
import { ProductoPreset } from "@/features/rentabilidad/types/rentabilidad.types";

export const metadata = {
  title: "Costeo Real por Producto | FoodOS",
  description:
    "Costeo directo conectado a tus recetas: ingredientes + costos directos + overhead = costo real objetivo.",
};

export default async function RentabilidadPage() {
  const supabase = createAdminClient();

  const { data: productos } = await supabase
    .from("foodos_productos")
    .select("id, nombre, precio_venta, precio_costo, margen_porcentaje")
    .order("nombre", { ascending: true });

  const productosExistentes: ProductoPreset[] = (productos ?? []).map(p => ({
    id: p.id as string,
    nombre: (p.nombre as string) ?? "",
    precio_costo: Number(p.precio_costo) || undefined,
    precio_venta: Number(p.precio_venta) || undefined,
    margen_porcentaje: Number(p.margen_porcentaje) || undefined,
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-500 font-medium">
            Cargando motor de costeo…
          </div>
        }
      >
        <SimuladorRentabilidad productosExistentes={productosExistentes} />
      </Suspense>
    </div>
  );
}
