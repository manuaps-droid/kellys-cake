import { ProductoDesdeCatalogo } from "@/features/productos/components/ProductoDesdeCatalogo";
import { getProductosTienda } from "@/features/productos/queries/get-productos-tienda";
import { getIngredientes } from "@/features/ingredientes/queries/get-ingredientes";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NuevoProductoPage() {
  const productos = await getProductosTienda();
  const ingredientes = await getIngredientes();

  const supabase = createAdminClient();

  // Cargar recetas existentes para copiar
  const { data: recetasRaw } = await supabase
    .from("recetas")
    .select("id, rendimiento, producto_id")
    .eq("es_activa", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const recetasDisponibles = [];
  for (const r of recetasRaw ?? []) {
    const { data: prod } = await supabase
      .from("foodos_productos")
      .select("nombre")
      .eq("id", r.producto_id)
      .maybeSingle();

    recetasDisponibles.push({
      id: r.id as string,
      productoNombre: prod?.nombre ?? "Receta sin nombre",
      rendimiento: Number(r.rendimiento) || 1,
    });
  }

  const ingredientesBase = ingredientes.map((i) => ({
    id: i.id,
    nombre: i.nombre,
    unidad_uso: i.unidad_uso,
    unidad_compra: i.unidad_compra,
    costo_unitario: Number(i.costo_unitario) || 0,
    factor_conversion: Number(i.factor_conversion) || 1,
    costo_por_unidad_uso: Number(i.costo_por_unidad_uso) || 0,
    porcentaje_merma_estandar: Number(i.porcentaje_merma_estandar) || 0,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Crear Producto Final
        </h1>
        <p className="text-gray-500">
          Elige un producto de tu tienda, arma su receta con tus ingredientes y
          FoodOS calcula el costo y el margen al instante.
        </p>
      </div>
      <ProductoDesdeCatalogo
        productos={productos}
        recetasDisponibles={recetasDisponibles}
        ingredientesBase={ingredientesBase}
      />
    </div>
  );
}
