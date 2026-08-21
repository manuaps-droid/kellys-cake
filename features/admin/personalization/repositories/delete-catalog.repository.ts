import { createClient } from "@/lib/supabase/server";

export async function deleteCatalogRepository(
  id: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("catalogo_personalizacion")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}