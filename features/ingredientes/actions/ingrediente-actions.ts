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

export type IngredienteOpcionAutocomplete = {
  id: string;
  nombre: string;
  unidad_uso: string;
  unidad_compra: string;
  costo_unitario: number;
  factor_conversion: number;
  costo_por_unidad_uso: number;
  porcentaje_merma_estandar: number;
};

/**
 * Búsqueda de ingredientes para autocompletado: mientras el chef
 * escribe, devuelve hasta 12 coincidencias por nombre.
 */
export async function buscarIngredientesAction(
  consulta: string
): Promise<{ success: boolean; ingredientes: IngredienteOpcionAutocomplete[] }> {
  try {
    const { supabase } = await getFoodOSSession();

    const texto = (consulta ?? "").trim();

    let query = supabase
      .from("ingredientes")
      .select(
        "id, nombre, unidad_uso, unidad_compra, costo_unitario, factor_conversion, costo_por_unidad_uso, porcentaje_merma_estandar"
      )
      .neq("activo", false)
      .order("nombre")
      .limit(12);

    if (texto.length >= 2) {
      query = query.ilike("nombre", `%${texto}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, ingredientes: [] };
    }

    return {
      success: true,
      ingredientes: (data ?? []).map((i) => ({
        id: i.id,
        nombre: i.nombre,
        unidad_uso: i.unidad_uso,
        unidad_compra: i.unidad_compra,
        costo_unitario: Number(i.costo_unitario ?? 0),
        factor_conversion: Number(i.factor_conversion ?? 1),
        costo_por_unidad_uso: Number(i.costo_por_unidad_uso ?? 0),
        porcentaje_merma_estandar: Number(
          i.porcentaje_merma_estandar ?? 0
        ),
      })),
    };
  } catch {
    console.error("Exception en buscarIngredientesAction:");
    return { success: false, ingredientes: [] };
  }
}

/**
 * Creación rápida de ingrediente desde el editor de recetas:
 * registra el ingrediente en la base y lo devuelve ya seleccionable.
 */
export async function crearIngredienteRapidoAction(
  data: IngredienteFormValues
): Promise<{
  success: boolean;
  error?: string;
  ingrediente?: IngredienteOpcionAutocomplete;
}> {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    const parsed = ingredienteSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: "Datos del ingrediente inválidos." };
    }

    const values = parsed.data;

    const { data: creado, error: insertError } = await supabase
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
      })
      .select(
        "id, nombre, unidad_uso, unidad_compra, costo_unitario, factor_conversion, costo_por_unidad_uso, porcentaje_merma_estandar"
      )
      .single();

    if (insertError || !creado) {
      console.error("Error al crear ingrediente rápido:", insertError);
      return {
        success: false,
        error: insertError?.message ?? "No se pudo registrar el ingrediente.",
      };
    }

    revalidatePath("/foodos/ingredientes");
    revalidatePath("/foodos/productos");

    return {
      success: true,
      ingrediente: {
        id: creado.id,
        nombre: creado.nombre,
        unidad_uso: creado.unidad_uso,
        unidad_compra: creado.unidad_compra,
        costo_unitario: Number(creado.costo_unitario ?? 0),
        factor_conversion: Number(creado.factor_conversion ?? 1),
        costo_por_unidad_uso: Number(creado.costo_por_unidad_uso ?? 0),
        porcentaje_merma_estandar: Number(
          creado.porcentaje_merma_estandar ?? 0
        ),
      },
    };
  } catch (err) {
    console.error("Exception en crearIngredienteRapidoAction:", err);
    return { success: false, error: "Error interno del servidor." };
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
