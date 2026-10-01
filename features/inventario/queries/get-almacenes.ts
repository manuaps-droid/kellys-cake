import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
}

export async function getAlmacenes() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from('foodos_almacenes')
    .select('*')
    .eq('activo', true)
    .order('es_principal', { ascending: false });

  if (error) {
    console.error("Error obteniendo almacenes:", error);
    return [];
  }
  return data || [];
}
