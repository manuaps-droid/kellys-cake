"use server";

import { revalidatePath } from "next/cache";
import { productoSchema, ProductoFormValues } from "../validations/producto-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function crearProducto(data: ProductoFormValues) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const parsed = productoSchema.safeParse(data);
    if (!parsed.success) return { error: "Datos inválidos" };

    const { error: insertError } = await supabase.from('foodos_productos').insert({
      tenant_id: tenantId,
      nombre: parsed.data.nombre,
      categoria_id: parsed.data.categoria_id || null,
      precio_venta: parsed.data.precio_venta,
      precio_costo: 0, // Inicia en 0 hasta que se le agregue una receta
    });

    if (insertError) return { error: "Error al guardar el producto." };

    revalidatePath("/foodos/productos");
    return { success: true };
  } catch (err) {
    return { error: "Error interno del servidor." };
  }
}



