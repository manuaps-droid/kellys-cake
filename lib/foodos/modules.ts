import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type FoodosModulo = "core" | "logistica" | "ventas";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

async function getTenantId(): Promise<string | null> {
  const supabase = await getSupabaseClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return tenant?.id || null;
}

export async function getModulosActivos(): Promise<string[]> {
  const supabase = await getSupabaseClient();
  const tenantId = await getTenantId();
  if (!tenantId) return ["core"];

  const { data, error } = await supabase
    .from("foodos_modulos")
    .select("modulo, activo")
    .eq("tenant_id", tenantId);

  if (error || !data || data.length === 0) {
    // Si no hay registros aún, solo core está activo
    return ["core"];
  }

  return data.filter((m) => m.activo).map((m) => m.modulo);
}

export async function tieneModulo(modulo: FoodosModulo): Promise<boolean> {
  if (modulo === "core") return true; // Core siempre activo
  const activos = await getModulosActivos();
  return activos.includes(modulo);
}
