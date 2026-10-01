import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { get(name: string) { return cookieStore.get(name)?.value; } }
  });
}

export async function getProductos() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.from('foodos_productos').select('*').order('nombre', { ascending: true });
  return error ? [] : data;
}


