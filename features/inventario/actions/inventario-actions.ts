"use server";

import { revalidatePath } from "next/cache";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function registrarIngresoStock(params: {
  almacenId: string;
  items: Array<{
    ingredienteId: string;
    cantidad: number;
    costoUnitario?: number;
  }>;
  referencia: string;
}) {
  const { supabase, tenantId } = await getFoodOSSession();

  for (const item of params.items) {
    // 1. Obtener stock actual existente o inicializar
    const { data: regActual } = await supabase
      .from('foodos_inventario')
      .select('id, stock_actual')
      .eq('almacen_id', params.almacenId)
      .eq('ingrediente_id', item.ingredienteId)
      .maybeSingle();

    const stockAnterior = Number(regActual?.stock_actual || 0);
    const stockPosterior = stockAnterior + Number(item.cantidad);

    if (regActual) {
      await supabase
        .from('foodos_inventario')
        .update({ stock_actual: stockPosterior, updated_at: new Date().toISOString() })
        .eq('id', regActual.id);
    } else {
      await supabase
        .from('foodos_inventario')
        .insert({
          tenant_id: tenantId,
          almacen_id: params.almacenId,
          ingrediente_id: item.ingredienteId,
          stock_actual: stockPosterior,
          stock_minimo: 5
        });
    }

    // 2. Registrar en Kardex
    await supabase.from('foodos_kardex').insert({
      tenant_id: tenantId,
      almacen_id: params.almacenId,
      ingrediente_id: item.ingredienteId,
      tipo_movimiento: 'COMPRA',
      cantidad: item.cantidad,
      stock_anterior: stockAnterior,
      stock_posterior: stockPosterior,
      costo_unitario_momento: item.costoUnitario || 0,
      referencia_documento: params.referencia
    });
  }

  revalidatePath('/foodos/inventario');
  revalidatePath('/foodos');
  return { success: true };
}
