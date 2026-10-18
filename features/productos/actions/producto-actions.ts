"use server";

import { revalidatePath } from "next/cache";
import { productoSchema, ProductoFormValues } from "../validations/producto-schema";
import { recetaItemSchema } from "@/features/recetas/validations/receta-schema";
import { guardarReceta } from "@/features/recetas/actions/receta-actions";
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
  } catch {
    return { error: "Error interno del servidor." };
  }
}

export type ItemRecetaInput = {
  ingrediente_id: string;
  cantidad: number;
  unidad: string;
  merma_porcentaje?: number;
};

/**
 * Crea el producto final y, si se enviaron items, su receta en el
 * mismo paso (todo o nada): usado por el flujo de nuevo producto
 * desde los catálogos de la tienda.
 */
export async function crearProductoConReceta(input: {
  nombre: string;
  categoria_id?: string;
  precio_venta: number;
  rendimiento?: number;
  items?: ItemRecetaInput[];
}) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const parsed = productoSchema.safeParse({
      nombre: input.nombre,
      categoria_id: input.categoria_id,
      precio_venta: input.precio_venta,
    });

    if (!parsed.success) {
      return { error: "Datos del producto inválidos." };
    }

    const itemsValidos =
      input.items && input.items.length > 0
        ? input.items.map((item) =>
            recetaItemSchema.safeParse({
              ingrediente_id: item.ingrediente_id,
              cantidad: item.cantidad,
              unidad: item.unidad,
              merma_porcentaje: item.merma_porcentaje ?? 0,
            })
          )
        : [];

    const itemsInvalidos = itemsValidos.find((r) => !r.success);

    if (itemsInvalidos) {
      return {
        error:
          "Hay ingredientes con datos incompletos en la receta (cantidad o ingrediente faltante).",
      };
    }

    const recetaItems: Array<{
      ingrediente_id: string;
      cantidad: number;
      unidad: string;
      merma_porcentaje: number;
    }> = [];

    for (const r of itemsValidos) {
      if (r.success) recetaItems.push(r.data);
    }

    const { data: nuevoProducto, error: insertError } = await supabase
      .from("foodos_productos")
      .insert({
        tenant_id: tenantId,
        nombre: parsed.data.nombre,
        categoria_id: parsed.data.categoria_id || null,
        precio_venta: parsed.data.precio_venta,
        precio_costo: 0,
      })
      .select("id")
      .single();

    if (insertError || !nuevoProducto) {
      return { error: "Error al guardar el producto." };
    }

    if (itemsValidos.length > 0) {
      const resultadoReceta = await guardarReceta({
        producto_id: nuevoProducto.id,
        nombre: "Receta Principal",
        rendimiento: input.rendimiento && input.rendimiento > 0 ? input.rendimiento : 1,
        items: recetaItems,
      });

      if (resultadoReceta.error) {
        await supabase
          .from("foodos_productos")
          .delete()
          .eq("id", nuevoProducto.id);

        return { error: resultadoReceta.error };
      }
    }

    revalidatePath("/foodos/productos");
    revalidatePath(`/foodos/productos/${nuevoProducto.id}/receta`);

    return { success: true, productoId: nuevoProducto.id };
  } catch (err) {
    console.error("Exception en crearProductoConReceta:", err);
    return { error: "Error interno del servidor." };
  }
}



