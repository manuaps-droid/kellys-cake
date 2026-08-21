import { createClient } from "@/lib/supabase/server";

export async function deleteImage(
  path: string
) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("cake-projects")
    .remove([path]);

  if (error) {
    throw error;
  }
}