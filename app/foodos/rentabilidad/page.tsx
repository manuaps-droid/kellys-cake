import { Suspense } from "react";
import { getProductos } from "@/features/productos/queries/get-productos";
import { SimuladorRentabilidad } from "@/features/rentabilidad/components/SimuladorRentabilidad";
import { ProductoPreset } from "@/features/rentabilidad/types/rentabilidad.types";

export const metadata = {
  title: "Simulador de Rentabilidad & Diagnóstico Financiero | FoodOS",
  description: "Auditoría de márgenes comerciales, punto de equilibrio, Food Cost, Labor Cost, ROS, ROE y ROI para Kelly's Cake.",
};

export default async function RentabilidadPage() {
  const rawProductos = await getProductos();

  const productosExistentes: ProductoPreset[] = (rawProductos || []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio_costo: p.precio_costo ?? undefined,
    precio_venta: p.precio_venta ?? undefined,
    margen_porcentaje: p.margen_porcentaje ?? undefined,
  }));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Suspense
        fallback={
          <div className="p-12 text-center text-slate-500 font-medium">
            Cargando motor de simulación financiera FoodOS...
          </div>
        }
      >
        <SimuladorRentabilidad productosExistentes={productosExistentes} />
      </Suspense>
    </div>
  );
}
