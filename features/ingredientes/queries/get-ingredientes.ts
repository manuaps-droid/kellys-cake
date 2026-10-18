import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Lee todos los ingredientes del tenant de FoodOS.
 * Usa el cliente admin (service_role) para no depender de RLS
 * ni de la sesión del usuario en las páginas del servidor.
 */
export async function getIngredientes() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ingredientes')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error("Error leyendo ingredientes:", error.message);
    return [];
  }

  return data ?? [];
}
