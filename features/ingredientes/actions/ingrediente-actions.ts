"use server";

import { revalidatePath } from "next/cache";
import { ingredienteSchema, IngredienteFormValues } from "../validations/ingrediente-schema";
import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export async function crearIngrediente(data: IngredienteFormValues) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const parsed = ingredienteSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos", details: parsed.error.format() };
    }

    const values = parsed.data;

    const { error: insertError } = await supabase
      .from("ingredientes")
      .insert({
        tenant_id: tenantId,
        nombre: values.nombre,
        categoria_id: values.categoria_id || null,
        unidad_compra: values.unidad_compra,
        unidad_uso: values.unidad_uso,
        factor_conversion: values.factor_conversion,
        costo_unitario: values.costo_unitario,
        porcentaje_rendimiento: values.porcentaje_rendimiento,
        porcentaje_merma_estandar: values.porcentaje_merma_estandar,
      });

    if (insertError) {
      console.error("Error al insertar ingrediente:", insertError);
      return { error: "Error en la base de datos al guardar el ingrediente." };
    }

    revalidatePath("/foodos/ingredientes");
    revalidatePath("/foodos/productos");
    return { success: true };
  } catch (err) {
    console.error("Exception en crearIngrediente:", err);
    return { error: "No autorizado o error interno del servidor." };
  }
}

export async function actualizarIngrediente(id: string, data: IngredienteFormValues) {
  try {
    const { supabase } = await getFoodOSSession();

    const parsed = ingredienteSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos inválidos", details: parsed.error.format() };
    }

    const values = parsed.data;

    const { error: updateError } = await supabase
      .from("ingredientes")
      .update({
        nombre: values.nombre,
        categoria_id: values.categoria_id || null,
        unidad_compra: values.unidad_compra,
        unidad_uso: values.unidad_uso,
        factor_conversion: values.factor_conversion,
        costo_unitario: values.costo_unitario,
        porcentaje_rendimiento: values.porcentaje_rendimiento,
        porcentaje_merma_estandar: values.porcentaje_merma_estandar,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error al actualizar ingrediente:", updateError);
      return { error: "No se pudo actualizar el ingrediente." };
    }

    revalidatePath("/foodos/ingredientes");
    revalidatePath("/foodos/productos");
    return { success: true };
  } catch (err) {
    console.error("Exception en actualizarIngrediente:", err);
    return { error: "No autorizado o error interno del servidor al actualizar." };
  }
}

export async function eliminarIngrediente(id: string) {
  try {
    const { supabase } = await getFoodOSSession();

    const { error } = await supabase
      .from("ingredientes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error al eliminar ingrediente:", error);
      return { error: "No se puede eliminar el ingrediente si ya está en recetas o compras registradas." };
    }

    revalidatePath("/foodos/ingredientes");
    revalidatePath("/foodos/productos");
    return { success: true };
  } catch (err) {
    console.error("Exception en eliminarIngrediente:", err);
    return { error: "No autorizado o error interno del servidor al eliminar." };
  }
}
