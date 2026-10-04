import { createAdminClient } from "@/lib/supabase/admin";

import {
  SECCION_SCHEMA,
  SECCIONES,
  type SeccionConfig,
} from "../validations/config.schema";

/**
 * Devuelve los defaults de un schema Zod (todos los campos
 * con `.default()` aplicados). Lo usamos cuando la tabla o la
 * fila todavía no existen (migración sin push) para que la
 * página siga cargando y el admin pueda empezar a configurar.
 */
function schemaDefaults<S extends SeccionConfig>(seccion: S): unknown {
  const r = SECCION_SCHEMA[seccion].safeParse({});
  return r.success ? r.data : {};
}

/**
 * Lee todas las secciones en una sola consulta y devuelve el
 * payload validado+parseado por Zod (con defaults si falta algún
 * campo). Si la tabla/RLS/fila no existen todavía (migración sin
 * push), devuelve los defaults del schema en lugar de propagar
 * el error, para que la página del admin siga funcionando.
 */
export async function getConfigRepository<T extends SeccionConfig>(
  seccion?: T
): Promise<Record<string, unknown>> {
  const supabase = createAdminClient();

  if (seccion) {
    let data: { seccion?: string; data?: unknown } | null = null;
    try {
      const res = await supabase
        .from("tienda_config")
        .select("seccion, data")
        .eq("seccion", seccion)
        .maybeSingle();
      data = res.data as { seccion?: string; data?: unknown } | null;
    } catch {
      data = null;
    }
    const parsed = SECCION_SCHEMA[seccion].safeParse(data?.data ?? {});
    return { [seccion]: parsed.success ? parsed.data : schemaDefaults(seccion) };
  }

  let rows: Array<{ seccion: string; data: unknown }> = [];
  try {
    const res = await supabase
      .from("tienda_config")
      .select("seccion, data");
    rows = (res.data ?? []) as Array<{ seccion: string; data: unknown }>;
  } catch {
    rows = [];
  }

  // Garantiza que TODAS las secciones esperadas estén presentes
  // (con defaults si no vinieron de la BD). Así el admin nunca
  // ve una tab vacía aunque falten filas.
  const result: Record<string, unknown> = {};
  const found = new Set<string>();

  for (const row of rows) {
    if (!(row.seccion in SECCION_SCHEMA)) continue;
    const schema = SECCION_SCHEMA[row.seccion as SeccionConfig];
    const parsed = schema.safeParse(row.data);
    if (parsed.success) {
      result[row.seccion] = parsed.data;
      found.add(row.seccion);
    }
  }

  for (const sec of SECCIONES) {
    if (!found.has(sec)) {
      result[sec] = schemaDefaults(sec);
    }
  }

  return result;
}

export async function updateConfigRepository<T extends SeccionConfig>(
  seccion: T,
  data: unknown
): Promise<void> {
  const supabase = createAdminClient();

  // Siempre validamos antes de escribir para que la BD contenga
  // únicamente datos conformes al schema.
  const parsed = SECCION_SCHEMA[seccion].parse(data);

  const { error } = await supabase
    .from("tienda_config")
    .upsert({ seccion, data: parsed }, { onConflict: "seccion" });

  if (error) {
    // Mensaje más claro para el caso de tabla inexistente (QUELATION:
    // falta `supabase db push`). Cuando sea así, el mensaje viene
    // con "Does not exist" o similar; devolvemos una pista útil.
    const msg = error.message ?? "";
    if (/relation .* does not exist|schema "?.*"? does not exist|Could not find the table/i.test(msg)) {
      throw new Error(
        "La tabla 'tienda_config' no existe en la base de datos. Ejecuta `npx supabase db push` para aplicar las migraciones pendientes antes de guardar la configuración."
      );
    }
    throw error;
  }
}

/**
 * Variante pública para uso en Server Components del storefront.
 * Usa el cliente de servidor (anon/RLS) en lugar de service_role.
 * Si la tabla o la fila no existen, devuelve los defaults del schema.
 */
export async function getPublicConfigRepository<T extends SeccionConfig>(
  seccion: T
): Promise<unknown> {
  let data: unknown = null;
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const res = await supabase
      .from("tienda_config")
      .select("seccion, data")
      .eq("seccion", seccion)
      .maybeSingle();
    data = (res.data as { data?: unknown } | null)?.data ?? null;
  } catch {
    data = null;
  }

  if (!data) {
    try {
      const supabaseAdmin = createAdminClient();
      const res = await supabaseAdmin
        .from("tienda_config")
        .select("seccion, data")
        .eq("seccion", seccion)
        .maybeSingle();
      data = (res.data as { data?: unknown } | null)?.data ?? null;
    } catch {
      data = null;
    }
  }

  const parsed = SECCION_SCHEMA[seccion].safeParse(data ?? {});
  return parsed.success ? parsed.data : schemaDefaults(seccion);
}
