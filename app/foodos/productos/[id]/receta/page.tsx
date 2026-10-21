import RecetaEditorWrapper from "@/features/recetas/components/RecetaEditorWrapper";
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

  // Cargar la receta existente
  const { data: recetaExistente } = await supabase
    .from('recetas')
    .select('id, rendimiento')
    .eq('producto_id', id)
    .eq('es_activa', true)
    .single();

  let itemsIniciales: Array<{
    ingrediente_id: string;
    cantidad: number;
    unidad: string;
    merma_porcentaje: number;
  }> = [];

  let rendimientoInicial = 1;

  if (recetaExistente) {
    rendimientoInicial = Number(recetaExistente.rendimiento) || 1;

    const { data: items } = await supabase
      .from('receta_items')
      .select('ingrediente_id, cantidad, unidad, merma_porcentaje')
      .eq('receta_id', recetaExistente.id)
      .order('created_at', { ascending: true });

    itemsIniciales = (items ?? []).map((item) => ({
      ingrediente_id: item.ingrediente_id ?? "",
      cantidad: Number(item.cantidad) || 0,
      unidad: item.unidad ?? "",
      merma_porcentaje: Number(item.merma_porcentaje) || 0,
    }));
  }

  // Cargar otras recetas para copiar
  const { data: otrasRecetasRaw } = await supabase
    .from('recetas')
    .select('id, rendimiento, producto_id')
    .eq('es_activa', true)
    .neq('producto_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Buscar los nombres de los productos por ID
  const recetasDisponibles = [];
  for (const r of otrasRecetasRaw ?? []) {
    const { data: prod } = await supabase
      .from('foodos_productos')
      .select('nombre')
      .eq('id', r.producto_id)
      .maybeSingle();

    recetasDisponibles.push({
      id: r.id as string,
      productoNombre: prod?.nombre ?? "Receta sin nombre",
      rendimiento: Number(r.rendimiento) || 1,
    });
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
      <RecetaEditorWrapper
        productoId={id}
        productoNombre={producto.nombre}
        productoPrecioVenta={Number(producto.precio_venta) || 0}
        productoPrecioCosto={Number(producto.precio_costo) || 0}
        ingredientes={ingredientesDisponibles}
        itemsIniciales={itemsIniciales}
        rendimientoInicial={rendimientoInicial}
        recetasDisponibles={recetasDisponibles}
      />
    </div>
  );
}
