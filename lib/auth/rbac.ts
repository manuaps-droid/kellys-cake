import { createClient } from "@/lib/supabase/server";

/**
 * RBAC — Control de acceso por rol.
 *
 * Hoy: solo existe el rol `admin` (validado en getFoodOSSession).
 * Mañana: la tabla `org_miembros` asigna roles finos por organización
 * (dueno | cocinero | cajero | mesero | contador).
 *
 * Compatibilidad: si el usuario no tiene registro en org_miembros
 * (o la tabla aún no existe), se aplica el comportamiento actual
 * (solo admin pasa) — cero breaking.
 */

export type FoodosRol =
  | "dueno"
  | "admin"
  | "cocinero"
  | "cajero"
  | "mesero"
  | "contador";

/**
 * Valida que el usuario actual tenga al menos uno de los roles dados.
 * Fallback: si no hay registro en org_miembros, exige rol admin
 * (comportamiento histórico, cero regresión).
 */
export async function requireRol(rolesPermitidos: FoodosRol[]): Promise<{
  autorizado: boolean;
  rol: FoodosRol | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { autorizado: false, rol: null, error: "Sin sesión." };

    // 1. Intento por org_miembros (RBAC fino, cuando exista)
    const { data: miembro, error: errMiembro } = await supabase
      .from("org_miembros")
      .select("rol")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!errMiembro && miembro?.rol) {
      const rol = miembro.rol as FoodosRol;
      return rolesPermitidos.includes(rol)
        ? { autorizado: true, rol }
        : {
            autorizado: false,
            rol,
            error: `Tu rol (${rol}) no permite esta acción.`,
          };
    }

    // 2. Fallback histórico: admins tienen todo
    const { data: cliente } = await supabase
      .from("clientes")
      .select("rol, activo")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!cliente || !cliente.activo) {
      return { autorizado: false, rol: null, error: "Cuenta inactiva." };
    }

    const esAdmin = cliente.rol === "admin";
    return esAdmin
      ? { autorizado: true, rol: "admin" }
      : {
          autorizado: false,
          rol: cliente.rol as FoodosRol,
          error: "Solo administradores pueden ejecutar esta acción.",
        };
  } catch {
    return { autorizado: false, rol: null, error: "Error al validar permisos." };
  }
}
