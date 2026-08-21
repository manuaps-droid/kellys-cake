import { createClient } from "@/lib/supabase/server";

export async function deleteProductRepository(
  id: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}