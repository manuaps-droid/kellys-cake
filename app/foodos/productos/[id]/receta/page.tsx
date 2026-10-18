import { RecetaEditor } from "@/features/recetas/components/RecetaEditor";
import { getIngredientes } from "@/features/ingredientes/queries/get-ingredientes";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function RecetaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ingredientes = await getIngredientes();

  const supabase = createAdminClient();

  const { data: producto } = await supabase
    .from('foodos_productos')
    .select('id, nombre, precio_venta, precio_costo')
    .eq('id', id)
    .single();

  if (!producto) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-bold text-red-700">Producto no encontrado</p>
          <p className="mt-2 text-sm text-red-500">
            El producto con ID <code className="font-mono">{id.slice(0, 8)}…</code> no
            existe en FoodOS. Verifica que lo creaste desde Productos & Recetas.
          </p>
        </div>
      </div>
    );
  }

  const ingredientesDisponibles = ingredientes.map(i => ({
    id: i.id,
    nombre: i.nombre,
    unidad_uso: i.unidad_uso,
    costo_por_unidad_uso: i.costo_por_unidad_uso,
    porcentaje_merma_estandar: i.porcentaje_merma_estandar
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receta: {producto.nombre}</h1>
        <p className="text-gray-500">Edita los ingredientes para descubrir el costo exacto.</p>
        {producto.precio_costo != null && producto.precio_costo > 0 && (
          <p className="mt-1 text-sm text-blue-600 font-medium">
            Costo actual: S/ {Number(producto.precio_costo).toFixed(2)} por porción
          </p>
        )}
      </div>
      <RecetaEditor productoId={id} ingredientesDisponibles={ingredientesDisponibles} />
    </div>
  );
}
