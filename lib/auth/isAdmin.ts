import { createClient } from "@/lib/supabase/server";

/**
 * Verifica si el usuario actual tiene una sesión válida y rol de 'admin' activo.
 * Diseñado para rutas de API (no lanza redirect, retorna boolean).
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return false;

    const { data: cliente } = await supabase
      .from("clientes")
      .select("rol, activo")
      .eq("user_id", user.id)
      .maybeSingle();

    return Boolean(cliente?.activo && cliente.rol === "admin");
  } catch {
    return false;
  }
}
