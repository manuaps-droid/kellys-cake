"use server";

import { createClient } from "@/lib/supabase/server";

export async function attachProyectoToCateringAction(
  cotizacionId: string,
  proyectoId: string
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("cotizaciones_catering")
      .update({ proyecto_id: proyectoId })
      .eq("id", cotizacionId);

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error",
    };
  }
}

export async function getCateringByProyectoAction(proyectoId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cotizaciones_catering")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .maybeSingle();

    if (error) return { success: false };
    return { success: true, cotizacion: data };
  } catch {
    return { success: false };
  }
}
