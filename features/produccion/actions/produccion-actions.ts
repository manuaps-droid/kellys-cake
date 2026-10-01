"use server";

import { revalidatePath } from "next/cache";
import { ordenProduccionSchema, OrdenProduccionFormValues } from "../validations/produccion-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";
import { redirect } from "next/navigation";

export async function crearOrdenProduccion(data: OrdenProduccionFormValues) {
  let nuevaOrdenId = "";
  try {
    const { supabase, tenantId } = await getFoodOSSession();
    const parsed = ordenProduccionSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos inválidos" };

    const { fecha_prevista, notas, items } = parsed.data;

    const { data: nuevaOrden, error: ordenErr } = await supabase
      .from('ordenes_produccion')
      .insert({ tenant_id: tenantId, fecha_prevista, notas })
      .select().single();

    if (ordenErr || !nuevaOrden) return { error: "Error al registrar la orden" };
    nuevaOrdenId = nuevaOrden.id;

    const itemsDb = items.map(i => ({
      orden_id: nuevaOrden.id,
      producto_id: i.producto_id,
      cantidad: i.cantidad
    }));

    const { error: itemsErr } = await supabase.from('orden_produccion_items').insert(itemsDb);
    if (itemsErr) return { error: "Error al guardar el detalle" };

  } catch (e) {
    return { error: "Error interno" };
  }
  
  revalidatePath("/foodos/produccion");
  redirect(`/foodos/produccion/${nuevaOrdenId}`);
}

