import { createAdminClient } from "@/lib/supabase/admin";
import { calcularCosteoReal } from "@/features/rentabilidad/services/costeo-real.service";
import type { DesgloseCosteo } from "@/features/rentabilidad/services/costeo-real.service";
import { SimuladorRentabilidad } from "@/features/rentabilidad/components/SimuladorRentabilidad";
import { ProductoPreset } from "@/features/rentabilidad/types/rentabilidad.types";

export const metadata = {
  title: "Costeo Real por Producto | FoodOS",
  description:
    "Costeo profesional en 4 capas: ingredientes, empaques, mano de obra e indirectos. Datos reales, no multiplicadores.",
};

export default async function RentabilidadPage() {
  const supabase = createAdminClient();

  const { data: productos } = await supabase
    .from("foodos_productos")
    .select("id, nombre, precio_venta, precio_costo, margen_porcentaje")
    .order("nombre", { ascending: true });

  // Buscar presentaciones de 6 unidades en la tienda para estos productos
  const nombresFoodOS = (productos ?? []).map(
    (p) => (p.nombre as string)?.trim().toLowerCase()
  );

  const { data: tiendaProductos } = await supabase
    .from("productos")
    .select("id, nombre")
    .in("estado", ["publicado", "borrador"]);

  const preciosPack: Record<string, number> = {};

  for (const tp of (tiendaProductos ?? []) as Array<{
    id: string;
    nombre: string;
  }>) {
    const nombreLower = tp.nombre.trim().toLowerCase();

    if (!nombresFoodOS.includes(nombreLower)) continue;

    const { data: pres } = await supabase
      .from("producto_presentaciones")
      .select("nombre, precio")
      .eq("producto_id", tp.id)
      .eq("activo", true)
      .order("precio", { ascending: true });

    const pres6 = (pres ?? []).find(
      (p: { nombre: string }) => p.nombre.trim() === "6"
    );

    if (pres6) {
      preciosPack[nombreLower] = Number(pres6.precio);
    }
  }

  const productosExistentes: ProductoPreset[] = (productos ?? []).map((p) => {
    const nombreLower = (p.nombre as string)?.trim().toLowerCase();
    const precioPack = preciosPack[nombreLower];

    return {
      id: p.id as string,
      nombre: (p.nombre as string) ?? "",
      precio_costo: Number(p.precio_costo) || undefined,
      precio_venta: precioPack ?? (Number(p.precio_venta) || undefined),
      margen_porcentaje: Number(p.margen_porcentaje) || undefined,
    };
  });

  // Calcular costeo real para cada producto (con receta activa)
  const costeos: Record<string, DesgloseCosteo | null> = {};

  for (const prod of productosExistentes) {
    costeos[prod.id] = await calcularCosteoReal(prod.id);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 mx-auto max-w-7xl">
      <SimuladorRentabilidad
        productosExistentes={productosExistentes}
        costeosIniciales={costeos}
      />
    </div>
  );
}
