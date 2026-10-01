import { createClient } from "@/lib/supabase/server";

/**
 * Valida que el usuario tenga una sesión activa y retorna el cliente y tenant_id de FoodOS.
 * Lanza un error si no está autenticado o la cuenta no está activa.
 */
export async function getFoodOSSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("No autorizado. Debes iniciar sesión en Kelly's Cake / FoodOS.");
  }

  // Verificar que el usuario tenga registro en clientes y esté activo
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, rol, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cliente || !cliente.activo) {
    throw new Error("Acceso denegado. Tu cuenta no está activa.");
  }

  if (cliente.rol !== "admin") {
    throw new Error("Acceso denegado. Solo administradores pueden acceder a FoodOS.");
  }

  // Obtener el tenant configurado para FoodOS
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!tenant?.id) {
    throw new Error("No se encontró el negocio/tenant en FoodOS.");
  }

  return {
    supabase,
    user,
    cliente,
    tenantId: tenant.id,
  };
}
