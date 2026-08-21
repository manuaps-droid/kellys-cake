import { createClient } from "@/lib/supabase/server";

export async function getFillingsRepository() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("catalogo_personalizacion")
    .select(`
      id,
      nombre,
      descripcion
    `)
    .eq("tipo", "filling")
    .eq("activo", true)
    .order("orden");

  if (error) {
    throw error;
  }

  return data;
}