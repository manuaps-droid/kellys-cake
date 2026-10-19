"use server";

import { revalidatePath } from "next/cache";

import { getFoodOSSession } from "@/lib/auth/getFoodOSSession";

export type EmpaqueInput = {
  id?: string;
  producto_id: string;
  nombre: string;
  cantidad: number;
  costo_unitario: number;
};

/**
 * Lista los empaques de un producto.
 */
export async function listarEmpaquesAction(productoId: string) {
  try {
    const { supabase } = await getFoodOSSession();

    const { data, error } = await supabase
      .from("foodos_empaques")
      .select("id, nombre, cantidad, costo_unitario")
      .eq("producto_id", productoId)
      .eq("activo", true)
      .order("nombre");

    if (error) {
      return { error: error.message, empaques: [] };
    }

    return {
      empaques: (data ?? []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        nombre: e.nombre as string,
        cantidad: Number(e.cantidad) || 1,
        costo_unitario: Number(e.costo_unitario) || 0,
      })),
    };
  } catch {
    return { error: "No autorizado.", empaques: [] };
  }
}

/**
 * Crea o actualiza un empaque de un producto.
 */
export async function guardarEmpaqueAction(input: EmpaqueInput) {
  try {
    const { supabase, tenantId } = await getFoodOSSession();

    if (!tenantId) {
      return { error: "No autorizado." };
    }

    const nombre = (input.nombre ?? "").trim();
    const cantidad = Math.max(0.001, Number(input.cantidad) || 1);
    const costo = Math.max(0, Number(input.costo_unitario) || 0);

    if (nombre.length < 2) {
      return { error: "Escribe el nombre del empaque." };
    }

    if (input.id) {
      const { error } = await supabase
        .from("foodos_empaques")
        .update({
          nombre,
          cantidad,
          costo_unitario: costo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id);

      if (error) return { error: "No se pudo actualizar el empaque." };
    } else {
      const { error } = await supabase.from("foodos_empaques").insert({
        tenant_id: tenantId,
        producto_id: input.producto_id,
        nombre,
        cantidad,
        costo_unitario: costo,
      });

      if (error) return { error: "No se pudo crear el empaque." };
    }

    revalidatePath("/foodos/rentabilidad");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}

/**
 * Elimina (desactiva) un empaque.
 */
export async function eliminarEmpaqueAction(id: string) {
  try {
    const { supabase } = await getFoodOSSession();

    const { error } = await supabase
      .from("foodos_empaques")
      .delete()
      .eq("id", id);

    if (error) return { error: "No se pudo eliminar el empaque." };

    revalidatePath("/foodos/rentabilidad");
    return { success: true };
  } catch {
    return { error: "Error interno del servidor." };
  }
}
