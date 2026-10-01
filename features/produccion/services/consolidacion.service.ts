import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function generarConsolidadoAlmacen(ordenId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });

  // 1. Obtener la orden y los productos que queremos hacer
  const { data: orden } = await supabase
    .from('ordenes_produccion')
    .select('*, items:orden_produccion_items(*)')
    .eq('id', ordenId)
    .single();

  if (!orden || !orden.items) return null;

  // 2. Obtener las recetas activas de esos productos
  const productoIds = orden.items.map((i: any) => i.producto_id);
  const { data: recetas } = await supabase
    .from('recetas')
    .select('*, items:receta_items(*, ingrediente:ingredientes(*))')
    .in('producto_id', productoIds);

  if (!recetas) return null;

  // 3. Diccionario de consolidación
  const consolidado = new Map<string, any>();

  // 4. Algoritmo de explosión de materiales (BOM)
  for (const ordenItem of orden.items) {
    const receta = recetas.find(r => r.producto_id === ordenItem.producto_id);
    if (!receta) continue;

    const multiplicador_orden = ordenItem.cantidad / (receta.rendimiento || 1);

    for (const recItem of receta.items) {
      if (!recItem.ingrediente) continue;
      const ing = recItem.ingrediente;
      
      // Cálculo de merma: (Merma estándar del ingrediente + Merma extra de la receta)
      const mermaTotal = (ing.porcentaje_merma_estandar + (recItem.merma_porcentaje || 0)) / 100.0;
      const factorFisico = 1 - (mermaTotal >= 1 ? 0.99 : mermaTotal);
      
      // La cantidad bruta (con merma) a sacar de almacén para UNA tanda de receta
      const cantidadBrutaPorReceta = recItem.cantidad / factorFisico;
      
      // Lo que necesitamos para esta orden en particular
      const cantidadTotalRequerida = cantidadBrutaPorReceta * multiplicador_orden;

      // Agrupar en el consolidado
      if (consolidado.has(ing.id)) {
        const existente = consolidado.get(ing.id);
        existente.cantidad_requerida += cantidadTotalRequerida;
        existente.productos_que_lo_usan.push({ nombre: receta.nombre, cantidad_aportada: cantidadTotalRequerida });
      } else {
        consolidado.set(ing.id, {
          ingrediente_id: ing.id,
          nombre: ing.nombre,
          unidad_uso: ing.unidad_uso,
          cantidad_requerida: cantidadTotalRequerida,
          productos_que_lo_usan: [{ nombre: receta.nombre, cantidad_aportada: cantidadTotalRequerida }]
        });
      }
    }
  }

  return {
    orden,
    insumos: Array.from(consolidado.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  };
}

