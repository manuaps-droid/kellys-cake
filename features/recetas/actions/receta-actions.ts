"use server";

import { revalidatePath } from "next/cache";
import { recetaSchema, RecetaFormValues } from "../validations/receta-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function guardarReceta(data: RecetaFormValues) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();
    const parsed = recetaSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos de receta inválidos." };

    const { producto_id, nombre, rendimiento, items } = parsed.data;

    const ingredienteIds = items.map(i => i.ingrediente_id);
    const { data: ingredientesDB } = await supabase
      .from('ingredientes')
      .select('id, costo_por_unidad_uso, porcentaje_merma_estandar')
      .in('id', ingredienteIds);

    const ingMap = new Map(ingredientesDB?.map(i => [i.id, i]));

    let costoTotal = 0;
    const itemsParaInsertar = items.map(item => {
      const ingDB = ingMap.get(item.ingrediente_id);
      const costoUso = ingDB ? ingDB.costo_por_unidad_uso : 0;
      const mermaBase = ingDB ? ingDB.porcentaje_merma_estandar : 0;
      
      const mermaTotal = (mermaBase + item.merma_porcentaje) / 100;
      const factorMerma = 1 - (mermaTotal >= 1 ? 0.99 : mermaTotal);
      
      const cantidadReal = item.cantidad / factorMerma;
      const costoLinea = cantidadReal * costoUso;
      
      costoTotal += costoLinea;

      return {
        ingrediente_id: item.ingrediente_id,
        cantidad: item.cantidad,
        unidad: item.unidad,
        merma_porcentaje: item.merma_porcentaje,
        costo_linea: costoLinea
      };
    });

    const costoUnitario = costoTotal / rendimiento;

    await supabase.from('recetas').delete().eq('producto_id', producto_id);

    const { data: nuevaReceta, error: recetaErr } = await supabase
      .from('recetas')
      .insert({
        tenant_id: tenantId,
        producto_id,
        nombre,
        rendimiento,
        costo_total: costoTotal,
        costo_unitario: costoUnitario
      })
      .select()
      .single();

    if (recetaErr || !nuevaReceta) return { error: "Error al crear la cabecera de la receta." };

    const itemsConRecetaId = itemsParaInsertar.map(i => ({ ...i, receta_id: nuevaReceta.id }));
    const { error: itemsErr } = await supabase.from('receta_items').insert(itemsConRecetaId);
    
    if (itemsErr) return { error: "Error al guardar los ingredientes de la receta." };

    await supabase.from('foodos_productos').update({ precio_costo: costoUnitario }).eq('id', producto_id);

    revalidatePath("/foodos/productos");
    revalidatePath(`/foodos/productos/${producto_id}/receta`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Error interno al procesar la receta." };
  }
}



