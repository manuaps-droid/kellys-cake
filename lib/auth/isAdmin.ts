import { createClient } from "@/lib/supabase/server";

import { isCurrentDeviceAuthorized } from "./authorized-devices";

/**
 * Verifica si el usuario actual tiene una sesión válida, rol de
 * 'admin' activo Y si la petición proviene de uno de los equipos
 * autorizados (máx. 3 dispositivos). Protege todas las acciones y
 * rutas de administración del proyecto: solo los dispositivos
 * autorizados tienen control total.
 * Diseñado para rutas de API y server actions (no lanza redirect,
 * retorna boolean).
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

    if (!cliente?.activo || cliente.rol !== "admin") {
      return false;
    }

    // Solo los equipos autorizados (máx. 3) tienen control total
    const deviceCheck = await isCurrentDeviceAuthorized();

    return deviceCheck.authorized;
  } catch {
    return false;
  }
}
