"use server";

import { revalidatePath } from "next/cache";
import { cotizacionSchema, CotizacionFormValues } from "../validations/cotizador-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";
import { redirect } from "next/navigation";

export async function guardarCotizacion(data: CotizacionFormValues) {
  let nuevaCotizacionId = "";
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const parsed = cotizacionSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos inválidos en el formulario" };

    const { cliente_nombre, fecha_evento, notas, items } = parsed.data;

    // Calcular totales seguros en backend
    let totalCosto = 0;
    let totalVenta = 0;
    
    const itemsProcesados = items.map(item => {
      const costoLinea = item.costo_unitario * item.cantidad;
      const ventaLinea = item.precio_venta_unitario * item.cantidad;
      totalCosto += costoLinea;
      totalVenta += ventaLinea;
      
      return {
        tipo_item: item.tipo_item,
        producto_id: item.tipo_item === 'producto' ? item.producto_id : null,
        nombre_descripcion: item.nombre_descripcion,
        cantidad: item.cantidad,
        costo_unitario: item.costo_unitario,
        precio_venta_unitario: item.precio_venta_unitario
      };
    });

    const { data: nuevaCotizacion, error: cotErr } = await supabase
      .from('cotizaciones')
      .insert({
        tenant_id: tenantId,
        cliente_nombre,
        fecha_evento: fecha_evento || null,
        notas,
        total_costo: totalCosto,
        total_venta: totalVenta
      })
      .select().single();

    if (cotErr || !nuevaCotizacion) return { error: "Error al crear la cotización" };
    nuevaCotizacionId = nuevaCotizacion.id;

    const itemsDb = itemsProcesados.map(i => ({ ...i, cotizacion_id: nuevaCotizacion.id }));
    const { error: itemsErr } = await supabase.from('cotizacion_items').insert(itemsDb);
    
    if (itemsErr) return { error: "Error al guardar el detalle de cotización" };

  } catch (e) {
    return { error: "Error interno" };
  }
  
  revalidatePath("/foodos");
  redirect("/foodos"); // Por MVP volvemos al dashboard tras guardar
}

