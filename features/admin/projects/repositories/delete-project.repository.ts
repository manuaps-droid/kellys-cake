import { createClient } from "@/lib/supabase/server";

export async function deleteProjectRepository(
  id: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proyectos_personalizados")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
