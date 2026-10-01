"use server";

import { revalidatePath } from "next/cache";
import { compraSchema, CompraFormValues } from "../validations/compra-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function registrarCompra(data: CompraFormValues) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();
    const parsed = compraSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos inválidos" };

    const { proveedor_id, fecha, numero_factura, items } = parsed.data;

    const totalCompra = items.reduce((sum, item) => sum + item.precio_total, 0);

    // 1. Crear cabecera de compra
    const { data: nuevaCompra, error: compraErr } = await supabase
      .from('compras')
      .insert({
        tenant_id: tenantId,
        proveedor_id: proveedor_id || null,
        fecha,
        numero_factura: numero_factura || null,
        total: totalCompra
      })
      .select()
      .single();

    if (compraErr || !nuevaCompra) return { error: "Error al registrar la compra" };

    // 2. Insertar items (Esto activará el TRIGGER en DB que actualiza ingredientes y recetas)
    const itemsDb = items.map(i => ({
      compra_id: nuevaCompra.id,
      ingrediente_id: i.ingrediente_id,
      cantidad: i.cantidad,
      precio_total: i.precio_total
    }));

    const { error: itemsErr } = await supabase.from('compra_items').insert(itemsDb);
    if (itemsErr) return { error: "Error al guardar detalle de items" };

    // Refrescar caché de varias rutas por el efecto cascada
    revalidatePath("/foodos/compras");
    revalidatePath("/foodos/ingredientes");
    revalidatePath("/foodos/productos");
    revalidatePath("/foodos");

    return { success: true };
  } catch (e) {
    return { error: "Error interno" };
  }
}

