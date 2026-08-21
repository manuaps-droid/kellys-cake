import { createClient } from "@/lib/supabase/server";

import type { AdminProjectStatus } from "../types/project.type";

export async function updateProjectStatusRepository(
  id: string,
  status: AdminProjectStatus
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proyectos_personalizados")
    .update({ estado: status })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
